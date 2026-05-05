import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  // Support both product reviews and tour reviews
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null,
  },
  tour: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TourPackage',
    default: null,
  },
  guestInfo: {
    name: { type: String, required: true },
    email: { type: String, default: '' },
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
}, { timestamps: true });

const ReviewModel = mongoose.model('Review', reviewSchema);

export default ReviewModel;
