// =================================================================
// CART ROUTES
// =================================================================
// Routes for shopping cart management

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// All cart routes require customer authentication
router.use(protect, authorize('customer'));

router.get('/', (req, res) => res.status(501).json({ message: 'Get shopping cart' }));
router.post('/add', (req, res) => res.status(501).json({ message: 'Add item to cart' }));
router.put('/update/:itemId', (req, res) => res.status(501).json({ message: 'Update cart item quantity' }));
router.delete('/remove/:itemId', (req, res) => res.status(501).json({ message: 'Remove item from cart' }));
router.post('/clear', (req, res) => res.status(501).json({ message: 'Clear entire cart' }));
router.get('/subtotal', (req, res) => res.status(501).json({ message: 'Get cart subtotal' }));

module.exports = router;
