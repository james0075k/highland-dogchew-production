/**
 * createOrderFromPI.js
 *
 * Single source of truth for order creation from a Stripe PaymentIntent.
 * Used by BOTH the webhook handler (primary) and the sync endpoint (fallback).
 *
 * Guarantees:
 *   • Idempotent — returns the existing order if already created (no duplicate)
 *   • Atomic — unique index on paymentIntentId blocks concurrent duplicates at DB level
 *   • Fire-and-forget emails — a failed email never blocks order creation
 */

import OrderModel from '../models/orderModel.js';
import ProductModel from '../models/productModel.js';
import PromoCodeModel from '../models/promoCodeModel.js';
import sendEmail from './sendEmail.js';
import { customerOrderEmailHtml, adminOrderEmailHtml } from './emailTemplates.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function safeParse(str, fallback = []) {
  try { return JSON.parse(str || '[]'); } catch { return fallback; }
}

// H-4 fix: reassemble chunked metadata values written by chunkToMeta()
//
// New format:  items_n="3", items_0="...", items_1="...", items_2="..."
// Legacy format: items="[{...}]"   (single field, kept for backward compat)
//
export function unchunkFromMeta(meta, prefix) {
  const n = parseInt(meta[`${prefix}_n`] || '0', 10);
  if (n > 0) {
    let result = '';
    for (let i = 0; i < n; i++) {
      result += meta[`${prefix}_${i}`] || '';
    }
    return result;
  }
  // Backward compat: old single-field format
  return meta[prefix] || '[]';
}

export function buildOrderItems(lineItems) {
  return lineItems.map((item) => ({
    ...(item.productId ? { product: item.productId } : {}),
    name:      item.name      || 'Unknown Product',
    size:      item.size      || 'Default',
    quantity:  Number(item.quantity)  || 1,
    unitPrice: Number(item.unitPrice) || 0,
    subscriptionInterval: item.subscriptionInterval || null,
  }));
}

