/**
 * Admin-driven marketing sends: review requests and the newsletter.
 *
 * Both flows share the same discipline — resolve an audience, drop anyone who
 * has opted out, dedupe by address, send with a throttle, record what happened.
 * The two differ in who they target and what they say, so the audience
 * resolution is separate for each and the send machinery is shared.
 */

import OrderModel from '../models/orderModel.js';
import ProductModel from '../models/productModel.js';
import Subscriber from '../models/subscriberModel.js';
import EmailCampaignModel from '../models/emailCampaignModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';
import sendBulk, { MAX_BATCH } from '../utils/sendBulk.js';
import { getSuppressedEmails, unsubscribeUrl, unsubscribeHeaders } from '../utils/marketingConsent.js';
import {
  reviewRequestEmailHtml, reviewRequestEmailText,
  newsletterEmailHtml, newsletterEmailText,
} from '../utils/marketingTemplates.js';
import { heroSrc, heroDataUri, emailAttachments } from '../utils/emailAssets.js';
import logger from '../utils/logger.js';

const log = logger.child({ component: 'marketing' });

const SITE_URL = () => process.env.APP_URL || 'https://highlanddogchew.co.uk';
const PRODUCT_TYPES = ['yak-milk', 'puff-treat', 'highland-mix'];
// Shown only in previews and test sends. Real sends use the customer's own
// first name; this placeholder makes that substitution visible at a glance.
const PREVIEW_NAME = '{first name}';

const ORDER_STATUSES = ['pending', 'confirmed', 'backordered', 'processing', 'shipped', 'delivered', 'cancelled'];

// ─── Shared helpers ───────────────────────────────────────────────────────────

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Builds the order-side Mongo filter shared by the candidate list and the send.
 *
 * `defaultStatus` is what applies when the admin picked no status: 'delivered'
 * for review requests, because asking before the parcel lands is the fastest
 * way to earn a one-star — and null for the newsletter, which isn't tied to
 * where the parcel is.
 */
async function buildOrderFilter({ orderStatus, productType, dateFrom, dateTo }, defaultStatus = 'delivered') {
  // Only paid orders: an unpaid or failed order has no customer to thank.
  const filter = { paymentStatus: 'paid' };

  if (orderStatus && ORDER_STATUSES.includes(orderStatus)) {
    filter.orderStatus = orderStatus;
  } else if (defaultStatus) {
    filter.orderStatus = defaultStatus;
  }

  if (productType && PRODUCT_TYPES.includes(productType)) {
    const ids = await ProductModel.find({ productType }).select('_id').lean();
    filter['items.product'] = { $in: ids.map((p) => p._id) };
  }

  const from = parseDate(dateFrom);
  const to = parseDate(dateTo);
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = from;
    if (to) {
      // An end date the admin typed means "including that whole day".
      to.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = to;
    }
  }

  return filter;
}

/** One-line postal address for the admin recipient lists. */
function formatAddress(addr = {}) {
  return [addr.addressLine1, addr.addressLine2, addr.city, addr.county, addr.postcode]
    .map((p) => (p || '').trim())
    .filter(Boolean)
    .join(', ');
}

/**
 * Review link for one order item, deep-linking to the product's review form.
 *
 * Carries the first name so the form can prefill it — but deliberately not the
 * email address, which would end up in browser history and in the Referer sent
 * to any third-party asset on the page.
 */
function reviewUrlFor(item, slugById, firstName) {
  const slug = item.product ? slugById.get(item.product.toString()) : null;
  if (!slug) return `${SITE_URL()}/products`;

  const params = new URLSearchParams({ review: '1' });
  // Trim: checkout data carries stray whitespace, which would otherwise
  // prefill the review form with "Monica " and show up in the URL as "Monica+".
  const name = (firstName || '').trim();
  if (name) params.set('name', name);
  return `${SITE_URL()}/products/${slug}?${params.toString()}`;
}

async function slugsForOrders(orders) {
  const ids = [
    ...new Set(
      orders.flatMap((o) => (o.items || []).map((i) => i.product?.toString()).filter(Boolean))
    ),
  ];
  const products = await ProductModel.find({ _id: { $in: ids } }).select('slug').lean();
  return new Map(products.map((p) => [p._id.toString(), p.slug]));
}

// ─── GET /api/admin/marketing/review-candidates ───────────────────────────────

