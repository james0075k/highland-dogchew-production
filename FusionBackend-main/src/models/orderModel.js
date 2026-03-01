import mongoose from 'mongoose';

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
    unique: true,
    sparse: true, // allows multiple orders with no paymentIntentId (manual/legacy)
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
}, { timestamps: true });

// Auto-generate order number
orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `HD-${timestamp}-${random}`;
  }
  next();
});

const OrderModel = mongoose.model('Order', orderSchema);

export default OrderModel;
