// =================================================================
// RIDER STORE ROUTES
// =================================================================

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const riderController = require('../controllers/riderController');
const riderDeliveryController = require('../controllers/riderDeliveryController');

// All routes require rider authentication
router.use(protect, authorize('rider'));

/**
 * @swagger
 * /api/riders/deliveries:
 *   get:
 *     summary: Get available deliveries (pending, unassigned)
 *     tags: [Rider]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: latitude
 *         schema: { type: number }
 *       - in: query
 *         name: longitude
 *         schema: { type: number }
 *       - in: query
 *         name: radius
 *         schema: { type: number }
 *         description: Radius in km (default 10)
 *     responses:
 *       200:
 *         description: List of available deliveries
 */
router.get('/deliveries', riderDeliveryController.getAvailableDeliveries);

/**
 * @swagger
 * /api/riders/deliveries/active:
 *   get:
 *     summary: Get rider active deliveries (accepted/picked_up/in_transit)
 *     tags: [Rider]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Active deliveries for this rider
 */
router.get('/deliveries/active', riderDeliveryController.getActiveDeliveries);

/**
 * @swagger
 * /api/riders/deliveries/{deliveryId}/accept:
 *   post:
 *     summary: Accept a delivery - status becomes accepted
 *     tags: [Rider]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: deliveryId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Delivery accepted
 */
router.post('/deliveries/:deliveryId/accept', riderDeliveryController.acceptDelivery);

/**
 * @swagger
 * /api/riders/deliveries/{deliveryId}/reject:
 *   post:
 *     summary: Reject a delivery - returns to pending pool
 *     tags: [Rider]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: deliveryId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, example: Too far away }
 *     responses:
 *       200:
 *         description: Delivery rejected
 */
router.post('/deliveries/:deliveryId/reject', riderDeliveryController.rejectDelivery);

/**
 * @swagger
 * /api/riders/deliveries/{deliveryId}/start:
 *   post:
 *     summary: Confirm pickup from vendor - status becomes picked_up
 *     tags: [Rider]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: deliveryId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Delivery started (picked up from vendor)
 */
router.post('/deliveries/:deliveryId/start', riderDeliveryController.startDelivery);

/**
 * @swagger
 * /api/riders/deliveries/{deliveryId}/complete:
 *   post:
 *     summary: Mark delivery as delivered - status becomes delivered
 *     description: Requires current status to be picked_up or in_transit
 *     tags: [Rider]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: deliveryId
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes: { type: string }
 *     responses:
 *       200:
 *         description: Delivery completed
 */
router.post('/deliveries/:deliveryId/complete', riderDeliveryController.completeDelivery);

/**
 * @swagger
 * /api/riders/location/update:
 *   post:
 *     summary: Update rider GPS location (auto-transitions picked_up to in_transit)
 *     tags: [Rider]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [latitude, longitude]
 *             properties:
 *               latitude:   { type: number, example: 51.5074 }
 *               longitude:  { type: number, example: -0.1278 }
 *               accuracy:   { type: number }
 *               deliveryId: { type: string }
 *     responses:
 *       200:
 *         description: Location updated
 */
router.post('/location/update', riderDeliveryController.updateLocation);

/**
 * @swagger
 * /api/riders/deliveries/{deliveryId}/track:
 *   get:
 *     summary: Get delivery tracking data (location history, ETA)
 *     tags: [Rider]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: deliveryId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Tracking data
 */
router.get('/deliveries/:deliveryId/track', riderDeliveryController.getDeliveryTracking);

// Connection management
router.post('/request/:storeId', riderController.requestStoreConnection);
router.get('/my-stores', riderController.getConnectedStores);
router.get('/requests', riderController.getConnectionRequests);

// Earnings and ratings
router.get('/earnings', riderController.getEarnings);
router.get('/ratings', riderController.getRatings);
router.post('/store/:storeId/rate', riderController.rateStore);

module.exports = router;
