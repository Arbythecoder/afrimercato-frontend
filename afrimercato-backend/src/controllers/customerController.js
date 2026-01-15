// =================================================================
// CUSTOMER CONTROLLER - COMPLETE MVP
// =================================================================
// File: src/controllers/customerController.js
// Handles all customer operations: profile, addresses, orders, reviews, wishlist

const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { asyncHandler } = require('../middleware/errorHandler');

// =================================================================
// PROFILE OPERATIONS
// =================================================================

/**
 * @route   GET /api/customer/profile
 * @desc    Get customer profile
 * @access  Private (customer)
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user.id)
    .select('-password -emailVerificationToken -passwordResetToken');

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  res.status(200).json({
    success: true,
    data: customer
  });
});

/**
 * @route   PUT /api/customer/profile
 * @desc    Update customer profile
 * @access  Private (customer)
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;

  const customer = await User.findByIdAndUpdate(
    req.user.id,
    {
      name,
      phone,
      avatar,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  ).select('-password -emailVerificationToken -passwordResetToken');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: customer
  });
});

// =================================================================
// ADDRESS MANAGEMENT
// =================================================================

/**
 * @route   GET /api/customer/addresses
 * @desc    Get all delivery addresses for customer
 * @access  Private (customer)
 */
exports.getAddresses = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  const addresses = customer.addresses || [];

  res.status(200).json({
    success: true,
    count: addresses.length,
    data: addresses
  });
});

/**
 * @route   POST /api/customer/addresses
 * @desc    Add a new delivery address
 * @access  Private (customer)
 */
exports.addAddress = asyncHandler(async (req, res) => {
  const { label, street, city, postcode, landmark, isDefault } = req.body;

  // Validate required fields
  if (!street || !city || !postcode) {
    return res.status(400).json({
      success: false,
      message: 'Street, city, and postcode are required'
    });
  }

  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  // Initialize addresses array if it doesn't exist
  if (!customer.addresses) {
    customer.addresses = [];
  }

  const newAddress = {
    _id: new require('mongoose').Types.ObjectId(),
    label: label || 'Home',
    street,
    city,
    postcode,
    landmark,
    isDefault: isDefault || (customer.addresses.length === 0) // First address is default
  };

  // If this is set as default, unset others
  if (isDefault) {
    customer.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  customer.addresses.push(newAddress);
  await customer.save();

  res.status(201).json({
    success: true,
    message: 'Address added successfully',
    data: newAddress
  });
});

/**
 * @route   PUT /api/customer/addresses/:addressId
 * @desc    Update a delivery address
 * @access  Private (customer)
 */
exports.updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { label, street, city, postcode, landmark, isDefault } = req.body;

  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  const address = customer.addresses?.find(a => a._id.toString() === addressId);

  if (!address) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  // Update fields
  if (label) address.label = label;
  if (street) address.street = street;
  if (city) address.city = city;
  if (postcode) address.postcode = postcode;
  if (landmark) address.landmark = landmark;

  // Handle default address
  if (isDefault === true) {
    customer.addresses.forEach(addr => {
      addr.isDefault = false;
    });
    address.isDefault = true;
  } else if (isDefault === false && customer.addresses.length === 1) {
    // Can't unset default if it's the only address
    return res.status(400).json({
      success: false,
      message: 'You must have at least one default address'
    });
  }

  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: address
  });
});

/**
 * @route   DELETE /api/customer/addresses/:addressId
 * @desc    Delete a delivery address
 * @access  Private (customer)
 */
exports.deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  const addressIndex = customer.addresses?.findIndex(a => a._id.toString() === addressId);

  if (addressIndex === -1 || addressIndex === undefined) {
    return res.status(404).json({
      success: false,
      message: 'Address not found'
    });
  }

  const deletedAddress = customer.addresses.splice(addressIndex, 1)[0];

  // If deleted address was default and there are other addresses, make first one default
  if (deletedAddress.isDefault && customer.addresses.length > 0) {
    customer.addresses[0].isDefault = true;
  }

  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully'
  });
});

// =================================================================
// ORDER OPERATIONS
// =================================================================

/**
 * @route   GET /api/customer/orders
 * @desc    Get all customer orders
 * @access  Private (customer)
 */
exports.getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;

  const query = { customer: req.user.id };

  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const orders = await Order.find(query)
    .populate('vendor', 'storeName logo')
    .populate('items.product', 'name price images')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Order.countDocuments(query);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / limit),
    data: orders
  });
});

/**
 * @route   GET /api/customer/orders/:orderId
 * @desc    Get order details
 * @access  Private (customer)
 */
