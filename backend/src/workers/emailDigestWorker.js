const { connectRabbitMQ, QUEUES, getChannel } = require('../config/rabbitmq');
const db = require('../config/database');
const sgMail = require('@sendgrid/mail');
const { digestNotificationTemplate } = require('../utils/emailTemplates');
const cron = require('node-cron');
require('dotenv').config();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Store pending notifications per user
const pendingDigests = new Map();

const collectNotification = (message) => {
  const notification = JSON.parse(message.content.toString());
  const userId = notification.userId;

  if (!pendingDigests.has(userId)) {
    pendingDigests.set(userId, []);
  }

  pendingDigests.get(userId).push(notification);
  console.log(`📥 Collected digest notification for user ${userId}:`, notification.title);
};

const processDigestEmails = async () => {
  if (pendingDigests.size === 0) {
    console.log('⏸️  No pending digest notifications to send');
    return;
  }

  console.log(`🔵 Processing daily digest for ${pendingDigests.size} user(s)...`);

  for (const [userId, notifications] of pendingDigests.entries()) {
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

      // Send digest email
      const emailContent = {
        to: userEmail,
        from: process.env.SENDGRID_FROM_EMAIL,
        subject: `📊 Your Daily Digest - ${notifications.length} notification${notifications.length > 1 ? 's' : ''}`,
        html: digestNotificationTemplate(notifications)
      };

      await sgMail.send(emailContent);

      console.log(`✅ Digest email sent to ${userEmail} (${notifications.length} notifications)`);

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
            [notifResult.rows[0].id, 'email_digest', 'delivered']
          );
        }
      }

    } catch (error) {
      console.error(`❌ Error sending digest email to user ${userId}:`, error.message);
    }
  }

  // Clear pending digests
  pendingDigests.clear();
  console.log('✅ Digest processing complete');
};

const startDigestWorker = async () => {
  try {
    if (!process.env.SENDGRID_API_KEY || !process.env.SENDGRID_FROM_EMAIL) {
      console.error('❌ SendGrid not configured');
      process.exit(1);
    }

    const { channel } = await connectRabbitMQ();

    console.log('👂 Digest Email Worker listening on queue:', QUEUES.EMAIL_DIGEST);

    // Consume messages and collect them
    channel.consume(QUEUES.EMAIL_DIGEST, (message) => {
      if (message) {
        collectNotification(message);
        channel.ack(message);
      }
    }, { noAck: false });

    // Schedule digest processing once daily at 9:00 AM
    // Cron format: minute hour day month dayOfWeek
    // 0 9 * * * = every day at 9:00 AM
    cron.schedule('0 */3 * * *', () => {
      console.log('⏰ Daily digest schedule triggered (9:00 AM)');
      processDigestEmails();
    });

    console.log('⏰ Daily digest scheduled: every day at 9:00 AM');
    
    // For testing: also trigger every 30 minutes (comment out in production)
    cron.schedule('*/30 * * * *', () => {
      console.log('⏰ [TEST] Digest triggered (every 30 mins for testing)');
      processDigestEmails();
    });
    console.log('⏰ [TEST MODE] Also sending digest every 30 minutes for testing');

  } catch (error) {
    console.error('❌ Digest Worker error:', error.message);
    setTimeout(startDigestWorker, 5000);
  }
};

if (require.main === module) {
  console.log('🚀 Starting Daily Digest Email Worker (LOW PRIORITY)...');
  startDigestWorker();
}

module.exports = { startDigestWorker };