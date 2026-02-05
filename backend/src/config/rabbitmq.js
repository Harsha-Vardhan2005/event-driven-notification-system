const amqp = require('amqplib');
require('dotenv').config();

let connection = null;
let channel = null;

const QUEUES = {
  IN_APP: 'notifications.inapp',
  EMAIL_HIGH: 'notifications.email.high',      // NEW - instant emails
  EMAIL_BATCH: 'notifications.email.batch',    // NEW - batched every 15 mins
  EMAIL_DIGEST: 'notifications.email.digest'   // NEW - daily digest
};

const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
    channel = await connection.createChannel();

    // Create in-app queue with priority
    await channel.assertQueue(QUEUES.IN_APP, {
      durable: true,
      arguments: {
        'x-max-priority': 10
      }
    });

    // Create email queues with priority
    await channel.assertQueue(QUEUES.EMAIL_HIGH, {
      durable: true,
      arguments: {
        'x-max-priority': 10
      }
    });

    await channel.assertQueue(QUEUES.EMAIL_BATCH, {
      durable: true
    });

    await channel.assertQueue(QUEUES.EMAIL_DIGEST, {
      durable: true
    });

    // Create WebSocket queue
    await channel.assertQueue('notifications.websocket', {
      durable: true
    });

    console.log('✅ Connected to RabbitMQ');
    console.log(`📬 Queues created: ${Object.values(QUEUES).join(', ')}`);

    return { connection, channel };
  } catch (error) {
    console.error('❌ RabbitMQ connection error:', error.message);
    setTimeout(connectRabbitMQ, 5000);
  }
};

const getChannel = () => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  return channel;
};

const closeConnection = async () => {
  if (channel) await channel.close();
  if (connection) await connection.close();
};

module.exports = {
  connectRabbitMQ,
  getChannel,
  closeConnection,
  QUEUES
};