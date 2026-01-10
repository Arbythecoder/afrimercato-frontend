// Admin routes for vendor verification and management

const express = require('express');
const router = express.Router();
const {
  getPendingVendors,
  getAllVendors,
  getVendorForReview,
  approveVendor,
  rejectVendor,
  requestMoreInfo,
  suspendVendor,
  reactivateVendor,
  getVendorStats
} = require('../controllers/adminVendorController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// Vendor verification statistics
router.get('/stats', getVendorStats);

// Get all pending vendor applications
router.get('/pending', getPendingVendors);

// Get all vendors with filters
router.get('/', getAllVendors);

// Get single vendor for review
router.get('/:id', getVendorForReview);

// Approve vendor application
router.post('/:id/approve', approveVendor);

// Reject vendor application
router.post('/:id/reject', rejectVendor);

// Request more information from vendor
router.post('/:id/request-info', requestMoreInfo);

// Suspend vendor
router.post('/:id/suspend', suspendVendor);

// Reactivate suspended vendor
router.post('/:id/reactivate', reactivateVendor);

module.exports = router;
