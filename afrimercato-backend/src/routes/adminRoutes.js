// =================================================================
// ADMIN ROUTES
// =================================================================
// Routes for admin operations

const express = require('express');
const router = express.Router();

const {
  getPendingVendorAccounts,
  approveVendorAccount,
  rejectVendorAccount,
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

// Vendor User Account Management (Primary approval - must approve account first)
router.get('/vendors/accounts/pending', getPendingVendorAccounts);
router.put('/vendors/accounts/:id/approve', approveVendorAccount);
router.put('/vendors/accounts/:id/reject', rejectVendorAccount);

// Vendor Store Management (Secondary - for store profiles)
router.get('/vendors', getAllVendors);
router.get('/vendors/pending', getPendingVendors);
router.put('/vendors/:id/approve', approveVendor);
router.put('/vendors/:id/reject', rejectVendor);
router.put('/vendors/:id/suspend', suspendVendor);

module.exports = router;
