// =================================================================
// PICKER AUTH ROUTES
// =================================================================
// Routes for picker registration, login, and profile management

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const pickerController = require('../controllers/pickerController');

// Public routes
router.post('/register', pickerController.register);
router.post('/login', pickerController.login);

// Protected routes
router.get('/profile', protect, authorize('picker'), pickerController.getProfile);
router.put('/profile', protect, authorize('picker'), pickerController.updateProfile);
router.post('/documents/upload', protect, authorize('picker'), pickerController.uploadDocuments);
router.post('/connect-store/:storeId', protect, authorize('picker'), pickerController.requestStoreConnection);
router.get('/connected-stores', protect, authorize('picker'), pickerController.getConnectedStores);
router.post('/check-in/:storeId', protect, authorize('picker'), pickerController.checkIn);
router.post('/check-out/:storeId', protect, authorize('picker'), pickerController.checkOut);

module.exports = router;
