/**
 * Socket.IO Configuration for Real-time Features
 * - GPS Tracking (rider location updates)
 * - In-app Chat (Customer-Rider-Vendor)
 * - Live notifications
 */

const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Delivery = require('../models/Delivery');

let io;

/**
 * Initialize Socket.IO
 */
function initSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL || [
        'http://localhost:5173',
        'http://localhost:3000'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/socket.io',
    transports: ['websocket', 'polling']
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token ||
                    socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.user = user;
      socket.userId = user._id.toString();
      socket.userRole = user.role;

      next();
    } catch (error) {
      next(new Error('Authentication failed: ' + error.message));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} (${socket.userRole})`);

    // Join user to their own room
    socket.join(socket.userId);

    // Join role-specific room
    socket.join(socket.userRole);

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to Afrimercato real-time server',
      userId: socket.userId,
      role: socket.userRole,
      timestamp: new Date()
    });

    // ====================
    // GPS TRACKING EVENTS
    // ====================

    /**
     * Rider updates their location
     * Broadcasts to customer tracking the delivery
     */
    socket.on('update_location', async (data) => {
      try {
        const { deliveryId, latitude, longitude, accuracy, heading, speed } = data;

        // Verify rider owns this delivery
        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
          return socket.emit('error', { message: 'Delivery not found' });
        }

        if (delivery.rider.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Unauthorized: Not your delivery' });
        }

        // Update location in database
        await delivery.updateLocation(latitude, longitude, accuracy, heading, speed);

        // Calculate and update ETA
        await delivery.updateETA();

        // Broadcast to customer
        io.to(delivery.customer.toString()).emit('location_update', {
          deliveryId: delivery._id,
          location: {
            latitude,
            longitude,
            accuracy,
            heading,
            speed
          },
          eta: delivery.tracking.eta,
          distance: delivery.tracking.distance,
          timestamp: new Date()
        });

        // Acknowledge to rider
        socket.emit('location_updated', {
          success: true,
          deliveryId: delivery._id,
          timestamp: new Date()
        });

        console.log(`📍 Location updated for delivery ${deliveryId}`);
      } catch (error) {
        console.error('Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    /**
     * Customer/Vendor requests to track delivery
     */
    socket.on('track_delivery', async (data) => {
      try {
        const { deliveryId } = data;

        const delivery = await Delivery.findById(deliveryId)
          .populate('rider', 'name phone')
          .populate('order');

        if (!delivery) {
          return socket.emit('error', { message: 'Delivery not found' });
        }

        // Verify authorization (customer or vendor)
        if (delivery.customer.toString() !== socket.userId &&
            delivery.vendor.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Unauthorized to track this delivery' });
        }

        // Join delivery tracking room
        socket.join(`delivery:${deliveryId}`);

        // Send current delivery status
        socket.emit('delivery_status', {
          deliveryId: delivery._id,
          status: delivery.status,
          rider: {
            name: delivery.rider.name,
            phone: delivery.rider.phone
          },
          currentLocation: delivery.tracking.currentLocation,
          eta: delivery.tracking.eta,
          distance: delivery.tracking.distance,
          timeline: delivery.timeline
        });

        console.log(`👀 User ${socket.userId} tracking delivery ${deliveryId}`);
      } catch (error) {
        console.error('Track delivery error:', error);
        socket.emit('error', { message: 'Failed to track delivery' });
      }
    });

    /**
     * Stop tracking delivery
     */
    socket.on('stop_tracking', (data) => {
      const { deliveryId } = data;
      socket.leave(`delivery:${deliveryId}`);
      console.log(`👋 User ${socket.userId} stopped tracking delivery ${deliveryId}`);
    });

    /**
     * Rider updates delivery status
     */
    socket.on('update_delivery_status', async (data) => {
      try {
        const { deliveryId, status, note, location } = data;

        const delivery = await Delivery.findById(deliveryId);

        if (!delivery) {
          return socket.emit('error', { message: 'Delivery not found' });
        }

        if (delivery.rider.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Unauthorized' });
        }

        // Update status
        await delivery.updateStatus(status, location, note, socket.userId);

        // Broadcast to customer and vendor
        io.to(delivery.customer.toString()).emit('delivery_status_changed', {
          deliveryId: delivery._id,
          status,
          note,
          timestamp: new Date()
        });

        io.to(delivery.vendor.toString()).emit('delivery_status_changed', {
          deliveryId: delivery._id,
          status,
          note,
          timestamp: new Date()
        });

        socket.emit('status_updated', { success: true });

        console.log(`📦 Delivery ${deliveryId} status: ${status}`);
      } catch (error) {
        console.error('Status update error:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    // ====================
    // CHAT EVENTS (Phase 5)
    // ====================

    /**
     * Send message in delivery chat
     */
    socket.on('send_message', async (data) => {
      try {
        const { deliveryId, message, recipientId } = data;

        // Create message (will implement Message model in Phase 5)
        const newMessage = {
          id: Date.now().toString(),
          deliveryId,
          senderId: socket.userId,
          senderName: socket.user.name,
          recipientId,
          message,
          timestamp: new Date()
        };

        // Send to recipient
        io.to(recipientId).emit('new_message', newMessage);

        // Acknowledge to sender
        socket.emit('message_sent', { success: true, message: newMessage });

        console.log(`💬 Message sent in delivery ${deliveryId}`);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    /**
     * Mark message as read
     */
    socket.on('mark_read', (data) => {
      const { messageId, deliveryId } = data;

      // Broadcast read receipt
      io.to(`delivery:${deliveryId}`).emit('message_read', {
        messageId,
        readBy: socket.userId,
        timestamp: new Date()
      });
    });

    /**
     * Typing indicator
     */
    socket.on('typing', (data) => {
      const { deliveryId, recipientId } = data;

      io.to(recipientId).emit('user_typing', {
        deliveryId,
        userId: socket.userId,
        userName: socket.user.name
      });
    });

    socket.on('stop_typing', (data) => {
      const { deliveryId, recipientId } = data;

      io.to(recipientId).emit('user_stop_typing', {
        deliveryId,
        userId: socket.userId
      });
    });

    // ====================
    // NOTIFICATION EVENTS
    // ====================

    /**
     * Send real-time notification
     */
    socket.on('send_notification', (data) => {
      const { userId, notification } = data;

      io.to(userId).emit('notification', {
        ...notification,
        timestamp: new Date()
      });
    });

    // ====================
    // DISCONNECT
    // ====================

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId}`);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('🔌 Socket.IO initialized');
  return io;
}

/**
 * Get Socket.IO instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initSocket first.');
  }
  return io;
}

/**
 * Emit event to specific user
 */
function emitToUser(userId, event, data) {
  if (io) {
    io.to(userId.toString()).emit(event, data);
  }
}

/**
 * Emit event to all users in a role
 */
function emitToRole(role, event, data) {
  if (io) {
    io.to(role).emit(event, data);
  }
}

/**
 * Emit event to delivery participants (rider, customer, vendor)
 */
function emitToDelivery(delivery, event, data) {
  if (io) {
    io.to(delivery.rider.toString()).emit(event, data);
    io.to(delivery.customer.toString()).emit(event, data);
    io.to(delivery.vendor.toString()).emit(event, data);
  }
}

/**
 * Broadcast to all connected users
 */
function broadcast(event, data) {
  if (io) {
    io.emit(event, data);
  }
}

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToRole,
  emitToDelivery,
  broadcast
};
