import Joi from 'joi';

// Allowed code charset: letters/digits/underscore/hyphen only. Blocks whitespace,
// punctuation, and unicode lookalikes a customer might paste from a phishing
// email. Length 3–24 — short enough to type, long enough to keep brute force
// infeasible.
const codePattern = /^[A-Z0-9_-]+$/;

export const createPromoCodeSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(3).max(24).pattern(codePattern).required()
    .messages({ 'string.pattern.base': 'Code may only contain letters, digits, underscore and hyphen.' }),
  discountType: Joi.string().valid('percentage', 'flat').required(),
  discountValue: Joi.number().positive().required()
    // For a percentage code, anything above 100 makes no sense; cap defensively.
    // For a flat code, cap at £10,000 to stop a typo from creating a giant discount.
    .when('discountType', {
      is: 'percentage',
      then: Joi.number().max(100).messages({ 'number.max': 'Percentage discount cannot exceed 100%.' }),
      otherwise: Joi.number().max(10000),
    }),
  expiryDate: Joi.date().greater('now').allow(null).optional()
    .messages({ 'date.greater': 'Expiry date must be in the future.' }),
  isActive: Joi.boolean().optional(),
  usageLimit: Joi.number().integer().min(1).max(1_000_000).allow(null).optional(),
  perUserLimit: Joi.number().integer().min(1).max(100).allow(null).optional(),
  minOrderAmount: Joi.number().min(0).max(100000).optional(),
});

// Admin edit — every field optional. `code` is intentionally NOT editable
// (it's the customer-facing identifier and Stripe sync key). Discount changes
// trigger a Stripe coupon re-creation because coupons are immutable.
export const updatePromoCodeSchema = Joi.object({
  discountType: Joi.string().valid('percentage', 'flat').optional(),
  discountValue: Joi.number().positive().max(10000).optional(),
  expiryDate: Joi.date().allow(null).optional(),
  isActive: Joi.boolean().optional(),
  usageLimit: Joi.number().integer().min(1).max(1_000_000).allow(null).optional(),
  perUserLimit: Joi.number().integer().min(1).max(100).allow(null).optional(),
  minOrderAmount: Joi.number().min(0).max(100000).optional(),
}).min(1).messages({ 'object.min': 'Provide at least one field to update.' });

export const verifyPromoCodeSchema = Joi.object({
  // Match the create-side charset so we never even hit the DB for malformed
  // input. Length is bounded to keep the index lookup cheap.
  code: Joi.string().trim().uppercase().min(3).max(24).pattern(codePattern).required()
    .messages({ 'string.pattern.base': 'Invalid promo code format.' }),
  subtotal: Joi.number().positive().required(),
  email: Joi.string().trim().email().lowercase().optional(),
});
