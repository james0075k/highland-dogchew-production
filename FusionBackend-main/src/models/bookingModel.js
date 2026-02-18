import mongoose from "mongoose";

const guestInfoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  country: { type: String, required: true },
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  guestInfo: {
    type: guestInfoSchema,
    required: true,
  },
  tourPackage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TourPackage",
    required: true,
  },
  travelDate: {
    type: Date,
    required: true,
  },
  bookingDate: {
    type: Date,
    default: Date.now,
  },
  totalPeople: {
    type: Number,
    required: true,
  },
  specialRequests: {
    type: String,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled", "completed"],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  }
}, { timestamps: true });

const BookingModel = mongoose.model("Booking", bookingSchema);

export default BookingModel;