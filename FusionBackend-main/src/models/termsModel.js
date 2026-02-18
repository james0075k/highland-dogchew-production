import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
}, 
 { _id: false }
);

const termsSchema = new mongoose.Schema(
  {
    pageTitle: { type: String, default: 'Terms and Conditions' },
    sections: [sectionSchema],
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const TermsModel = mongoose.model('Terms', termsSchema);
export default TermsModel;
