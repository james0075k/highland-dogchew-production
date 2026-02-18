import mongoose from 'mongoose';

const contactInfoSchema = new mongoose.Schema(
  {
    address: { type: String, default: '' },
   phones: {
      type: [String], 
      default: [],
    },
    email: { type: String, default: '' },
    whatsappNumber: { 
      type: String,
      default: '',
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

const ContactInfo = mongoose.model('ContactInfo', contactInfoSchema);
export default ContactInfo;
