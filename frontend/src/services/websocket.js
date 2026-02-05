import { io } from 'socket.io-client';

let socket = null;

export const connectWebSocket = (userId, onNotification) => {
  socket = io('http://localhost:5000');

  socket.on('connect', () => {
    console.log('🔌 Connected to WebSocket');
    socket.emit('join', userId);
  });

  socket.on('notification:new', (notification) => {
    console.log('📲 Received real-time notification:', notification);
    onNotification(notification);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Disconnected from WebSocket');
  });

  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};