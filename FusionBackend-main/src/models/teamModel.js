import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      
    },
    position: {
      type: String,
      
    },
    image: {
      type: String,
      
    },
    shortinfo: {
      type: String,
      default: '',
    },
    contactNumber: {
      type: String,
      default: '',
    },
 certifications: [
  {
    title: { type: String },
    imageUrls: { type: String }, // must be URL, not File
    _id: false, 
  }
],
    socialLinks: {
      facebook: String,
      linkedin: String,
      twitter: String,
      github: String,
      instagram: String,
    },
  },
  { timestamps: true }
);

const teamModel = mongoose.model('Team', teamSchema);

export default teamModel;
