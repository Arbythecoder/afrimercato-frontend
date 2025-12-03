/**
 * Tracking Routes - Real-time Order Tracking
 * Live order status updates and rider location tracking
 */

const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const { protect } = require('../middleware/auth');

/**
 * Get order tracking details
 * GET /api/tracking/:orderId
 * Protected (customer, vendor, rider, picker, or admin)
 */
router.get('/:orderId', protect, trackingController.getOrderTracking);

/**
 * Update rider location (real-time GPS)
 * POST /api/tracking/rider/location
 * Protected (rider only)
 */
router.post('/rider/location', protect, trackingController.updateRiderLocation);

/**
 * Update order status
 * POST /api/tracking/status
 * Protected (vendor, picker, rider, or admin)
 */
router.post('/status', protect, trackingController.updateOrderStatus);

module.exports = router;
