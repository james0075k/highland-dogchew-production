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

import Stripe from 'stripe';
import OrderModel from '../models/orderModel.js';
import SubscriptionModel from '../models/subscriptionModel.js';
import { createOrderFromPI, safeParse } from '../utils/createOrderFromPI.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseIntervalWeeks(label) {
  if (!label) return 4; // fallback: monthly
  const lower = label.toLowerCase();
  const match = lower.match(/(\d+)\s*week/);
  if (match) return parseInt(match[1], 10);
  if (lower.includes('month')) return 4;
  if (lower.includes('fortnight') || lower.includes('2 week')) return 2;
  if (lower.includes('week')) return 1;
  return 4;
}

function addWeeks(date, weeks) {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

function generateSubId() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SUB-${date}-${rand}`;
}

// ─── Create subscriptions from a confirmed PaymentIntent ─────────────────────

async function createSubscriptionsFromPI(pi, order) {
  const meta = pi.metadata || {};

  if (meta.hasSubscription !== 'true') return;
  if (!pi.payment_method) {
    console.warn('[sub] No payment_method on PI — cannot create subscriptions');
    return;
  }

  const subItems = safeParse(meta.subscriptionItems, []);
  if (!subItems.length) {
    console.warn('[sub] hasSubscription=true but subscriptionItems is empty');
    return;
  }

  const email = meta.c_email || '';

  // ── Find or create a Stripe Customer ───────────────────────────────────────
  let stripeCustomerId;
  try {
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      stripeCustomerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        name: `${meta.c_firstName || ''} ${meta.c_lastName || ''}`.trim() || undefined,
        phone: meta.c_phone || undefined,
      });
      stripeCustomerId = customer.id;
    }

    // Attach the payment method to the customer (idempotent if already attached)
    await stripe.paymentMethods.attach(pi.payment_method, { customer: stripeCustomerId })
      .catch((err) => {
        // "already attached" is not an error worth stopping for
        if (!err.message?.includes('already been attached')) throw err;
      });

    // Set as default for future invoices
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: { default_payment_method: pi.payment_method },
    });
  } catch (err) {
    console.error('[sub] Stripe Customer setup failed:', err.message);
    return; // Don't create subscriptions if Customer setup failed
  }

  // ── Shipping address from order ─────────────────────────────────────────────
  const addr = order.shippingAddress || {};

  // ── Create a SubscriptionModel document per subscription line item ──────────
  for (const item of subItems) {
    const intervalWeeks = parseIntervalWeeks(item.subscriptionInterval);
    const nextBillingDate = addWeeks(new Date(), intervalWeeks);

    try {
      // Idempotency: check if subscription already exists for this PI + productId
      const existingDoc = await SubscriptionModel.findOne({
        'billingHistory.paymentIntentId': pi.id,
        'product': item.productId || undefined,
        productName: item.name,
      });
      if (existingDoc) {
        console.log(`[sub] ⏭️  Subscription already exists for ${item.name} — skipped`);
        continue;
      }

      const sub = await SubscriptionModel.create({
        subscriptionId:   generateSubId(),
        email:            email.toLowerCase(),
        stripeCustomerId,
        paymentMethodId:  pi.payment_method,
        product:          item.productId || undefined,
        productName:      item.name,
        productImage:     item.image || '',
        productSlug:      item.slug  || '',
        size:             item.size  || 'Default',
        quantity:         Number(item.quantity) || 1,
        unitPrice:        Number(item.unitPrice) || 0,
        intervalLabel:    item.subscriptionInterval || 'Every 4 weeks',
        intervalWeeks,
        status:           'active',
        nextBillingDate,
        firstOrderId:     order._id,
        orders:           [order._id],
        billingHistory: [{
          date:            new Date(),
          amount:          +(Number(item.unitPrice) * Number(item.quantity)).toFixed(2),
          status:          'success',
          orderId:         order._id,
          paymentIntentId: pi.id,
        }],
        shippingAddress: {
          fullName:     addr.fullName     || `${addr.firstName || ''} ${addr.lastName || ''}`.trim(),
          firstName:    addr.firstName    || '',
          lastName:     addr.lastName     || '',
          email:        addr.email        || email,
          phone:        addr.phone        || meta.c_phone || '',
          addressLine1: addr.addressLine1 || '',
          addressLine2: addr.addressLine2 || '',
          city:         addr.city         || '',
          county:       addr.county       || '',
          postcode:     addr.postcode     || '',
          country:      addr.country      || 'United Kingdom',
        },
      });

      console.log(`[sub] ✅ Subscription ${sub.subscriptionId} created for ${item.name}`);
    } catch (err) {
      console.error(`[sub] ❌ Failed to create subscription for ${item.name}:`, err.message);
    }
  }
}

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
          console.log(`[webhook] ⏭️  Order ${order.orderNumber} already exists — skipped`);
        }

        // Always attempt subscription creation (idempotent internally)
        if (pi.metadata?.hasSubscription === 'true') {
          await createSubscriptionsFromPI(pi, order);
        }
      } catch (err) {
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
      break;
  }

  return res.status(200).json({ received: true });
};
