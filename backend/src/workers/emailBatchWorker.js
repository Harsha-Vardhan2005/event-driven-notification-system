const { connectRabbitMQ, QUEUES, getChannel } = require('../config/rabbitmq');
const db = require('../config/database');
const sgMail = require('@sendgrid/mail');
const { batchNotificationTemplate } = require('../utils/emailTemplates');
const cron = require('node-cron');
require('dotenv').config();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Store pending notifications per user
const pendingNotifications = new Map();

const collectNotification = (message) => {
  const notification = JSON.parse(message.content.toString());
  const userId = notification.userId;

  if (!pendingNotifications.has(userId)) {
    pendingNotifications.set(userId, []);
  }

  pendingNotifications.get(userId).push(notification);
  console.log(`📥 Collected batch notification for user ${userId}:`, notification.title);
};

const processBatchEmails = async () => {
  if (pendingNotifications.size === 0) {
    console.log('⏸️  No pending batch notifications to send');
    return;
  }

  console.log(`🟡 Processing batch emails for ${pendingNotifications.size} user(s)...`);

  for (const [userId, notifications] of pendingNotifications.entries()) {
    try {
      // Get user email
      const userResult = await db.query(
        'SELECT email FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        console.error('❌ User not found:', userId);
        continue;
      }

      const userEmail = userResult.rows[0].email;

      // Send batch email
      const emailContent = {
        to: userEmail,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `📬 You have ${notifications.length} new notification${notifications.length > 1 ? 's' : ''}`,
        html: batchNotificationTemplate(notifications)
      };

      await sgMail.send(emailContent);

      console.log(`✅ Batch email sent to ${userEmail} (${notifications.length} notifications)`);

      // Log delivery for each notification
      for (const notif of notifications) {
        const notifResult = await db.query(
          `SELECT id FROM notifications 
           WHERE user_id = $1 
           AND type = $2 
           AND title = $3 
           ORDER BY created_at DESC 
           LIMIT 1`,
          [userId, notif.type, notif.title]
        );

        if (notifResult.rows.length > 0) {
          await db.query(
            `INSERT INTO notification_delivery_log (notification_id, channel, status, delivered_at) 
             VALUES ($1, $2, $3, NOW())`,
            [notifResult.rows[0].id, 'email_batch', 'delivered']
          );
        }
      }

    } catch (error) {
      console.error(`❌ Error sending batch email to user ${userId}:`, error.message);
    }
  }

  // Clear pending notifications
  pendingNotifications.clear();
  console.log('✅ Batch processing complete');
};

const startBatchWorker = async () => {
  try {
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      console.error('❌ SendGrid not configured');
      process.exit(1);
    }

    const { channel } = await connectRabbitMQ();

    console.log('👂 Batch Email Worker listening on queue:', QUEUES.EMAIL_BATCH);

    // Consume messages and collect them
    channel.consume(QUEUES.EMAIL_BATCH, (message) => {
      if (message) {
        collectNotification(message);
        channel.ack(message);
      }
    }, { noAck: false });

    // Schedule batch processing every 15 minutes
    // Cron format: minute hour day month dayOfWeek
    // */15 * * * * = every 15 minutes
    cron.schedule('*/15 * * * *', () => {
      console.log('⏰ Batch email schedule triggered (every 15 minutes)');
      processBatchEmails();
    });

    console.log('⏰ Batch emails scheduled: every 15 minutes');
    
    // Also process immediately on startup if there are pending messages
    setTimeout(() => processBatchEmails(), 5000);

  } catch (error) {
    console.error('❌ Batch Worker error:', error.message);
    setTimeout(startBatchWorker, 5000);
  }
};

if (require.main === module) {
  console.log('🚀 Starting Batch Email Worker (MEDIUM PRIORITY)...');
  startBatchWorker();
}

module.exports = { startBatchWorker };