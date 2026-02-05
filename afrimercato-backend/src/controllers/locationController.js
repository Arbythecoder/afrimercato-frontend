const Vendor = require('../models/Vendor');
const { geocode, getNormalizedLabel } = require('../services/geocodingService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Search vendors by location with geocoding support
 * Supports postcodes, city names, and address text
 * Returns empty array if no vendors found (triggers "Coming Soon" UI)
 */
exports.searchVendors = asyncHandler(async (req, res) => {
  const {
    postcode,
    locationText,
    radiusKm = 25,
    limit = 20,
    category
  } = req.query;

  const searchQuery = postcode || locationText;

  if (!searchQuery) {
    return res.status(400).json({
      success: false,
      message: 'Please provide postcode or locationText parameter'
    });
  }

  try {
    // Geocode the search query to get lat/lng
    const geocoded = await geocode(searchQuery);

    if (!geocoded) {
      // Location is invalid or not found
      return res.status(200).json({
        success: true,
        count: 0,
        data: {
          vendors: [],
          location: {
            query: searchQuery,
            normalized: null,
            found: false
          }
        }
      });
    }

    const { lat, lng, displayName } = geocoded;
    const normalizedLabel = getNormalizedLabel(displayName);

    // Build vendor query
    const vendorQuery = {
      isVerified: true,
      isActive: true,
      isPublic: true,
      approvalStatus: 'approved',
      'location.coordinates.coordinates': { $exists: true } // Must have coordinates
    };

    // Add category filter if provided
    if (category) {
      vendorQuery.category = new RegExp(category, 'i');
    }

    // Find vendors within radius using geospatial query
    const radiusInMeters = radiusKm * 1000;
    const vendors = await Vendor.find({
      ...vendorQuery,
      'location.coordinates.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat] // [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      }
    })
      .select('storeName description category location phone logo rating stats businessHours deliverySettings currency')
      .limit(parseInt(limit));

    // Format vendors for frontend
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
        ? `${vendor.currency === 'EUR' ? '€' : '£'}${vendor.deliverySettings.minimumOrderValue}`
        : `${vendor.currency === 'EUR' ? '€' : '£'}10`,
      tags: vendor.category ? [vendor.category] : ['African', 'Fresh', 'Groceries'],
      location: vendor.location?.city || normalizedLabel,
      address: vendor.location?.address || 'UK Location',
      currency: vendor.currency || 'GBP'
    }));

    res.status(200).json({
      success: true,
      count: formattedVendors.length,
      data: {
        vendors: formattedVendors,
        location: {
          query: searchQuery,
          normalized: normalizedLabel,
          found: true,
          lat,
          lng,
          radiusKm
        }
      }
    });
  } catch (error) {
    console.error('Search vendors error:', error);

    // Return empty result with error details (graceful degradation)
    res.status(200).json({
      success: true,
      count: 0,
      data: {
        vendors: [],
        location: {
          query: searchQuery,
          normalized: null,
          found: false,
          error: error.message
        }
      }
    });
  }
});

/**
 * Browse all vendors (not location-based)
 * Used when user clicks "Browse all stores"
 */
exports.browseAllVendors = asyncHandler(async (req, res) => {
  const { limit = 50, category, page = 1 } = req.query;

  const query = {
    isVerified: true,
    isActive: true,
    isPublic: true,
    approvalStatus: 'approved'
  };

  if (category) {
    query.category = new RegExp(category, 'i');
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [vendors, total] = await Promise.all([
    Vendor.find(query)
      .select('storeName description category location phone logo rating stats businessHours deliverySettings currency')
      .sort({ rating: -1, 'stats.totalOrders': -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Vendor.countDocuments(query)
  ]);

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
      ? `${vendor.currency === 'EUR' ? '€' : '£'}${vendor.deliverySettings.minimumOrderValue}`
      : `${vendor.currency === 'EUR' ? '€' : '£'}10`,
    tags: vendor.category ? [vendor.category] : ['African', 'Fresh', 'Groceries'],
    location: vendor.location?.city || 'UK Location',
    address: vendor.location?.address || 'UK Location',
    currency: vendor.currency || 'GBP'
  }));

  res.status(200).json({
    success: true,
    count: formattedVendors.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    data: {
      vendors: formattedVendors
    }
  });
});

/**
 * Store location notification request (Coming Soon feature)
 */
exports.notifyWhenAvailable = asyncHandler(async (req, res) => {
  const { email, location } = req.body;

  if (!email || !location) {
    return res.status(400).json({
      success: false,
      message: 'Email and location are required'
    });
  }

  // TODO: Store in database or send to email service
  // For now, just acknowledge the request
  console.log(`Notification request: ${email} wants updates for ${location}`);

  res.status(200).json({
    success: true,
    message: 'Thank you! We\'ll notify you when we launch in your area.'
  });
});
