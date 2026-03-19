import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  gst: {
    type: Number,
    default: 18
  },
  quantity: {
    type: Number,
    required: true
  },
  description: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model("Product", productSchema);
