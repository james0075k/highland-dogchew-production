import mongoose from 'mongoose';
import slugify from 'slugify';

const productCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true,
    lowercase: true
  },

  description: {
    type: String
  },

  image: {
    type: String
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

// Auto-generate slug
productCategorySchema.pre('validate', function (next) {
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

const ProductCategoryModel = mongoose.model('ProductCategory', productCategorySchema);

export default ProductCategoryModel;