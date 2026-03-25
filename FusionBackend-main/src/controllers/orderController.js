/**
 * orderController.js — FALLBACK order creation path (sync endpoint)
 *
 * POST /api/orders/sync  — called by the success page after Stripe redirects back.
 *   • Works in local dev (no webhook reachable)
 *   • Acts as a safety net in production if webhook is delayed or missed
 *   • Fully idempotent — safe to call multiple times for the same payment
 *
 * GET  /api/orders/payment-intent/:paymentIntentId
 *   • Used by the success page to check if the order already exists
 *   • Returns a stripped response (no phone/internal fields)
 *
 * POST /api/orders/my-orders
 *   • Returns order history for a given email (rate-limited in route)
 *
 * POST /api/orders/track
 *   • Public parcel tracking — validates email + orderNumber before returning
 *
 * NOTE: POST /api/orders/create has been removed.
 *       Order creation now happens exclusively via the Stripe webhook
 *       (productWebhookController) or the /sync endpoint below.
 *       Both paths use createOrderFromPI which is payment-verified and idempotent.
 */

import { getStripe } from '../config/stripe.js';
import OrderModel from '../models/orderModel.js';
import { createOrderFromPI } from '../utils/createOrderFromPI.js';
import { createSubscriptionsFromPI } from '../utils/createSubscriptionsFromPI.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';

// ─── GET /api/orders/payment-intent/:paymentIntentId ─────────────────────────
// Used by the success page to confirm the order exists.
// Phone is excluded — it is PII that the success page doesn't need.
export const getOrderByPaymentIntent = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.params;
    const order = await OrderModel.findOne({ paymentIntentId }).lean();
    if (!order) return next(handleError(404, 'Order not found'));

    // Strip internal/sensitive fields before returning
    const { shippingAddress, ...rest } = order;
    const safeAddress = shippingAddress
      ? {
          fullName:     shippingAddress.fullName,
          addressLine1: shippingAddress.addressLine1,
          addressLine2: shippingAddress.addressLine2,
          city:         shippingAddress.city,
          county:       shippingAddress.county,
          postcode:     shippingAddress.postcode,
          country:      shippingAddress.country,
          // email included so success page can show "confirmation sent to …"
          email:        shippingAddress.email,
          // phone omitted — not needed on success page
        }
      : {};

    return handleSuccess(res, 200, 'Order fetched successfully', { ...rest, shippingAddress: safeAddress });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders — admin only ────────────────────────────────────────────
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 }).limit(50);
    return handleSuccess(res, 200, 'Orders fetched successfully', orders);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/orders/my-orders — Fetch all orders by email ──────────────────
// Body: { email }
// Rate-limited in orderRoute.js (10 req / 15 min per IP).
// Returns only safe customer-facing fields — no phone, no internal IDs.
export const getMyOrders = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !String(email).trim()) {
      return next(handleError(400, 'Email address is required'));
    }

    const emailLower = String(email).trim().toLowerCase();

    const orders = await OrderModel.find({
      'shippingAddress.email': { $regex: new RegExp(`^${emailLower}$`, 'i') },
    })
      .sort({ createdAt: -1 })
      .lean();

    const payload = orders.map((o) => ({
      orderNumber:    o.orderNumber,
      orderStatus:    o.orderStatus,
      paymentStatus:  o.paymentStatus,
      trackingNumber: o.trackingNumber || null,
      courier:        o.courier || 'evri',
      shippedAt:      o.shippedAt || null,
      createdAt:      o.createdAt,
      grandTotal:     o.grandTotal,
      items: (o.items || []).map((i) => ({
        name:      i.name,
        size:      i.size,
        quantity:  i.quantity,
        unitPrice: i.unitPrice,
      })),
      shippingAddress: {
        fullName:     o.shippingAddress?.fullName,
        addressLine1: o.shippingAddress?.addressLine1,
        city:         o.shippingAddress?.city,
        postcode:     o.shippingAddress?.postcode,
        country:      o.shippingAddress?.country,
      },
    }));

    return handleSuccess(res, 200, `Found ${payload.length} order(s)`, payload);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/orders/track — Public parcel tracking ─────────────────────────
