import PromoBannerModel from '../models/promoBannerModel.js';
import PromoCodeModel from '../models/promoCodeModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/successHandler.js';
import { savePromoBannerSchema } from '../validations/promoBannerValidationSchema.js';

// Served until an admin saves the banner for the first time, so deploying this
// feature doesn't change what the live homepage shows.
const DEFAULT_CODE = 'FRANK10';

const discountLabel = (promo) =>
  promo.discountType === 'percentage'
    ? `${promo.discountValue}% off`
    : `£${Number(promo.discountValue).toFixed(2).replace(/\.00$/, '')} off`;

export const suggestedLeadText = (promo) => `${discountLabel(promo)} every chew with code`;

// Same "can a customer actually redeem this" rules as verifyPromoCode, minus the
// per-customer and minimum-order checks (those depend on who is checking out).
// The banner must never advertise a code checkout would reject.
const statusOf = (promo) => {
  if (!promo.isActive) return 'inactive';
  if (promo.expiryDate && new Date() > new Date(promo.expiryDate)) return 'expired';
  if (promo.usageLimit !== null && promo.usageLimit !== undefined && promo.usageCount >= promo.usageLimit) return 'used-up';
  return 'active';
};

const HIDDEN = { enabled: false, leadText: '', code: null, discountLabel: null };

// ─── GET /api/promo-banner — public ──────────────────────────────────────────
// Exposes only the one code the admin chose to advertise — never the list.
export const getPublicBanner = async (req, res, next) => {
  try {
    const banner = await PromoBannerModel.findOne().lean();

    let promo;
    let leadText;
    if (banner) {
      if (!banner.enabled || !banner.promoCode) return handleSuccess(res, 200, 'Banner hidden', HIDDEN);
      promo = await PromoCodeModel.findById(banner.promoCode).lean();
      leadText = banner.leadText;
    } else {
      promo = await PromoCodeModel.findOne({ code: DEFAULT_CODE }).lean();
      leadText = promo ? suggestedLeadText(promo) : '';
    }

    if (!promo || statusOf(promo) !== 'active') return handleSuccess(res, 200, 'Banner hidden', HIDDEN);

    return handleSuccess(res, 200, 'Banner fetched', {
      enabled: true,
      leadText,
      code: promo.code,
      discountLabel: discountLabel(promo),
    });
  } catch (err) {
    next(err);
  }
};

// ─── GET /api/promo-banner/admin — admin only ────────────────────────────────
// Current settings plus the codes to choose from. Only display fields — no
// redemption emails/IPs.
export const getAdminBanner = async (req, res, next) => {
  try {
    const [banner, promos] = await Promise.all([
      PromoBannerModel.findOne().lean(),
      PromoCodeModel.find()
        .select('code discountType discountValue isActive expiryDate usageLimit usageCount')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const codes = promos.map((p) => ({
      _id: p._id,
      code: p.code,
      discountType: p.discountType,
      discountValue: p.discountValue,
      discountLabel: discountLabel(p),
      suggestedLeadText: suggestedLeadText(p),
      status: statusOf(p),
    }));

    let settings;
    if (banner) {
      settings = {
        saved: true,
        enabled: banner.enabled,
        leadText: banner.leadText,
        promoCodeId: banner.promoCode,
        updatedAt: banner.updatedAt,
      };
    } else {
      const fallback = codes.find((c) => c.code === DEFAULT_CODE);
      settings = {
        saved: false,
        enabled: true,
        leadText: fallback ? fallback.suggestedLeadText : '',
        promoCodeId: fallback ? fallback._id : null,
        updatedAt: null,
      };
    }

    return handleSuccess(res, 200, 'Banner settings fetched', { settings, codes });
  } catch (err) {
    next(err);
  }
};

// ─── PUT /api/promo-banner — admin only ──────────────────────────────────────
export const saveBanner = async (req, res, next) => {
  try {
    const { error, value } = savePromoBannerSchema.validate(req.body);
    if (error) return next(handleError(400, error.details[0].message));

    const promo = await PromoCodeModel.findById(value.promoCodeId).lean();
    if (!promo) return next(handleError(400, 'That promo code no longer exists.'));
    const status = statusOf(promo);
    if (value.enabled && status !== 'active') {
      return next(handleError(400, `${promo.code} is ${status.replace('-', ' ')} — customers can't use it, so it can't go on the banner.`));
    }

    let banner = await PromoBannerModel.findOne();
    if (!banner) banner = new PromoBannerModel();
    banner.enabled = value.enabled;
    banner.leadText = value.leadText;
    banner.promoCode = promo._id;
    await banner.save();

    return handleSuccess(res, 200, 'Banner saved', {
      enabled: banner.enabled,
      leadText: banner.leadText,
      promoCodeId: banner.promoCode,
      updatedAt: banner.updatedAt,
    });
  } catch (err) {
    next(err);
  }
};
