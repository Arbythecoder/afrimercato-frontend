/**
 * VENDOR-PICKER MANAGEMENT ROUTES
 * Vendors manage their pickers (approve, reject, assign, suspend)
 */

const express = require('express');
const router = express.Router();
const vendorPickerController = require('../controllers/vendorPickerController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication as vendor
router.use(protect);
router.use(authorize('vendor'));

// ======================
// PICKER REQUESTS
// ======================

/**
 * Get picker requests (pending approvals)
 * GET /api/vendor/pickers/requests
 */
router.get('/requests', vendorPickerController.getPickerRequests);

/**
 * Approve picker request
 * POST /api/vendor/pickers/:pickerId/approve
 * Body: {sections: ['fresh-produce', 'dairy'], schedule: {...}}
 */
router.post('/:pickerId/approve', vendorPickerController.approvePicker);

/**
 * Reject picker request
 * POST /api/vendor/pickers/:pickerId/reject
 * Body: {reason: 'Not qualified'}
 */
router.post('/:pickerId/reject', vendorPickerController.rejectPicker);

// ======================
// PICKER MANAGEMENT
// ======================

/**
 * Get approved pickers
 * GET /api/vendor/pickers/approved
 */
router.get('/approved', vendorPickerController.getApprovedPickers);

/**
 * Get currently active pickers at store
 * GET /api/vendor/pickers/active
 */
router.get('/active', vendorPickerController.getActivePickers);

/**
 * Get picker performance at vendor's store
 * GET /api/vendor/pickers/:pickerId/performance
 */
router.get('/:pickerId/performance', vendorPickerController.getPickerPerformance);

/**
 * Suspend picker
 * POST /api/vendor/pickers/:pickerId/suspend
 * Body: {reason: 'Poor performance'}
 */
router.post('/:pickerId/suspend', vendorPickerController.suspendPicker);

// ======================
// ORDER ASSIGNMENT
// ======================

/**
 * Manually assign picker to order
 * POST /api/vendor/pickers/assign-order
 * Body: {orderId, pickerId}
 */
router.post('/assign-order', vendorPickerController.assignPickerToOrder);

module.exports = router;
