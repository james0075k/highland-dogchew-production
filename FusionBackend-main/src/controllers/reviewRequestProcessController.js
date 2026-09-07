/**
 * Automatic review requests — the unattended version of the admin's manual send.
 *
 * OFF by default. It only runs when REVIEW_REQUEST_CRON_ENABLED === 'true', so
 * the manual flow can be trusted first and switched to automatic later without
 * a code change.
 *
 * Timing: the countdown runs from deliveredAt when an admin marked the order
 * delivered, and falls back to shippedAt + an assumed transit time when they
 * didn't. The fallback matters — without it, forgetting to mark one order
 * delivered means that customer is never asked, silently.
 */

import OrderModel from '../models/orderModel.js';
import ProductModel from '../models/productModel.js';
import EmailCampaignModel from '../models/emailCampaignModel.js';
import sendBulk from '../utils/sendBulk.js';
import { getSuppressedEmails, unsubscribeUrl, unsubscribeHeaders } from '../utils/marketingConsent.js';
import { reviewRequestEmailHtml } from '../utils/marketingTemplates.js';
import { heroSrc, emailAttachments } from '../utils/emailAssets.js';
import logger from '../utils/logger.js';

const log = logger.child({ component: 'reviewRequestCron' });

const SITE_URL = () => process.env.APP_URL || 'https://highlanddogchew.co.uk';
const DAY_MS = 24 * 60 * 60 * 1000;

const num = (envVar, fallback) => {
  const n = parseInt(process.env[envVar] || '', 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export function isReviewRequestCronEnabled() {
  return process.env.REVIEW_REQUEST_CRON_ENABLED === 'true';
}

export async function processReviewRequests() {
  if (!isReviewRequestCronEnabled()) {
    log.debug('Skipped — REVIEW_REQUEST_CRON_ENABLED is not "true"');
    return { skipped: true };
  }

  // Days to wait after the parcel lands, and the transit time assumed when
  // nobody marked the order delivered.
  const delayDays = num('REVIEW_REQUEST_DELAY_DAYS', 3);
  const assumedTransitDays = num('REVIEW_REQUEST_TRANSIT_DAYS', 3);
  // Don't chase orders from months ago on the first run after switching this on.
  const maxAgeDays = num('REVIEW_REQUEST_MAX_AGE_DAYS', 30);

  const now = Date.now();
  const deliveredCutoff = new Date(now - delayDays * DAY_MS);
  const shippedCutoff = new Date(now - (delayDays + assumedTransitDays) * DAY_MS);
  const tooOld = new Date(now - maxAgeDays * DAY_MS);

  const orders = await OrderModel.find({
    paymentStatus: 'paid',
    orderStatus: { $in: ['delivered', 'shipped'] },
    'reviewRequest.sentAt': null,
    createdAt: { $gte: tooOld },
    $or: [
      { deliveredAt: { $ne: null, $lte: deliveredCutoff } },
      // Only fall back to shippedAt when there is no delivery stamp at all.
      { deliveredAt: null, shippedAt: { $ne: null, $lte: shippedCutoff } },
    ],
  })
    .select('orderNumber shippingAddress items reviewRequest')
    .limit(200)
    .lean();

  if (orders.length === 0) {
    log.info('No orders due a review request');
    return { due: 0, sent: 0, failed: 0 };
  }

  const productIds = [
    ...new Set(orders.flatMap((o) => (o.items || []).map((i) => i.product?.toString()).filter(Boolean))),
  ];
  const products = await ProductModel.find({ _id: { $in: productIds } }).select('slug').lean();
  const slugById = new Map(products.map((p) => [p._id.toString(), p.slug]));

  const suppressed = await getSuppressedEmails(
    orders.map((o) => o.shippingAddress?.email).filter(Boolean),
    'review'
  );

  const messages = [];
  const orderIds = [];
  const skippedIds = [];

  for (const order of orders) {
    const email = (order.shippingAddress?.email || '').toLowerCase().trim();

    if (!email || suppressed.has(email)) {
      // Claim it anyway so the sweep doesn't reconsider it every night.
      skippedIds.push(order._id);
      continue;
    }

    messages.push({
      to: email,
      subject: "We'd love to hear how your dog got on 🐾",
      html: reviewRequestEmailHtml({
        firstName: order.shippingAddress?.firstName,
        orderNumber: order.orderNumber,
        items: (order.items || []).map((i) => {
          const slug = i.product ? slugById.get(i.product.toString()) : null;
          if (!slug) return { name: i.name, image: i.image, reviewUrl: `${SITE_URL()}/products` };

          const params = new URLSearchParams({ review: '1' });
          const name = (order.shippingAddress?.firstName || '').trim();
          if (name) params.set('name', name);
          return {
            name: i.name,
            image: i.image,
            reviewUrl: `${SITE_URL()}/products/${slug}?${params.toString()}`,
          };
        }),
        unsubscribeUrl: unsubscribeUrl(email, 'review'),
        heroSrc: heroSrc('review'),
        logoSrc: heroSrc('logo'),
      }),
      headers: unsubscribeHeaders(email, 'review'),
      attachments: emailAttachments('review'),
    });
    orderIds.push(order._id);
  }

  if (skippedIds.length) {
    await OrderModel.updateMany(
      { _id: { $in: skippedIds } },
      { $set: { 'reviewRequest.sentAt': new Date() } }
    );
  }

  if (messages.length === 0) {
    log.info({ skipped: skippedIds.length }, 'All due orders were skipped');
    return { due: orders.length, sent: 0, failed: 0 };
  }

  const result = await sendBulk(messages);

  const failedAddresses = new Set(result.results.filter((r) => !r.ok).map((r) => r.to));
  const succeededIds = orderIds.filter((_id, i) => !failedAddresses.has(messages[i].to));

  if (succeededIds.length) {
    await OrderModel.updateMany(
      { _id: { $in: succeededIds } },
      { $set: { 'reviewRequest.sentAt': new Date() }, $inc: { 'reviewRequest.count': 1 } }
    );
  }

  await EmailCampaignModel.create({
    type: 'review-request',
    subject: 'Review request (automatic)',
    audience: { source: 'customers' },
    recipientCount: messages.length,
    sentCount: result.sent,
    failedCount: result.failed,
    status: result.failed === 0 ? 'sent' : result.sent === 0 ? 'failed' : 'partial',
    sentByEmail: 'cron',
    failures: result.results.filter((r) => !r.ok).map((r) => ({ email: r.to, error: r.error })),
  });

  log.info({ due: orders.length, sent: result.sent, failed: result.failed }, 'Review request sweep finished');
  return { due: orders.length, sent: result.sent, failed: result.failed };
}
