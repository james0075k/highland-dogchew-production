/**
 * reverseSyncFromStripe.js
 *
 * Handles Stripe Dashboard → our DB sync for promo-code state changes.
 * Triggered by webhook events:
 *   • coupon.deleted          — admin deletes a coupon in Stripe Dashboard
 *   • coupon.updated          — discount details changed (we only care about valid:false)
 *   • promotion_code.updated  — customer-facing code activated/deactivated/expired
 *
 * On any of these we look up the matching local PromoCode by stripeCouponId or
 * stripePromotionCodeId and flip isActive=false when Stripe says the code is no
 * longer redeemable. We never re-activate from Stripe — admin must do that
 * intentionally via the dashboard endpoint.
 */

import PromoCodeModel from '../models/promoCodeModel.js';

export async function reverseSyncFromStripe(event) {
  try {
    const obj = event.data?.object;
    if (!obj) return { synced: false, reason: 'empty event payload' };

    let filter = null;
    let shouldDeactivate = false;

    switch (event.type) {
      case 'coupon.deleted':
        filter = { stripeCouponId: obj.id };
        shouldDeactivate = true;
        break;

      case 'coupon.updated':
        filter = { stripeCouponId: obj.id };
        // Stripe marks a coupon invalid when expired or fully redeemed
        shouldDeactivate = obj.valid === false;
        break;

      case 'promotion_code.updated':
        filter = { stripePromotionCodeId: obj.id };
        shouldDeactivate = obj.active === false;
        break;

      default:
        return { synced: false, reason: `unhandled event ${event.type}` };
    }

    if (!shouldDeactivate) {
      return { synced: false, reason: 'no deactivation required' };
    }

    const result = await PromoCodeModel.findOneAndUpdate(
      filter,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!result) {
      return { synced: false, reason: 'no matching local promo found' };
    }

    console.log(`[promo] Reverse-synced "${result.code}" from Stripe (${event.type}) — isActive=false`);
    return { synced: true, code: result.code };
  } catch (err) {
    console.error('[promo] reverseSyncFromStripe error:', err.message);
    return { synced: false, error: err.message };
  }
}
