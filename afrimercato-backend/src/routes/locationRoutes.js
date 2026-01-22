// =================================================================
// LOCATION ROUTES
// =================================================================
// Routes for geolocation and store discovery

const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const { asyncHandler } = require('../middleware/errorHandler');

// =================================================================
// PUBLIC ROUTES - No authentication required
// =================================================================

/**
 * @route   GET /api/locations/search-vendors
 * @desc    Search vendors by location (city, address, etc.)
 * @access  Public
 */
router.get('/search-vendors', asyncHandler(async (req, res) => {
  const { location, radius = 50, limit = 20, category } = req.query;

  // Build search query
  const query = {
    isVerified: true,
    isActive: true
  };

  // Search by location (city or address)
  if (location) {
    const searchRegex = new RegExp(location, 'i');
    query.$or = [
      { 'address.city': searchRegex },
      { 'address.state': searchRegex },
      { 'address.street': searchRegex },
      { 'address.postcode': searchRegex },
      { storeName: searchRegex }
    ];
  }

  // Filter by category
  if (category) {
    query.category = new RegExp(category, 'i');
  }

  const vendors = await Vendor.find(query)
    .select('storeName description category address phone logo rating stats businessHours deliverySettings')
    .sort({ rating: -1, 'stats.totalOrders': -1 })
    .limit(parseInt(limit));

  // Format response for frontend
  const formattedVendors = vendors.map(vendor => ({
    id: vendor._id,
    name: vendor.storeName,
    category: vendor.category || 'African Groceries',
    image: vendor.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    rating: vendor.rating || 4.5,
    deliveryTime: vendor.deliverySettings?.estimatedPrepTime
      ? `${vendor.deliverySettings.estimatedPrepTime}-${vendor.deliverySettings.estimatedPrepTime + 15} min`
      : '25-40 min',
    minOrder: vendor.deliverySettings?.minimumOrderValue
      ? `£${vendor.deliverySettings.minimumOrderValue}`
      : '£10',
    tags: vendor.category ? [vendor.category] : ['African', 'Fresh', 'Groceries'],
    location: vendor.address?.city || 'United Kingdom',
    address: vendor.address
      ? `${vendor.address.street || ''}, ${vendor.address.city || ''} ${vendor.address.postcode || ''}`
      : 'UK Location'
  }));

  res.status(200).json({
    success: true,
    count: formattedVendors.length,
    data: {
      vendors: formattedVendors
    }
  });
}));

/**
 * @route   GET /api/locations/stores/nearby
 * @desc    Get stores near a location
 * @access  Public
 */
router.get('/stores/nearby', asyncHandler(async (req, res) => {
  const { city, limit = 10 } = req.query;

  const query = { isVerified: true, isActive: true };

  if (city) {
    query['address.city'] = new RegExp(city, 'i');
  }

  const vendors = await Vendor.find(query)
    .select('storeName description category address logo rating')
    .sort({ rating: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors
  });
}));

/**
 * @route   GET /api/locations/stores/search
 * @desc    Search stores by location text
 * @access  Public
 */
router.get('/stores/search', asyncHandler(async (req, res) => {
  const { q, limit = 20 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const searchRegex = new RegExp(q, 'i');

  const vendors = await Vendor.find({
    isVerified: true,
    isActive: true,
    $or: [
      { storeName: searchRegex },
      { 'address.city': searchRegex },
      { 'address.postcode': searchRegex },
      { category: searchRegex }
    ]
  })
    .select('storeName description category address logo rating')
    .sort({ rating: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: vendors.length,
    data: vendors
  });
}));

/**
 * @route   GET /api/locations/featured-stores
 * @desc    Get featured stores for homepage
 * @access  Public
 */
router.get('/featured-stores', asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  const vendors = await Vendor.find({
    isVerified: true,
    isActive: true
  })
    .select('storeName description category address phone logo rating stats businessHours deliverySettings')
    .sort({ rating: -1, 'stats.totalOrders': -1 })
    .limit(parseInt(limit));

  // Format for frontend display
  const formattedStores = vendors.map(vendor => ({
    id: vendor._id,
    name: vendor.storeName,
    category: vendor.category || 'African Groceries',
    image: vendor.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    rating: vendor.rating || 4.5,
    deliveryTime: vendor.deliverySettings?.estimatedPrepTime
      ? `${vendor.deliverySettings.estimatedPrepTime}-${vendor.deliverySettings.estimatedPrepTime + 15} min`
      : '25-40 min',
    minOrder: vendor.deliverySettings?.minimumOrderValue
      ? `£${vendor.deliverySettings.minimumOrderValue}`
      : '£10',
    tags: vendor.category ? [vendor.category] : ['African', 'Fresh', 'Groceries'],
    location: vendor.address?.city || 'United Kingdom'
  }));

  res.status(200).json({
    success: true,
    count: formattedStores.length,
    data: formattedStores
  });
}));

// Placeholder routes for future implementation
router.get('/areas', (req, res) => res.status(200).json({ success: true, data: [] }));
router.get('/zones', (req, res) => res.status(200).json({ success: true, data: [] }));
router.get('/postcode/:postcode/check', (req, res) => res.status(200).json({ success: true, served: true }));
router.post('/validate', (req, res) => res.status(200).json({ success: true, valid: true }));
router.get('/distance', (req, res) => res.status(200).json({ success: true, distance: 0 }));

// Admin location management (protected)
const { protect, authorize } = require('../middleware/auth');
router.post('/zones/create', protect, authorize('admin'), (req, res) => res.status(501).json({ message: 'Create delivery zone' }));
router.put('/zones/:zoneId', protect, authorize('admin'), (req, res) => res.status(501).json({ message: 'Update zone' }));
router.delete('/zones/:zoneId', protect, authorize('admin'), (req, res) => res.status(501).json({ message: 'Delete zone' }));

module.exports = router;
