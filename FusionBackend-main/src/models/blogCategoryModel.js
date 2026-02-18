import mongoose from 'mongoose';
import slugify from 'slugify';

const blogCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
}, { timestamps: true });

blogCategorySchema.pre('validate', function (next) {
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const BlogCategoryModel = mongoose.model('BlogCategory', blogCategorySchema);
export default BlogCategoryModel;