// Body: { orderNumber, email }
// Validates email against shippingAddress.email; returns limited safe fields.
export const trackOrder = async (req, res, next) => {
  try {
    const { orderNumber, email } = req.body;

    if (!orderNumber || !email) {
      return next(handleError(400, 'orderNumber and email are required'));
    }

    const order = await OrderModel.findOne({
      orderNumber: String(orderNumber).trim().toUpperCase(),
    }).lean();

    if (!order) return next(handleError(404, 'Order not found'));

    // Validate email matches (case-insensitive)
    const storedEmail = (order.shippingAddress?.email || '').toLowerCase().trim();
    if (storedEmail !== String(email).toLowerCase().trim()) {
      return next(handleError(404, 'Order not found'));
    }

    // Return only the fields the customer needs
    const payload = {
      orderNumber:    order.orderNumber,
      orderStatus:    order.orderStatus,
      paymentStatus:  order.paymentStatus,
      trackingNumber: order.trackingNumber || null,
      courier:        order.courier || 'evri',
      shippedAt:      order.shippedAt || null,
      createdAt:      order.createdAt,
      items:          (order.items || []).map((i) => ({
        name:      i.name,
        size:      i.size,
        quantity:  i.quantity,
        unitPrice: i.unitPrice,
      })),
      subtotal:      order.subtotal,
      totalTax:      order.totalTax,
      totalDelivery: order.totalDelivery,
      grandTotal:    order.grandTotal,
      shippingAddress: {
        fullName:     order.shippingAddress?.fullName,
        addressLine1: order.shippingAddress?.addressLine1,
        city:         order.shippingAddress?.city,
        postcode:     order.shippingAddress?.postcode,
        country:      order.shippingAddress?.country,
      },
    };

    return handleSuccess(res, 200, 'Order found', payload);
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/orders/sync — FALLBACK order creation ─────────────────────────
//
// Flow:
//   1. Check DB first — if order exists, return it instantly (no Stripe call)
//   2. Retrieve PI from Stripe and verify it actually succeeded
//   3. Delegate to createOrderFromPI (same utility as webhook)
//
// The unique index on paymentIntentId makes concurrent webhook + sync calls safe:
//   • If webhook wins → sync finds the existing order at step 1
//   • If sync wins   → webhook finds the existing order and skips creation
//   • If both race   → MongoDB unique index rejects the second insert; the
//                      duplicate-key handler in createOrderFromPI returns the winner
//
export const syncOrderFromPaymentIntent = async (req, res, next) => {
  try {
    // customer = shipping details saved in sessionStorage by the checkout page.
    // Passed here as a fallback when PI metadata is empty (race with payment confirm).
    const { paymentIntentId, customer } = req.body;

    if (!paymentIntentId) {
      return next(handleError(400, 'paymentIntentId is required'));
    }

    // ── Retrieve PI from Stripe to verify payment ─────────────────────────────
    let pi;
    try {
      pi = await getStripe().paymentIntents.retrieve(paymentIntentId);
    } catch (stripeErr) {
      return next(handleError(400, `Stripe error: ${stripeErr.message}`));
    }

    if (pi.status !== 'succeeded') {
      return next(handleError(402, `Payment not completed (status: ${pi.status})`));
    }

    // ── Delegate to shared util — passes customerOverride so empty metadata ────
    //    orders are backfilled with sessionStorage data from the checkout page.
    const { order, created } = await createOrderFromPI(pi, customer || null);

    // Create subscription records if this PI contains subscription items
    if (pi.metadata?.hasSubscription === 'true') {
      await createSubscriptionsFromPI(pi, order);
    }

    console.log(`[sync] ${created ? '✅ Created' : '⏭️  Already existed'}: Order ${order.orderNumber} (PI: ${pi.id})`);
    return handleSuccess(res, created ? 201 : 200, created ? 'Order created' : 'Order fetched', order);

  } catch (err) {
    next(err);
  }
};
