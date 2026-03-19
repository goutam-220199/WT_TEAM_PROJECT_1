const reportSchema = new mongoose.Schema({
    reportType: String, // sales, inventory
    data: Object,
    generatedAt: {
      type: Date,
      default: Date.now
    }
  });
  
  export default mongoose.model("Report", reportSchema);