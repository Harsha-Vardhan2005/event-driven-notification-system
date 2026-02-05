const { connectRabbitMQ, QUEUES, getChannel } = require('../config/rabbitmq');
const db = require('../config/database');
const sgMail = require('@sendgrid/mail');
const { singleNotificationTemplate } = require('../utils/emailTemplates');
require('dotenv').config();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const processHighPriorityEmail = async (message) => {
  try {
    const notification = JSON.parse(message.content.toString());
    
    console.log('🔴 Processing HIGH priority email:', notification.title);

    // Get user email from database
    const userResult = await db.query(
      'SELECT email FROM users WHERE id = $1',
      [notification.userId]
    );

    if (userResult.rows.length === 0) {
      console.error('❌ User not found:', notification.userId);
      return;
    }

    const userEmail = userResult.rows[0].email;

    // Send email using template
    const emailContent = {
      to: userEmail,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: `🔔 ${notification.title}`,
      html: singleNotificationTemplate(notification)
    };

    await sgMail.send(emailContent);

    console.log('✅ High priority email sent to:', userEmail);

    // Log delivery
    const notifResult = await db.query(
      `SELECT id FROM notifications 
       WHERE user_id = $1 
       AND type = $2 
       AND title = $3 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [notification.userId, notification.type, notification.title]
    );

    if (notifResult.rows.length > 0) {
      await db.query(
        `INSERT INTO notification_delivery_log (notification_id, channel, status, delivered_at) 
         VALUES ($1, $2, $3, NOW())`,
        [notifResult.rows[0].id, 'email', 'delivered']
      );
    }

    return true;
  } catch (error) {
    console.error('❌ Error sending high priority email:', error.message);
    
    // Log failed delivery
    try {
      const notifResult = await db.query(
        `SELECT id FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [notification.userId]
      );

      if (notifResult.rows.length > 0) {
        await db.query(
          `INSERT INTO notification_delivery_log (notification_id, channel, status, error_message) 
           VALUES ($1, $2, $3, $4)`,
          [notifResult.rows[0].id, 'email', 'failed', error.message]
        );
      }
    } catch (logError) {
      console.error('Failed to log error:', logError.message);
    }

    throw error;
  }
};

const startEmailWorker = async () => {
  try {
    // Verify SendGrid is configured
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      console.error('❌ SendGrid not configured. Please set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL in .env');
      process.exit(1);
    }

    const { channel } = await connectRabbitMQ();

    channel.prefetch(1);

    console.log('👂 Email Worker (HIGH PRIORITY) listening on queue:', QUEUES.EMAIL_HIGH);

    channel.consume(QUEUES.EMAIL_HIGH, async (message) => {
      if (message) {
        try {
          await processHighPriorityEmail(message);
          channel.ack(message);
        } catch (error) {
          console.error('❌ Failed to process email:', error.message);
          // Don't requeue email failures to avoid spam
          channel.ack(message);
        }
      }
    });
  } catch (error) {
    console.error('❌ Email Worker error:', error.message);
    setTimeout(startEmailWorker, 5000);
  }
};

if (require.main === module) {
  console.log('🚀 Starting High Priority Email Worker...');
  startEmailWorker();
}

module.exports = { startEmailWorker };