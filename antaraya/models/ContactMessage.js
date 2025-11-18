import mongoose from "mongoose";

const ContactMessageSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: false },
  email: { type: String, required: true },
  subscribe: { type: Boolean, default: false },
  message: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.ContactMessage || mongoose.model("ContactMessage", ContactMessageSchema);
