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

  // Build search query - only show approved, verified, public, active vendors
  const query = {
    isVerified: true,
    isActive: true,
    isPublic: true,
    approvalStatus: 'approved'
  };

  // Search by location (city or address) - search multiple possible fields
  // The Vendor model stores address in different places depending on registration flow
  if (location) {
    const searchRegex = new RegExp(location, 'i');
    query.$or = [
      // Search in address object (object format)
      { 'address.city': searchRegex },
      { 'address.state': searchRegex },
      { 'address.street': searchRegex },
      { 'address.postcode': searchRegex },
      // Search in address as string
      { 'address': searchRegex },
      // Search in location object
      { 'location.address': searchRegex },
      { 'location.postcode': searchRegex },
      // Search in storeName
      { storeName: searchRegex },
      // Search in category
      { category: searchRegex }
    ];
  }

  // Filter by category
  if (category) {
    query.category = new RegExp(category, 'i');
  }

  const vendors = await Vendor.find(query)
    .select('storeName description category address location phone logo rating stats businessHours deliverySettings')
    .sort({ rating: -1, 'stats.totalOrders': -1 })
    .limit(parseInt(limit));

  // Format response for frontend - handle both address formats
  const formattedVendors = vendors.map(vendor => {
    // Extract location/address data from either source
    const addressData = vendor.address || {};
    const locationData = vendor.location || {};

    // Get city from various possible locations
    const city = addressData.city || locationData.address || 'United Kingdom';

    // Build full address string
    let fullAddress = 'UK Location';
    if (typeof addressData === 'string') {
      fullAddress = addressData;
    } else if (addressData.street || addressData.city || addressData.postcode) {
      fullAddress = `${addressData.street || ''}, ${addressData.city || ''} ${addressData.postcode || ''}`.trim();
    } else if (locationData.address || locationData.postcode) {
      fullAddress = `${locationData.address || ''} ${locationData.postcode || ''}`.trim();
    }

    return {
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
      location: city,
      address: fullAddress
    };
  });

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
 * @route   GET /api/locations/vendor/:id
 * @desc    Get a single vendor by ID for customer storefront
 * @access  Public
 */
router.get('/vendor/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId format
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid vendor ID format'
    });
  }

  const vendor = await Vendor.findById(id)
    .select('storeName description category address location phone logo rating stats businessHours deliverySettings isActive isVerified isPublic approvalStatus');

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor not found'
    });
  }

  // Only return active, verified, public, approved vendors to customers
  if (!vendor.isActive || !vendor.isVerified || !vendor.isPublic || vendor.approvalStatus !== 'approved') {
    return res.status(404).json({
      success: false,
      message: 'Vendor not available'
    });
  }

  // Extract location/address data from either source
  const addressData = vendor.address || {};
  const locationData = vendor.location || {};
  const city = addressData.city || locationData.address || 'United Kingdom';

  // Build full address string
  let fullAddress = 'UK Location';
  if (typeof addressData === 'string') {
    fullAddress = addressData;
  } else if (addressData.street || addressData.city || addressData.postcode) {
    fullAddress = `${addressData.street || ''}, ${addressData.city || ''} ${addressData.postcode || ''}`.trim();
  } else if (locationData.address || locationData.postcode) {
    fullAddress = `${locationData.address || ''} ${locationData.postcode || ''}`.trim();
  }

  // Format response for frontend
  const formattedVendor = {
    id: vendor._id,
    name: vendor.storeName,
    storeName: vendor.storeName, // Include both for compatibility
    description: vendor.description,
    category: vendor.category || 'African Groceries',
    image: vendor.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
    logo: vendor.logo,
    rating: vendor.rating || 4.5,
    deliveryTime: vendor.deliverySettings?.estimatedPrepTime
      ? `${vendor.deliverySettings.estimatedPrepTime}-${vendor.deliverySettings.estimatedPrepTime + 15} min`
      : '25-40 min',
    minOrder: vendor.deliverySettings?.minimumOrderValue
      ? `£${vendor.deliverySettings.minimumOrderValue}`
      : '£10',
    tags: vendor.category ? [vendor.category] : ['African', 'Fresh', 'Groceries'],
    location: city,
    address: fullAddress,
    phone: vendor.phone,
    businessHours: vendor.businessHours,
    stats: vendor.stats,
    deliverySettings: vendor.deliverySettings
  };

  res.status(200).json({
    success: true,
    data: formattedVendor
  });
}));

/**
 * @route   GET /api/locations/featured-stores
 * @desc    Get featured stores for homepage
 * @access  Public
 */
router.get('/featured-stores', asyncHandler(async (req, res) => {
  const { limit = 6 } = req.query;

  // Only show approved, verified, public, active vendors
  const vendors = await Vendor.find({
    isVerified: true,
    isActive: true,
    isPublic: true,
    approvalStatus: 'approved'
  })
    .select('storeName description category address location phone logo rating stats businessHours deliverySettings')
    .sort({ rating: -1, 'stats.totalOrders': -1 })
    .limit(parseInt(limit));

  // Format for frontend display - handle both address formats
  const formattedStores = vendors.map(vendor => {
    const addressData = vendor.address || {};
    const locationData = vendor.location || {};
    const city = addressData.city || locationData.address || 'United Kingdom';

    return {
      id: vendor._id,
      name: vendor.storeName,
      description: vendor.description,
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
      location: city
    };
  });

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
