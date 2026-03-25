import PromoCodeModel from '../models/promoCodeModel.js';
import { getStripe } from '../config/stripe.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import { createPromoCodeSchema, verifyPromoCodeSchema } from '../validations/promoCodeValidationSchema.js';

// ─── Sync a new promo code to Stripe Coupon + PromotionCode ──────────────────
//
// Per Stripe docs (stripe.com/docs/billing/subscriptions/coupons):
//   • Coupon  — defines the discount (percent_off or amount_off)
//   • PromotionCode — the customer-facing code tied to a coupon
//
// Both are visible in Stripe Dashboard → Products → Coupons.
// Stripe validates active status, expiry, and minimum amount automatically.
//
async function syncToStripe(promo) {
  const stripe = getStripe();

  // 1. Coupon — holds discount definition
  const couponParams = {
    name:     promo.code,   // label shown in Stripe Dashboard
    duration: 'once',       // one-time payment (not subscription)
  };
  if (promo.discountType === 'percentage') {
    couponParams.percent_off = promo.discountValue;               // e.g. 10 → 10%
  } else {
    couponParams.amount_off = Math.round(promo.discountValue * 100); // convert £ → pence
    couponParams.currency   = 'gbp';
  }
  if (promo.usageLimit) couponParams.max_redemptions = promo.usageLimit;
  if (promo.expiryDate) couponParams.redeem_by = Math.floor(new Date(promo.expiryDate) / 1000);

  const coupon = await stripe.coupons.create(couponParams);

  // 2. PromotionCode — customer-facing code linked to the coupon
  const promoParams = {
    coupon: coupon.id,
    code:   promo.code,   // e.g. "SAVE10" — what the customer types
  };
  if (promo.usageLimit) promoParams.max_redemptions = promo.usageLimit;
  if (promo.expiryDate) promoParams.expires_at = Math.floor(new Date(promo.expiryDate) / 1000);
  if (promo.minOrderAmount > 0) {
    promoParams.restrictions = {
      minimum_amount:          Math.round(promo.minOrderAmount * 100),
      minimum_amount_currency: 'gbp',
    };
  }

  const stripePromo = await stripe.promotionCodes.create(promoParams);
  return { stripeCouponId: coupon.id, stripePromotionCodeId: stripePromo.id };
}

// ─── POST /api/promo/verify — public ──────────────────────────────────────────
export const verifyPromoCode = async (req, res, next) => {
  try {
    const { error, value } = verifyPromoCodeSchema.validate(req.body);
    if (error) return next(handleError(400, error.details[0].message));

    const { code, subtotal } = value;
    const promo = await PromoCodeModel.findOne({ code: code.toUpperCase() });

    if (!promo)            return next(handleError(404, 'Promo code not found'));
    if (!promo.isActive)   return next(handleError(400, 'This promo code is no longer active'));

    if (promo.expiryDate && new Date() > promo.expiryDate)
      return next(handleError(400, 'This promo code has expired'));

    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit)
      return next(handleError(400, 'This promo code has reached its usage limit'));

    if (subtotal < promo.minOrderAmount)
      return next(handleError(400, `Minimum order amount of £${promo.minOrderAmount.toFixed(2)} required`));

    // ── Stripe-level validation (dual-source truth for Stripe-synced codes) ─────
    // If the code was deactivated in the Stripe Dashboard, refuse it here too.
    if (promo.stripePromotionCodeId) {
      try {
        const sp = await getStripe().promotionCodes.retrieve(promo.stripePromotionCodeId);
        if (!sp.active)
          return next(handleError(400, 'This promo code is no longer active'));
        if (sp.expires_at && sp.expires_at < Math.floor(Date.now() / 1000))
          return next(handleError(400, 'This promo code has expired'));
      } catch (stripeErr) {
        // Stripe unreachable — DB already passed, allow through
        console.warn('[promo] Stripe check skipped (using DB only):', stripeErr.message);
      }
    }

    const discount = promo.discountType === 'percentage'
      ? +(subtotal * (promo.discountValue / 100)).toFixed(2)
      : +Math.min(promo.discountValue, subtotal).toFixed(2);

    return handleSuccess(res, 200, 'Promo code is valid', {
      code:                  promo.code,
      discountType:          promo.discountType,
      discountValue:         promo.discountValue,
      discount,
      stripePromotionCodeId: promo.stripePromotionCodeId || null,
    });
  } catch (err) {
    next(err);
  }
};

// ─── POST /api/promo/create — admin only ──────────────────────────────────────
export const createPromoCode = async (req, res, next) => {
  try {
    const { error, value } = createPromoCodeSchema.validate(req.body);
    if (error) return next(handleError(400, error.details[0].message));

    value.code = value.code.toUpperCase();

    const existing = await PromoCodeModel.findOne({ code: value.code });
    if (existing) return next(handleError(409, 'A promo code with this code already exists'));

    const promo = await PromoCodeModel.create(value);

    // ── Sync to Stripe (best-effort — never blocks DB creation) ─────────────────
    try {
      const { stripeCouponId, stripePromotionCodeId } = await syncToStripe(promo);
      promo.stripeCouponId        = stripeCouponId;
      promo.stripePromotionCodeId = stripePromotionCodeId;
      await promo.save();
      console.log(`[promo] "${promo.code}" synced to Stripe — coupon: ${stripeCouponId}`);
    } catch (stripeErr) {
      // Stripe sync failed — promo code is still live in our DB
      console.error('[promo] Stripe sync failed (code still active in DB):', stripeErr.message);
    }

    return handleSuccess(res, 201, 'Promo code created successfully', promo);
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/promo — admin only ──────────────────────────────────────────────
export const getAllPromoCodes = async (req, res, next) => {
  try {
    const promoCodes = await PromoCodeModel.find().sort({ createdAt: -1 });
    return handleSuccess(res, 200, 'Promo codes fetched successfully', promoCodes);
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/promo/:id/deactivate — admin only ────────────────────────────
// Deactivates in our DB and in Stripe Dashboard simultaneously.
export const deactivatePromoCode = async (req, res, next) => {
  try {
    const promo = await PromoCodeModel.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!promo) return next(handleError(404, 'Promo code not found'));

    if (promo.stripePromotionCodeId) {
      await getStripe().promotionCodes.update(promo.stripePromotionCodeId, { active: false })
        .catch((err) => console.error('[promo] Stripe deactivate failed:', err.message));
    }

    return handleSuccess(res, 200, 'Promo code deactivated', promo);
  } catch (err) {
    next(err);
  }
};
