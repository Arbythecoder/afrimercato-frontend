// =================================================================
// VENDOR-RIDER MANAGEMENT ROUTES
// =================================================================
// Routes for vendors to manage rider connections
// Per SRS Section 2.1.4.1.a

const express = require('express');
const router = express.Router();

// Import controllers
const {
  getRiderRequests,
  approveRider,
  rejectRider,
  getConnectedRiders,
  removeRider,
  getRiderDetails,
  getAvailableRiders
} = require('../controllers/vendorRiderController');

// Import middleware
const { protect, authorize, verifyVendor } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validator');

/**
 * ALL ROUTES REQUIRE:
 * - Authentication (protect)
 * - Vendor role (authorize)
 * - Verified vendor (verifyVendor)
 */
router.use(protect, authorize('vendor'), verifyVendor);

// @route   GET /api/vendor/riders/requests
// @desc    Get pending rider connection requests
// @access  Private (Verified Vendor only)
router.get('/requests', getRiderRequests);

// @route   GET /api/vendor/riders/connected
// @desc    Get list of connected riders
// @access  Private (Verified Vendor only)
router.get('/connected', getConnectedRiders);

// @route   GET /api/vendor/riders/available
// @desc    Get currently available riders (online and ready)
// @access  Private (Verified Vendor only)
router.get('/available', getAvailableRiders);

// @route   GET /api/vendor/riders/:riderId
// @desc    Get detailed info about a specific rider
// @access  Private (Verified Vendor only)
router.get('/:riderId', validateMongoId('riderId'), getRiderDetails);

// @route   POST /api/vendor/riders/:riderId/approve
// @desc    Approve rider connection request
// @access  Private (Verified Vendor only)
router.post('/:riderId/approve', validateMongoId('riderId'), approveRider);

// @route   POST /api/vendor/riders/:riderId/reject
// @desc    Reject rider connection request
// @access  Private (Verified Vendor only)
router.post('/:riderId/reject', validateMongoId('riderId'), rejectRider);

// @route   DELETE /api/vendor/riders/:riderId/remove
// @desc    Remove/disconnect a rider
// @access  Private (Verified Vendor only)
router.delete('/:riderId/remove', validateMongoId('riderId'), removeRider);

module.exports = router;
