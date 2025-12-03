/**
 * PICKER ORDER ROUTES
 * Order picking, packing, and completion workflow
 */

const express = require('express');
const router = express.Router();
const pickerOrderController = require('../controllers/pickerOrderController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication as picker
router.use(protect);
router.use(authorize('picker'));

// ======================
// ORDER DISCOVERY
// ======================

/**
 * Get available orders at picker's current store
 * GET /api/picker/orders/available?page=1&limit=20
 * Must be checked in to a store
 */
router.get('/available', pickerOrderController.getAvailableOrders);

/**
 * Get picker's active orders (currently picking/packing)
 * GET /api/picker/orders/active
 */
router.get('/active', pickerOrderController.getMyActiveOrders);

/**
 * Get picking history
 * GET /api/picker/orders/history?page=1&limit=20&status=ready_for_pickup
 */
router.get('/history', pickerOrderController.getPickingHistory);

/**
 * Get detailed order info
 * GET /api/picker/orders/:orderId
 */
router.get('/:orderId', pickerOrderController.getOrderDetails);

// ======================
// ORDER CLAIMING
// ======================

/**
 * Claim an order to pick
 * POST /api/picker/orders/:orderId/claim
 * Max 3 active orders at a time
 */
router.post('/:orderId/claim', pickerOrderController.claimOrder);

// ======================
// PICKING WORKFLOW
// ======================

/**
 * Start picking an order
 * POST /api/picker/orders/:orderId/start
 * Changes status from assigned → picking
 */
router.post('/:orderId/start', pickerOrderController.startPicking);

/**
 * Mark individual item as picked
 * POST /api/picker/orders/:orderId/items/:productId/picked
 * Body: {quantityPicked, note}
 */
router.post('/:orderId/items/:productId/picked', pickerOrderController.markItemPicked);

/**
 * Report issue with an item
 * POST /api/picker/orders/:orderId/items/:productId/issue
 * Body: {issueType: 'out_of_stock|wrong_quantity|damaged|expired|other', description, quantityAvailable}
 */
router.post('/:orderId/items/:productId/issue', pickerOrderController.reportItemIssue);

/**
 * Suggest substitute product
 * POST /api/picker/orders/:orderId/items/:productId/substitute
 * Body: {substituteProductId, reason}
 */
router.post('/:orderId/items/:productId/substitute', pickerOrderController.suggestSubstitute);

/**
 * Complete picking (all items picked)
 * POST /api/picker/orders/:orderId/complete-picking
 * Changes status from picking → picked
 */
router.post('/:orderId/complete-picking', pickerOrderController.completePicking);

// ======================
// PACKING WORKFLOW
// ======================

/**
 * Start packing order
 * POST /api/picker/orders/:orderId/start-packing
 * Changes status from picked → packing
 */
router.post('/:orderId/start-packing', pickerOrderController.startPacking);

/**
 * Upload packing photos
 * POST /api/picker/orders/:orderId/packing-photos
 * Body: {photos: [url1, url2], notes}
 * Minimum 1 photo required
 */
router.post('/:orderId/packing-photos', pickerOrderController.uploadPackingPhotos);

/**
 * Complete packing (mark as ready for rider pickup)
 * POST /api/picker/orders/:orderId/complete-packing
 * Body: {location, notes}
 * Changes status from packing → ready_for_pickup
 * Calculates earnings and updates picker stats
 */
router.post('/:orderId/complete-packing', pickerOrderController.completePacking);

module.exports = router;
