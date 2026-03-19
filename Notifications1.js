const notificationSchema = new mongoose.Schema({
    message: String,
    type: {
      type: String,
      enum: ["info", "warning", "error"]
    },
    isRead: {
      type: Boolean,
      default: false
    }
  }, { timestamps: true });
  
  export default mongoose.model("Notification", notificationSchema);