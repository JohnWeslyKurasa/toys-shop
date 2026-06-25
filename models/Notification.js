const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    enum: ['New product launches', 'Discounts', 'Flash sales', 'Festival offers', 'Order updates', 'Stock availability', 'General announcements'],
    default: 'General announcements',
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false,
  },
  targetAudience: {
    type: String,
    enum: ['All Users', 'Specific Users', 'Users who purchased a product', 'New Users'],
    default: 'All Users',
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  expiresAt: {
    type: Date,
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
