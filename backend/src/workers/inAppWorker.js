const { connectRabbitMQ, QUEUES, getChannel } = require('../config/rabbitmq');
const db = require('../config/database');

const processInAppNotification = async (message) => {
  try {
    const notification = JSON.parse(message.content.toString());
    
    console.log('📥 Processing in-app notification:', notification.title);

    // Save to database
    const result = await db.query(
      `INSERT INTO notifications (user_id, type, title, message, priority, data) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        notification.userId,
        notification.type,
        notification.title,
        notification.message,
        notification.priority,
        JSON.stringify(notification.data || {})
      ]
    );

    const savedNotification = result.rows[0];

    // Log delivery
    await db.query(
      `INSERT INTO notification_delivery_log (notification_id, channel, status, delivered_at) 
       VALUES ($1, $2, $3, NOW())`,
      [savedNotification.id, 'inapp', 'delivered']
    );

    console.log('✅ In-app notification saved:', savedNotification.id);

    // Publish event to WebSocket queue
    const channel = getChannel();
    
    await channel.assertQueue('notifications.websocket', { durable: true });
    
    channel.sendToQueue(
      'notifications.websocket',
      Buffer.from(JSON.stringify(savedNotification)),
      { persistent: true }
    );

    console.log('📡 Published to WebSocket queue');

    return savedNotification;
  } catch (error) {
    console.error('❌ Error processing in-app notification:', error.message);
    throw error;
  }
};

const startInAppWorker = async () => {
  try {
    const { channel } = await connectRabbitMQ();

    // Prefetch only 1 message at a time
    channel.prefetch(1);

    console.log('👂 In-App Worker listening on queue:', QUEUES.IN_APP);

    channel.consume(QUEUES.IN_APP, async (message) => {
      if (message) {
        try {
          await processInAppNotification(message);
          channel.ack(message); // Acknowledge successful processing
        } catch (error) {
          console.error('❌ Failed to process message:', error.message);
          // Reject and requeue the message
          channel.nack(message, false, true);
        }
      }
    });
  } catch (error) {
    console.error('❌ In-App Worker error:', error.message);
    setTimeout(startInAppWorker, 5000); // Retry after 5 seconds
  }
};

// Start the worker if this file is run directly
if (require.main === module) {
  console.log('🚀 Starting In-App Notification Worker...');
  startInAppWorker();
}

module.exports = { startInAppWorker };