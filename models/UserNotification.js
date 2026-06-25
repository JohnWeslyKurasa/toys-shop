const mongoose = require('mongoose');

const userNotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  notificationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification',
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  clicked: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

// Ensure unique combination of userId and notificationId
userNotificationSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

module.exports = mongoose.model('UserNotification', userNotificationSchema);
