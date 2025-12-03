const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect } = require('../middleware/auth');

// Public routes - view plans
router.get('/plans', subscriptionController.getPlans);
router.get('/plans/:planId', subscriptionController.getPlanDetails);

// Protected routes - require authentication
router.use(protect);

// Vendor's subscription management
router.get('/my-subscription', subscriptionController.getVendorSubscription);
router.post('/subscribe', subscriptionController.createOrUpgradeSubscription);
router.post('/cancel', subscriptionController.cancelSubscription);

// Marketplace integration
router.post('/marketplace/connect', subscriptionController.connectMarketplace);
router.delete('/marketplace/:marketplace/disconnect', subscriptionController.disconnectMarketplace);

// Usage statistics
router.get('/usage', subscriptionController.getUsageStats);

module.exports = router;
