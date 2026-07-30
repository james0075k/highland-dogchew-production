import mongoose from 'mongoose';

const { Schema } = mongoose;

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const billingEntrySchema = new Schema(
  {
    date:             { type: Date, default: Date.now },
    amount:           { type: Number, required: true },
    status:           { type: String, enum: ['success', 'failed'], required: true },
    orderId:          { type: Schema.Types.ObjectId, ref: 'Order' },
    paymentIntentId:  { type: String },
    failureReason:    { type: String },
  },
  { _id: false }
);

const addressSchema = new Schema(
  {
    fullName:     String,
    firstName:    String,
    lastName:     String,
    email:        String,
    phone:        String,
    addressLine1: String,
    addressLine2: String,
    city:         String,
    county:       String,
    postcode:     String,
    country:      { type: String, default: 'United Kingdom' },
  },
  { _id: false }
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const subscriptionSchema = new Schema(
  {
    subscriptionId: { type: String, required: true, unique: true, index: true },

    // ── Origin (natural key — set once, never changed) ──────────────────────────
    //
    // The PaymentIntent that created this subscription plus a key identifying the
    // exact cart line it came from. Together these are what makes creation
    // idempotent: both the Stripe webhook and POST /api/orders/sync call
    // createSubscriptionsFromPI for the same payment, and the unique index below
    // is the last line of defence against them both inserting.
    //
    // Kept separate from billingHistory on purpose — that array grows on every
    // renewal, so it is the wrong thing to hang a uniqueness guarantee on.
    //
    originPaymentIntentId: { type: String },
    originItemKey:         { type: String }, // `${product || productName}::${size}`

    // ── Customer ───────────────────────────────────────────────────────────────
    email:            { type: String, required: true, index: true, lowercase: true, trim: true },
    stripeCustomerId: { type: String, required: true },
    paymentMethodId:  { type: String, required: true },

    // ── Product ────────────────────────────────────────────────────────────────
    product:       { type: Schema.Types.ObjectId, ref: 'Product' },
    productName:   { type: String, required: true },
    productImage:  { type: String, default: '' },
    productSlug:   { type: String, default: '' },
    size:          { type: String, default: 'Default' },
    quantity:      { type: Number, required: true, min: 1 },
    unitPrice:     { type: Number, required: true }, // per delivery, after discount

    // ── Interval ───────────────────────────────────────────────────────────────
    intervalLabel: { type: String, required: true }, // "Every 2 weeks"
    intervalWeeks: { type: Number, required: true },  // 2

    // ── Status & billing ───────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['active', 'paused', 'payment_failed', 'cancelled'],
      default: 'active',
      index:   true,
    },
    nextBillingDate: { type: Date, required: true, index: true },
    lastBilledAt:    { type: Date },
    failureCount:    { type: Number, default: 0 },
    failureReason:   { type: String },

    // ── Linked orders ──────────────────────────────────────────────────────────
    firstOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    orders:       [{ type: Schema.Types.ObjectId, ref: 'Order' }],

    // ── History ────────────────────────────────────────────────────────────────
    billingHistory: [billingEntrySchema],

    // ── Shipping (copied at creation for renewals) ─────────────────────────────
    shippingAddress: addressSchema,
  },
  { timestamps: true }
);

// Compound index for the cron job query
subscriptionSchema.index({ status: 1, nextBillingDate: 1 });

// One subscription per (origin payment, cart line). Partial filter so documents
// predating the origin fields — and any future doc created without them — are
// simply not indexed rather than colliding on null, mirroring the paymentIntentId
// index in orderModel.js.
subscriptionSchema.index(
  { originPaymentIntentId: 1, originItemKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      originPaymentIntentId: { $type: 'string', $gt: '' },
      originItemKey:         { $type: 'string', $gt: '' },
    },
  }
);

export default mongoose.model('Subscription', subscriptionSchema);
