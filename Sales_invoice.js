const salesSchema = new mongoose.Schema({
    customerName: String,
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product"
        },
        quantity: Number,
        price: Number,
        gst: Number
      }
    ],
    subtotal: Number,
    totalGST: Number,
    totalAmount: Number
  }, { timestamps: true });