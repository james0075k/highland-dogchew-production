import mongoose from 'mongoose';
import slugify from 'slugify';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },


  subtitle:{
    type: String,
    required: true, 
    
  },

   description:{
    type: String,
    required: true, 
  },

  imageUrl: {
    type: String,
    required: true,
  },
  date: Date,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogCategory',
    required: true,
  }
  ,
  isFeatured: {
    type: Boolean,
    default: false,
  },
  slug: {
    type: String,
    required: true,
   
  }
}, { timestamps: true });

// Auto-generate slug from title
blogSchema.pre('validate', function (next) {
  if (this.title && !this.slug) {
    this.slug = slugify(this.title, { 
      lower: true,
      strict: true,
      replacement: '-',
      trim: true
    });
  }
  next();
});

const BlogModel = mongoose.model('Blog', blogSchema);

export default BlogModel;
