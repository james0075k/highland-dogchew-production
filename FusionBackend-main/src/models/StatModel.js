import mongoose from 'mongoose';

const statSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true // e.g., 18, 2750, etc.
  },
  label: {
    type: String,
    required: true // e.g., "Years of Experience"
  },
  description: {
    type: String,
    required: true // e.g., "Seasoned in travel excellence since day one."
  }
}, {
  timestamps: true
});

const StatModel = mongoose.model('Stat', statSchema);
export default StatModel;
