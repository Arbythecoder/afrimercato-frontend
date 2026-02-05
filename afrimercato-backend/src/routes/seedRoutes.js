// =================================================================
// SEED ROUTES
// =================================================================
// Routes for seeding demo data (admin only)

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { seedVendors, seedProducts, clearVendors, clearProducts, getSeedStatus } = require('../controllers/seedController');
const { seedDemoStores, removeDemoStores } = require('../controllers/demoStoreController');

// Public access for demo stores during testing phase
router.post('/demo-stores', seedDemoStores);

// All other routes require admin authentication
router.use(protect, authorize('admin'));

// Seed operations
router.post('/vendors', seedVendors);
router.post('/products', seedProducts);
router.post('/customers', (req, res) => res.status(501).json({ message: 'Seed customer data' }));
router.post('/orders', (req, res) => res.status(501).json({ message: 'Seed order data' }));
router.post('/riders', (req, res) => res.status(501).json({ message: 'Seed rider data' }));
router.post('/pickers', (req, res) => res.status(501).json({ message: 'Seed picker data' }));

// Clear demo data
router.post('/clear', clearVendors);
router.post('/clear/vendors', clearVendors);
router.post('/clear/products', clearProducts);
router.delete('/demo-stores', removeDemoStores);

// Status
router.get('/status', getSeedStatus);

module.exports = router;
