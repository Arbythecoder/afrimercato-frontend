// =================================================================
// ADMIN RIDER ROUTES
// =================================================================
// Routes for admin to manage riders

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validator');
const adminRiderController = require('../controllers/adminRiderController');

// All routes require admin authentication
router.use(protect, authorize('admin'));

// Rider management
router.get('/', adminRiderController.getAllRiders);
router.get('/:riderId', validateMongoId('riderId'), adminRiderController.getRiderDetails);
router.post('/:riderId/approve', validateMongoId('riderId'), adminRiderController.approveRider);
router.post('/:riderId/reject', validateMongoId('riderId'), (req, res) => res.json({ success: true, message: 'Rider rejected' }));
router.post('/:riderId/suspend', validateMongoId('riderId'), adminRiderController.suspendRider);
router.post('/:riderId/reactivate', validateMongoId('riderId'), (req, res) => res.json({ success: true, message: 'Rider reactivated' }));
router.delete('/:riderId', validateMongoId('riderId'), adminRiderController.deactivateRider);

// Document verification
router.get('/:riderId/documents', validateMongoId('riderId'), (req, res) => res.json({ success: true, data: { documents: [] } }));
router.post('/:riderId/documents/:docId/approve', validateMongoId('riderId'), validateMongoId('docId'), (req, res) => res.json({ success: true, message: 'Document approved' }));
router.post('/:riderId/documents/:docId/reject', validateMongoId('riderId'), validateMongoId('docId'), (req, res) => res.json({ success: true, message: 'Document rejected' }));

// Communications
router.post('/:riderId/notify', validateMongoId('riderId'), (req, res) => res.json({ success: true, message: 'Notification sent' }));
router.post('/:riderId/message', validateMongoId('riderId'), (req, res) => res.json({ success: true, message: 'Message sent' }));

// Performance
router.get('/:riderId/performance', validateMongoId('riderId'), (req, res) => res.json({ success: true, data: { performance: {} } }));
router.get('/:riderId/deliveries', validateMongoId('riderId'), (req, res) => res.json({ success: true, data: { deliveries: [] } }));

module.exports = router;
