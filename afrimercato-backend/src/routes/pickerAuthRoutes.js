// =================================================================
// PICKER AUTH ROUTES
// =================================================================
// Routes for picker registration, login, and profile management

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', (req, res) => res.status(501).json({ message: 'Picker registration' }));
router.post('/login', (req, res) => res.status(501).json({ message: 'Picker login' }));

// Protected routes
router.get('/profile', protect, authorize('picker'), (req, res) => res.status(501).json({ message: 'Get picker profile' }));
router.put('/profile', protect, authorize('picker'), (req, res) => res.status(501).json({ message: 'Update picker profile' }));
router.post('/documents/upload', protect, authorize('picker'), (req, res) => res.status(501).json({ message: 'Upload verification documents' }));
router.post('/connect-store/:storeId', protect, authorize('picker'), (req, res) => res.status(501).json({ message: 'Connect with store' }));
router.get('/connected-stores', protect, authorize('picker'), (req, res) => res.status(501).json({ message: 'Get connected stores' }));
router.post('/check-in/:storeId', protect, authorize('picker'), (req, res) => res.status(501).json({ message: 'Check in at store' }));
router.post('/check-out/:storeId', protect, authorize('picker'), (req, res) => res.status(501).json({ message: 'Check out from store' }));

module.exports = router;
