/**
 * subscriptionProcessController.js
 *
 * Processes due subscription renewals.
 * Called by the daily internal cron (setInterval in index.js) and
 * by POST /api/subscriptions/process (protected by CRON_SECRET header).
 *
 * For each active subscription where nextBillingDate <= now:
 *   1. Atomically claim by advancing nextBillingDate → prevents concurrent double-charge
 *   2. Charge via Stripe off-session PaymentIntent
 *   3. Create a renewal order
 *   4. Update subscription record + billingHistory
 *   5. Send renewal confirmation email
 *   On Stripe failure: restore original nextBillingDate, increment failureCount
 *   After MAX_FAILURES: set status to payment_failed
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
const BATCH_SIZE      = 100;

/**
 * DST-safe week addition via millisecond arithmetic.
 * Avoids setDate() which can shift the clock by 1 hour on daylight-saving boundaries.
 */
function addWeeks(date, weeks) {
  return new Date(new Date(date).getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
}

// ─── Core processing function (exported for cron + HTTP endpoint) ─────────────

export async function processSubscriptions() {
  const appUrl = process.env.APP_URL;
  if (!appUrl) {
    throw new Error('[cron] APP_URL environment variable is required for off-session Stripe payments');
  }

  const now = new Date();
  let processed = 0;
  let failed    = 0;

  // Process in batches; re-query after each batch because we mutate nextBillingDate
  // to atomically claim subscriptions and prevent concurrent double-charging.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const dueSubs = await SubscriptionModel.find({
      status:          'active',
      nextBillingDate: { $lte: now },
    }).limit(BATCH_SIZE);

    if (!dueSubs.length) break;

    console.log(`[cron] Processing batch of ${dueSubs.length} due subscription(s)`);

    for (const sub of dueSubs) {
      // ── Atomic claim ───────────────────────────────────────────────────────
      // Advance nextBillingDate NOW, before charging Stripe. This guarantees
      // that even if the process crashes after a successful charge, the
      // subscription will NOT be re-charged on the next cron run (since
      // nextBillingDate is already in the future).  If the Stripe charge
      // fails, handleRenewalFailure restores the original nextBillingDate.
      const newNextBillingDate = addWeeks(sub.nextBillingDate, sub.intervalWeeks);
      const claimed = await SubscriptionModel.findOneAndUpdate(
        {
          _id:             sub._id,
          nextBillingDate: sub.nextBillingDate, // ensure it hasn't changed since we queried
          status:          'active',
        },
        { $set: { nextBillingDate: newNextBillingDate } },
        { new: false }, // return the OLD doc — falsy if not found (already claimed)
      );

      if (!claimed) {
        console.log(`[cron] ${sub.subscriptionId} already claimed by concurrent run — skipping`);
        continue;
      }

      try {
        await renewSubscription(sub, now, appUrl);
        processed++;
      } catch (err) {
        console.error(`[cron] Unexpected error renewing ${sub.subscriptionId}:`, err.message);
        failed++;
        // Restore original nextBillingDate so the subscription is retried next run
        await SubscriptionModel.findByIdAndUpdate(sub._id, {
          $set: { nextBillingDate: sub.nextBillingDate },
        }).catch((e) => console.error('[cron] Failed to restore nextBillingDate:', e.message));
      }
    }

    // Fewer than BATCH_SIZE results means we've exhausted the due-subscription queue
    if (dueSubs.length < BATCH_SIZE) break;
  }

  if (processed || failed) {
    console.log(`[cron] Done — ✅ ${processed} renewed, ❌ ${failed} failed`);
  } else {
    console.log('[cron] No subscriptions due for renewal');
  }

  return { processed, failed };
}

// ─── Renew a single subscription ─────────────────────────────────────────────

