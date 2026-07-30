/**
 * reconcileStripePayments.js — safety net for order creation.
 *
 * Orders are normally created by the Stripe webhook (primary) or by
 * POST /api/orders/sync when the customer's browser reaches the receipt page
 * (fallback). Both can be missed at once:
 *
 *   • the webhook endpoint isn't registered / its secret is wrong / it 500s past
 *     Stripe's retry window, AND
 *   • the customer closes the tab before the success page loads.
 *
 * The result is money taken with no order and no confirmation email — invisible,
 * because nothing in our own system knows the payment happened.
 *
 * This sweep asks Stripe directly: "which succeeded product payments from the
 * last 48h have no order?" and creates any it finds via the same
 * createOrderFromPI used by both other paths, so it inherits their idempotency,
 * stock handling and promo redemption. It also re-runs subscription creation for
 * recent subscription payments — that call is a cheap no-op once the records
 * exist, and it closes the window where a process died mid-creation.
 *
 * A rescue is always abnormal, so it emails ADMIN_EMAIL: it means webhook
 * delivery is broken and needs fixing at the source.
 */

import { getStripe } from '../config/stripe.js';
import OrderModel from '../models/orderModel.js';
import SubscriptionModel from '../models/subscriptionModel.js';
import { createOrderFromPI } from './createOrderFromPI.js';
import { createSubscriptionsFromPI } from './createSubscriptionsFromPI.js';
import sendEmail from './sendEmail.js';
import { paymentRescuedAdminEmailHtml } from './emailTemplates.js';
import logger from './logger.js';

const log = logger.child({ component: 'reconcile' });

const LOOKBACK_MS = 48 * 60 * 60 * 1000;
const PAGE_SIZE   = 100;
const MAX_PAGES   = 10; // 1,000 PIs per sweep is far beyond real volume

/**
 * @returns {Promise<{ scanned: number, rescued: string[], failed: string[] }>}
 */
export async function reconcileStripePayments({ lookbackMs = LOOKBACK_MS } = {}) {
  const createdAfter = Math.floor((Date.now() - lookbackMs) / 1000);

  let scanned = 0;
  const rescued = [];
  const failed  = [];

  let startingAfter;
  for (let page = 0; page < MAX_PAGES; page++) {
    const batch = await getStripe().paymentIntents.list({
      created: { gte: createdAfter },
      limit:   PAGE_SIZE,
      ...(startingAfter && { starting_after: startingAfter }),
    });

    for (const pi of batch.data) {
      // Only our own product payments; ignore anything else on the account.
      if (pi.metadata?.type !== 'product-purchase') continue;
      if (pi.status !== 'succeeded') continue;
      scanned += 1;

      try {
        const existing = await OrderModel.exists({ paymentIntentId: pi.id });

        if (!existing) {
          const { order, created } = await createOrderFromPI(pi);
          if (created) {
            rescued.push(order.orderNumber);
            log.warn(
              { pi: pi.id, orderNumber: order.orderNumber },
              'Order was missing and has been created from Stripe — check webhook delivery',
            );
          }
          if (pi.metadata?.hasSubscription === 'true') {
            await createSubscriptionsFromPI(pi, order);
          }
        } else if (pi.metadata?.hasSubscription === 'true') {
          // Order exists, but subscription creation may have died part-way.
          // Only re-run when nothing was recorded for this payment: the util
          // resolves the Stripe Customer before it checks individual line items,
          // so calling it speculatively every hour would mean pointless Stripe
          // API traffic for every recent subscription order.
          const hasSubs = await SubscriptionModel.exists({ originPaymentIntentId: pi.id });
          if (!hasSubs) {
            const order = await OrderModel.findOne({ paymentIntentId: pi.id });
            if (order) {
              log.warn({ pi: pi.id }, 'Subscription records missing for a paid order — recreating');
              await createSubscriptionsFromPI(pi, order);
            }
          }
        }
      } catch (err) {
        failed.push(pi.id);
        log.error({ err, pi: pi.id }, 'Reconciliation failed for payment');
      }
    }

    if (!batch.has_more || batch.data.length === 0) break;
    startingAfter = batch.data[batch.data.length - 1].id;
  }

  if (rescued.length > 0 && process.env.ADMIN_EMAIL) {
    sendEmail({
      to: process.env.ADMIN_EMAIL,
      subject: `⚠️ ${rescued.length} order(s) recovered from Stripe – check webhook delivery`,
      html: paymentRescuedAdminEmailHtml(rescued, failed),
    }).catch((err) => log.error({ err }, 'Rescue alert email failed'));
  }

  log.info({ scanned, rescued: rescued.length, failed: failed.length }, 'Reconciliation sweep finished');
  return { scanned, rescued, failed };
}

export default reconcileStripePayments;
