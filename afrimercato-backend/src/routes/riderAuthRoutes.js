// =================================================================
// RIDER AUTH ROUTES
// =================================================================
// Routes for rider registration, login, and profile management

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', (req, res) => res.status(501).json({ message: 'Rider registration' }));
router.post('/login', (req, res) => res.status(501).json({ message: 'Rider login' }));

// Protected routes
router.get('/profile', protect, authorize('rider'), (req, res) => res.status(501).json({ message: 'Get rider profile' }));
router.put('/profile', protect, authorize('rider'), (req, res) => res.status(501).json({ message: 'Update rider profile' }));
router.post('/documents/upload', protect, authorize('rider'), (req, res) => res.status(501).json({ message: 'Upload verification documents' }));
router.post('/connect-store/:storeId', protect, authorize('rider'), (req, res) => res.status(501).json({ message: 'Connect with store' }));
router.get('/connected-stores', protect, authorize('rider'), (req, res) => res.status(501).json({ message: 'Get connected stores' }));

module.exports = router;
