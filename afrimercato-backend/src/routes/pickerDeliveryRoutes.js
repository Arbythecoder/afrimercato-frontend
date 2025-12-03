/**
 * Picker/Rider Delivery Routes
 * Delivery management for riders/pickers
 */

const express = require('express');
const router = express.Router();
const pickerDeliveryController = require('../controllers/pickerDeliveryController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication as rider
router.use(protect);
router.use(authorize('rider'));

// ======================
// DELIVERY MANAGEMENT
// ======================

/**
 * Get rider's active deliveries
 * GET /api/picker/deliveries/active
 * Returns deliveries with status: assigned, accepted, picked_up, in_transit
 */
router.get('/deliveries/active', pickerDeliveryController.getActiveDeliveries);

/**
 * Get all rider's deliveries (history)
 * GET /api/picker/deliveries?page=1&limit=20&status=completed
 */
router.get('/deliveries', pickerDeliveryController.getAllDeliveries);

/**
 * Get single delivery details
 * GET /api/picker/deliveries/:deliveryId
 */
router.get('/deliveries/:deliveryId', pickerDeliveryController.getDeliveryDetails);

// ======================
// DELIVERY STATUS UPDATES
// ======================

/**
 * Accept delivery
 * POST /api/picker/deliveries/:deliveryId/accept
 * Rider accepts the assigned delivery
 */
router.post('/deliveries/:deliveryId/accept', pickerDeliveryController.acceptDelivery);

/**
 * Reject delivery
 * POST /api/picker/deliveries/:deliveryId/reject
 * Body: { reason }
 * Rider rejects assigned delivery (triggers reassignment)
 */
router.post('/deliveries/:deliveryId/reject', pickerDeliveryController.rejectDelivery);

/**
 * Mark as picked up from vendor
 * POST /api/picker/deliveries/:deliveryId/pickup
 * Body: { latitude, longitude, note, photos }
 * Rider marks order as picked up
 */
router.post('/deliveries/:deliveryId/pickup', pickerDeliveryController.markPickedUp);

/**
 * Mark as in transit to customer
 * POST /api/picker/deliveries/:deliveryId/in-transit
 * Rider starts journey to customer
 */
router.post('/deliveries/:deliveryId/in-transit', pickerDeliveryController.markInTransit);

/**
 * Complete delivery
 * POST /api/picker/deliveries/:deliveryId/complete
 * Body: { latitude, longitude, photos, signature, customerName, note }
 * Rider completes delivery with proof
 */
router.post('/deliveries/:deliveryId/complete', pickerDeliveryController.completeDelivery);

/**
 * Report delivery issue
 * POST /api/picker/deliveries/:deliveryId/report-issue
 * Body: { issueType, description, photos, latitude, longitude }
 * Report problems like customer unavailable, wrong address, etc.
 */
router.post('/deliveries/:deliveryId/report-issue', pickerDeliveryController.reportIssue);

// ======================
// RIDER STATS & EARNINGS
// ======================

/**
 * Get rider earnings summary
 * GET /api/picker/earnings?period=today|week|month
 * Returns earnings breakdown for specified period
 */
router.get('/earnings', pickerDeliveryController.getEarnings);

/**
 * Get rider statistics
 * GET /api/picker/stats
 * Returns overall rider performance stats
 */
router.get('/stats', pickerDeliveryController.getRiderStats);

module.exports = router;
