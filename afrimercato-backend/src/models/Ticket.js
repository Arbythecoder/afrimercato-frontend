// File: src/models/Ticket.js
// Support ticket system for customer service

const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    // Who created the ticket
    reporter: {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
      },
      userType: {
        type: String,
        enum: ['customer', 'vendor', 'rider'],
        required: true
      },
      name: String,
      email: String,
      phone: String
    },

    // Ticket details
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      minlength: [5, 'Subject must be at least 5 characters'],
      maxlength: [200, 'Subject cannot exceed 200 characters']
    },

    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

    category: {
      type: String,
      enum: [
        'order_issue',
        'payment_issue',
        'delivery_issue',
        'product_quality',
        'refund_request',
        'account_issue',
        'technical_issue',
        'feedback',
        'gdpr_request',
        'other'
      ],
      required: [true, 'Category is required'],
      index: true
    },

    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
      index: true
    },

    status: {
      type: String,
      enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed', 'reopened'],
      default: 'open',
      index: true
    },

    // Related references
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },

    relatedVendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      default: null
    },

    // Assignment
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },

    assignedAt: Date,

    // Conversation thread
    messages: [{
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      senderType: {
        type: String,
        enum: ['customer', 'vendor', 'rider', 'admin', 'system'],
        required: true
      },
      message: {
        type: String,
        required: true,
        maxlength: 2000
      },
      attachments: [{
        url: String,
        filename: String,
        fileType: String,
        fileSize: Number
      }],
      isInternal: {
        type: Boolean,
        default: false // Internal notes only visible to admins
      },
      sentAt: {
        type: Date,
        default: Date.now
      },
      readBy: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        readAt: {
          type: Date,
          default: Date.now
        }
      }]
    }],

    // Attachments (initial ticket attachments)
    attachments: [{
      url: String,
      filename: String,
      fileType: String,
      fileSize: Number
    }],

    // Resolution
    resolution: {
      resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      resolvedAt: Date,
      resolutionNote: {
        type: String,
        maxlength: 1000
      },
      resolutionType: {
        type: String,
        enum: ['resolved', 'workaround', 'cannot_reproduce', 'by_design', 'duplicate', 'wont_fix']
      }
    },

    // Customer satisfaction
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        maxlength: 500
      },
      submittedAt: Date
    },

    // Timestamps for SLA tracking
    firstResponseAt: Date,
    lastResponseAt: Date,
    closedAt: Date,
    reopenedAt: Date,

    // Tags for organization
    tags: [{
      type: String,
      trim: true
    }],

    // Internal notes (admin only)
    internalNotes: {
      type: String,
      maxlength: 2000
    },

    // Auto-close tracking
    autoCloseScheduledAt: Date,

    // Status history
    statusHistory: [{
      status: String,
      timestamp: {
        type: Date,
        default: Date.now
      },
      note: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  {
    timestamps: true
  }
);

// Indexes
ticketSchema.index({ ticketNumber: 1 }, { unique: true });
ticketSchema.index({ 'reporter.user': 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ category: 1, status: 1 });
ticketSchema.index({ priority: 1, status: 1 });
ticketSchema.index({ createdAt: -1 });
ticketSchema.index({ status: 1, createdAt: -1 });

// Static method to generate ticket number
ticketSchema.statics.generateTicketNumber = async function() {
  const year = new Date().getFullYear();
  const prefix = `TKT${year}`;

  const lastTicket = await this.findOne({
    ticketNumber: new RegExp(`^${prefix}`)
  })
    .sort({ createdAt: -1 })
    .select('ticketNumber');

  let nextNumber = 1;
  if (lastTicket) {
    const lastNumber = parseInt(lastTicket.ticketNumber.replace(prefix, ''));
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(6, '0');
  return `${prefix}${paddedNumber}`;
};

// Virtuals
ticketSchema.virtual('responseTime').get(function() {
  if (!this.firstResponseAt) return null;
  return Math.round((this.firstResponseAt - this.createdAt) / 1000 / 60); // minutes
});

ticketSchema.virtual('resolutionTime').get(function() {
  if (!this.closedAt) return null;
  return Math.round((this.closedAt - this.createdAt) / 1000 / 60 / 60); // hours
});

ticketSchema.virtual('isOverdue').get(function() {
  if (this.status === 'closed' || this.status === 'resolved') return false;

  const now = new Date();
  const hoursSinceCreation = (now - this.createdAt) / 1000 / 60 / 60;

  // SLA thresholds based on priority
  const slaThresholds = {
    urgent: 4,   // 4 hours
    high: 24,    // 24 hours
    normal: 48,  // 48 hours
    low: 72      // 72 hours
  };

  return hoursSinceCreation > slaThresholds[this.priority];
});

ticketSchema.virtual('messageCount').get(function() {
  return this.messages.length;
});

ticketSchema.virtual('unreadCount').get(function() {
  // Count messages not read by reporter
  return this.messages.filter(msg =>
    !msg.readBy.some(r => r.user.toString() === this.reporter.user.toString())
  ).length;
});

// Methods

/**
 * Add message to ticket
 */
ticketSchema.methods.addMessage = async function(senderId, senderType, message, attachments = [], isInternal = false) {
  this.messages.push({
    sender: senderId,
    senderType,
    message,
    attachments,
    isInternal,
    sentAt: new Date()
  });

  // Update last response time
  this.lastResponseAt = new Date();

  // Set first response time if this is the first response
  if (!this.firstResponseAt && senderType === 'admin') {
    this.firstResponseAt = new Date();
  }

  // If ticket was closed, reopen it
  if (this.status === 'closed' && senderType !== 'admin') {
    this.status = 'reopened';
    this.reopenedAt = new Date();
    this.statusHistory.push({
      status: 'reopened',
      timestamp: new Date(),
      note: 'Ticket reopened due to new message',
      updatedBy: senderId
    });
  }

  await this.save();
  return this;
};

/**
 * Assign ticket to agent
 */
ticketSchema.methods.assignTo = async function(agentId, assignedBy) {
  this.assignedTo = agentId;
  this.assignedAt = new Date();

  if (this.status === 'open') {
    this.status = 'in_progress';
    this.statusHistory.push({
      status: 'in_progress',
      timestamp: new Date(),
      note: 'Ticket assigned to agent',
      updatedBy: assignedBy
    });
  }

  await this.save();
  return this;
};

/**
 * Resolve ticket
 */
ticketSchema.methods.resolve = async function(resolvedBy, resolutionNote, resolutionType = 'resolved') {
  this.status = 'resolved';
  this.resolution = {
    resolvedBy,
    resolvedAt: new Date(),
    resolutionNote,
    resolutionType
  };

  // Schedule auto-close in 7 days
  const autoCloseDate = new Date();
  autoCloseDate.setDate(autoCloseDate.getDate() + 7);
  this.autoCloseScheduledAt = autoCloseDate;

  this.statusHistory.push({
    status: 'resolved',
    timestamp: new Date(),
    note: resolutionNote,
    updatedBy: resolvedBy
  });

  await this.save();
  return this;
};

/**
 * Close ticket
 */
ticketSchema.methods.close = async function(closedBy, note) {
  this.status = 'closed';
  this.closedAt = new Date();

  this.statusHistory.push({
    status: 'closed',
    timestamp: new Date(),
    note: note || 'Ticket closed',
    updatedBy: closedBy
  });

  await this.save();
  return this;
};

/**
 * Mark message as read
 */
ticketSchema.methods.markMessageAsRead = async function(messageId, userId) {
  const message = this.messages.id(messageId);
  if (message && !message.readBy.some(r => r.user.toString() === userId.toString())) {
    message.readBy.push({
      user: userId,
      readAt: new Date()
    });
    await this.save();
  }
  return this;
};

ticketSchema.set('toJSON', { virtuals: true });
ticketSchema.set('toObject', { virtuals: true });

const Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
