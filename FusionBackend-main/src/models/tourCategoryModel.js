import mongoose from "mongoose";
import slugify from "slugify";

const tourCategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
   image: { type: String }, 
  slug: { type: String, unique: true }, // Add slug field
  createdAt: { type: Date, default: Date.now }
});

// Middleware to create slug before saving
tourCategorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const tourCategoryModel = mongoose.model('TourCategory', tourCategorySchema);

export default tourCategoryModel;     
