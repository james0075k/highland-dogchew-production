import Joi from 'joi';

const sizeSchema = Joi.object({
  label: Joi.string().required(),
  value: Joi.string().required(),
});

const bulkPricingSchema = Joi.object({
  quantity: Joi.number().required(),
  price: Joi.number().required(),
  originalPrice: Joi.number().required(),
  discount: Joi.number().default(0),
});

export const productValidationSchema = Joi.object({
  name: Joi.string().required(),
  slug: Joi.string().optional(),
  image: Joi.string().required(),
  rating: Joi.number().min(0).max(5).default(0),
  reviews: Joi.number().default(0),
  price: Joi.number().required(),
  originalPrice: Joi.number().required(),
  category: Joi.string().valid('Original', 'Flavored').required(),
  productType: Joi.string().valid('yak-milk', 'puff-treat', 'highland-mix').default('yak-milk'),
  badge: Joi.string().allow(null, '').optional(),
  description: Joi.string().required(),
  features: Joi.array().items(Joi.string()).optional(),
  sizes: Joi.array().items(sizeSchema).optional(),
  bulkPricing: Joi.array().items(bulkPricingSchema).optional(),
  gallery: Joi.array().items(Joi.string()).optional(),
});


