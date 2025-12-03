// =================================================================
// LOCATION SEARCH CONTROLLER - Uber Eats/Just Eat Style
// =================================================================
// Handles location-based vendor discovery
// Search by: City, Postcode, Address, or Coordinates

const Vendor = require('../models/Vendor');
const { geocodeAddress, calculateDistance, getBoundingBox, getLocationFromIP } = require('../utils/geocoding');
const { validatePostcode } = require('../utils/geolocation');

// =================================================================
// SEARCH VENDORS BY LOCATION
// =================================================================

/**
 * Search vendors near a location (city, postcode, or address)
 * GET /api/location/search-vendors
 * Query params: location, latitude, longitude, radius, category, sort
 */
exports.searchVendorsByLocation = async (req, res) => {
  try {
    const {
      location, // e.g., "Bristol UK", "SW1A 1AA"
      latitude,
      longitude,
      radius = 10, // Default 10km radius
      category,
      minRating,
      maxDeliveryFee,
      isOpen, // Filter by currently open stores
      sort = 'distance', // distance, rating, deliveryFee
      page = 1,
      limit = 20
    } = req.query;

    let searchLat, searchLng;

    // Option 1: Search by text location (city, postcode, address)
    if (location) {
      const geocoded = await geocodeAddress(location);

      if (!geocoded.success || !geocoded.primaryResult) {
        return res.status(404).json({
          success: false,
          message: 'Location not found. Please try a different search term.',
          suggestion: 'Try searching for a city name, postcode, or full address'
        });
      }

      searchLat = geocoded.primaryResult.latitude;
      searchLng = geocoded.primaryResult.longitude;

      console.log(`📍 Location search: "${location}" → [${searchLat}, ${searchLng}]`);

    }
    // Option 2: Search by coordinates (user's GPS location)
    else if (latitude && longitude) {
      searchLat = parseFloat(latitude);
      searchLng = parseFloat(longitude);

      if (isNaN(searchLat) || isNaN(searchLng)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid coordinates provided'
        });
      }
    }
    // Option 3: No location provided
    else {
      return res.status(400).json({
        success: false,
        message: 'Please provide either location (text) or coordinates (lat/lng)'
      });
    }

    // Build query filters - ONLY show approved vendors
    const filters = {
      isActive: true,
      approvalStatus: 'approved', // Admin must approve before store is visible
      'address.coordinates.latitude': { $exists: true },
      'address.coordinates.longitude': { $exists: true }
    };

    // Filter by category
    if (category && category !== 'all') {
      filters.category = category;
    }

    // Filter by minimum rating
    if (minRating) {
      filters.rating = { $gte: parseFloat(minRating) };
    }

    // Filter by max delivery fee
    if (maxDeliveryFee) {
      filters.deliveryFee = { $lte: parseFloat(maxDeliveryFee) };
    }

    // Fetch all matching vendors
    const vendors = await Vendor.find(filters)
      .select('storeName description logo category rating reviewCount deliveryFee freeDeliveryAbove address businessHours isClosed')
      .populate('user', 'name email')
      .lean();

    // Calculate distance for each vendor and filter by radius
    const vendorsWithDistance = vendors
      .map(vendor => {
        const vendorLat = vendor.address?.coordinates?.latitude;
        const vendorLng = vendor.address?.coordinates?.longitude;

        if (!vendorLat || !vendorLng) return null;

        const distance = calculateDistance(
          searchLat,
          searchLng,
          vendorLat,
          vendorLng,
          'km'
        );

        // Filter out vendors outside radius
        if (distance > parseFloat(radius)) return null;

        return {
          ...vendor,
          distance: distance,
          distanceDisplay: distance < 1
            ? `${Math.round(distance * 1000)}m`
            : `${distance.toFixed(1)}km`,
          isCurrentlyOpen: checkIfOpen(vendor),
          coordinates: {
            latitude: vendorLat,
            longitude: vendorLng
          }
        };
      })
      .filter(v => v !== null); // Remove vendors outside radius

    // Filter by "open now" if requested
    let filteredVendors = vendorsWithDistance;
    if (isOpen === 'true') {
      filteredVendors = vendorsWithDistance.filter(v => v.isCurrentlyOpen);
    }

    // Sort vendors
    switch (sort) {
      case 'distance':
        filteredVendors.sort((a, b) => a.distance - b.distance);
        break;
      case 'rating':
        filteredVendors.sort((a, b) => b.rating - a.rating);
        break;
      case 'deliveryFee':
        filteredVendors.sort((a, b) => a.deliveryFee - b.deliveryFee);
        break;
      case 'popular':
        filteredVendors.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        filteredVendors.sort((a, b) => a.distance - b.distance);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedVendors = filteredVendors.slice(startIndex, endIndex);

    // Response
    res.status(200).json({
      success: true,
      count: paginatedVendors.length,
      total: filteredVendors.length,
      page: parseInt(page),
      pages: Math.ceil(filteredVendors.length / limit),
      searchLocation: {
        query: location || `${latitude}, ${longitude}`,
        coordinates: {
          latitude: searchLat,
          longitude: searchLng
        }
      },
      filters: {
        radius: parseFloat(radius),
        radiusUnit: 'km',
        category: category || 'all',
        minRating: minRating || 'any',
        maxDeliveryFee: maxDeliveryFee || 'any',
        openNow: isOpen === 'true'
      },
      vendors: paginatedVendors
    });

  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching vendors by location',
      error: error.message
    });
  }
};

