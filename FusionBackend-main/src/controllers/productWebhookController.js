/**
 * productWebhookController.js — PRIMARY order creation path
 *
 * Stripe calls this endpoint after every payment event.
 * The sync endpoint (fallback) uses the same createOrderFromPI utility,
 * so the two paths can never produce duplicate orders.
 *
 * If the order contains subscription items, createSubscriptionsFromPI is
 * called after the order is confirmed. It creates a Stripe Customer,
 * attaches the saved payment method, and creates Subscription records.
 */

import { getStripe } from '../config/stripe.js';
import OrderModel from '../models/orderModel.js';
import { createOrderFromPI } from '../utils/createOrderFromPI.js';
import { createSubscriptionsFromPI } from '../utils/createSubscriptionsFromPI.js';
import logger from '../utils/logger.js';

const log = logger.child({ component: 'webhook' });

// ─── POST /api/webhook/stripe ─────────────────────────────────────────────────
export const handleProductWebhook = async (req, res) => {
  // ── 1. Verify Stripe signature (reject tampered requests) ────────────────────
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.PRODUCT_WEBHOOK_SECRET
    );
  } catch (err) {
    log.warn({ err }, 'Stripe signature verification failed');
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {

    // ── payment_intent.succeeded ─────────────────────────────────────────────
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      if (pi.metadata?.type !== 'product-purchase') break;

      try {
        const { order, created } = await createOrderFromPI(pi);
        log.info(
          { orderNumber: order.orderNumber, pi: pi.id, created },
          created ? 'Order created' : 'Order already exists, skipped',
        );

        // Always attempt subscription creation (idempotent internally)
        if (pi.metadata?.hasSubscription === 'true') {
          await createSubscriptionsFromPI(pi, order);
        }
      } catch (err) {
        log.error({ err, pi: pi.id }, 'Error processing payment_intent.succeeded');
        // H-6 fix: return 500 so Stripe retries (up to ~3 days with exponential back-off).
        // createOrderFromPI is idempotent via unique index — safe to retry.
        return res.status(500).json({ error: 'Processing failed — will retry' });
      }
      break;
    }

    // ── payment_intent.payment_failed ────────────────────────────────────────
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      if (pi.metadata?.type !== 'product-purchase') break;
      const reason = pi.last_payment_error?.message || 'unknown reason';
      log.warn({ pi: pi.id, reason }, 'Payment failed');
      break;
    }

    // ── payment_intent.canceled (L-1 fix) ────────────────────────────────────
    case 'payment_intent.canceled': {
      const pi = event.data.object;
      if (pi.metadata?.type !== 'product-purchase') break;
      // Mark any partially-created order as cancelled (guard: only if not already paid)
      await OrderModel.findOneAndUpdate(
        { paymentIntentId: pi.id, paymentStatus: { $ne: 'paid' } },
        { paymentStatus: 'failed', orderStatus: 'cancelled' }
      ).catch((err) => log.error({ err, pi: pi.id }, 'Cancel update failed'));
      log.info({ pi: pi.id }, 'Payment intent cancelled');
      break;
    }

    // ── charge.refunded ──────────────────────────────────────────────────────
    case 'charge.refunded': {
      const charge = event.data.object;
      if (charge.payment_intent) {
        await OrderModel.findOneAndUpdate(
          { paymentIntentId: charge.payment_intent },
          { paymentStatus: 'refunded', orderStatus: 'cancelled' }
        ).catch((err) =>
          log.error({ err, pi: charge.payment_intent }, 'Refund update failed'),
        );
        log.info({ pi: charge.payment_intent }, 'Order refunded');
      }
      break;
    }

    default:
      break;
  }

  return res.status(200).json({ received: true });
};
