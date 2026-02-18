import Joi from 'joi';

export const createPromoCodeSchema = Joi.object({
  code: Joi.string().trim().min(3).max(30).required(),
  discountType: Joi.string().valid('percentage', 'flat').required(),
  discountValue: Joi.number().positive().required(),
  expiryDate: Joi.date().allow(null).optional(),
  isActive: Joi.boolean().optional(),
  usageLimit: Joi.number().integer().min(1).allow(null).optional(),
  minOrderAmount: Joi.number().min(0).optional(),
});

export const verifyPromoCodeSchema = Joi.object({
  code: Joi.string().trim().required(),
  subtotal: Joi.number().positive().required(),
});
