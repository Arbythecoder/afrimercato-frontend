// =================================================================
// CHAT MODEL - Customer-Vendor Messaging
// =================================================================
// Enables customers to communicate with vendors about orders/products

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['customer', 'vendor'],
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message text is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  readAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  // Participants
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  
  // Optional: Link to order (if chat is about specific order)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },

  // Chat messages
  messages: [messageSchema],

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Last message metadata (for quick listing)
  lastMessage: {
    text: String,
    sender: mongoose.Schema.Types.ObjectId,
    sentAt: Date
  },
  
  // Unread counts
  unreadByCustomer: {
    type: Number,
    default: 0
  },
  unreadByVendor: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
chatSchema.index({ customer: 1, vendor: 1 });
chatSchema.index({ customer: 1, updatedAt: -1 });
chatSchema.index({ vendor: 1, updatedAt: -1 });
chatSchema.index({ order: 1 });

// Update timestamp before save
chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to add a message
chatSchema.methods.addMessage = function(senderId, senderRole, messageText) {
  const newMessage = {
    sender: senderId,
    senderRole: senderRole,
    message: messageText,
    createdAt: new Date()
  };
  
  this.messages.push(newMessage);
  
  // Update last message metadata
  this.lastMessage = {
    text: messageText,
    sender: senderId,
    sentAt: new Date()
  };
  
  // Increment unread count for recipient
  if (senderRole === 'customer') {
    this.unreadByVendor += 1;
  } else {
    this.unreadByCustomer += 1;
  }
  
  return this.save();
};

// Method to mark messages as read
chatSchema.methods.markAsRead = function(role) {
  const now = new Date();
  
  this.messages.forEach(msg => {
    // Mark unread messages from the other party as read
    if (msg.senderRole !== role && !msg.readAt) {
      msg.readAt = now;
    }
  });
  
  // Reset unread count
  if (role === 'customer') {
    this.unreadByCustomer = 0;
  } else {
    this.unreadByVendor = 0;
  }
  
  return this.save();
};

module.exports = mongoose.model('Chat', chatSchema);
