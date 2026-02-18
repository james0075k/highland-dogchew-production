import Joi from 'joi';

export const varietyValidationSchema = Joi.object({
  name: Joi.string().required().min(2).max(100).messages({
    'string.empty': 'Variety name is required',
    'string.min': 'Variety name must be at least 2 characters',
    'string.max': 'Variety name cannot exceed 100 characters',
  }),
  slug: Joi.string().required(),
  description: Joi.string().required().min(10).max(500).messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 10 characters',
    'string.max': 'Description cannot exceed 500 characters',
  }),
  category: Joi.string()
    .valid('Blueberry', 'Strawberry', 'Pumpkin', 'Honey')
    .required()
    .messages({
      'any.only': 'Category must be one of: Blueberry, Strawberry, Pumpkin, Honey',
      'string.empty': 'Category is required',
    }),
  image: Joi.string().uri().required().messages({
    'string.empty': 'Image is required',
    'string.uri': 'Image must be a valid URL',
  }),
  isActive: Joi.boolean().default(true),
  displayOrder: Joi.number().integer().min(0).default(0),
});

export default varietyValidationSchema;