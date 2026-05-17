/**
 * createFreeOrder.js
 *
 * Used when a 100%-off promo brings the grand total to £0 and Stripe cannot
 * create a PaymentIntent (Stripe rejects amounts below £0.30 for GBP).
 *
 * Mirrors createOrderFromPI:
 *   - Stock-first with rollback on order-insert failure
 *   - Atomic promo redemption with $expr/$size guards
 *   - Order snapshot of promo for refund rollback parity
 *   - Customer + admin confirmation emails (fire-and-forget)
 *
 * Differs from createOrderFromPI:
 *   - No PaymentIntent. paymentIntentId is null; paymentStatus is 'paid'
 *     immediately (£0 charged = settled).
 *   - All inputs come from the request body, not Stripe metadata.
 */

import OrderModel from '../models/orderModel.js';
import ProductModel from '../models/productModel.js';
import PromoCodeModel from '../models/promoCodeModel.js';
import sendEmail from './sendEmail.js';
import { customerOrderEmailHtml, adminOrderEmailHtml } from './emailTemplates.js';

async function decrementStockForItems(lineItems) {
  const productIds = lineItems.map((i) => i.productId).filter(Boolean);
  const products   = await ProductModel
    .find({ _id: { $in: productIds } })
    .select('trackStock sizes')
    .lean();
  const productMap = {};
  products.forEach((p) => { productMap[p._id.toString()] = p; });

  const rollbacks = [];
  const oversold  = [];

  for (const item of lineItems) {
    if (!item.productId) continue;
    const prod = productMap[item.productId];
    if (!prod?.trackStock) continue;
    const qty = Number(item.quantity) || 1;

    if (item.size && item.size !== 'Default') {
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
      if (result.modifiedCount > 0) rollbacks.push({ type: 'size', productId: item.productId, size: item.size, qty });
      else                          oversold.push({ name: item.name, size: item.size, qty });
    } else {
      const result = await ProductModel.updateOne(
        { _id: item.productId, trackStock: true, stockQuantity: { $gte: qty } },
        { $inc: { stockQuantity: -qty } }
      );
      if (result.modifiedCount > 0) rollbacks.push({ type: 'global', productId: item.productId, qty });
      else                          oversold.push({ name: item.name, qty });
    }
  }
  return { rollbacks, oversold };
}

async function rollbackStockDecrements(rollbacks) {
  for (const rb of rollbacks) {
    try {
      if (rb.type === 'size') {
        await ProductModel.updateOne(
          { _id: rb.productId, sizes: { $elemMatch: { $or: [{ value: rb.size }, { label: rb.size }] } } },
          { $inc: { 'sizes.$.stockQuantity': rb.qty } }
        );
      } else {
        await ProductModel.updateOne({ _id: rb.productId }, { $inc: { stockQuantity: rb.qty } });
      }
    } catch (err) {
      console.error(`[free-order] CRITICAL: stock rollback failed for ${rb.productId}:`, err.message);
    }
  }
}

