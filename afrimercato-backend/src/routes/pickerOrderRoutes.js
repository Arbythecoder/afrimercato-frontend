// =================================================================
// PICKER ORDER ROUTES
// =================================================================
// Routes for picker order fulfillment and picking workflow

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const pickerOrderController = require('../controllers/pickerOrderController');

// All routes require picker authentication
router.use(protect, authorize('picker'));

// Order management
router.get('/available', pickerOrderController.getAvailableOrders);
router.get('/my-orders', pickerOrderController.getMyOrders);
router.post('/:orderId/claim', pickerOrderController.claimOrder);
router.post('/:orderId/start', pickerOrderController.startPicking);

// Item picking workflow
router.get('/:orderId/items', pickerOrderController.getOrderItems);
router.post('/:orderId/items/:itemId/pick', pickerOrderController.pickItem);
router.post('/:orderId/items/:itemId/issue', pickerOrderController.reportItemIssue);
router.post('/:orderId/substitute', pickerOrderController.suggestSubstitute);

// Packing workflow
router.post('/:orderId/ready-for-packing', pickerOrderController.readyForPacking);
router.post('/:orderId/start-packing', pickerOrderController.startPacking);
router.post('/:orderId/upload-photos', pickerOrderController.uploadPackingPhotos);
router.post('/:orderId/complete-packing', pickerOrderController.completePacking);

// History and earnings
router.get('/history', pickerOrderController.getHistory);
router.get('/earnings', pickerOrderController.getEarnings);
router.get('/stats', pickerOrderController.getStats);

module.exports = router;
