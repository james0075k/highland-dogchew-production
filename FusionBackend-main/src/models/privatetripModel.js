import mongoose from 'mongoose';

// Reuse guestInfoSchema
const guestInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  country: { type: String }
}, { _id: false });

// Private Trip Schema
const privateTripSchema = new mongoose.Schema({
  guestInfo: {
    type: guestInfoSchema,
    required: true
  },
  preferredDestination: {
    type: String,
    required: false // optional
  },
  tripLength: {
    type: String,
    required: false // optional
  },
  desiredMonth: {
    type: String,
    required: false // optional
  },
  activities: {
    type: String,
    required: false // optional
  },
  additionalNotes: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['open', 'planned', 'cancelled', 'completed'],
    default: 'open'
  }
}, { timestamps: true });

const PrivateTrip = mongoose.model('PrivateTrip', privateTripSchema);
export default PrivateTrip;
