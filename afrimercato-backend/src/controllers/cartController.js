// =================================================================
// CART CONTROLLER - COMPLETE MVP
// =================================================================
// File: src/controllers/cartController.js
// Handles shopping cart operations

const User = require('../models/User');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

// =================================================================
// CART OPERATIONS
// =================================================================

/**
 * @route   GET /api/cart
 * @desc    Get shopping cart
 * @access  Private (customer)
 */
exports.getCart = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  let cart = customer.cart || [];

  // Validate all items still exist and have current pricing
  const validItems = [];
  let totalPrice = 0;

  for (const item of cart) {
    const product = await Product.findById(item.productId);

    if (!product) {
      // Product no longer exists, skip it
      continue;
    }

    if (product.stock < item.quantity) {
      // Reduce quantity if not enough stock
      item.quantity = Math.max(0, product.stock);
    }

    if (item.quantity > 0) {
      // Update price in case it changed
      const itemTotal = product.price * item.quantity;
      validItems.push({
        ...item,
        price: product.price,
        total: itemTotal,
        available: product.stock > 0
      });
      totalPrice += itemTotal;
    }
  }

  // Update cart with valid items
  customer.cart = validItems;
  await customer.save();

  res.status(200).json({
    success: true,
    count: validItems.length,
    subtotal: Math.round(totalPrice * 100) / 100,
    data: validItems
  });
});

/**
 * @route   POST /api/cart/add
 * @desc    Add item to cart
 * @access  Private (customer)
 */
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  // Validate inputs
  if (!productId || quantity < 1) {
    return res.status(400).json({
      success: false,
      message: 'Valid product ID and quantity are required'
    });
  }

  // Verify product exists
  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check stock
  if (product.stock < quantity) {
    return res.status(400).json({
      success: false,
      message: `Only ${product.stock} items available in stock`
    });
  }

  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  if (!customer.cart) {
    customer.cart = [];
  }

  // Check if item already in cart
  const existingItem = customer.cart.find(item => item.productId.toString() === productId);

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;

    if (product.stock < newQuantity) {
      return res.status(400).json({
        success: false,
        message: `Cannot add that many items. Only ${product.stock} available`
      });
    }

    existingItem.quantity = newQuantity;
  } else {
    // Add new item
    customer.cart.push({
      productId,
      quantity,
      price: product.price,
      vendorId: product.vendor,
      addedAt: Date.now()
    });
  }

  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Item added to cart',
    data: {
      productId,
      quantity: existingItem ? existingItem.quantity : quantity
    }
  });
});

/**
 * @route   PUT /api/cart/update/:itemId
 * @desc    Update cart item quantity
 * @access  Private (customer)
 */
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;

  if (!quantity || quantity < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid quantity is required'
    });
  }

  const customer = await User.findById(req.user.id);

  if (!customer || !customer.cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  const cartItem = customer.cart.find(item => item._id?.toString() === itemId || item.productId.toString() === itemId);

  if (!cartItem) {
    return res.status(404).json({
      success: false,
      message: 'Item not in cart'
    });
  }

  if (quantity === 0) {
    // Remove item if quantity is 0
    customer.cart = customer.cart.filter(item => item._id?.toString() !== itemId && item.productId.toString() !== itemId);
  } else {
    // Check stock availability
    const product = await Product.findById(cartItem.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} items available in stock`
      });
    }

    cartItem.quantity = quantity;
  }

  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Cart item updated',
    data: cartItem
  });
});

/**
 * @route   DELETE /api/cart/remove/:itemId
 * @desc    Remove item from cart
 * @access  Private (customer)
 */
exports.removeFromCart = asyncHandler(async (req, res) => {
  const { itemId } = req.params;

  const customer = await User.findById(req.user.id);

  if (!customer || !customer.cart) {
    return res.status(404).json({
      success: false,
      message: 'Cart not found'
    });
  }

  const initialLength = customer.cart.length;
  customer.cart = customer.cart.filter(item => item._id?.toString() !== itemId && item.productId.toString() !== itemId);

  if (customer.cart.length === initialLength) {
    return res.status(404).json({
      success: false,
      message: 'Item not in cart'
    });
  }

  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Item removed from cart'
  });
});

/**
 * @route   POST /api/cart/clear
 * @desc    Clear entire cart
 * @access  Private (customer)
 */
exports.clearCart = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  customer.cart = [];
  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Cart cleared'
  });
});

/**
 * @route   GET /api/cart/subtotal
 * @desc    Get cart subtotal and item count
 * @access  Private (customer)
 */
exports.getCartSubtotal = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  const cart = customer.cart || [];

  let subtotal = 0;
  let itemCount = 0;
  let tax = 0;

  for (const item of cart) {
    const product = await Product.findById(item.productId);

    if (product) {
      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;
      itemCount += item.quantity;
    }
  }

  // Calculate tax (assume 5% for MVP)
  tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  res.status(200).json({
    success: true,
    data: {
      itemCount,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      total,
      currency: 'GHS'
    }
  });
});

/**
 * @route   POST /api/cart/validate
 * @desc    Validate cart items before checkout
 * @access  Private (customer)
 */
exports.validateCart = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user.id);

  if (!customer || !customer.cart || customer.cart.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cart is empty'
    });
  }

  const issues = [];
  const validItems = [];

  for (const item of customer.cart) {
    const product = await Product.findById(item.productId);

    if (!product) {
      issues.push({
        productId: item.productId,
        issue: 'Product no longer available'
      });
      continue;
    }

    if (!product.isActive) {
      issues.push({
        productId: item.productId,
        issue: 'Product is no longer available'
      });
      continue;
    }

    if (product.stock === 0) {
      issues.push({
        productId: item.productId,
        issue: 'Product is out of stock'
      });
      continue;
    }

    if (product.stock < item.quantity) {
      issues.push({
        productId: item.productId,
        issue: `Only ${product.stock} items available (requested ${item.quantity})`
      });
      // Still allow checkout with reduced quantity
      item.quantity = product.stock;
    }

    validItems.push({
      productId: item.productId,
      name: product.name,
      quantity: item.quantity,
      price: product.price,
      total: product.price * item.quantity,
      vendorId: product.vendor
    });
  }

  if (issues.length > 0 || validItems.length === 0) {
    // Update cart with valid items only
    customer.cart = customer.cart.filter(item => 
      validItems.some(v => v.productId.toString() === item.productId.toString())
    );
    await customer.save();
  }

  res.status(200).json({
    success: issues.length === 0,
    issues,
    validItems,
    message: issues.length > 0 ? 'Cart has some issues' : 'Cart is valid'
  });
});
