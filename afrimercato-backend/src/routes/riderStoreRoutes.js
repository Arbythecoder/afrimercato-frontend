// =================================================================
// RIDER-STORE CONNECTION ROUTES
// =================================================================
// Routes for riders to find and connect with stores
// Per SRS Section 2.1.4.1.a

const express = require('express');
const router = express.Router();

// Import controllers
const {
  getNearbyStores,
  requestConnection,
  getConnectedStores,
  disconnectFromStore,
  getStoreDetails,
  cancelConnectionRequest
} = require('../controllers/riderStoreController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validator');

/**
 * ALL ROUTES REQUIRE:
 * - Authentication (protect)
 * - Rider role (authorize)
 */
router.use(protect, authorize('rider'));

// @route   GET /api/rider/stores/nearby
// @desc    Find stores in rider's service area
// @access  Private (Rider only)
router.get('/nearby', getNearbyStores);

// @route   GET /api/rider/stores/connected
// @desc    Get list of connected stores
// @access  Private (Rider only)
router.get('/connected', getConnectedStores);

// @route   GET /api/rider/stores/:vendorId
// @desc    Get detailed info about a specific store
// @access  Private (Rider only)
router.get('/:vendorId', validateMongoId('vendorId'), getStoreDetails);

// @route   POST /api/rider/stores/:vendorId/connect
// @desc    Request connection with a store
// @access  Private (Rider only)
router.post('/:vendorId/connect', validateMongoId('vendorId'), requestConnection);

// @route   POST /api/rider/stores/:vendorId/cancel-request
// @desc    Cancel a pending connection request
// @access  Private (Rider only)
router.post('/:vendorId/cancel-request', validateMongoId('vendorId'), cancelConnectionRequest);

// @route   DELETE /api/rider/stores/:vendorId/disconnect
// @desc    Disconnect from a store
// @access  Private (Rider only)
router.delete('/:vendorId/disconnect', validateMongoId('vendorId'), disconnectFromStore);

module.exports = router;