// =================================================================
// GEOCODE ADDRESS/POSTCODE
// =================================================================

/**
 * Convert address or postcode to coordinates
 * GET /api/location/geocode
 * Query params: query (address/postcode)
 */
exports.geocodeLocation = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a location to search'
      });
    }

    // First try postcode validation (UK/Ireland)
    const postcodeValidation = validatePostcode(query);

    if (postcodeValidation.valid) {
      // Valid UK/Ireland postcode - geocode it
      const geocoded = await geocodeAddress(query);

      return res.status(200).json({
        success: true,
        postcodeInfo: postcodeValidation,
        ...geocoded
      });
    }

    // Not a valid postcode - try general geocoding
    const geocoded = await geocodeAddress(query);

    if (!geocoded.success) {
      return res.status(404).json(geocoded);
    }

    res.status(200).json(geocoded);

  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({
      success: false,
      message: 'Error geocoding location',
      error: error.message
    });
  }
};

// =================================================================
// DETECT USER LOCATION (IP-BASED)
// =================================================================

/**
 * Detect user's location from IP address
 * GET /api/location/detect
 */
exports.detectUserLocation = async (req, res) => {
  try {
    // Get user's IP address
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.ip;

    console.log('Detecting location for IP:', ipAddress);

    const location = await getLocationFromIP(ipAddress);

    if (!location.success) {
      return res.status(404).json({
        success: false,
        message: 'Unable to detect your location. Please search manually.',
        fallback: {
          city: 'London',
          country: 'United Kingdom'
        }
      });
    }

    res.status(200).json({
      success: true,
      detected: true,
      ...location
    });

  } catch (error) {
    console.error('IP location detection error:', error);
    res.status(500).json({
      success: false,
      message: 'Error detecting location',
      error: error.message
    });
  }
};

// =================================================================
// GET VENDOR BY STOREFRONT SLUG/ID
// =================================================================

/**
 * Get individual vendor storefront
 * GET /api/location/vendor/:storeId
 */
