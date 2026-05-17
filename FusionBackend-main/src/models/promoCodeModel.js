import mongoose from 'mongoose';

const redemptionSchema = new mongoose.Schema({
  email:      { type: String, default: null }, // lowercased
  ip:         { type: String, default: null },
  orderId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  redeemedAt: { type: Date,   default: Date.now },
}, { _id: false });

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
  // Global redemption cap across all customers (null = unlimited)
  usageLimit: {
    type: Number,
    default: null,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  // Per-customer cap, enforced by email AND IP. 1 = "one redemption per customer".
  // null = unlimited per customer (only global usageLimit applies).
  perUserLimit: {
    type: Number,
    default: 1,
  },
  minOrderAmount: {
    type: Number,
    default: 0,
  },
  // Lowercased emails / source IPs of every successful redemption.
  // Used for fast per-user limit checks; the audit trail lives in `redemptions`.
  redeemedEmails: {
    type: [String],
    default: [],
    index: true,
  },
  redeemedIPs: {
    type: [String],
    default: [],
    index: true,
  },
  redemptions: {
    type: [redemptionSchema],
    default: [],
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
