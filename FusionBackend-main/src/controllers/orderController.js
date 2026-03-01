/**
 * orderController.js — FALLBACK order creation path (sync endpoint)
 *
 * POST /api/orders/sync  — called by the success page after Stripe redirects back.
 *   • Works in local dev (no webhook reachable)
 *   • Acts as a safety net in production if webhook is delayed or missed
 *   • Fully idempotent — safe to call multiple times for the same payment
 *
 * GET  /api/orders/payment-intent/:paymentIntentId
 *   • Lightweight read used by the success page to check if order already exists
 *     (avoids a Stripe API call when the webhook already fired)
 */

import Stripe from 'stripe';
import OrderModel from '../models/orderModel.js';
import { createOrderFromPI } from '../utils/createOrderFromPI.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─── POST /api/orders/create (legacy — kept for backwards compat) ─────────────
export const createOrder = async (req, res, next) => {
  try {
    const {
      items, shippingAddress, subtotal, totalTax,
      totalDelivery, totalDiscount, grandTotal, paymentIntentId,
    } = req.body;

    if (paymentIntentId) {
      const existing = await OrderModel.findOne({ paymentIntentId });
      if (existing) return handleSuccess(res, 200, 'Order already exists', existing);
    }

    const order = await OrderModel.create({
      items, shippingAddress, subtotal, totalTax,
      totalDelivery, totalDiscount: totalDiscount || 0,
      grandTotal, paymentIntentId,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    return handleSuccess(res, 201, 'Order created successfully', order);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders/payment-intent/:paymentIntentId ─────────────────────────
export const getOrderByPaymentIntent = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.params;
    const order = await OrderModel.findOne({ paymentIntentId });
    if (!order) return next(handleError(404, 'Order not found'));
    return handleSuccess(res, 200, 'Order fetched successfully', order);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/orders ──────────────────────────────────────────────────────────
export const getUserOrders = async (req, res, next) => {
  try {
    const orders = await OrderModel.find().sort({ createdAt: -1 }).limit(50);
    return handleSuccess(res, 200, 'Orders fetched successfully', orders);
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
      pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (stripeErr) {
      return next(handleError(400, `Stripe error: ${stripeErr.message}`));
    }

    if (pi.status !== 'succeeded') {
      return next(handleError(402, `Payment not completed (status: ${pi.status})`));
    }

    // ── Delegate to shared util — passes customerOverride so empty metadata ────
    //    orders are backfilled with sessionStorage data from the checkout page.
    const { order, created } = await createOrderFromPI(pi, customer || null);

    console.log(`[sync] ${created ? '✅ Created' : '⏭️  Already existed'}: Order ${order.orderNumber} (PI: ${pi.id})`);
    return handleSuccess(res, created ? 201 : 200, created ? 'Order created' : 'Order fetched', order);

  } catch (err) {
    next(err);
  }
};
