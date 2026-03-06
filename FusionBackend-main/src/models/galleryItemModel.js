import mongoose from 'mongoose';

const GALLERY_CATEGORIES = [
  'GALLERY', 'HONEY', 'PUMPKIN', 'STRAWBERRY', 'BLUEBERRY',
  'COCONUT', 'PEANUT', 'MINT', 'TURMERIC', 'FLAXSEED',
];

const galleryItemSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: GALLERY_CATEGORIES,
      default: 'GALLERY',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('GalleryItem', galleryItemSchema);
