// =================================================================
// RIDER STORE ROUTES
// =================================================================
// Routes for rider-store connections and delivery management

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const riderController = require('../controllers/riderController');
const riderDeliveryController = require('../controllers/riderDeliveryController');

// All routes require rider authentication
router.use(protect, authorize('rider'));

// Connection management
router.post('/request/:storeId', riderController.requestStoreConnection);
router.get('/my-stores', riderController.getConnectedStores);
router.get('/requests', riderController.getConnectionRequests);

// Delivery management
router.get('/deliveries', riderDeliveryController.getAvailableDeliveries);
router.get('/deliveries/active', riderDeliveryController.getActiveDeliveries);
router.post('/deliveries/:deliveryId/accept', riderDeliveryController.acceptDelivery);
router.post('/deliveries/:deliveryId/reject', riderDeliveryController.rejectDelivery);
router.post('/deliveries/:deliveryId/start', riderDeliveryController.startDelivery);
router.post('/deliveries/:deliveryId/complete', riderDeliveryController.completeDelivery);

// Location tracking
router.post('/location/update', riderDeliveryController.updateLocation);
router.get('/deliveries/:deliveryId/track', riderDeliveryController.getDeliveryTracking);

// Earnings and ratings
router.get('/earnings', riderController.getEarnings);
router.get('/ratings', riderController.getRatings);
router.post('/store/:storeId/rate', riderController.rateStore);

module.exports = router;
