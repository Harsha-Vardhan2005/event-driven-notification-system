const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

// Routes
router.get('/user/:userId', getNotifications);
router.get('/user/:userId/unread/count', getUnreadCount);
router.post('/', createNotification);
router.put('/:id/read', markAsRead);
router.put('/user/:userId/read-all', markAllAsRead);

module.exports = router;