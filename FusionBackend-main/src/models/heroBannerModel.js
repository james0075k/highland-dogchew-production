import mongoose from "mongoose";

const heroBannerSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    subTitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    buttonText: {
        type: String,
        required: true
    },
    buttonLink: {
        type: String,
        required: true
    },
    bannerImage: {
        type: String,
        required: true
    },
    height: {
        type: Number,
        required: false
    },
    width: {
        type: Number,
        required: false
    },
    

}, { timestamps: true });

export default mongoose.model("HeroBanner", heroBannerSchema);