export const getReviewCandidates = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit || '50', 10)));
    const filter = await buildOrderFilter(req.query);

    const [orders, total] = await Promise.all([
      OrderModel.find(filter)
        .sort({ deliveredAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('orderNumber shippingAddress items.name items.product orderStatus deliveredAt createdAt reviewRequest')
        .lean(),
      OrderModel.countDocuments(filter),
    ]);

    const suppressed = await getSuppressedEmails(
      orders.map((o) => o.shippingAddress?.email).filter(Boolean),
      'review'
    );

    const candidates = orders.map((o) => {
      const email = (o.shippingAddress?.email || '').toLowerCase();
      return {
        _id: o._id,
        orderNumber: o.orderNumber,
        name: o.shippingAddress?.firstName || o.shippingAddress?.fullName || '',
        fullName: o.shippingAddress?.fullName || '',
        email,
        address: formatAddress(o.shippingAddress),
        products: (o.items || []).map((i) => i.name),
        orderStatus: o.orderStatus,
        deliveredAt: o.deliveredAt,
        createdAt: o.createdAt,
        alreadySentAt: o.reviewRequest?.sentAt || null,
        sentCount: o.reviewRequest?.count || 0,
        // Surfaced rather than filtered out, so the admin can see why an order
        // is missing from a send instead of wondering.
        optedOut: !email || suppressed.has(email),
      };
    });

    return handleSuccess(res, 200, 'Review candidates fetched', {
      candidates,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/marketing/review-requests/send ───────────────────────────

export const sendReviewRequests = async (req, res, next) => {
  try {
    const { orderIds, resend = false, testTo } = req.body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return next(handleError(400, 'Select at least one order to send to'));
    }
    if (orderIds.length > MAX_BATCH) {
      return next(handleError(400, `Select at most ${MAX_BATCH} orders per batch`));
    }

    const orders = await OrderModel.find({ _id: { $in: orderIds } })
      .select('orderNumber shippingAddress items reviewRequest')
      .lean();

    if (orders.length === 0) return next(handleError(404, 'No matching orders found'));

    const slugById = await slugsForOrders(orders);
    const suppressed = await getSuppressedEmails(
      orders.map((o) => o.shippingAddress?.email).filter(Boolean),
      'review'
    );

    const skipped = [];
    const messages = [];
    const sendableOrderIds = [];

    for (const order of orders) {
      const email = (order.shippingAddress?.email || '').toLowerCase().trim();

      if (!email) {
        skipped.push({ orderNumber: order.orderNumber, reason: 'No email address on the order' });
        continue;
      }
      if (suppressed.has(email)) {
        skipped.push({ orderNumber: order.orderNumber, reason: 'Customer has unsubscribed' });
        continue;
      }
      if (order.reviewRequest?.sentAt && !resend) {
        skipped.push({ orderNumber: order.orderNumber, reason: 'Already sent' });
        continue;
      }

      const items = (order.items || []).map((i) => ({
        name: i.name,
        image: i.image,
        reviewUrl: reviewUrlFor(i, slugById, order.shippingAddress?.firstName),
      }));

      messages.push({
        to: testTo || email,
        subject: `We'd love to hear how your dog got on 🐾`,
        html: reviewRequestEmailHtml({
          firstName: order.shippingAddress?.firstName,
          orderNumber: order.orderNumber,
          items,
          unsubscribeUrl: unsubscribeUrl(email, 'review'),
          heroSrc: heroSrc('review'),
          logoSrc: heroSrc('logo'),
        }),
        text: reviewRequestEmailText({
          firstName: order.shippingAddress?.firstName,
          orderNumber: order.orderNumber,
          items,
          unsubscribeUrl: unsubscribeUrl(email, 'review'),
        }),
        headers: unsubscribeHeaders(email, 'review'),
        attachments: emailAttachments('review'),
      });
      sendableOrderIds.push(order._id);
    }

    if (messages.length === 0) {
      return handleSuccess(res, 200, 'Nothing to send', { sent: 0, failed: 0, skipped });
    }

    const result = await sendBulk(messages);

    // A test send must never mark real orders as contacted.
    if (!testTo) {
      const failedAddresses = new Set(result.results.filter((r) => !r.ok).map((r) => r.to));
      const succeededIds = sendableOrderIds.filter((_id, i) => !failedAddresses.has(messages[i].to));

      if (succeededIds.length) {
        await OrderModel.updateMany(
          { _id: { $in: succeededIds } },
          { $set: { 'reviewRequest.sentAt': new Date() }, $inc: { 'reviewRequest.count': 1 } }
        );
      }

      await EmailCampaignModel.create({
        type: 'review-request',
        subject: 'Review request',
        audience: { source: 'customers' },
        recipientCount: messages.length,
        sentCount: result.sent,
        failedCount: result.failed,
        suppressedCount: skipped.filter((s) => s.reason === 'Customer has unsubscribed').length,
        status: result.failed === 0 ? 'sent' : result.sent === 0 ? 'failed' : 'partial',
        sentBy: req.user?._id ?? null,
        sentByEmail: req.user?.email ?? '',
        failures: result.results.filter((r) => !r.ok).map((r) => ({ email: r.to, error: r.error })),
      });
    }

    log.info({ sent: result.sent, failed: result.failed, test: !!testTo }, 'Review requests sent');

    return handleSuccess(res, 200, `Sent ${result.sent} review request(s)`, {
      sent: result.sent,
      failed: result.failed,
      skipped,
      failures: result.results.filter((r) => !r.ok),
    });
  } catch (err) {
    next(err);
  }
};

// ─── Newsletter audience ──────────────────────────────────────────────────────

/**
 * Resolves the newsletter audience to a deduped list of
 * { email, name } — customers keep their first name so the email can greet them.
 */
async function resolveNewsletterAudience(query) {
  const source = ['subscribers', 'customers', 'both'].includes(query.source) ? query.source : 'both';
  const byEmail = new Map();

  if (source === 'subscribers' || source === 'both') {
    const subs = await Subscriber.find({ isActive: true }).select('email').lean();
    for (const s of subs) {
      const email = s.email?.toLowerCase().trim();
      // Subscribers gave us an address and nothing else — no name, no postal
      // address. The UI shows that plainly rather than an empty column.
      if (email) byEmail.set(email, { email, name: '', address: '', source: 'subscriber' });
    }
  }

  if (source === 'customers' || source === 'both') {
    const filter = await buildOrderFilter(query, null);

    const orders = await OrderModel.find(filter)
      .sort({ createdAt: -1 })
      .select('shippingAddress')
      .lean();

    for (const o of orders) {
      const addr = o.shippingAddress || {};
      const email = addr.email?.toLowerCase().trim();
      if (!email) continue;
      const existing = byEmail.get(email);
      // A customer who is also a subscriber is upgraded to the richer record,
      // and the newest order wins — that's their current address.
      if (!existing || existing.source === 'subscriber') {
        byEmail.set(email, {
          email,
          name: addr.firstName || addr.fullName || '',
          address: formatAddress(addr),
          source: existing ? 'both' : 'customer',
        });
      }
    }
  }

  const all = [...byEmail.values()];
  const suppressed = await getSuppressedEmails(all.map((r) => r.email), 'newsletter');

  return {
    recipients: all.filter((r) => !suppressed.has(r.email)),
    suppressedCount: all.filter((r) => suppressed.has(r.email)).length,
    source,
  };
}

// ─── GET /api/admin/marketing/newsletter/audience ─────────────────────────────

export const getNewsletterAudience = async (req, res, next) => {
  try {
    const { recipients, suppressedCount, source } = await resolveNewsletterAudience(req.query);

    return handleSuccess(res, 200, 'Audience resolved', {
      source,
      count: recipients.length,
      suppressedCount,
      overCap: recipients.length > MAX_BATCH,
      cap: MAX_BATCH,
      // The full list, so the admin can see exactly who is about to be mailed
      // before committing. Nobody should have to send blind to a count.
      recipients,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/marketing/newsletter/send ────────────────────────────────

export const sendNewsletter = async (req, res, next) => {
  try {
    const { subject, headline, bodyHtml, ctaLabel, ctaUrl, showRange = true, testTo } = req.body;

    if (!subject?.trim()) return next(handleError(400, 'A subject line is required'));
    if (!headline?.trim()) return next(handleError(400, 'A headline is required'));
    if (!bodyHtml?.trim()) return next(handleError(400, 'The email body is required'));

    // Test send: one message to the admin, nothing recorded, nobody else mailed.
    if (testTo) {
      const result = await sendBulk([
        {
          to: testTo,
          subject: `[TEST] ${subject}`,
          html: newsletterEmailHtml({
            headline,
            bodyHtml,
            greetingName: PREVIEW_NAME,
            ctaLabel,
            ctaUrl,
            showRange,
            unsubscribeUrl: unsubscribeUrl(testTo, 'newsletter'),
            heroSrc: heroSrc('newsletter'),
            logoSrc: heroSrc('logo'),
          }),
          text: newsletterEmailText({
            headline, bodyHtml, greetingName: PREVIEW_NAME, ctaLabel, ctaUrl,
            unsubscribeUrl: unsubscribeUrl(testTo, 'newsletter'),
          }),
          headers: unsubscribeHeaders(testTo, 'newsletter'),
          attachments: emailAttachments('newsletter'),
        },
      ]);

      return handleSuccess(res, 200, `Test email sent to ${testTo}`, {
        sent: result.sent,
        failed: result.failed,
        failures: result.results.filter((r) => !r.ok),
      });
    }

    const { recipients, suppressedCount, source } = await resolveNewsletterAudience(req.body);

    if (recipients.length === 0) {
      return next(handleError(400, 'That audience has no recipients'));
    }

    const messages = recipients.map((r) => ({
      to: r.email,
      subject,
      html: newsletterEmailHtml({
        headline,
        bodyHtml,
        greetingName: r.name,
        ctaLabel,
        ctaUrl,
        showRange,
        unsubscribeUrl: unsubscribeUrl(r.email, 'newsletter'),
        heroSrc: heroSrc('newsletter'),
        logoSrc: heroSrc('logo'),
      }),
      text: newsletterEmailText({
        headline, bodyHtml, greetingName: r.name, ctaLabel, ctaUrl,
        unsubscribeUrl: unsubscribeUrl(r.email, 'newsletter'),
      }),
      headers: unsubscribeHeaders(r.email, 'newsletter'),
      attachments: emailAttachments('newsletter'),
    }));

    const result = await sendBulk(messages);

    const campaign = await EmailCampaignModel.create({
      type: 'newsletter',
      subject,
      headline,
      audience: {
        source,
        productType: req.body.productType || null,
        orderStatus: req.body.orderStatus || null,
        dateFrom: parseDate(req.body.dateFrom),
        dateTo: parseDate(req.body.dateTo),
      },
      recipientCount: messages.length,
      sentCount: result.sent,
      failedCount: result.failed,
      suppressedCount,
      status: result.failed === 0 ? 'sent' : result.sent === 0 ? 'failed' : 'partial',
      sentBy: req.user?._id ?? null,
      sentByEmail: req.user?.email ?? '',
      failures: result.results.filter((r) => !r.ok).map((r) => ({ email: r.to, error: r.error })),
    });

    log.info({ sent: result.sent, failed: result.failed, campaign: campaign._id }, 'Newsletter sent');

    return handleSuccess(res, 200, `Newsletter sent to ${result.sent} recipient(s)`, {
      sent: result.sent,
      failed: result.failed,
      truncated: result.truncated,
      failures: result.results.filter((r) => !r.ok),
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/admin/marketing/newsletter/preview ─────────────────────────────
// Renders the real template so the admin previews exactly what will be sent.
// Rebuilding an approximation in the browser would drift from the template the
// moment either side changed.
export const previewNewsletter = async (req, res, next) => {
  try {
    const { headline, bodyHtml, ctaLabel, ctaUrl, showRange = true } = req.body;

    const html = newsletterEmailHtml({
      headline: headline || 'Your headline here',
      bodyHtml: bodyHtml || '<p>Your message here.</p>',
      greetingName: PREVIEW_NAME,
      ctaLabel,
      ctaUrl,
      showRange,
      unsubscribeUrl: '#preview',
      // cid: only resolves inside a mail client, so the preview inlines it.
      heroSrc: heroDataUri('newsletter'),
      logoSrc: heroDataUri('logo'),
    });

    return handleSuccess(res, 200, 'Preview rendered', { html });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/admin/marketing/campaigns ───────────────────────────────────────

export const getCampaigns = async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '25', 10)));
    const campaigns = await EmailCampaignModel.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return handleSuccess(res, 200, 'Campaigns fetched', campaigns);
  } catch (err) {
    next(err);
  }
};
