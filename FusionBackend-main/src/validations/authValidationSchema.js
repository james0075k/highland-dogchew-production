import Joi from 'joi';

// Joi.string() rejects objects/arrays outright — this is the primary defence
// against NoSQL operator injection (e.g. {"$ne":null}). Every auth endpoint
// must validate before touching Mongoose.

const emailSchema = Joi.string().trim().lowercase().email({ minDomainSegments: 2 }).max(254).required();

// Password complexity. We don't enforce mixed-case/symbols (too friction-y
// against memorable passphrases) but require ≥ 8 chars and at least one digit
// OR symbol to keep dictionary attacks expensive.
const strongPasswordSchema = Joi.string().min(8).max(128)
  .pattern(/[\d\W]/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters.',
    'string.pattern.base': 'Password must contain at least one number or symbol.',
  });

export const loginSchema = Joi.object({
  email:    emailSchema,
  password: Joi.string().min(1).max(128).required(),
});

export const registerSchema = Joi.object({
  fullName:    Joi.string().trim().min(2).max(80).required(),
  email:       emailSchema,
  phoneNumber: Joi.string().trim().pattern(/^[+\d\s\-()]{7,20}$/).required()
    .messages({ 'string.pattern.base': 'Invalid phone number format.' }),
  password:    strongPasswordSchema,
  // `role` is intentionally NOT accepted from the client — first admin is
  // always created as 'superadmin' by the controller, regardless of input.
});

export const forgotPasswordSchema = Joi.object({
  email: emailSchema,
});

export const resetPasswordSchema = Joi.object({
  password: strongPasswordSchema,
});

export const resetTokenSchema = Joi.object({
  // 32-byte hex token from crypto.randomBytes(32).toString('hex')
  token: Joi.string().hex().length(64).required(),
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(1).max(128).required(),
  newPassword: strongPasswordSchema,
});