async function renewSubscription(sub, now, appUrl) {
  const lineTotal   = +(sub.unitPrice * sub.quantity).toFixed(2);
  const totalTax    = +(lineTotal * TAX_RATE).toFixed(2);
  const grandTotal  = +(lineTotal + totalTax + DELIVERY_CHARGE).toFixed(2);
  const amountPence = Math.round(grandTotal * 100);

  // ── Charge via Stripe off-session ─────────────────────────────────────────
  let pi;
  try {
    pi = await getStripe().paymentIntents.create({
      amount:         amountPence,
      currency:       'gbp',
      customer:       sub.stripeCustomerId,
      payment_method: sub.paymentMethodId,
      confirm:        true,
      off_session:    true,
      return_url:     appUrl,
      metadata: {
        type:           'subscription-renewal',
        subscriptionId: sub.subscriptionId,
        // Truncate to stay within Stripe's 500-char metadata value limit
        productName:    String(sub.productName || '').slice(0, 500),
        email:          String(sub.email       || '').slice(0, 500),
      },
    });
  } catch (stripeErr) {
    // Charge failed — restore original nextBillingDate so the sub is retried
    await handleRenewalFailure(sub, stripeErr.message, now, sub.nextBillingDate);
    return;
  }

  if (pi.status !== 'succeeded') {
    await handleRenewalFailure(sub, `Stripe PI status: ${pi.status}`, now, sub.nextBillingDate);
    return;
  }

  // ── Create renewal order ──────────────────────────────────────────────────
  const addr = sub.shippingAddress || {};
  let order;
  try {
    order = await OrderModel.create({
      items: [{
        product:   sub.product   || undefined,
        name:      String(sub.productName || 'Subscription renewal'),
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
      grandTotal,
      paymentIntentId: pi.id,
      paymentStatus:   'paid',
      orderStatus:     'confirmed',
    });
  } catch (err) {
    console.error(`[cron] Order creation failed for ${sub.subscriptionId}:`, err.message);
    // Payment succeeded but order creation failed.
    // nextBillingDate is ALREADY advanced (no double-charge risk).
    // Record the billing entry so the admin can investigate.
    await SubscriptionModel.findByIdAndUpdate(sub._id, {
      $set: {
        lastBilledAt:  now,
        failureReason: `order_creation_failed: ${err.message}`.slice(0, 500),
      },
      $push: {
        billingHistory: {
          date:            now,
          amount:          grandTotal,
          status:          'success',
          paymentIntentId: pi.id,
          failureReason:   `order_creation_failed: ${err.message}`.slice(0, 500),
        },
      },
    }).catch((e) => console.error('[cron] Failed to record billing entry after order failure:', e.message));
    return;
  }

  // ── Finalise subscription record ──────────────────────────────────────────
  // nextBillingDate was already set atomically before the Stripe charge.
  await SubscriptionModel.findByIdAndUpdate(sub._id, {
    $set: {
      status:        'active',
      lastBilledAt:  now,
      failureCount:  0,
      failureReason: '',
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
      to:      sub.email,
      subject: `Your Highland Yak Chew subscription has been renewed`,
      html:    subscriptionRenewalEmailHtml(sub, order),
    }).catch((err) => console.error('[cron] Renewal email failed:', err.message));
  }

  console.log(`[cron] ✅ Renewed ${sub.subscriptionId} → Order ${order.orderNumber}`);
}

// ─── Handle a failed renewal attempt ─────────────────────────────────────────

async function handleRenewalFailure(sub, reason, now, restoreNextBillingDate) {
  const newCount  = (sub.failureCount || 0) + 1;
  const newStatus = newCount >= MAX_FAILURES ? 'payment_failed' : 'active';

  // Truncate so we never store a multi-kilobyte Stripe error message
  const truncatedReason = String(reason || 'Unknown error').slice(0, 500);

  await SubscriptionModel.findByIdAndUpdate(sub._id, {
    $set: {
      failureCount:    newCount,
      failureReason:   truncatedReason,
      status:          newStatus,
      nextBillingDate: restoreNextBillingDate, // restore so it's retried on next run
    },
    $push: {
      billingHistory: {
        date:          now,
        amount:        +(sub.unitPrice * sub.quantity).toFixed(2),
        status:        'failed',
        failureReason: truncatedReason,
      },
    },
  });

  // Email customer only when subscription becomes suspended
  if (newStatus === 'payment_failed' && sub.email) {
    sendEmail({
      to:      sub.email,
      subject: `Action Required – Your Highland Yak Chew subscription payment failed`,
      html:    subscriptionPaymentFailedEmailHtml(sub, truncatedReason),
    }).catch((err) => console.error('[cron] Failure email error:', err.message));
  }

  console.warn(`[cron] ⚠️  ${sub.subscriptionId} failure #${newCount}: ${truncatedReason}`);
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
