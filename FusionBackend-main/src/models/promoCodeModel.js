import mongoose from 'mongoose';

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'flat'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usageLimit: {
    type: Number,
    default: null, // null = unlimited
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  // Stripe Coupon/PromotionCode IDs — populated when admin creates the code
  stripeCouponId: {
    type: String,
    default: null,
  },
  stripePromotionCodeId: {
    type: String,
    default: null,
  },
}, { timestamps: true });

const PromoCodeModel = mongoose.model('PromoCode', promoCodeSchema);

export default PromoCodeModel;
