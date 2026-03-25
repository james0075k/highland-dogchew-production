/**
 * subscriptionProcessController.js
 *
 * Processes due subscription renewals.
 * Called by the daily internal cron (setInterval in index.js) and
 * by POST /api/subscriptions/process (protected by CRON_SECRET header).
 *
 * For each active subscription where nextBillingDate <= now:
 *   1. Charge via Stripe off-session PaymentIntent
 *   2. Create a renewal order
 *   3. Update nextBillingDate + billingHistory
 *   4. Send renewal confirmation email
 *   On failure: increment failureCount, set status to payment_failed after 3 attempts
 */

import { getStripe } from '../config/stripe.js';
import OrderModel from '../models/orderModel.js';
import SubscriptionModel from '../models/subscriptionModel.js';
import sendEmail from '../utils/sendEmail.js';
import {
  subscriptionRenewalEmailHtml,
  subscriptionPaymentFailedEmailHtml,
} from '../utils/emailTemplates.js';

const TAX_RATE        = 0.20;
const DELIVERY_CHARGE = 2.99;
const MAX_FAILURES    = 3;

function addWeeks(date, weeks) {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

// ─── Core processing function (exported for cron + HTTP endpoint) ─────────────

export async function processSubscriptions() {
  const now = new Date();

  const dueSubs = await SubscriptionModel.find({
    status:          'active',
    nextBillingDate: { $lte: now },
  }).limit(100); // safety cap per run

  if (!dueSubs.length) {
    console.log('[cron] No subscriptions due for renewal');
    return { processed: 0, failed: 0 };
  }

  console.log(`[cron] Processing ${dueSubs.length} due subscription(s)`);

  let processed = 0;
  let failed    = 0;

  for (const sub of dueSubs) {
    try {
      await renewSubscription(sub, now);
      processed++;
    } catch (err) {
      console.error(`[cron] Failed to renew ${sub.subscriptionId}:`, err.message);
      failed++;
    }
  }

  return { processed, failed };
}

// ─── Renew a single subscription ─────────────────────────────────────────────

async function renewSubscription(sub, now) {
  const lineTotal   = +(sub.unitPrice * sub.quantity).toFixed(2);
  const totalTax    = +(lineTotal * TAX_RATE).toFixed(2);
  const grandTotal  = +(lineTotal + totalTax + DELIVERY_CHARGE).toFixed(2);
  const amountPence = Math.round(grandTotal * 100);

  // ── Charge via Stripe off-session ─────────────────────────────────────────
  let pi;
  try {
    pi = await getStripe().paymentIntents.create({
      amount:               amountPence,
      currency:             'gbp',
      customer:             sub.stripeCustomerId,
      payment_method:       sub.paymentMethodId,
      confirm:              true,
      off_session:          true,
      return_url:           process.env.APP_URL || 'https://highlanddogchew.co.uk',
      metadata: {
        type:           'subscription-renewal',
        subscriptionId: sub.subscriptionId,
        productName:    sub.productName,
        email:          sub.email,
      },
    });
  } catch (stripeErr) {
    await handleRenewalFailure(sub, stripeErr.message);
    return;
  }

  if (pi.status !== 'succeeded') {
    await handleRenewalFailure(sub, `Stripe PI status: ${pi.status}`);
    return;
  }

  // ── Create renewal order ──────────────────────────────────────────────────
  const addr = sub.shippingAddress || {};
  let order;
  try {
    order = await OrderModel.create({
      items: [{
        product:   sub.product   || undefined,
        name:      sub.productName,
        size:      sub.size      || 'Default',
        quantity:  sub.quantity,
        unitPrice: sub.unitPrice,
      }],
      shippingAddress: {
        fullName:     addr.fullName     || `${addr.firstName || ''} ${addr.lastName || ''}`.trim(),
        firstName:    addr.firstName    || '',
        lastName:     addr.lastName     || '',
        email:        addr.email        || sub.email,
        phone:        addr.phone        || '',
        addressLine1: addr.addressLine1 || '',
        addressLine2: addr.addressLine2 || '',
        city:         addr.city         || '',
        county:       addr.county       || '',
        postcode:     addr.postcode     || '',
        country:      addr.country      || 'United Kingdom',
      },
      subtotal:        lineTotal,
      totalTax,
      totalDelivery:   DELIVERY_CHARGE,
      totalDiscount:   0,
      grandTotal:      pi.amount_received / 100,
      paymentIntentId: pi.id,
      paymentStatus:   'paid',
      orderStatus:     'confirmed',
    });
  } catch (err) {
    console.error(`[cron] Order creation failed for ${sub.subscriptionId}:`, err.message);

    // C-1 fix: payment already went through — MUST advance nextBillingDate here.
    // Without this, the cron would re-charge the customer on the next run
    // because nextBillingDate is still <= now.
    await SubscriptionModel.findByIdAndUpdate(sub._id, {
      $set: {
        nextBillingDate: addWeeks(now, sub.intervalWeeks),
        lastBilledAt:    now,
        failureReason:   `order_creation_failed: ${err.message}`,
      },
      $push: {
        billingHistory: {
          date:            now,
          amount:          grandTotal,
          status:          'success',
          paymentIntentId: pi.id,
          failureReason:   `order_creation_failed: ${err.message}`,
        },
      },
    }).catch((e) => console.error('[cron] Emergency nextBillingDate update failed:', e.message));

    return;
  }

  // ── Update subscription ───────────────────────────────────────────────────
  await SubscriptionModel.findByIdAndUpdate(sub._id, {
    $set: {
      status:          'active',
      nextBillingDate: addWeeks(now, sub.intervalWeeks),
      lastBilledAt:    now,
      failureCount:    0,
      failureReason:   '',
    },
    $push: {
      orders:         order._id,
      billingHistory: {
        date:            now,
        amount:          grandTotal,
        status:          'success',
        orderId:         order._id,
        paymentIntentId: pi.id,
      },
    },
  });

  // ── Send renewal email (fire-and-forget) ──────────────────────────────────
  if (sub.email) {
    sendEmail({
      to: sub.email,
      subject: `Your Highland Yak Chew subscription has been renewed`,
      html: subscriptionRenewalEmailHtml(sub, order),
    }).catch((err) => console.error('[cron] Renewal email failed:', err.message));
  }

  console.log(`[cron] ✅ Renewed ${sub.subscriptionId} → Order ${order.orderNumber}`);
}

// ─── Handle a failed renewal attempt ─────────────────────────────────────────

async function handleRenewalFailure(sub, reason) {
  const newCount  = (sub.failureCount || 0) + 1;
  const newStatus = newCount >= MAX_FAILURES ? 'payment_failed' : 'active';

  await SubscriptionModel.findByIdAndUpdate(sub._id, {
    $set: {
      failureCount:  newCount,
      failureReason: reason,
      status:        newStatus,
    },
    $push: {
      billingHistory: {
        date:          new Date(),
        amount:        +(sub.unitPrice * sub.quantity).toFixed(2),
        status:        'failed',
        failureReason: reason,
      },
    },
  });

  // Email customer if subscription is now suspended
  if (newStatus === 'payment_failed' && sub.email) {
    sendEmail({
      to: sub.email,
      subject: `Action Required – Your Highland Yak Chew subscription payment failed`,
      html: subscriptionPaymentFailedEmailHtml(sub, reason),
    }).catch((err) => console.error('[cron] Failure email error:', err.message));
  }

  console.warn(`[cron] ⚠️  ${sub.subscriptionId} failure #${newCount}: ${reason}`);
}

// ─── POST /api/subscriptions/process (manual trigger) ────────────────────────

export const triggerSubscriptionProcess = async (req, res) => {
  const secret = req.headers['x-cron-secret'];
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const result = await processSubscriptions();
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    console.error('[cron] Manual trigger failed:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
