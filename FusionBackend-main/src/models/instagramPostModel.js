import mongoose from 'mongoose';

const instagramPostSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  caption: {
    type: String,
    required: true,
  },
  instagramLink: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['photo', 'reel', 'video'],
    default: 'photo',
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

const InstagramPostModel = mongoose.model('InstagramPost', instagramPostSchema);

export default InstagramPostModel;
