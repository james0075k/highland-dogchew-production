import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema(
  {

     title: {
      type: String,
      trim: true,
    },
    
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    }

 
  },
  { timestamps: true }
);


const FaqModel = mongoose.model('FAQ', faqSchema);


export default FaqModel;