// ─── Core ─────────────────────────────────────────────────────────────────────
//
// createOrderFromPI(pi, customerOverride?)
//
// @param  pi               — Stripe PaymentIntent object (already retrieved)
// @param  customerOverride — optional customer/shipping data from sessionStorage
//                           (used when PI metadata is empty because update-meta
//                            raced with the payment confirmation)
// @returns  { order: OrderDocument, created: boolean }
//   created = true  → new order was inserted
//   created = false → existing order returned (idempotent path)
//
// Throws if:
//   • pi.metadata.type !== 'product-purchase'
//   • pi.status !== 'succeeded'
//
export async function createOrderFromPI(pi, customerOverride = null) {
  // ── Guard: only handle our own product-purchase intents ──────────────────────
  if (pi.metadata?.type !== 'product-purchase') {
    throw new Error('Invalid payment type — not a product-purchase intent');
  }
  if (pi.status !== 'succeeded') {
    throw new Error(`Payment not completed (Stripe status: ${pi.status})`);
  }

  // ── Idempotency check — DB lookup is cheaper than a Stripe API call ───────────
  const existing = await OrderModel.findOne({ paymentIntentId: pi.id });
  if (existing) {
    // If the existing order is missing customer details but we have them now,
    // patch the record before returning it (handles replay via success page).
    if (customerOverride && !existing.shippingAddress.email && customerOverride.email) {
      const patched = await OrderModel.findByIdAndUpdate(
        existing._id,
        {
          'shippingAddress.fullName':
            `${customerOverride.firstName || ''} ${customerOverride.lastName || ''}`.trim()
            || existing.shippingAddress.fullName,
          'shippingAddress.firstName':    customerOverride.firstName    || existing.shippingAddress.firstName,
          'shippingAddress.lastName':     customerOverride.lastName     || existing.shippingAddress.lastName,
          'shippingAddress.email':        customerOverride.email        || existing.shippingAddress.email,
          'shippingAddress.phone':        customerOverride.phone        || existing.shippingAddress.phone,
          'shippingAddress.addressLine1': customerOverride.addressLine1 || existing.shippingAddress.addressLine1,
          'shippingAddress.addressLine2': customerOverride.addressLine2 || existing.shippingAddress.addressLine2,
          'shippingAddress.city':         customerOverride.city         || existing.shippingAddress.city,
          'shippingAddress.county':       customerOverride.county       || existing.shippingAddress.county,
          'shippingAddress.postcode':     customerOverride.postcode     || existing.shippingAddress.postcode,
          'shippingAddress.country':      customerOverride.country      || existing.shippingAddress.country,
        },
        { new: true }
      );
      return { order: patched, created: false };
    }
    return { order: existing, created: false };
  }

  // ── Extract customer & shipping ───────────────────────────────────────────────
  // Priority: PI metadata > customerOverride (sessionStorage) > empty string
  const meta      = pi.metadata;
  const c         = customerOverride || {};
  const firstName = meta.c_firstName || c.firstName   || '';
  const lastName  = meta.c_lastName  || c.lastName    || '';
  const fullName  = `${firstName} ${lastName}`.trim() || 'Customer';
  const email     = meta.c_email     || c.email       || '';
  const phone     = meta.c_phone     || c.phone       || '';

  // H-4 fix: reconstruct items from chunked metadata fields
  const lineItems = safeParse(unchunkFromMeta(meta, 'items'));

  // ── Create the order ──────────────────────────────────────────────────────────
  let order;
  try {
    order = await OrderModel.create({
      items: buildOrderItems(lineItems),
      shippingAddress: {
        fullName,
        firstName,
        lastName,
        email,
        phone,
        addressLine1: meta.s_line1    || c.addressLine1 || '',
        addressLine2: meta.s_line2    || c.addressLine2 || '',
        city:         meta.s_city     || c.city         || '',
        county:       meta.s_county   || c.county       || '',
        postcode:     meta.s_postcode || c.postcode     || '',
        country:      meta.s_country  || c.country      || 'United Kingdom',
      },
      subtotal:      parseFloat(meta.subtotal      || '0'),
      totalTax:      parseFloat(meta.totalTax      || '0'),
      totalDelivery: parseFloat(meta.totalDelivery || '0'),
      totalDiscount: parseFloat(meta.discount      || '0'),
      // Authoritative total = what Stripe actually charged (pence → GBP)
      grandTotal:    pi.amount_received / 100,
      paymentIntentId: pi.id,
      paymentStatus:   'paid',
      orderStatus:     'confirmed',
    });
  } catch (err) {
    // Duplicate key error: another process (webhook or sync) won the race.
    // Fetch and return the winning record — still idempotent.
    if (err.code === 11000) {
      const winner = await OrderModel.findOne({ paymentIntentId: pi.id });
      if (winner) return { order: winner, created: false };
    }
    throw err;
  }

  // ── Stock decrement (fire-and-forget — never blocks order creation) ───────────
  try {
    for (const item of lineItems) {
      if (!item.productId) continue;
      const qty = Number(item.quantity) || 1;

      if (item.size && item.size !== 'Default') {
        // H-5 fix: single $elemMatch query — prevents double-decrement when
        // a size's value and label are identical strings.
        // Floor guard: stockQuantity: { $gte: qty } prevents stock going negative
        // under concurrent orders (atomic — only one winner when stock is 1).
        await ProductModel.updateOne(
          {
            _id: item.productId,
            trackStock: true,
            sizes: {
              $elemMatch: {
                $or: [{ value: item.size }, { label: item.size }],
                stockQuantity: { $gte: qty },
              },
            },
          },
          { $inc: { 'sizes.$.stockQuantity': -qty } }
        ).catch(() => {});
      } else {
        // Global stock decrement — floor guard prevents going negative
        await ProductModel.updateOne(
          { _id: item.productId, trackStock: true, stockQuantity: { $gte: qty } },
          { $inc: { stockQuantity: -qty } }
        ).catch(() => {});
      }
    }
  } catch (stockErr) {
    console.error('[order] Stock decrement failed:', stockErr.message);
  }

  // ── Promo code usage increment (fire-and-forget) ──────────────────────────────
  if (meta.promoCode) {
    PromoCodeModel.findOneAndUpdate(
      { code: meta.promoCode.toUpperCase() },
      { $inc: { usageCount: 1 } }
    ).catch((err) => console.error('[order] Promo update failed:', err.message));
  }

  // ── Confirmation emails (fire-and-forget) ─────────────────────────────────────
  if (email) {
    const hasSubscription = meta.hasSubscription === 'true';
    sendEmail({
      to: email,
      subject: `Your Order Confirmation – Highland Yak Chew (${order.orderNumber})`,
      html: customerOrderEmailHtml(order, firstName, { hasSubscription }),
    }).catch((err) => console.error('[order] Customer email failed:', err.message));
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    sendEmail({
      to: adminEmail,
      subject: `New Order Received – ${order.orderNumber} – Action Required`,
      html: adminOrderEmailHtml(order, meta),
    }).catch((err) => console.error('[order] Admin email failed:', err.message));
  }

  return { order, created: true };
}