export async function createFreeOrder({ lineItems, totals, customer, shipping, promoData, clientIP }) {
  const { rollbacks, oversold } = await decrementStockForItems(lineItems);

  if (oversold.length > 0) {
    console.warn(
      '[free-order] Stock exhausted for item(s):',
      oversold.map((o) => `${o.name}${o.size ? ` (${o.size})` : ''} x${o.qty}`).join(', ')
    );
  }

  const orderStatus = oversold.length > 0 ? 'backordered' : 'confirmed';

  let order;
  try {
    order = await OrderModel.create({
      items: lineItems.map((it) => ({
        ...(it.productId ? { product: it.productId } : {}),
        name:                 it.name      || 'Unknown Product',
        size:                 it.size      || 'Default',
        quantity:             Number(it.quantity)  || 1,
        unitPrice:            Number(it.unitPrice) || 0,
        subscriptionInterval: it.subscriptionInterval || null,
      })),
      shippingAddress: {
        fullName:     `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer',
        firstName:    customer.firstName  || '',
        lastName:     customer.lastName   || '',
        email:        customer.email      || '',
        phone:        customer.phone      || '',
        addressLine1: shipping.address    || '',
        addressLine2: shipping.apartment  || '',
        city:         shipping.city       || '',
        county:       shipping.county     || '',
        postcode:     shipping.postcode   || '',
        country:      shipping.country    || 'United Kingdom',
      },
      subtotal:        totals.subtotal,
      totalTax:        totals.totalTax,
      totalDelivery:   totals.totalDelivery,
      totalDiscount:   totals.discount,
      grandTotal:      0,
      // paymentIntentId intentionally omitted — sparse unique index treats
      // an explicit null as a present value (would collide across free orders),
      // but an absent field is excluded from the index.
      paymentStatus:   'paid',
      orderStatus,
    });
  } catch (err) {
    if (rollbacks.length > 0) await rollbackStockDecrements(rollbacks);
    throw err;
  }

  // ── Atomic promo redemption (same guards as paid path) ────────────────────
  if (promoData) {
    const codeUC  = promoData.code.toUpperCase();
    const emailLC = (customer.email || '').toLowerCase();
    const ip      = clientIP || '';

    const usageGuard = {
      $or: [
        { usageLimit: null },
        { $expr: { $lt: ['$usageCount', '$usageLimit'] } },
      ],
    };

    const perUserChecks = [];
    if (emailLC) {
      perUserChecks.push({
        $lt: [
          { $size: { $filter: { input: '$redeemedEmails', as: 'e', cond: { $eq: ['$$e', emailLC] } } } },
          '$perUserLimit',
        ],
      });
    }
    if (ip) {
      perUserChecks.push({
        $lt: [
          { $size: { $filter: { input: '$redeemedIPs', as: 'i', cond: { $eq: ['$$i', ip] } } } },
          '$perUserLimit',
        ],
      });
    }

    const matchFilter = { code: codeUC, isActive: true, ...usageGuard };
    if (perUserChecks.length > 0) {
      matchFilter.$and = [{
        $or: [{ perUserLimit: null }, { $expr: { $and: perUserChecks } }],
      }];
    }

    const pushOps = {
      redemptions: { email: emailLC || null, ip: ip || null, orderId: order._id, redeemedAt: new Date() },
    };
    if (emailLC) pushOps.redeemedEmails = emailLC;
    if (ip)      pushOps.redeemedIPs    = ip;

    let atomicRedeem = null;
    try {
      atomicRedeem = await PromoCodeModel.findOneAndUpdate(
        matchFilter,
        { $inc: { usageCount: 1 }, $push: pushOps },
        { new: true }
      );
    } catch (err) {
      console.error(`[free-order] Promo redeem failed for "${codeUC}":`, err.message);
    }

    const raceLost = !atomicRedeem;
    await OrderModel.updateOne(
      { _id: order._id },
      {
        $set: {
          promoCode: {
            code:                  codeUC,
            discountType:          promoData.discountType,
            discountValue:         promoData.discountValue,
            discountAmount:        totals.discount,
            stripePromotionCodeId: promoData.stripePromotionCodeId || null,
            customerEmail:         emailLC || null,
            customerIP:            ip || null,
            raceLost,
            rolledBack:            false,
          },
        },
      }
    ).catch((err) => console.error('[free-order] Promo snapshot save failed:', err.message));
  }

  // ── Confirmation emails (fire-and-forget) ─────────────────────────────────
  if (customer.email) {
    sendEmail({
      to: customer.email,
      subject: `Your Order Confirmation - Highland Yak Chew (${order.orderNumber})`,
      html: customerOrderEmailHtml(order, customer.firstName || '', { hasSubscription: false }),
    }).catch((err) => console.error('[free-order] Customer email failed:', err.message));
  }
  const adminEmail = process.env.ADMIN_EMAIL;
  if (adminEmail) {
    sendEmail({
      to: adminEmail,
      subject: `New FREE Order - ${order.orderNumber}${oversold.length ? ' - BACKORDERED' : ''}`,
      html: adminOrderEmailHtml(order, { promoCode: promoData?.code || '' }),
    }).catch((err) => console.error('[free-order] Admin email failed:', err.message));
  }

  return { order, created: true };
}
