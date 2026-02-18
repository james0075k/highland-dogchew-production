

import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      small: { type: String, required: true },
      big: { type: String, required: true },
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Partner', partnerSchema);

