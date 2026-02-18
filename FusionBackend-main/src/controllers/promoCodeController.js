import PromoCodeModel from '../models/promoCodeModel.js';
import handleError from '../utils/errorHandler.js';
import handleSuccess from '../utils/sucessHandler.js';
import { createPromoCodeSchema, verifyPromoCodeSchema } from '../validations/promoCodeValidationSchema.js';

// POST /api/promo/verify — public
export const verifyPromoCode = async (req, res, next) => {
  try {
    const { error, value } = verifyPromoCodeSchema.validate(req.body);
    if (error) {
      return next(handleError(400, error.details[0].message));
    }

    const { code, subtotal } = value;

    const promo = await PromoCodeModel.findOne({ code: code.toUpperCase() });

    if (!promo) {
      return next(handleError(404, 'Promo code not found'));
    }

    if (!promo.isActive) {
      return next(handleError(400, 'This promo code is no longer active'));
    }

    if (promo.expiryDate && new Date() > promo.expiryDate) {
      return next(handleError(400, 'This promo code has expired'));
    }

    if (promo.usageLimit !== null && promo.usageCount >= promo.usageLimit) {
      return next(handleError(400, 'This promo code has reached its usage limit'));
    }

    if (subtotal < promo.minOrderAmount) {
      return next(handleError(400, `Minimum order amount of £${promo.minOrderAmount.toFixed(2)} required`));
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = +(subtotal * (promo.discountValue / 100)).toFixed(2);
    } else {
      discount = +Math.min(promo.discountValue, subtotal).toFixed(2);
    }

    return handleSuccess(res, 200, 'Promo code is valid', {
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discount,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/promo/create — admin only
export const createPromoCode = async (req, res, next) => {
  try {
    const { error, value } = createPromoCodeSchema.validate(req.body);
    if (error) {
      return next(handleError(400, error.details[0].message));
    }

    value.code = value.code.toUpperCase();

    const existing = await PromoCodeModel.findOne({ code: value.code });
    if (existing) {
      return next(handleError(409, 'A promo code with this code already exists'));
    }

    const promo = await PromoCodeModel.create(value);

    return handleSuccess(res, 201, 'Promo code created successfully', promo);
  } catch (err) {
    next(err);
  }
};

// GET /api/promo — admin only
export const getAllPromoCodes = async (req, res, next) => {
  try {
    const promoCodes = await PromoCodeModel.find().sort({ createdAt: -1 });
    return handleSuccess(res, 200, 'Promo codes fetched successfully', promoCodes);
  } catch (err) {
    next(err);
  }
};
