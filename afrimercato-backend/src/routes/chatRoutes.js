// =================================================================
// CHAT ROUTES - Customer-Vendor Messaging
// =================================================================

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  startChat,
  getChats,
  getChat,
  sendMessage,
  getUnreadCount
} = require('../controllers/chatController');

// All chat routes require authentication
router.use(protect);

// Start a new chat (customer only)
router.post('/start', authorize('customer'), startChat);

// Get all chats for current user
router.get('/', getChats);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Get specific chat with messages
router.get('/:chatId', getChat);

// Send message in chat
router.post('/:chatId/messages', sendMessage);

module.exports = router;
