const orderSchema = new mongoose.Schema({
    orderId: {
      type: String,
      required: true
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        quantity: Number,
        price: Number
      }
    ],
    totalAmount: Number,
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending"
    }
  }, { timestamps: true });
  
  export default mongoose.model("Order", orderSchema);