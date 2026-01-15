// =================================================================
// SOCKET.IO CONFIGURATION
// =================================================================
// Real-time communication setup

const socketIO = require('socket.io');

/**
 * Initialize Socket.IO
 */
const initSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL,
        'https://arbythecoder.github.io/afrimercato-frontend',
        'https://arbythecoder.github.io',
        'http://localhost:3000',
        'http://localhost:5173'
      ],
      credentials: true
    }
  });

  // Connection event
  io.on('connection', (socket) => {
    console.log('✓ New Socket.IO connection:', socket.id);

    // Join room (order tracking, delivery tracking, etc)
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`✓ Socket ${socket.id} joined room: ${room}`);
    });

    // Leave room
    socket.on('leave-room', (room) => {
      socket.leave(room);
      console.log(`✓ Socket ${socket.id} left room: ${room}`);
    });

    // Location update (riders/pickers)
    socket.on('location-update', (data) => {
      io.to(data.room).emit('location-update', data);
    });

    // Order status update
    socket.on('order-update', (data) => {
      io.to(data.orderId).emit('order-update', data);
    });

    // Delivery status update
    socket.on('delivery-update', (data) => {
      io.to(data.deliveryId).emit('delivery-update', data);
    });

    // Chat message
    socket.on('chat-message', (data) => {
      io.to(data.room).emit('chat-message', data);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log('✓ Socket disconnected:', socket.id);
    });
  });

  return io;
};

module.exports = {
  initSocket
};
