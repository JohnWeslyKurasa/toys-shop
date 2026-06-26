const Notification = require('../models/Notification');
const UserNotification = require('../models/UserNotification');
const User = require('../models/User');

// POST /api/admin/notifications
// Admin creates a notification and pushes it via Socket.IO
exports.createNotification = async (req, res) => {
  try {
    const { title, message, image, type, productId, targetAudience, priority, expiresAt } = req.body;
    
    const notification = await Notification.create({
      title,
      message,
      image,
      type,
      productId,
      targetAudience,
      priority,
      expiresAt,
      createdBy: req.user._id
    });

    let targetUsers = [];
    
    // Determine Target Audience
    if (targetAudience === 'All Users') {
      targetUsers = await User.find({}).select('_id');
    } else if (targetAudience === 'New Users') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      targetUsers = await User.find({ createdAt: { $gte: thirtyDaysAgo } }).select('_id');
    } else {
      // Default to All Users if not explicitly handled for now
      targetUsers = await User.find({}).select('_id');
    }

    // Create UserNotification entries
    const userNotifs = targetUsers.map(user => ({
      userId: user._id,
      notificationId: notification._id
    }));
    
    if (userNotifs.length > 0) {
      await UserNotification.insertMany(userNotifs);
    }

    // Emit via Socket.IO
    if (req.io) {
      if (targetAudience === 'All Users' || targetAudience === 'New Users') {
        // Simplified: Broadcast to everyone online. In a strict setup, emit to individual user rooms.
        req.io.emit('new_notification', notification);
      }
    }

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/notifications/public
// Get global public notifications for guests
exports.getPublicNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ targetAudience: 'All Users' })
      .sort({ createdAt: -1 })
      .limit(20);
      
    const validNotifications = notifications.filter(n => {
      if (n.expiresAt && new Date(n.expiresAt) < new Date()) return false;
      return true;
    });

    res.status(200).json({ success: true, count: validNotifications.length, data: validNotifications });
  } catch (error) {
    console.error('Error fetching public notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/notifications
// Get logged-in user's notifications
exports.getNotifications = async (req, res) => {
  try {
    // 1. Ensure user has all recent global notifications
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const globalNotifs = await Notification.find({
      targetAudience: 'All Users',
      createdAt: { $gte: thirtyDaysAgo }
    });

    const existingNotifs = await UserNotification.find({ userId: req.user._id });
    const existingIds = existingNotifs.map(un => un.notificationId.toString());

    const missingGlobal = globalNotifs.filter(n => !existingIds.includes(n._id.toString()));
    if (missingGlobal.length > 0) {
      await UserNotification.insertMany(missingGlobal.map(n => ({
        userId: req.user._id,
        notificationId: n._id
      })));
    }

    // 2. Fetch all user notifications
    const userNotifications = await UserNotification.find({ userId: req.user._id })
      .populate('notificationId')
      .sort({ createdAt: -1 })
      .limit(50);
      
    // Filter out missing references or expired notifications
    const validNotifications = userNotifications.filter(un => {
      const n = un.notificationId;
      if (!n) return false;
      if (n.expiresAt && new Date(n.expiresAt) < new Date()) return false;
      return true;
    });

    res.status(200).json({ success: true, count: validNotifications.length, data: validNotifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/notifications/read/:id
// Mark specific notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userNotif = await UserNotification.findOneAndUpdate(
      { userId: req.user._id, notificationId: req.params.id },
      { isRead: true },
      { new: true }
    );
    if (!userNotif) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.status(200).json({ success: true, data: userNotif });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/notifications/read-all
// Mark all user notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await UserNotification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/notifications/unread-count
// Get unread badge count
exports.getUnreadCount = async (req, res) => {
  try {
    // 1. Ensure user has all recent global notifications
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const globalNotifs = await Notification.find({
      targetAudience: 'All Users',
      createdAt: { $gte: thirtyDaysAgo }
    });

    const existingNotifs = await UserNotification.find({ userId: req.user._id });
    const existingIds = existingNotifs.map(un => un.notificationId.toString());

    const missingGlobal = globalNotifs.filter(n => !existingIds.includes(n._id.toString()));
    if (missingGlobal.length > 0) {
      await UserNotification.insertMany(missingGlobal.map(n => ({
        userId: req.user._id,
        notificationId: n._id
      })));
    }

    const count = await UserNotification.countDocuments({ userId: req.user._id, isRead: false });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
