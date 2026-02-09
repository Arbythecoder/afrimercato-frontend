// =================================================================
// CHAT CONTROLLER - Customer-Vendor Messaging
// =================================================================
// Handles chat creation and message exchange between customers and vendors

const Chat = require('../models/Chat');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/chats/start
 * @desc    Start a chat with a vendor (customer only)
 * @access  Private (Customer)
 */
exports.startChat = asyncHandler(async (req, res) => {
  const { vendorId, orderId, initialMessage } = req.body;
  const customerId = req.user.id;

  // Verify vendor exists
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  // Check if chat already exists
  let chat = await Chat.findOne({
    customer: customerId,
    vendor: vendorId,
    ...(orderId && { order: orderId })
  });

  if (!chat) {
    // Create new chat
    chat = await Chat.create({
      customer: customerId,
      vendor: vendorId,
      order: orderId || null,
      messages: []
    });
  }

  // Add initial message if provided
  if (initialMessage && initialMessage.trim()) {
    await chat.addMessage(customerId, 'customer', initialMessage.trim());
  }

  // Populate for response
  await chat.populate([
    { path: 'customer', select: 'name email avatar' },
    { path: 'vendor', select: 'storeName logo' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Chat started successfully',
    data: chat
  });
});

/**
 * @route   GET /api/chats
 * @desc    Get all chats for current user (customer or vendor)
 * @access  Private
 */
exports.getChats = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.roles[0]; // primary role

  let query = {};
  
  if (userRole === 'customer') {
    query.customer = userId;
  } else if (userRole === 'vendor') {
    // Find vendor profile for this user
    const vendor = await Vendor.findOne({ user: userId });
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found'
      });
    }
    query.vendor = vendor._id;
  } else {
    return res.status(403).json({
      success: false,
      message: 'Only customers and vendors can access chats'
    });
  }

  const chats = await Chat.find(query)
    .populate('customer', 'name email avatar')
    .populate('vendor', 'storeName logo')
    .populate('order', 'orderNumber status')
    .sort({ updatedAt: -1 })
    .lean();

  res.json({
    success: true,
    count: chats.length,
    data: chats
  });
});

/**
 * @route   GET /api/chats/:chatId
 * @desc    Get single chat with messages
 * @access  Private
 */
exports.getChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.roles[0];

  const chat = await Chat.findById(chatId)
    .populate('customer', 'name email avatar')
    .populate('vendor', 'storeName logo user')
    .populate('order', 'orderNumber status pricing');

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  // Verify user is participant
  const isCustomer = chat.customer._id.toString() === userId;
  const isVendor = userRole === 'vendor' && chat.vendor.user.toString() === userId;

  if (!isCustomer && !isVendor) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this chat'
    });
  }

  // Mark messages as read
  const role = isCustomer ? 'customer' : 'vendor';
  await chat.markAsRead(role);

  res.json({
    success: true,
    data: chat
  });
});

/**
 * @route   POST /api/chats/:chatId/messages
 * @desc    Send a message in a chat
 * @access  Private
 */
exports.sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { message } = req.body;
  const userId = req.user.id;
  const userRole = req.user.roles[0];

  if (!message || !message.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Message text is required'
    });
  }

  if (message.length > 1000) {
    return res.status(400).json({
      success: false,
      message: 'Message cannot exceed 1000 characters'
    });
  }

  const chat = await Chat.findById(chatId)
    .populate('vendor', 'user');

  if (!chat) {
    return res.status(404).json({
      success: false,
      message: 'Chat not found'
    });
  }

  // Verify user is participant
  const isCustomer = chat.customer.toString() === userId;
  const isVendor = userRole === 'vendor' && chat.vendor.user.toString() === userId;

  if (!isCustomer && !isVendor) {
    return res.status(403).json({
      success: false,
      message: 'You do not have access to this chat'
    });
  }

  const senderRole = isCustomer ? 'customer' : 'vendor';
  await chat.addMessage(userId, senderRole, message.trim());

  // Re-populate for response
  await chat.populate([
    { path: 'customer', select: 'name email avatar' },
    { path: 'vendor', select: 'storeName logo' }
  ]);

  res.json({
    success: true,
    message: 'Message sent successfully',
    data: chat
  });
});

/**
 * @route   GET /api/chats/unread-count
 * @desc    Get unread message count for current user
 * @access  Private
 */
exports.getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.roles[0];

  let query = {};
  let unreadField = '';

  if (userRole === 'customer') {
    query.customer = userId;
    unreadField = 'unreadByCustomer';
  } else if (userRole === 'vendor') {
    const vendor = await Vendor.findOne({ user: userId });
    if (!vendor) {
      return res.json({ success: true, data: { count: 0 } });
    }
    query.vendor = vendor._id;
    unreadField = 'unreadByVendor';
  } else {
    return res.json({ success: true, data: { count: 0 } });
  }

  const chats = await Chat.find(query).select(unreadField).lean();
  const totalUnread = chats.reduce((sum, chat) => sum + (chat[unreadField] || 0), 0);

  res.json({
    success: true,
    data: {
      count: totalUnread
    }
  });
});
