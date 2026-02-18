import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  message: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    required: true
  },
  position: {
    type: String, // e.g., CEO, Manager
    required: false
  }
}, { timestamps: true });

const TestimonialModel = mongoose.model('Testimonial', testimonialSchema);

export default TestimonialModel;
