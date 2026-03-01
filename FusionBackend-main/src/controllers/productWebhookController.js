/**
 * productWebhookController.js — PRIMARY order creation path
 *
 * Stripe calls this endpoint after every payment event.
 * The sync endpoint (fallback) uses the same createOrderFromPI utility,
 * so the two paths can never produce duplicate orders.
 */

import Stripe from 'stripe';
import OrderModel from '../models/orderModel.js';
import { createOrderFromPI } from '../utils/createOrderFromPI.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─── POST /api/webhook/stripe ─────────────────────────────────────────────────
export const handleProductWebhook = async (req, res) => {
  // ── 1. Verify Stripe signature (reject tampered requests) ────────────────────
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.PRODUCT_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ── 2. Always respond 200 quickly so Stripe does not retry ───────────────────
  //    (DB write happens synchronously above; emails are fire-and-forget)
  switch (event.type) {

    // ── payment_intent.succeeded ─────────────────────────────────────────────
    case 'payment_intent.succeeded': {
      const pi = event.data.object;
      if (pi.metadata?.type !== 'product-purchase') break;

      try {
        const { order, created } = await createOrderFromPI(pi);
        if (created) {
          console.log(`[webhook] ✅ Order ${order.orderNumber} created (PI: ${pi.id})`);
        } else {
          // Sync endpoint already created it — perfectly normal in dual-system
          console.log(`[webhook] ⏭️  Order ${order.orderNumber} already exists (sync was faster) — skipped`);
        }
      } catch (err) {
        // Log but still return 200 — Stripe will not retry on 200
        console.error('[webhook] ❌ Error processing payment_intent.succeeded:', err.message);
      }
      break;
    }

    // ── payment_intent.payment_failed ────────────────────────────────────────
    case 'payment_intent.payment_failed': {
      const pi = event.data.object;
      if (pi.metadata?.type !== 'product-purchase') break;
      const reason = pi.last_payment_error?.message || 'unknown reason';
      console.log(`[webhook] ⚠️  Payment failed for PI ${pi.id}: ${reason}`);
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
          console.error('[webhook] Refund update failed:', err.message)
        );
        console.log(`[webhook] 💸 Order refunded for PI ${charge.payment_intent}`);
      }
      break;
    }

    default:
      // Silently ignore events we don't handle
      break;
  }

  return res.status(200).json({ received: true });
};
