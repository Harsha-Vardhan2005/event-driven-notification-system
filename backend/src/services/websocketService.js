let io = null;

const initializeWebSocket = (server) => {
  const { Server } = require('socket.io');
  
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Vite's default port for React
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);

    // Client joins a room based on their userId
    socket.on('join', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`👤 User ${userId} joined their notification room`);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id);
    });
  });

  return io;
};

const pushNotificationToUser = (userId, notification) => {
  if (!io) {
    console.warn('⚠️  WebSocket not initialized');
    return;
  }

  io.to(`user_${userId}`).emit('notification:new', notification);
  console.log(`📲 Pushed notification to user ${userId}:`, notification.title);
};

module.exports = {
  initializeWebSocket,
  pushNotificationToUser
};