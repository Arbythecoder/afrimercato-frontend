// File: src/controllers/ticketController.js
// Support ticket management

const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Vendor = require('../models/Vendor');
const { sendEmail } = require('../utils/emailService');

// =================================================================
// USER TICKET ENDPOINTS (Customer/Vendor/Rider)
// =================================================================

/**
 * @route   POST /api/tickets
 * @desc    Create a new support ticket
 * @access  Private
 */
exports.createTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      category,
      priority,
      relatedOrder,
      relatedVendor,
      attachments
    } = req.body;

    const user = await User.findById(req.user._id);

    // Generate ticket number
    const ticketNumber = await Ticket.generateTicketNumber();

    const ticket = await Ticket.create({
      ticketNumber,
      reporter: {
        user: req.user._id,
        userType: req.user.role,
        name: user.name,
        email: user.email,
        phone: user.phone
      },
      subject,
      description,
      category,
      priority: priority || 'normal',
      relatedOrder,
      relatedVendor,
      attachments: attachments || [],
      statusHistory: [{
        status: 'open',
        timestamp: new Date(),
        note: 'Ticket created',
        updatedBy: req.user._id
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating ticket',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/tickets
 * @desc    Get user's tickets
 * @access  Private
 */
exports.getMyTickets = async (req, res) => {
  try {
    const { status, category, page = 1, limit = 20 } = req.query;

    const query = { 'reporter.user': req.user._id };

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    const skip = (page - 1) * limit;
    const total = await Ticket.countDocuments(query);

    const tickets = await Ticket.find(query)
      .select('-messages -internalNotes')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/tickets/:id
 * @desc    Get single ticket with messages
 * @access  Private
 */
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      'reporter.user': req.user._id
    })
      .populate('relatedOrder', 'orderNumber status')
      .populate('messages.sender', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Filter out internal messages for non-admin users
    if (req.user.role !== 'admin') {
      ticket.messages = ticket.messages.filter(msg => !msg.isInternal);
      ticket.internalNotes = undefined;
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/tickets/:id/messages
 * @desc    Add message to ticket
 * @access  Private
 */
exports.addMessage = async (req, res) => {
  try {
    const { message, attachments } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      'reporter.user': req.user._id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot add message to closed ticket'
      });
    }

    await ticket.addMessage(
      req.user._id,
      req.user.role,
      message,
      attachments || [],
      false
    );

    res.status(200).json({
      success: true,
      message: 'Message added successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding message',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/tickets/:id/close
 * @desc    Close ticket (by reporter)
 * @access  Private
 */
exports.closeTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findOne({
      _id: req.params.id,
      'reporter.user': req.user._id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (ticket.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Ticket is already closed'
      });
    }

    await ticket.close(req.user._id, 'Closed by user');

    res.status(200).json({
      success: true,
      message: 'Ticket closed successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error closing ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error closing ticket',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/tickets/:id/feedback
 * @desc    Submit feedback on resolved ticket
 * @access  Private
 */
exports.submitFeedback = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const ticket = await Ticket.findOne({
      _id: req.params.id,
      'reporter.user': req.user._id
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (!['resolved', 'closed'].includes(ticket.status)) {
      return res.status(400).json({
        success: false,
        message: 'Can only rate resolved or closed tickets'
      });
    }

    ticket.feedback = {
      rating,
      comment: comment || '',
      submittedAt: new Date()
    };

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback',
      data: ticket
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting feedback',
      error: error.message
    });
  }
};

// =================================================================
// ADMIN TICKET ENDPOINTS
// =================================================================

/**
 * @route   GET /api/admin/tickets
 * @desc    Get all tickets (Admin)
 * @access  Private (Admin)
 */
exports.getAllTickets = async (req, res) => {
  try {
    const {
      status,
      category,
      priority,
      assignedTo,
      userType,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (priority) {
      query.priority = priority;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (userType) {
      query['reporter.userType'] = userType;
    }

    if (search) {
      query.$or = [
        { ticketNumber: new RegExp(search, 'i') },
        { subject: new RegExp(search, 'i') },
        { 'reporter.email': new RegExp(search, 'i') }
      ];
    }

    const skip = (page - 1) * limit;
    const total = await Ticket.countDocuments(query);

    const tickets = await Ticket.find(query)
      .populate('reporter.user', 'name email')
      .populate('assignedTo', 'name email')
      .populate('relatedOrder', 'orderNumber')
      .select('-messages')
      .sort({ priority: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: tickets.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: tickets
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tickets',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/tickets/:id
 * @desc    Get ticket details (Admin)
 * @access  Private (Admin)
 */
exports.getTicketByIdAdmin = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('reporter.user', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('relatedOrder')
      .populate('relatedVendor', 'storeName')
      .populate('messages.sender', 'name email');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    res.status(200).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/admin/tickets/:id/assign
 * @desc    Assign ticket to agent
 * @access  Private (Admin)
 */
exports.assignTicket = async (req, res) => {
  try {
    const { agentId } = req.body;

    if (!agentId) {
      return res.status(400).json({
        success: false,
        message: 'Agent ID is required'
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    await ticket.assignTo(agentId, req.user._id);

    res.status(200).json({
      success: true,
      message: 'Ticket assigned successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error assigning ticket',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/admin/tickets/:id/messages
 * @desc    Admin reply to ticket
 * @access  Private (Admin)
 */
exports.adminReply = async (req, res) => {
  try {
    const { message, attachments, isInternal } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    await ticket.addMessage(
      req.user._id,
      'admin',
      message,
      attachments || [],
      isInternal || false
    );

    res.status(200).json({
      success: true,
      message: 'Reply added successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reply',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/admin/tickets/:id/resolve
 * @desc    Resolve ticket
 * @access  Private (Admin)
 */
exports.resolveTicket = async (req, res) => {
  try {
    const { resolutionNote, resolutionType } = req.body;

    if (!resolutionNote) {
      return res.status(400).json({
        success: false,
        message: 'Resolution note is required'
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    await ticket.resolve(req.user._id, resolutionNote, resolutionType);

    res.status(200).json({
      success: true,
      message: 'Ticket resolved successfully',
      data: ticket
    });
  } catch (error) {
    console.error('Error resolving ticket:', error);
    res.status(500).json({
      success: false,
      message: 'Error resolving ticket',
      error: error.message
    });
  }
};

/**
 * @route   PATCH /api/admin/tickets/:id/status
 * @desc    Update ticket status
 * @access  Private (Admin)
 */
exports.updateTicketStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const validStatuses = ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    ticket.status = status;

    if (status === 'closed') {
      ticket.closedAt = new Date();
    }

    ticket.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status changed to ${status}`,
      updatedBy: req.user._id
    });

    await ticket.save();

    res.status(200).json({
      success: true,
      message: 'Ticket status updated',
      data: ticket
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating ticket status',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/admin/tickets/stats/dashboard
 * @desc    Get ticket statistics for dashboard
 * @access  Private (Admin)
 */
exports.getTicketStats = async (req, res) => {
  try {
    const [
      totalTickets,
      openTickets,
      inProgressTickets,
      resolvedTickets,
      closedTickets,
      overdueTickets,
      avgResponseTime,
      avgResolutionTime
    ] = await Promise.all([
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'open' }),
      Ticket.countDocuments({ status: 'in_progress' }),
      Ticket.countDocuments({ status: 'resolved' }),
      Ticket.countDocuments({ status: 'closed' }),
      Ticket.countDocuments({
        status: { $in: ['open', 'in_progress'] },
        createdAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
      }),
      Ticket.aggregate([
        { $match: { firstResponseAt: { $exists: true } } },
        {
          $project: {
            responseTime: {
              $divide: [{ $subtract: ['$firstResponseAt', '$createdAt'] }, 60000]
            }
          }
        },
        { $group: { _id: null, avgTime: { $avg: '$responseTime' } } }
      ]),
      Ticket.aggregate([
        { $match: { closedAt: { $exists: true } } },
        {
          $project: {
            resolutionTime: {
              $divide: [{ $subtract: ['$closedAt', '$createdAt'] }, 3600000]
            }
          }
        },
        { $group: { _id: null, avgTime: { $avg: '$resolutionTime' } } }
      ])
    ]);

    const stats = {
      total: totalTickets,
      open: openTickets,
      inProgress: inProgressTickets,
      resolved: resolvedTickets,
      closed: closedTickets,
      overdue: overdueTickets,
      avgResponseTimeMinutes: avgResponseTime[0]?.avgTime || 0,
      avgResolutionTimeHours: avgResolutionTime[0]?.avgTime || 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching ticket stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching ticket stats',
      error: error.message
    });
  }
};

module.exports = exports;
