const { getChannel, QUEUES } = require('../config/rabbitmq');

const PRIORITY_MAP = {
  high: 10,
  medium: 5,
  low: 1
};

const publishNotification = async (notificationData, channels = ['inapp']) => {
  try {
    const channel = getChannel();
    const priority = PRIORITY_MAP[notificationData.priority] || 5;

    const message = {
      ...notificationData,
      timestamp: new Date().toISOString()
    };

    const messageBuffer = Buffer.from(JSON.stringify(message));

    // Publish to in-app queue (always instant)
    if (channels.includes('inapp')) {
      channel.sendToQueue(QUEUES.IN_APP, messageBuffer, {
        persistent: true,
        priority: priority
      });
      console.log(`📤 Published to ${QUEUES.IN_APP}:`, notificationData.title);
    }

    // Smart email routing based on priority
    if (channels.includes('email')) {
      let emailQueue;
      
      switch (notificationData.priority) {
        case 'high':
          // High priority → Send immediately
          emailQueue = QUEUES.EMAIL_HIGH;
          break;
        case 'medium':
          // Medium priority → Batch every 15 mins
          emailQueue = QUEUES.EMAIL_BATCH;
          break;
        case 'low':
          // Low priority → Daily digest
          emailQueue = QUEUES.EMAIL_DIGEST;
          break;
        default:
          emailQueue = QUEUES.EMAIL_BATCH;
      }
      
      channel.sendToQueue(emailQueue, messageBuffer, {
        persistent: true,
        priority: priority
      });
      console.log(`📤 Published to ${emailQueue}:`, notificationData.title);
    }

    return true;
  } catch (error) {
    console.error('❌ Queue publish error:', error.message);
    throw error;
  }
};

module.exports = { publishNotification };