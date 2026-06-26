const express = require('express');
const {
  createNotification,
  getNotifications,
  getPublicNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
} = require('../controllers/notificationController');

const { authMiddleware, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public Routes
router.get('/public', getPublicNotifications);

// User Routes
router.get('/', authMiddleware, getNotifications);
router.get('/unread-count', authMiddleware, getUnreadCount);
router.patch('/read-all', authMiddleware, markAllAsRead);
router.patch('/read/:id', authMiddleware, markAsRead);

// Admin Routes
router.post('/admin', authMiddleware, adminOnly, createNotification);

module.exports = router;
