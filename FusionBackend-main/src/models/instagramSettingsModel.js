import mongoose from 'mongoose';

/**
 * Singleton document — only one record ever exists.
 * Admin can toggle the Instagram Feed section ON/OFF
 * and control how many live posts appear.
 */
const instagramSettingsSchema = new mongoose.Schema(
  {
    isEnabled: {
      type: Boolean,
      default: true,
    },
    postsCount: {
      type: Number,
      default: 8,
      min: 1,
      max: 12,
    },
  },
  { timestamps: true }
);

export default mongoose.model('InstagramSettings', instagramSettingsSchema);
