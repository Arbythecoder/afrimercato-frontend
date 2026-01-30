// =================================================================
// ADMIN VENDOR ROUTES
// =================================================================
// Routes for admin to manage vendors

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validator');
const adminVendorController = require('../controllers/adminVendorController');

// All routes require admin authentication
router.use(protect, authorize('admin'));

// Vendor management
router.get('/', adminVendorController.getAllVendors);
router.get('/:vendorId', validateMongoId('vendorId'), adminVendorController.getVendorDetails);
router.post('/:vendorId/approve', validateMongoId('vendorId'), adminVendorController.approveVendor);
router.post('/:vendorId/reject', validateMongoId('vendorId'), adminVendorController.rejectVendor);
router.post('/:vendorId/suspend', validateMongoId('vendorId'), adminVendorController.suspendVendor);
router.post('/:vendorId/reactivate', validateMongoId('vendorId'), adminVendorController.reactivateVendor);
router.delete('/:vendorId', validateMongoId('vendorId'), adminVendorController.deleteVendor);

// Verification management
router.get('/:vendorId/verification', validateMongoId('vendorId'), adminVendorController.getVerificationDetails);
router.post('/:vendorId/verification/approve', validateMongoId('vendorId'), adminVendorController.approveVerification);
router.post('/:vendorId/verification/reject', validateMongoId('vendorId'), adminVendorController.rejectVerification);

// Document review
router.get('/:vendorId/documents', validateMongoId('vendorId'), adminVendorController.getVendorDocuments);
router.post('/:vendorId/documents/:docId/approve', validateMongoId('vendorId'), validateMongoId('docId'), (req, res) => res.json({ success: true, message: 'Document approved' }));
router.post('/:vendorId/documents/:docId/reject', validateMongoId('vendorId'), validateMongoId('docId'), (req, res) => res.json({ success: true, message: 'Document rejected' }));

// Vendor communications
router.post('/:vendorId/notify', validateMongoId('vendorId'), adminVendorController.notifyVendor);
router.post('/:vendorId/message', validateMongoId('vendorId'), adminVendorController.messageVendor);

// Vendor reports
router.get('/:vendorId/reports', validateMongoId('vendorId'), adminVendorController.getVendorReports);
router.get('/:vendorId/transactions', validateMongoId('vendorId'), adminVendorController.getVendorTransactions);

module.exports = router;
