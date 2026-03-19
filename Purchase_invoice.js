const purchaseSchema = new mongoose.Schema({
    invoiceDate: {
      type: Date,
      required: true
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true
    },
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