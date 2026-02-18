import Joi from 'joi';

const cartItemSchema = Joi.object({
  productId: Joi.string().required(),
  size: Joi.string().required(),
  quantity: Joi.number().integer().min(1).required(),
  unitPrice: Joi.number().positive().required(),
});

export const cartValidationSchema = Joi.object({
  items: Joi.array().items(cartItemSchema).min(1).required(),
  promoCode: Joi.string().trim().allow('', null).optional(),
});
