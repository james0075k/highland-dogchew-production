import mongoose from "mongoose";

const logoSchema = new mongoose.Schema({
  image: {
    urls: { type: [String], required: true },  // <- array of image URLs
    height: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    alt: { type: String, default: 'Logo image' },
    createdAt: { type: Date, default: Date.now },
  },
});

const LogoModel = mongoose.model("Logo", logoSchema);

export default LogoModel;
