import mongoose from 'mongoose';
import slugify from 'slugify';

const bulkTierSchema = new mongoose.Schema({
  minQty: { type: Number, required: true },
  salePrice: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
}, { _id: false });

const sizeSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: null,
  },
  originalPrice: {
    type: Number,
    default: null,
  },
  bulkTiers: [bulkTierSchema],
  stockQuantity: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const bulkPricingSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  }
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  image: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: true,
  },
  originalPrice: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Original', 'Flavored'],
  },
  productType: {
    type: String,
    required: true,
    enum: ['yak-milk', 'puff-treat', 'highland-mix'],
    default: 'yak-milk',
    index: true,
  },
  // NEW: Link to variety
  variety: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Variety',
    required: true, // Every product MUST belong to a variety
    index: true,
  },
  badge: {
    type: String,
    default: null,
  },
  description: {
    type: String,
    required: true,
  },
  features: [{
    type: String,
  }],
  sizes: [sizeSchema],
  bulkPricing: [bulkPricingSchema],
  gallery: [{
    type: String,
  }],

  // Advanced Pricing Settings (admin-controlled per product)
  pricingSettings: {
    taxPercentage: { type: Number, default: 0, min: 0 },
    deliveryCharge: { type: Number, default: 0, min: 0 },
  },

  // Subscription / Subscribe & Save Settings
  subscriptionSettings: {
    isEnabled: { type: Boolean, default: false },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    // Admin sets specific week numbers, e.g. [1, 2, 4] → "Every 1 week", "Every 2 weeks", "Every 4 weeks"
    weeklyOptions: [{ type: Number, min: 1 }],
    // Admin sets specific month numbers, e.g. [1, 2, 3] → "Every 1 month", "Every 2 months", "Every 3 months"
    monthlyOptions: [{ type: Number, min: 1 }],
    // Kept for backward compatibility with old products
    intervals: [{ type: String }],
  },

  // Stock management
  trackStock: {
    type: Boolean,
    default: false,
  },
  stockQuantity: {
    type: Number,
    default: 0,
  },

  // Soft delete — false means archived/hidden from all public listings
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },

  // Nutrition / Guaranteed Analysis
  nutritionFacts: {
    servingSize: { type: String, default: '' },
    calories: { type: String, default: '' },
    items: [{
      label: { type: String },
      value: { type: String },
      dailyValue: { type: String, default: '' },
      bold: { type: Boolean, default: false },
      indent: { type: Boolean, default: false },
    }],
  },
}, { timestamps: true });

// Compound index for the most common public query (list by type, active only, newest-first)
productSchema.index({ productType: 1, isActive: 1, createdAt: -1 });

// Auto-generate slug from name
productSchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { 
      lower: true,
      strict: true,
      replacement: '-',
      trim: true
    });
  }
  next();
});

const ProductModel = mongoose.model('Product', productSchema);

export default ProductModel;