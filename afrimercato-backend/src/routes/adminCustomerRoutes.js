// =================================================================
// ADMIN CUSTOMER ROUTES
// =================================================================
// Routes for admin to manage customers

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateMongoId } = require('../middleware/validator');
const adminCustomerController = require('../controllers/adminCustomerController');

// All routes require admin authentication
router.use(protect, authorize('admin'));

// Customer management
router.get('/', adminCustomerController.getAllCustomers);
router.get('/:customerId', validateMongoId('customerId'), adminCustomerController.getCustomerDetails);
router.post('/:customerId/suspend', validateMongoId('customerId'), adminCustomerController.suspendCustomer);
router.post('/:customerId/reactivate', validateMongoId('customerId'), adminCustomerController.reactivateCustomer);
router.delete('/:customerId', validateMongoId('customerId'), adminCustomerController.deleteCustomer);

// Customer orders
router.get('/:customerId/orders', validateMongoId('customerId'), adminCustomerController.getCustomerOrders);
router.get('/:customerId/orders/:orderId', validateMongoId('customerId'), validateMongoId('orderId'), (req, res) => res.json({ success: true, message: 'Get order details - not implemented yet' }));

// Customer communications
router.post('/:customerId/notify', validateMongoId('customerId'), adminCustomerController.notifyCustomer);
router.post('/:customerId/message', validateMongoId('customerId'), (req, res) => res.json({ success: true, message: 'Message sent' }));

// Customer disputes
router.get('/:customerId/disputes', validateMongoId('customerId'), (req, res) => res.json({ success: true, data: { disputes: [] } }));
router.post('/:customerId/disputes/:disputeId/resolve', validateMongoId('customerId'), validateMongoId('disputeId'), (req, res) => res.json({ success: true, message: 'Dispute resolved' }));

module.exports = router;
