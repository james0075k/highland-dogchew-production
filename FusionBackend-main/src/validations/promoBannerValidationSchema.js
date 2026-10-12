import Joi from 'joi';

// No angle brackets: the text is rendered escaped anyway, but there's no reason
// for markup to be stored in a one-line banner.
const plainText = /^[^<>]*$/;

export const savePromoBannerSchema = Joi.object({
  enabled:  Joi.boolean().required(),
  leadText: Joi.string().trim().min(1).max(80).pattern(plainText).required()
    .messages({ 'string.pattern.base': 'Banner text cannot contain < or >.' }),
  promoCodeId: Joi.string().hex().length(24).required()
    .messages({ 'string.length': 'Choose a promo code.', 'string.hex': 'Choose a promo code.' }),
});