exports.getOrderDetails = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId)
    .populate('customer', 'name email phone')
    .populate('vendor', 'storeName logo location.address')
    .populate('items.product', 'name price images unit')
    .populate('rider', 'name phone')
    .populate('picker', 'name phone');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Verify customer owns this order
  if (order.customer._id.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to view this order'
    });
  }

  res.status(200).json({
    success: true,
    data: order
  });
});

/**
 * @route   POST /api/customer/orders/:orderId/cancel
 * @desc    Cancel an order (only if status allows)
 * @access  Private (customer)
 */
exports.cancelOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { reason } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  // Verify customer owns this order
  if (order.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to cancel this order'
    });
  }

  // Can only cancel if order is pending, processing, or picker-assigned
  const cancellableStatuses = ['pending', 'processing', 'picker_assigned'];
  if (!cancellableStatuses.includes(order.status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel order with status: ${order.status}`
    });
  }

  order.status = 'cancelled';
  order.cancellationReason = reason;
  order.cancelledAt = Date.now();
  order.updatedAt = Date.now();

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: order
  });
});

// =================================================================
// REVIEW OPERATIONS
// =================================================================

/**
 * @route   POST /api/customer/reviews
 * @desc    Add a review for a product
 * @access  Private (customer)
 */
exports.addReview = asyncHandler(async (req, res) => {
  const { productId, orderId, rating, comment } = req.body;

  // Validate inputs
  if (!productId || !orderId || !rating || !comment) {
    return res.status(400).json({
      success: false,
      message: 'Product ID, order ID, rating, and comment are required'
    });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5'
    });
  }

  // Verify order belongs to customer and contains this product
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found'
    });
  }

  if (order.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to review products from this order'
    });
  }

  const itemInOrder = order.items.find(item => item.product.toString() === productId);
  if (!itemInOrder) {
    return res.status(400).json({
      success: false,
      message: 'This product was not in this order'
    });
  }

  // Check if review already exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  if (!product.reviews) {
    product.reviews = [];
  }

  // Prevent duplicate reviews from same customer for same product
  const existingReview = product.reviews.find(r => r.customerId?.toString() === req.user.id);
  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this product'
    });
  }

  const review = {
    _id: new require('mongoose').Types.ObjectId(),
    customerId: req.user.id,
    customerName: req.user.name,
    rating,
    comment,
    createdAt: Date.now()
  };

  product.reviews.push(review);

  // Update product rating (average of all reviews)
  const avgRating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
  product.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal

  await product.save();

  res.status(201).json({
    success: true,
    message: 'Review added successfully',
    data: review
  });
});

/**
 * @route   GET /api/customer/reviews
 * @desc    Get all reviews by customer
 * @access  Private (customer)
 */
exports.getCustomerReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  // Find all products where customer has left a review
  const products = await Product.find(
    { 'reviews.customerId': req.user.id },
    { reviews: { $elemMatch: { customerId: req.user.id } }, name: 1, images: 1, rating: 1 }
  )
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments({ 'reviews.customerId': req.user.id });

  // Extract reviews from products
  const reviews = products.flatMap(product => {
    return product.reviews.map(review => ({
      ...review.toObject(),
      productId: product._id,
      productName: product.name,
      productImage: product.images?.[0]
    }));
  });

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pages: Math.ceil(total / limit),
    data: reviews
  });
});

// =================================================================
// WISHLIST OPERATIONS
// =================================================================

/**
 * @route   GET /api/customer/wishlist
 * @desc    Get customer wishlist
 * @access  Private (customer)
 */
exports.getWishlist = asyncHandler(async (req, res) => {
  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  const wishlistIds = customer.wishlist || [];

  const products = await Product.find({ _id: { $in: wishlistIds } })
    .populate('vendor', 'storeName logo')
    .select('name description price originalPrice category images rating reviews unit stock');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products
  });
});

/**
 * @route   POST /api/customer/wishlist
 * @desc    Add product to wishlist
 * @access  Private (customer)
 */
exports.addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({
      success: false,
      message: 'Product ID is required'
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

  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  if (!customer.wishlist) {
    customer.wishlist = [];
  }

  // Check if already in wishlist
  if (customer.wishlist.includes(productId)) {
    return res.status(400).json({
      success: false,
      message: 'Product already in wishlist'
    });
  }

  customer.wishlist.push(productId);
  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Product added to wishlist',
    data: { productId }
  });
});

/**
 * @route   DELETE /api/customer/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private (customer)
 */
exports.removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const customer = await User.findById(req.user.id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: 'Customer not found'
    });
  }

  if (!customer.wishlist || !customer.wishlist.includes(productId)) {
    return res.status(404).json({
      success: false,
      message: 'Product not in wishlist'
    });
  }

  customer.wishlist = customer.wishlist.filter(id => id.toString() !== productId);
  await customer.save();

  res.status(200).json({
    success: true,
    message: 'Product removed from wishlist'
  });
});
