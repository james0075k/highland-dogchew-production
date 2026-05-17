/**
 * rollbackPromoRedemption.js
 *
 * Called from the charge.refunded webhook case. When an order that consumed
 * a promo code is refunded we roll the redemption back so:
 *   - usageCount drops by 1 (the global slot is freed)
 *   - the customer's email/IP is removed from redeemedEmails/redeemedIPs
 *     (their per-user slot is freed)
 *   - the audit row is removed from the redemptions[] array
 *
 * Idempotent: order.promoCode.rolledBack is set to true after a successful
 * rollback. A second call short-circuits.
 *
 * Non-fatal: any failure is logged but does not throw — refund webhook must
 * still succeed even if our local rollback errors.
 */

import OrderModel from '../models/orderModel.js';
import PromoCodeModel from '../models/promoCodeModel.js';

export async function rollbackPromoRedemption(order) {
  if (!order?.promoCode?.code)        return { rolledBack: false, reason: 'no promo on order' };
  if (order.promoCode.rolledBack)     return { rolledBack: false, reason: 'already rolled back' };
  if (order.promoCode.raceLost)       return { rolledBack: false, reason: 'redemption never recorded (race lost)' };

  const codeUC  = String(order.promoCode.code).toUpperCase();
  const emailLC = order.promoCode.customerEmail || '';
  const ip      = order.promoCode.customerIP    || '';

  try {
    // $pull with $in removes exactly one matching string per array. We want to
    // remove a single redemption, but $pull would strip every duplicate. To
    // preserve other concurrent redemptions from the same email/IP, we instead
    // pull by the redemptions[].orderId (unique) and use $inc on the counters.
    const updated = await PromoCodeModel.findOneAndUpdate(
      { code: codeUC },
      {
        $inc:  { usageCount: -1 },
        $pull: { redemptions: { orderId: order._id } },
      },
      { new: true }
    );

    if (!updated) {
      console.warn(`[refund] Promo "${codeUC}" not found while rolling back order ${order.orderNumber}`);
    } else {
      // After pulling the redemption row, recompute redeemedEmails/redeemedIPs
      // from the remaining redemptions[] entries so per-user limits stay accurate.
      const remaining = updated.redemptions || [];
      const emails    = remaining.map((r) => r.email).filter(Boolean);
      const ips       = remaining.map((r) => r.ip).filter(Boolean);
      await PromoCodeModel.updateOne(
        { _id: updated._id },
        { $set: { redeemedEmails: emails, redeemedIPs: ips } }
      );

      // Guard usageCount from going negative (would only happen if data drifted)
      if (updated.usageCount < 0) {
        await PromoCodeModel.updateOne({ _id: updated._id }, { $set: { usageCount: 0 } });
      }
    }

    await OrderModel.updateOne(
      { _id: order._id },
      { $set: { 'promoCode.rolledBack': true } }
    );

    return { rolledBack: true, code: codeUC, email: emailLC, ip };
  } catch (err) {
    console.error(
      `[refund] Promo rollback failed for "${codeUC}" on order ${order.orderNumber}:`,
      err.message
    );
    return { rolledBack: false, error: err.message };
  }
}
