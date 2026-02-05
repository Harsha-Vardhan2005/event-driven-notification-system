const db = require('../config/database');
const { publishNotification } = require('../services/queuePublisher'); 

// Get all notifications for a user
const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await db.query(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({
      success: true,
      count: parseInt(result.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, priority = 'medium', data = {} } = req.body;

    // Validate required fields
    if (!userId || !type || !title) {
      return res.status(400).json({
        success: false,
        error: 'userId, type, and title are required'
      });
    }

    // Check user preferences
    const prefResult = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    let channels = [];
    
    if (prefResult.rows.length > 0) {
      const prefs = prefResult.rows[0];
      const notifTypes = prefs.notification_types || {};

      // Check if user wants this notification type
      if (notifTypes[type] === false) {
        return res.status(200).json({
          success: true,
          message: 'User has disabled this notification type',
          skipped: true
        });
      }

      // Determine which channels to use
      if (prefs.inapp_enabled) channels.push('inapp');
      if (prefs.email_enabled) channels.push('email');
    } else {
      // Default: use in-app only
      channels = ['inapp'];
    }

    // If no channels enabled, skip
    if (channels.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'User has disabled all notification channels',
        skipped: true
      });
    }

    const notificationData = {
      userId,
      type,
      title,
      message,
      priority,
      data
    };

    // Publish to RabbitMQ
    await publishNotification(notificationData, channels);

    res.status(202).json({
      success: true,
      message: 'Notification queued for processing',
      data: notificationData,
      channels
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mark all as read for a user
const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    await db.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [userId]
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead
};