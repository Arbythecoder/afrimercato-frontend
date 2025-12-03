// =================================================================
// ADMIN ROUTES
// =================================================================
// Routes for admin operations

const express = require('express');
const router = express.Router();

const {
  getPendingVendors,
  getAllVendors,
  approveVendor,
  rejectVendor,
  suspendVendor,
  getAdminStats
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(protect, authorize('admin'));

// Dashboard
router.get('/stats', getAdminStats);

// Vendor Management
router.get('/vendors', getAllVendors);
router.get('/vendors/pending', getPendingVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);
router.put('/vendors/:id/suspend', suspendVendor);

module.exports = router;
