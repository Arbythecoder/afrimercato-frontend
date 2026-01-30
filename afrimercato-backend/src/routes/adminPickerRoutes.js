// =================================================================
// ADMIN PICKER ROUTES
// =================================================================
// Routes for admin to manage pickers

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validator');
const adminPickerController = require('../controllers/adminPickerController');

// All routes require admin authentication
router.use(protect, authorize('admin'));

// Picker management
router.get('/', adminPickerController.getAllPickers);
router.get('/:pickerId', validateMongoId('pickerId'), adminPickerController.getPickerDetails);
router.post('/:pickerId/approve', validateMongoId('pickerId'), adminPickerController.approvePicker);
router.post('/:pickerId/reject', validateMongoId('pickerId'), (req, res) => res.json({ success: true, message: 'Picker rejected' }));
router.post('/:pickerId/suspend', validateMongoId('pickerId'), adminPickerController.suspendPicker);
router.post('/:pickerId/reactivate', validateMongoId('pickerId'), (req, res) => res.json({ success: true, message: 'Picker reactivated' }));
router.delete('/:pickerId', validateMongoId('pickerId'), adminPickerController.deactivatePicker);

// Document verification
router.get('/:pickerId/documents', validateMongoId('pickerId'), (req, res) => res.json({ success: true, data: { documents: [] } }));
router.post('/:pickerId/documents/:docId/approve', validateMongoId('pickerId'), validateMongoId('docId'), (req, res) => res.json({ success: true, message: 'Document approved' }));
router.post('/:pickerId/documents/:docId/reject', validateMongoId('pickerId'), validateMongoId('docId'), (req, res) => res.json({ success: true, message: 'Document rejected' }));

// Communications
router.post('/:pickerId/notify', validateMongoId('pickerId'), (req, res) => res.json({ success: true, message: 'Notification sent' }));
router.post('/:pickerId/message', validateMongoId('pickerId'), (req, res) => res.json({ success: true, message: 'Message sent' }));

// Performance
router.get('/:pickerId/performance', validateMongoId('pickerId'), (req, res) => res.json({ success: true, data: { performance: {} } }));
router.get('/:pickerId/orders', validateMongoId('pickerId'), (req, res) => res.json({ success: true, data: { orders: [] } }));

module.exports = router;
