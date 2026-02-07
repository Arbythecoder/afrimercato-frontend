// =================================================================
// CART ROUTES
// =================================================================
// Routes for shopping cart management

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSubtotal,
  validateCart,
  setCartRepurchaseSchedule,
  getCartRepurchaseSchedule
} = require('../controllers/cartController');

// All cart routes require customer authentication
router.use(protect, authorize('customer'));

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update/:itemId', updateCartItem);
router.delete('/remove/:itemId', removeFromCart);
router.post('/clear', clearCart);
router.get('/subtotal', getCartSubtotal);
router.post('/validate', validateCart);

// Repurchase scheduling
router.post('/repurchase-schedule', setCartRepurchaseSchedule);
router.get('/repurchase-schedule', getCartRepurchaseSchedule);

module.exports = router;
