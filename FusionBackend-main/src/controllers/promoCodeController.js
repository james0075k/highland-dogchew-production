import PromoCodeModel from '../models/promoCodeModel.js';
import { getStripe } from '../config/stripe.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';
import {
  createPromoCodeSchema,
  verifyPromoCodeSchema,
  updatePromoCodeSchema,
} from '../validations/promoCodeValidationSchema.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Mask a code in logs: "SAVE20" → "SA****20" — enough to identify in support
// chats, not enough to reuse if the log ever leaks.
const maskCode = (code) => {
  if (!code) return '';
  const s = String(code);
  if (s.length <= 4) return '****';
  return s.slice(0, 2) + '****' + s.slice(-2);
};

// Generic message used for every "this code can't be applied" branch in /verify.
// Returning the same string for "not found", "inactive", "expired", "usage
// limit reached", and "per-user limit hit" keeps an attacker from enumerating
// which codes exist. The minimum-order branch is intentionally informative
// because a real customer needs to know to add more to their basket.
const GENERIC_INVALID = 'This promo code is invalid or has expired.';

// ─── Sync a new promo code to Stripe Coupon + PromotionCode ──────────────────
async function syncToStripe(promo) {
  const stripe = getStripe();

  const couponParams = {
    name:     promo.code,
    duration: 'once',
  };
  if (promo.discountType === 'percentage') {
    couponParams.percent_off = promo.discountValue;
  } else {
    couponParams.amount_off = Math.round(promo.discountValue * 100);
    couponParams.currency   = 'gbp';
  }
  if (promo.usageLimit) couponParams.max_redemptions = promo.usageLimit;
  if (promo.expiryDate) couponParams.redeem_by = Math.floor(new Date(promo.expiryDate) / 1000);

  const coupon = await stripe.coupons.create(couponParams);

  const promoParams = {
    coupon: coupon.id,
    code:   promo.code,
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

// Best-effort teardown of the Stripe coupon + promotion code pair.
async function unsyncFromStripe(promo) {
  const stripe = getStripe();
  if (promo.stripePromotionCodeId) {
    await stripe.promotionCodes.update(promo.stripePromotionCodeId, { active: false })
      .catch((err) => console.warn(`[promo:${maskCode(promo.code)}] Stripe promotion deactivate failed:`, err.message));
  }
  if (promo.stripeCouponId) {
    await stripe.coupons.del(promo.stripeCouponId)
      .catch((err) => console.warn(`[promo:${maskCode(promo.code)}] Stripe coupon delete failed:`, err.message));
  }
}

// ─── POST /api/promo/verify — public ──────────────────────────────────────────
export const verifyPromoCode = async (req, res, next) => {
  try {
    const { error, value } = verifyPromoCodeSchema.validate(req.body);
    // Same generic response for malformed input — don't let attackers map our
    // validation rules with crafted payloads.
    if (error) return next(handleError(400, GENERIC_INVALID));

    const { code, subtotal, email } = value;
    const promo = await PromoCodeModel.findOne({ code }).lean();

    // ── Unified "invalid" branches — all return the same generic message ────
    if (!promo)                                                              return next(handleError(400, GENERIC_INVALID));
    if (!promo.isActive)                                                     return next(handleError(400, GENERIC_INVALID));
    if (promo.expiryDate && new Date() > new Date(promo.expiryDate))         return next(handleError(400, GENERIC_INVALID));
    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit)   return next(handleError(400, GENERIC_INVALID));

    if (promo.perUserLimit !== null && promo.perUserLimit !== undefined) {
      const ip = req.ip || '';
      const emailLC = email ? String(email).toLowerCase() : '';
      const emailHits = emailLC ? promo.redeemedEmails.filter((e) => e === emailLC).length : 0;
      const ipHits    = ip      ? promo.redeemedIPs.filter((i) => i === ip).length         : 0;
      if (emailHits >= promo.perUserLimit || ipHits >= promo.perUserLimit) {
        return next(handleError(400, GENERIC_INVALID));
      }
    }

    // Min-order error IS informative — a real customer needs to know how much
    // more to add. It also leaks code existence, but the trade-off here is
    // worth it: enumeration without subtotal is already blocked by the rate
    // limiter and the unified responses above.
    if (subtotal < promo.minOrderAmount) {
      return next(handleError(400, `Minimum order amount of £${promo.minOrderAmount.toFixed(2)} required.`));
    }

    // Stripe-level cross-check — refuses codes deactivated via Stripe Dashboard.
    if (promo.stripePromotionCodeId) {
      try {
        const sp = await getStripe().promotionCodes.retrieve(promo.stripePromotionCodeId);
        if (!sp.active)                                                                return next(handleError(400, GENERIC_INVALID));
        if (sp.expires_at && sp.expires_at < Math.floor(Date.now() / 1000))            return next(handleError(400, GENERIC_INVALID));
      } catch (stripeErr) {
        console.warn(`[promo:${maskCode(code)}] Stripe check skipped (using DB only):`, stripeErr.message);
      }
    }

    // VAT is included in product catalogue prices — see cartPaymentController.js
    const TAX_RATE = 0;
    const DELIVERY = 1.99;
    const preDiscountTotal = +(subtotal + subtotal * TAX_RATE + DELIVERY).toFixed(2);

    const discount = promo.discountType === 'percentage'
      ? +(preDiscountTotal * (promo.discountValue / 100)).toFixed(2)
      : +Math.min(promo.discountValue, preDiscountTotal).toFixed(2);

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

    const existing = await PromoCodeModel.findOne({ code: value.code });
    if (existing) return next(handleError(409, 'A promo code with this code already exists'));

    const promo = await PromoCodeModel.create(value);

    try {
      const { stripeCouponId, stripePromotionCodeId } = await syncToStripe(promo);
      promo.stripeCouponId        = stripeCouponId;
      promo.stripePromotionCodeId = stripePromotionCodeId;
      await promo.save();
      console.log(`[promo:${maskCode(promo.code)}] synced to Stripe — coupon: ${stripeCouponId}`);
    } catch (stripeErr) {
      console.error(`[promo:${maskCode(promo.code)}] Stripe sync failed (code still active in DB):`, stripeErr.message);
    }

    return handleSuccess(res, 201, 'Promo code created successfully', promo);
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/promo/:id — admin only ────────────────────────────────────────
//
// Stripe coupons are immutable for discount type/value, so any change to those
// fields requires creating a fresh Stripe coupon + promotion code pair. We tear
// down the old pair after the new one is in place to minimise the no-discount
// window for in-flight checkouts.
//
// Past order redemptions stay valid — they reference the DB record, not Stripe.
export const updatePromoCode = async (req, res, next) => {
  try {
    const { error, value } = updatePromoCodeSchema.validate(req.body);
    if (error) return next(handleError(400, error.details[0].message));

    const promo = await PromoCodeModel.findById(req.params.id);
    if (!promo) return next(handleError(404, 'Promo code not found'));

    // Detect whether Stripe needs a fresh coupon (discount terms changed).
    const stripeAffected =
      ('discountType'   in value && value.discountType   !== promo.discountType)   ||
      ('discountValue'  in value && value.discountValue  !== promo.discountValue)  ||
      ('expiryDate'     in value && String(value.expiryDate || '') !== String(promo.expiryDate || '')) ||
      ('usageLimit'     in value && value.usageLimit     !== promo.usageLimit)     ||
      ('minOrderAmount' in value && value.minOrderAmount !== promo.minOrderAmount);

    Object.assign(promo, value);
    await promo.save();

    if (stripeAffected) {
      const oldCouponId        = promo.stripeCouponId;
      const oldPromotionCodeId = promo.stripePromotionCodeId;

      try {
        const fresh = await syncToStripe(promo);
        promo.stripeCouponId        = fresh.stripeCouponId;
        promo.stripePromotionCodeId = fresh.stripePromotionCodeId;
        await promo.save();
        console.log(`[promo:${maskCode(promo.code)}] re-synced — new coupon ${fresh.stripeCouponId}`);

        // Tear down old pair only after the new one is saved. Best-effort —
        // if Stripe is flaky here, the old coupon becomes orphaned in Stripe
        // but our DB is correct and the new coupon is live.
        await unsyncFromStripe({
          code: promo.code,
          stripeCouponId:        oldCouponId,
          stripePromotionCodeId: oldPromotionCodeId,
        });
      } catch (stripeErr) {
        console.error(`[promo:${maskCode(promo.code)}] Stripe re-sync failed; DB updated but Stripe still on old coupon:`, stripeErr.message);
      }
    } else if ('isActive' in value && promo.stripePromotionCodeId) {
      // Toggle Stripe active flag without recreating the coupon.
      await getStripe().promotionCodes.update(promo.stripePromotionCodeId, { active: !!value.isActive })
        .catch((err) => console.warn(`[promo:${maskCode(promo.code)}] Stripe active toggle failed:`, err.message));
    }

    return handleSuccess(res, 200, 'Promo code updated', promo);
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

// ─── DELETE /api/promo/:id ─ admin only ───────────────────────────────────────
export const deletePromoCode = async (req, res, next) => {
  try {
    const promo = await PromoCodeModel.findById(req.params.id);
    if (!promo) return next(handleError(404, 'Promo code not found'));

    if (promo.stripeCouponId) {
      await getStripe().coupons.del(promo.stripeCouponId)
        .catch((err) => console.error(`[promo:${maskCode(promo.code)}] Stripe coupon delete failed:`, err.message));
    }

    await PromoCodeModel.findByIdAndDelete(req.params.id);
    return handleSuccess(res, 200, 'Promo code deleted', { _id: req.params.id });
  } catch (err) {
    next(err);
  }
};

// ─── PATCH /api/promo/:id/deactivate ─ admin only ─────────────────────────────
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
        .catch((err) => console.error(`[promo:${maskCode(promo.code)}] Stripe deactivate failed:`, err.message));
    }

    return handleSuccess(res, 200, 'Promo code deactivated', promo);
  } catch (err) {
    next(err);
  }
};
