import mongoose from "mongoose";
import slugify from "slugify";

const activitySchema = new mongoose.Schema({
  title: { type: String, required: true },        
  slug: { type: String, unique: true },         
  subtitle: { type: String },                     
  description: { type: String, required: true },  
  image: { type: String },                        
  isFeatured: { type: Boolean, default: false },  
  totalTrips: {
      type: Number,
      default: 0, 
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourCategory',
  },
  createdAt: { type: Date, default: Date.now }
});

// 👇 Pre-save middleware to generate slug
activitySchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

const activityModel = mongoose.model('Activity', activitySchema);
export default activityModel;
