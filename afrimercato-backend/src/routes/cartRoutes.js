// =================================================================
// CART ROUTES
// =================================================================
// Routes for shopping cart management

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
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

// Cart routes require login — any role can build a cart and browse
// (only checkout enforces the customer-role restriction)
router.use(protect);

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
