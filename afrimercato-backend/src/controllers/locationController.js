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
    // Geocode the search query to get lat/lng with timeout
    const geocodePromise = geocode(searchQuery);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Geocoding timeout')), 5000)
    );
    const geocoded = await Promise.race([geocodePromise, timeoutPromise]);

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

    // Build vendor query with case-insensitive city matching
    const vendorQuery = {
      isVerified: true,
      isActive: true,
      isPublic: true,
      approvalStatus: 'approved',
      'location.coordinates.coordinates': { $exists: true }, // Must have coordinates
      'location.city': new RegExp(searchQuery.trim(), 'i') // CRITICAL: Case-insensitive city search
    };

    // Add category filter if provided
    if (category) {
      vendorQuery.category = new RegExp(category, 'i');
    }

    // Find vendors within radius using geospatial query
    const radiusInMeters = radiusKm * 1000;
    const maxLimit = Math.min(parseInt(limit), 50); // Cap at 50 results
    
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
      .select('storeName description category location.city location.address phone logo rating stats.totalOrders businessHours.isOpen deliverySettings.estimatedPrepTime deliverySettings.minimumOrderValue currency')
      .limit(maxLimit)
      .maxTimeMS(8000) // 8s timeout
      .lean(); // Return plain JS objects for better performance

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

    // Handle timeout errors gracefully
    if (error.code === 50 || error.message?.includes('timeout')) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: {
          vendors: [],
          location: {
            query: searchQuery,
            normalized: null,
            found: false,
            error: 'Search timed out. Please try a different location or try again.'
          }
        }
      });
    }

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

  const maxLimit = Math.min(parseInt(limit), 100); // Cap at 100
  const skip = (parseInt(page) - 1) * maxLimit;

  try {
    const [vendors, total] = await Promise.all([
      Vendor.find(query)
        .select('storeName description category location.city location.address phone logo rating stats.totalOrders businessHours.isOpen deliverySettings.estimatedPrepTime deliverySettings.minimumOrderValue currency')
        .sort({ rating: -1, 'stats.totalOrders': -1 })
        .skip(skip)
        .limit(maxLimit)
        .maxTimeMS(8000)
        .lean(),
      Vendor.countDocuments(query).maxTimeMS(3000)
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
      pages: Math.ceil(total / maxLimit),
      data: {
        vendors: formattedVendors
      }
    });
  } catch (error) {
    console.error('[BROWSE_VENDORS_ERROR]', error.message);
    if (error.code === 50 || error.message?.includes('timeout')) {
      return res.status(200).json({
        success: true,
        count: 0,
        total: 0,
        page: 1,
        pages: 0,
        data: { vendors: [] }
      });
    }
    throw error;
  }
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
