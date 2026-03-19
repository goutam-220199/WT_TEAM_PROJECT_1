const notificationSchema = new mongoose.Schema({
    message: String,
    isRead: { type: Boolean, default: false }
  }, { timestamps: true });