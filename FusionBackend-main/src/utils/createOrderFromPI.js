/**
 * createOrderFromPI.js
 *
 * Single source of truth for order creation from a Stripe PaymentIntent.
 * Used by BOTH the webhook handler (primary) and the sync endpoint (fallback).
 *
 * Guarantees:
 *   • Idempotent  — returns the existing order if already created (no duplicate)
 *   • Stock-first — stock is decremented BEFORE the order insert.
 *                   If the insert subsequently fails the decrement is rolled back
 *                   (compensating-transaction pattern — no MongoDB session required).
 *   • Oversell    — modifiedCount check at decrement time detects races at webhook
 *                   level; oversold items cause orderStatus='backordered' so the admin
 *                   is alerted rather than silently shipping a short order.
 *   • Promo sync  — usageCount is awaited (not fire-and-forget) so drift is caught
 *                   and logged immediately.
 *   • Emails      — fire-and-forget; a failed email never blocks order creation.
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
export function unchunkFromMeta(meta, prefix) {
  const n = parseInt(meta[`${prefix}_n`] || '0', 10);
  if (n > 0) {
    let result = '';
    for (let i = 0; i < n; i++) {
      result += meta[`${prefix}_${i}`] || '';
    }
    return result;
  }
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

// ─── Stock helpers ────────────────────────────────────────────────────────────
//
// decrementStockForItems(lineItems)
//
//   Runs an atomic $inc update per line item BEFORE the order is inserted.
//   Each updateOne uses a $gte floor guard so MongoDB rejects the decrement
//   when stock is already exhausted — only one concurrent winner can succeed
//   when the last unit is in play.
//
//   Returns:
//     rollbacks — descriptors for every successful decrement (used to undo on failure)
//     oversold  — items where stock ran out mid-flight (triggers 'backordered' status)
//
async function decrementStockForItems(lineItems) {
  // Batch-fetch all products upfront to check trackStock without N+1 queries
  const productIds = lineItems.map((i) => i.productId).filter(Boolean);
  const products   = await ProductModel
    .find({ _id: { $in: productIds } })
    .select('trackStock sizes')
    .lean();
  const productMap = {};
  products.forEach((p) => { productMap[p._id.toString()] = p; });

  const rollbacks = []; // what to undo if the subsequent order insert fails
  const oversold  = []; // items where stock ran out — order will be 'backordered'

  for (const item of lineItems) {
    if (!item.productId) continue;
    const prod = productMap[item.productId];
    if (!prod?.trackStock) continue; // product not found or opt-out of stock tracking

    const qty = Number(item.quantity) || 1;

    if (item.size && item.size !== 'Default') {
      // Size-specific decrement — positional $elemMatch keeps it atomic
      const result = await ProductModel.updateOne(
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
      );

      if (result.modifiedCount > 0) {
        rollbacks.push({ type: 'size', productId: item.productId, size: item.size, qty });
      } else {
        oversold.push({ name: item.name, size: item.size, qty });
      }
    } else {
      // Global stock decrement
      const result = await ProductModel.updateOne(
        { _id: item.productId, trackStock: true, stockQuantity: { $gte: qty } },
        { $inc: { stockQuantity: -qty } }
      );

      if (result.modifiedCount > 0) {
        rollbacks.push({ type: 'global', productId: item.productId, qty });
      } else {
        oversold.push({ name: item.name, qty });
      }
    }
  }

  return { rollbacks, oversold };
}

// rollbackStockDecrements(rollbacks)
//
//   Compensating transaction: re-increments stock for every item that was
//   successfully decremented in the same request. Called when the order
//   insert fails so stock is not permanently consumed without an order.
//
async function rollbackStockDecrements(rollbacks) {
  for (const rb of rollbacks) {
    try {
      if (rb.type === 'size') {
        await ProductModel.updateOne(
          {
            _id: rb.productId,
            sizes: { $elemMatch: { $or: [{ value: rb.size }, { label: rb.size }] } },
          },
          { $inc: { 'sizes.$.stockQuantity': rb.qty } }
        );
      } else {
        await ProductModel.updateOne(
          { _id: rb.productId },
          { $inc: { stockQuantity: rb.qty } }
        );
      }
    } catch (err) {
      // This leaves stock under-counted — log prominently for manual correction
      console.error(
        `[order] CRITICAL: stock rollback failed for product ${rb.productId} qty ${rb.qty}:`,
        err.message
      );
    }
  }
}

// ─── Core ─────────────────────────────────────────────────────────────────────
//
// createOrderFromPI(pi, customerOverride?)
//
// @param  pi               — Stripe PaymentIntent object (already retrieved)
// @param  customerOverride — optional customer/shipping data from sessionStorage
// @returns  { order: OrderDocument, created: boolean }
//
export async function createOrderFromPI(pi, customerOverride = null) {
  // ── Guard ─────────────────────────────────────────────────────────────────────
  if (pi.metadata?.type !== 'product-purchase') {
    throw new Error('Invalid payment type — not a product-purchase intent');
  }
  if (pi.status !== 'succeeded') {
    throw new Error(`Payment not completed (Stripe status: ${pi.status})`);
  }

  // ── Idempotency check ─────────────────────────────────────────────────────────
  // Checked BEFORE decrementing stock so a webhook replay never double-decrements.
  const existing = await OrderModel.findOne({ paymentIntentId: pi.id });
  if (existing) {
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
  const meta      = pi.metadata;
  const c         = customerOverride || {};
  const firstName = meta.c_firstName || c.firstName   || '';
  const lastName  = meta.c_lastName  || c.lastName    || '';
  const fullName  = `${firstName} ${lastName}`.trim() || 'Customer';
  const email     = meta.c_email     || c.email       || '';
  const phone     = meta.c_phone     || c.phone       || '';

  const lineItems = safeParse(unchunkFromMeta(meta, 'items'));

  // ── Step 1: Decrement stock BEFORE creating the order ────────────────────────
  //
  // Why stock-first?
  //   If we created the order first and then stock decrement failed, we'd have
  //   a confirmed order consuming stock that was never actually reserved.
  //   Doing it first means: on order insert failure → rollback → no phantom consumption.
  //
  //   Concurrent duplicate scenario (webhook + sync both fire):
  //     Both pass the idempotency check above (tiny race window).
  //     Both decrement stock. Only one wins the unique-index insert.
  //     The loser catches 11000 → rolls back its stock decrement → returns existing order.
  //     Net stock change = exactly one order's worth. ✓
  //
  const { rollbacks, oversold } = await decrementStockForItems(lineItems);

  if (oversold.length > 0) {
    console.warn(
      '[order] ⚠️  Stock exhausted for item(s) at webhook time — order will be backordered:',
      oversold.map((o) => `${o.name}${o.size ? ` (${o.size})` : ''} ×${o.qty}`).join(', ')
    );
  }

  // ── Step 2: Create the order ──────────────────────────────────────────────────
  const orderStatus = oversold.length > 0 ? 'backordered' : 'confirmed';

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
      orderStatus,
    });
  } catch (err) {
    // Insert failed → undo every stock decrement this request made
    if (rollbacks.length > 0) {
      await rollbackStockDecrements(rollbacks);
    }

    // Duplicate key: another concurrent path (webhook retry or sync endpoint) won the race.
    // Return their winning record — overall state is consistent.
    if (err.code === 11000) {
      const winner = await OrderModel.findOne({ paymentIntentId: pi.id });
      if (winner) return { order: winner, created: false };
    }

    throw err;
  }

  // ── Step 3: Atomic promo redemption ───────────────────────────────────────────
  //
  // Single conditional findOneAndUpdate that:
  //   1. only matches when the code is active AND usageLimit not yet reached
  //      (guards a read-then-write race between concurrent payments)
  //   2. AND when neither email nor IP has hit perUserLimit
  //   3. increments usageCount and appends email/IP/redemption snapshot atomically
  //
  // If the query matches nothing, the slot was lost mid-flight. Stripe has already
  // charged the customer — we still create the order, but flag promoCode.raceLost
  // so an admin can reconcile (manual refund or honour the discount).
  //
  // The promo snapshot is also written to order.promoCode so charge.refunded can
  // roll the redemption back later.
  //
  if (meta.promoCode) {
    const codeUC = meta.promoCode.toUpperCase();
    const emailLC = (meta.promoEmail || meta.c_email || '').toLowerCase();
    const promoIP = meta.promoIP || '';

    // Filter clause: usageLimit not yet reached
    const usageGuard = {
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
      ],
    };

    // Filter clause: this email/IP hasn't already hit perUserLimit. Only check
    // identifiers we actually have — guest orders with no email or no IP skip
    // that half of the test rather than colliding via empty strings.
    const perUserChecks = [];
    if (emailLC) {
      perUserChecks.push({
        $lt: [
          { $size: { $filter: { input: '$redeemedEmails', as: 'e', cond: { $eq: ['$$e', emailLC] } } } },
          '$perUserLimit',
        ],
      });
    }
    if (promoIP) {
      perUserChecks.push({
        $lt: [
          { $size: { $filter: { input: '$redeemedIPs', as: 'i', cond: { $eq: ['$$i', promoIP] } } } },
          '$perUserLimit',
        ],
      });
    }

    const perUserGuard = perUserChecks.length === 0
      ? {} // nothing to enforce
      : {
          $or: [
            { perUserLimit: null },
            { $expr: { $and: perUserChecks } },
          ],
        };

    // Only push identifiers we have, so empty-string sentinels never poison
    // the redeemedEmails/redeemedIPs arrays.
    const pushOps = {
      redemptions: {
        email:      emailLC || null,
        ip:         promoIP || null,
        orderId:    order._id,
        redeemedAt: new Date(),
      },
    };
    if (emailLC) pushOps.redeemedEmails = emailLC;
    if (promoIP) pushOps.redeemedIPs    = promoIP;

    const matchFilter = {
      code:     codeUC,
      isActive: true,
      ...usageGuard,
    };
    if (perUserChecks.length > 0) {
      matchFilter.$and = [perUserGuard];
    }

    let atomicRedeem = null;
    try {
      atomicRedeem = await PromoCodeModel.findOneAndUpdate(
        matchFilter,
        {
          $inc:  { usageCount: 1 },
          $push: pushOps,
        },
        { new: true }
      );
    } catch (err) {
      console.error(
        `[order] Promo atomic-redeem failed for "${meta.promoCode}" on order ${order.orderNumber}:`,
        err.message
      );
    }

    const raceLost = !atomicRedeem;
    if (raceLost) {
      console.warn(
        `[order] Promo "${meta.promoCode}" race lost on order ${order.orderNumber} — Stripe already charged. Manual reconciliation needed.`
      );
    }

    // Snapshot promo into the order so refund webhook can roll it back later.
    await OrderModel.updateOne(
      { _id: order._id },
      {
        $set: {
          promoCode: {
            code:                  codeUC,
            discountType:          meta.promoDiscType  || null,
            discountValue:         meta.promoDiscValue ? Number(meta.promoDiscValue) : null,
            discountAmount:        parseFloat(meta.discount || '0'),
            stripePromotionCodeId: meta.stripePromoId  || null,
            customerEmail:         emailLC || null,
            customerIP:            promoIP || null,
            raceLost,
            rolledBack:            false,
          },
        },
      }
    ).catch((err) => console.error('[order] Promo snapshot save failed:', err.message));
  }

  // ── Step 4: Confirmation emails (fire-and-forget) ─────────────────────────────
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
      subject: `New Order Received – ${order.orderNumber}${oversold.length ? ' – ⚠️ BACKORDERED' : ' – Action Required'}`,
      html: adminOrderEmailHtml(order, meta),
    }).catch((err) => console.error('[order] Admin email failed:', err.message));
  }

  return { order, created: true };
}
