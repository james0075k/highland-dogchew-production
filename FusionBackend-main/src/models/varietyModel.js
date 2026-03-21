// ============================================
// FILE: src/models/varietyModel.js
// ============================================
import mongoose from 'mongoose';
import slugify from 'slugify';

const varietySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    unique: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  }
}, { timestamps: true });

// Auto-generate slug from name
varietySchema.pre('validate', function (next) {
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

const VarietyModel = mongoose.model('Variety', varietySchema);

export default VarietyModel;