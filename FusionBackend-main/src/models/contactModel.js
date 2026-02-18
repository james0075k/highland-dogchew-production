import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 120 },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 2000 },

    // optional admin handling
    status: { type: String, enum: ["new", "read", "replied"], default: "new" },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const contactModel = mongoose.model("ContactMessage", contactSchema);
export default contactModel;
