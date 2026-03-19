const orderSchema = new mongoose.Schema({
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        quantity: Number
      }
    ],
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending"
    }
  }, { timestamps: true });