exports.getVendorStorefront = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { userLat, userLng } = req.query;

    const vendor = await Vendor.findOne({
      $or: [
        { storeId: storeId },
        { _id: storeId }
      ],
      isActive: true,
      approvalStatus: 'approved' // Only show approved stores
    })
      .populate('user', 'name email phone')
      .lean();

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found or inactive'
      });
    }

    // Calculate distance if user location provided
    let distance = null;
    if (userLat && userLng && vendor.address?.coordinates) {
      distance = calculateDistance(
        parseFloat(userLat),
        parseFloat(userLng),
        vendor.address.coordinates.latitude,
        vendor.address.coordinates.longitude,
        'km'
      );
    }

    // Get vendor's products count (with error handling)
    let productsCount = 0;
    try {
      const Product = require('../models/Product');
      productsCount = await Product.countDocuments({
        vendor: vendor._id,
        isActive: true,
        inStock: true
      });
    } catch (productError) {
      console.error('Error counting products:', productError);
      // Continue without product count
    }

    res.status(200).json({
      success: true,
      vendor: {
        ...vendor,
        distance: distance,
        distanceDisplay: distance
          ? distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`
          : null,
        isCurrentlyOpen: checkIfOpen(vendor),
        productsCount
      }
    });

  } catch (error) {
    console.error('Get vendor error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor details',
      error: error.message
    });
  }
};

// =================================================================
// GET CATEGORIES WITH VENDOR COUNTS
// =================================================================

/**
 * Get all categories with vendor counts for a location
 * GET /api/location/categories
 */
exports.getCategoriesWithCounts = async (req, res) => {
  try {
    const { latitude, longitude, radius = 20 } = req.query;

    if (!latitude || !longitude) {
      // Return all categories without location filter
      const categories = await Vendor.aggregate([
        {
          $match: {
            isActive: true,
            approvalStatus: 'approved'
          }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgRating: { $avg: '$rating' }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);

      return res.status(200).json({
        success: true,
        categories: categories.map(cat => ({
          category: cat._id,
          vendorCount: cat.count,
          averageRating: cat.avgRating ? cat.avgRating.toFixed(1) : '0.0'
        }))
      });
    }

    // With location - filter by proximity
    const vendors = await Vendor.find({
      isActive: true,
      approvalStatus: 'approved',
      'address.coordinates.latitude': { $exists: true },
      'address.coordinates.longitude': { $exists: true }
    }).select('category address.coordinates rating').lean();

    const searchLat = parseFloat(latitude);
    const searchLng = parseFloat(longitude);

    // Filter by distance and count by category
    const categoryCounts = {};

    vendors.forEach(vendor => {
      const vendorLat = vendor.address?.coordinates?.latitude;
      const vendorLng = vendor.address?.coordinates?.longitude;

      if (!vendorLat || !vendorLng) return;

      const distance = calculateDistance(searchLat, searchLng, vendorLat, vendorLng, 'km');

      if (distance <= parseFloat(radius)) {
        if (!categoryCounts[vendor.category]) {
          categoryCounts[vendor.category] = {
            count: 0,
            totalRating: 0,
            ratingCount: 0
          };
        }
        categoryCounts[vendor.category].count++;
        if (vendor.rating) {
          categoryCounts[vendor.category].totalRating += vendor.rating;
          categoryCounts[vendor.category].ratingCount++;
        }
      }
    });

    const categories = Object.keys(categoryCounts).map(category => ({
      category,
      vendorCount: categoryCounts[category].count,
      averageRating: categoryCounts[category].ratingCount > 0
        ? (categoryCounts[category].totalRating / categoryCounts[category].ratingCount).toFixed(1)
        : '0.0'
    })).sort((a, b) => b.vendorCount - a.vendorCount);

    res.status(200).json({
      success: true,
      location: { latitude: searchLat, longitude: searchLng, radius: parseFloat(radius) },
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// =================================================================
// HELPER FUNCTIONS
// =================================================================

/**
 * Check if vendor is currently open
 * @param {object} vendor - Vendor object
 * @returns {boolean} True if open now
 */
function checkIfOpen(vendor) {
  if (vendor.isClosed) return false;

  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  const todayHours = vendor.businessHours?.[day];

  if (!todayHours || !todayHours.isOpen) return false;

  return currentTime >= todayHours.open && currentTime <= todayHours.close;
}

module.exports = exports;
