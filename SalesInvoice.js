const salesSchema = new mongoose.Schema({
    invoiceNumber: {
      type: String,
      required: true
    },
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
    totalAmount: Number,
    gstAmount: Number,
    finalAmount: Number
  }, { timestamps: true });
  
  export default mongoose.model("Sales", salesSchema);