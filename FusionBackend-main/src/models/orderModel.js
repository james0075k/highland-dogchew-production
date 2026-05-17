import mongoose from 'mongoose';
import { randomBytes } from 'crypto';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  size: {
    type: String,
    default: 'Default',
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
  },

  // Subscription fields
  subscriptionInterval: {
    type: String,
    default: null,
  },

  // Per-item tax and delivery (from product pricingSettings at time of order)
  taxAmount: {
    type: Number,
    default: 0,
  },
  deliveryCharge: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName:     { type: String, default: '' },
  firstName:    { type: String },
  lastName:     { type: String },
  email:        { type: String, default: '' },
  phone:        { type: String },
  addressLine1: { type: String, default: '' },
  addressLine2: { type: String },
  city:         { type: String, default: '' },
  county:       { type: String },
  postcode:     { type: String, default: '' },
  country:      { type: String, default: 'United Kingdom' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    type: shippingAddressSchema,
    required: true,
  },
  subtotal: {
    type: Number,
    required: true,
  },
  totalTax: {
    type: Number,
    default: 0,
  },
  totalDelivery: {
    type: Number,
    default: 0,
  },
  totalDiscount: {
    type: Number,
    default: 0,
  },
  grandTotal: {
    type: Number,
    required: true,
  },
  paymentIntentId: {
    type: String,
    // Uniqueness is enforced by a partial-filter index below — only when the
    // field is a real (non-empty) Stripe PaymentIntent id. Free orders never
    // get a PI and must be allowed to coexist with each other.
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'backordered', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },

  // ── Courier tracking ──────────────────────────────────────────────────────
  trackingNumber: {
    type: String,
    default: null,
    trim: true,
  },
  courier: {
    type: String,
    default: 'evri',
    trim: true,
  },
  shippedAt: {
    type: Date,
    default: null,
  },

  // ── Promo code snapshot (taken at redemption time) ────────────────────────
  // Stored so charge.refunded can roll back usageCount + redeemedEmails/IPs.
  promoCode: {
    code:                  { type: String, default: null },
    discountType:          { type: String, default: null },
    discountValue:         { type: Number, default: null },
    discountAmount:        { type: Number, default: 0 },
    stripePromotionCodeId: { type: String, default: null },
    customerEmail:         { type: String, default: null }, // lowercased
    customerIP:            { type: String, default: null },
    raceLost:              { type: Boolean, default: false }, // true if atomic redeem failed
    rolledBack:            { type: Boolean, default: false }, // idempotency for refund rollback
  },
}, { timestamps: true });

// Unique only on actual Stripe PI ids — null / missing / "" are ignored.
orderSchema.index(
  { paymentIntentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      paymentIntentId: { $type: 'string', $gt: '' },
    },
  }
);

// Auto-generate order number using crypto.randomBytes (not Math.random)
// 3 random bytes = 6 hex chars = ~16.7 million combinations per timestamp bucket
orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = randomBytes(3).toString('hex').toUpperCase();
    this.orderNumber = `HD-${timestamp}-${random}`;
  }
  next();
});

const OrderModel = mongoose.model('Order', orderSchema);

export default OrderModel;
