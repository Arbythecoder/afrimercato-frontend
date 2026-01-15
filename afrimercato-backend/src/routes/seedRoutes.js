// =================================================================
// SEED ROUTES
// =================================================================
// Routes for seeding demo data (admin only)

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authentication
router.use(protect, authorize('admin'));

// Seed operations
router.post('/vendors', (req, res) => res.status(501).json({ message: 'Seed vendor data' }));
router.post('/products', (req, res) => res.status(501).json({ message: 'Seed product data' }));
router.post('/customers', (req, res) => res.status(501).json({ message: 'Seed customer data' }));
router.post('/orders', (req, res) => res.status(501).json({ message: 'Seed order data' }));
router.post('/riders', (req, res) => res.status(501).json({ message: 'Seed rider data' }));
router.post('/pickers', (req, res) => res.status(501).json({ message: 'Seed picker data' }));

// Clear demo data
router.post('/clear', (req, res) => res.status(501).json({ message: 'Clear all seed data' }));
router.post('/clear/vendors', (req, res) => res.status(501).json({ message: 'Clear vendor data' }));
router.post('/clear/products', (req, res) => res.status(501).json({ message: 'Clear product data' }));

// Status
router.get('/status', (req, res) => res.status(501).json({ message: 'Get seed data status' }));

module.exports = router;
