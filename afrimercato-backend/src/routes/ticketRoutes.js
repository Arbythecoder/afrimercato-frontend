// File: src/routes/ticketRoutes.js
// Routes for support ticket system

const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getTicketById,
  addMessage,
  closeTicket,
  submitFeedback,
  getAllTickets,
  getTicketByIdAdmin,
  assignTicket,
  adminReply,
  resolveTicket,
  updateTicketStatus,
  getTicketStats
} = require('../controllers/ticketController');

const { protect, authorize } = require('../middleware/auth');

// =================================================================
// USER ROUTES (Customer/Vendor/Rider)
// =================================================================
router.post('/tickets', protect, createTicket);
router.get('/tickets', protect, getMyTickets);
router.get('/tickets/:id', protect, getTicketById);
router.post('/tickets/:id/messages', protect, addMessage);
router.patch('/tickets/:id/close', protect, closeTicket);
router.post('/tickets/:id/feedback', protect, submitFeedback);

// =================================================================
// ADMIN ROUTES
// =================================================================
router.get('/admin/tickets', protect, authorize('admin'), getAllTickets);
router.get('/admin/tickets/stats/dashboard', protect, authorize('admin'), getTicketStats);
router.get('/admin/tickets/:id', protect, authorize('admin'), getTicketByIdAdmin);
router.patch('/admin/tickets/:id/assign', protect, authorize('admin'), assignTicket);
router.post('/admin/tickets/:id/messages', protect, authorize('admin'), adminReply);
router.patch('/admin/tickets/:id/resolve', protect, authorize('admin'), resolveTicket);
router.patch('/admin/tickets/:id/status', protect, authorize('admin'), updateTicketStatus);

module.exports = router;
