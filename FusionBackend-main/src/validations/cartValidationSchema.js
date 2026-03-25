import Joi from 'joi';

// M-6 fix: validate productId as a 24-char MongoDB ObjectId hex string
const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

const cartItemSchema = Joi.object({
  productId:            Joi.string().pattern(OBJECT_ID_PATTERN).required()
                          .messages({ 'string.pattern.base': 'Invalid product ID format' }),
  size:                 Joi.string().max(100).required(),
  // M-5 fix: cap quantity per line to 1000 to prevent runaway bulk-pricing loops
  quantity:             Joi.number().integer().min(1).max(1000).required(),
  unitPrice:            Joi.number().positive().optional(), // informational only — server recalculates
  isSubscription:       Joi.boolean().optional().default(false),
  subscriptionInterval: Joi.string().trim().max(50).allow('', null).optional(),
});

export const cartValidationSchema = Joi.object({
  // M-5 fix: hard cap of 50 line items per cart to prevent N+1 DB loop abuse
  items:     Joi.array().items(cartItemSchema).min(1).max(50).required(),
  promoCode: Joi.string().trim().max(50).allow('', null).optional(),
});
