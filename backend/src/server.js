const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const db = require('./config/database');
const { connectRabbitMQ, getChannel } = require('./config/rabbitmq');
const { initializeWebSocket, pushNotificationToUser } = require('./services/websocketService');
const notificationRoutes = require('./routes/notifications');
const preferenceRoutes = require('./routes/preferences');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/preferences', preferenceRoutes); 

// Test route
app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ 
      status: 'OK', 
      message: 'Server and database are running',
      timestamp: result.rows[0].now 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: error.message 
    });
  }
});

// WebSocket notification consumer
const startWebSocketConsumer = async () => {
  try {
    const channel = getChannel();
    
    await channel.assertQueue('notifications.websocket', { durable: true });
    
    console.log('👂 WebSocket consumer listening...');
    
    channel.consume('notifications.websocket', (message) => {
      if (message) {
        const notification = JSON.parse(message.content.toString());
        pushNotificationToUser(notification.user_id, notification);
        channel.ack(message);
      }
    });
  } catch (error) {
    console.error('❌ WebSocket consumer error:', error.message);
  }
};

// Initialize RabbitMQ, WebSocket and start server
const startServer = async () => {
  await connectRabbitMQ();
  initializeWebSocket(server);
  await startWebSocketConsumer();
  
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();