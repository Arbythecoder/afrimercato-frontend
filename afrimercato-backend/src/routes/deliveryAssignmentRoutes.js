/**
 * Delivery Assignment Routes
 * Auto and manual rider assignment to deliveries
 */

const express = require('express');
const router = express.Router();
const deliveryAssignmentController = require('../controllers/deliveryAssignmentController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// ======================
// AUTO ASSIGNMENT
// ======================

/**
 * Auto-assign rider to delivery
 * POST /api/delivery-assignment/auto-assign/:orderId
 * Body: { vehicleType: 'bicycle|motorcycle|car|van' }
 * Finds best available rider based on proximity, rating, and availability
 */
router.post('/auto-assign/:orderId',
  authorize('vendor', 'admin'),
  deliveryAssignmentController.autoAssignRider
);

// ======================
// MANUAL ASSIGNMENT
// ======================

/**
 * Manually assign rider to delivery
 * POST /api/delivery-assignment/manual-assign/:orderId
 * Body: { riderId }
 * Vendors can manually select a specific rider
 */
router.post('/manual-assign/:orderId',
  authorize('vendor', 'admin'),
  deliveryAssignmentController.manualAssignRider
);

/**
 * Get available riders near vendor
 * GET /api/delivery-assignment/available-riders/:vendorId?vehicleType=bicycle&radius=10
 * Returns list of available riders within specified radius (km)
 */
router.get('/available-riders/:vendorId',
  authorize('vendor', 'admin'),
  deliveryAssignmentController.getAvailableRiders
);

// ======================
// REASSIGNMENT
// ======================

/**
 * Reassign delivery to different rider
 * POST /api/delivery-assignment/reassign/:deliveryId
 * Body: { newRiderId, reason }
 * Used when current rider cannot complete delivery
 */
router.post('/reassign/:deliveryId',
  authorize('vendor', 'admin'),
  deliveryAssignmentController.reassignDelivery
);

module.exports = router;
