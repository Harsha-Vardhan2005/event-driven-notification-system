const db = require('../config/database');

// Get user preferences
const getPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    let result = await db.query(
      'SELECT * FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    // If no preferences exist, create default ones
    if (result.rows.length === 0) {
      result = await db.query(
        `INSERT INTO user_preferences (user_id, email_enabled, inapp_enabled, notification_types) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [userId, true, true, JSON.stringify({
          comment: true,
          like: true,
          mention: true,
          follow: true
        })]
      );
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update user preferences
const updatePreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email_enabled, inapp_enabled, notification_types } = req.body;

    const result = await db.query(
      `INSERT INTO user_preferences (user_id, email_enabled, inapp_enabled, notification_types, updated_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         email_enabled = $2,
         inapp_enabled = $3,
         notification_types = $4,
         updated_at = NOW()
       RETURNING *`,
      [userId, email_enabled, inapp_enabled, JSON.stringify(notification_types)]
    );

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getPreferences,
  updatePreferences
};