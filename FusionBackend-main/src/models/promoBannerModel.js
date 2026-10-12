import mongoose from 'mongoose';

// Singleton: the homepage discount strip ("10% off every chew with code FRANK10").
// One document at most — saveBanner upserts it. Until it exists the public
// endpoint serves built-in defaults (see promoBannerController.js).
const promoBannerSchema = new mongoose.Schema(
  {
    enabled:   { type: Boolean, default: true },
    // Words shown before the code. Plain text, rendered escaped by React.
    leadText:  { type: String, trim: true, maxlength: 80, required: true },
    promoCode: { type: mongoose.Schema.Types.ObjectId, ref: 'PromoCode', default: null },
  },
  { timestamps: true }
);

const PromoBannerModel = mongoose.model('PromoBanner', promoBannerSchema);

export default PromoBannerModel;
