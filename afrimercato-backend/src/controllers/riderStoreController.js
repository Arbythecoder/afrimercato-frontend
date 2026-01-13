// =================================================================
// RIDER-STORE CONNECTION CONTROLLER
// =================================================================
// Handles rider connections with stores in their service area
// Per SRS Section 2.1.4.1.a - "Connect with stores in location"

const Rider = require('../models/Rider');
const Vendor = require('../models/Vendor');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendVendorRiderRequestEmail } = require('../utils/emailService');

// =================================================================
// @route   GET /api/rider/stores/nearby
// @desc    Find stores in rider's service area (Per SRS 2.1.4.1.a)
// @access  Private (Rider only)
// =================================================================
/**
 * HOW IT WORKS:
 * 1. Get rider's service areas (postcodes & cities)
 * 2. Search for vendors in those areas
 * 3. Show stores that are verified and active
 * 4. Show connection status (not connected, pending, connected)
 */
exports.getNearbyStores = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, category } = req.query;

  // Get rider profile
  const rider = await Rider.findOne({ user: req.user.id });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  // Build search query based on rider's service areas
  const searchQuery = {
    isVerified: true,
    isActive: true
  };

  // Search by postcodes or cities
  if (rider.serviceAreas.postcodes.length > 0 || rider.serviceAreas.cities.length > 0) {
    searchQuery.$or = [];

    // Match postcodes (prefix match for flexibility)
    if (rider.serviceAreas.postcodes.length > 0) {
      const postcodePatterns = rider.serviceAreas.postcodes.map(pc =>
        new RegExp(`^${pc.split(' ')[0]}`, 'i')
      );

      searchQuery.$or.push({
        'address.postcode': { $in: postcodePatterns }
      });
    }

    // Match cities
    if (rider.serviceAreas.cities.length > 0) {
      const cityPatterns = rider.serviceAreas.cities.map(city =>
        new RegExp(city, 'i')
      );

      searchQuery.$or.push({
        'address.city': { $in: cityPatterns }
      });
    }
  }

  // Filter by category if provided
  if (category) {
    searchQuery.category = category;
  }

  // Pagination
  const skip = (page - 1) * limit;

  // Find stores
  const stores = await Vendor.find(searchQuery)
    .populate('user', 'name email')
    .select('storeId storeName category description address phone statistics')
    .sort({ 'statistics.totalOrders': -1 }) // Popular stores first
    .skip(skip)
    .limit(parseInt(limit));

  // Get total count
  const total = await Vendor.countDocuments(searchQuery);

  // Add connection status for each store
  const storesWithStatus = stores.map(store => {
    const connection = rider.connectedStores.find(
      cs => cs.vendor.toString() === store._id.toString()
    );

    return {
      ...store.toObject(),
      connectionStatus: connection ? connection.status : 'not_connected'
    };
  });

  res.json({
    success: true,
    message: `Found ${stores.length} stores in your area`,
    data: {
      stores: storesWithStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      riderServiceAreas: {
        postcodes: rider.serviceAreas.postcodes,
        cities: rider.serviceAreas.cities
      }
    }
  });
});

// =================================================================
// @route   POST /api/rider/stores/:vendorId/connect
// @desc    Request connection with a store (Per SRS 2.1.4.1.a)
// @access  Private (Rider only)
// =================================================================
/**
 * CONNECTION REQUEST FLOW:
 * 1. Rider finds a store in their area
 * 2. Rider sends connection request
 * 3. Request is added to rider's connectedStores (status: pending)
 * 4. Vendor receives notification
 * 5. Vendor approves/rejects
 * 6. Rider can accept deliveries from approved stores
 */
exports.requestConnection = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { message } = req.body; // Optional message to vendor

  // Get rider profile
  const rider = await Rider.findOne({ user: req.user.id });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  // Check if rider is verified
  if (!rider.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'You must be verified before connecting with stores',
      errorCode: 'RIDER_NOT_VERIFIED'
    });
  }

  // Get vendor/store
  const vendor = await Vendor.findById(vendorId);

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Store not found',
      errorCode: 'STORE_NOT_FOUND'
    });
  }

  // Check if store is verified and active
  if (!vendor.isVerified || !vendor.isActive) {
    return res.status(400).json({
      success: false,
      message: 'This store is not accepting rider connections',
      errorCode: 'STORE_NOT_AVAILABLE'
    });
  }

  // Check if rider is in store's service area
  const isInServiceArea = rider.isInServiceArea(
    vendor.address.postcode,
    vendor.address.city
  );

  if (!isInServiceArea) {
    return res.status(400).json({
      success: false,
      message: 'This store is outside your service area',
      errorCode: 'OUTSIDE_SERVICE_AREA',
      storeLocation: {
        postcode: vendor.address.postcode,
        city: vendor.address.city
      },
      yourServiceAreas: {
        postcodes: rider.serviceAreas.postcodes,
        cities: rider.serviceAreas.cities
      }
    });
  }

  // Check if connection already exists
  const existingConnection = rider.connectedStores.find(
    cs => cs.vendor.toString() === vendorId
  );

  if (existingConnection) {
    if (existingConnection.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'You are already connected to this store',
        errorCode: 'ALREADY_CONNECTED'
      });
    } else if (existingConnection.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'You have a pending connection request with this store',
        errorCode: 'REQUEST_PENDING'
      });
    } else if (existingConnection.status === 'rejected') {
      // Allow re-request after rejection
      existingConnection.status = 'pending';
      existingConnection.connectedAt = new Date();
    }
  } else {
    // Add new connection request
    rider.connectedStores.push({
      vendor: vendorId,
      status: 'pending',
      connectedAt: new Date()
    });
  }

  await rider.save();

  // Send notification to vendor about new connection request
  const vendorUser = await User.findById(vendor.user);
  if (vendorUser) {
    await sendVendorRiderRequestEmail(vendorUser.email, vendor.storeName, rider.fullName);
  }

  res.status(201).json({
    success: true,
    message: `Connection request sent to ${vendor.storeName}. Waiting for approval.`,
    data: {
      store: {
        id: vendor._id,
        storeId: vendor.storeId,
        storeName: vendor.storeName,
        category: vendor.category
      },
      connectionStatus: 'pending',
      requestedAt: new Date()
    }
  });
});

// =================================================================
// @route   GET /api/rider/stores/connected
// @desc    Get list of connected stores
// @access  Private (Rider only)
// =================================================================
exports.getConnectedStores = asyncHandler(async (req, res) => {
  const { status } = req.query; // Filter by status: pending, approved, rejected

  const rider = await Rider.findOne({ user: req.user.id })
    .populate({
      path: 'connectedStores.vendor',
      select: 'storeId storeName category address phone statistics'
    });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  // Filter connections by status if provided
  let connections = rider.connectedStores;

  if (status && ['pending', 'approved', 'rejected'].includes(status)) {
    connections = connections.filter(cs => cs.status === status);
  }

  // Format response
  const formattedConnections = connections.map(cs => ({
    connectionId: cs._id,
    status: cs.status,
    connectedAt: cs.connectedAt,
    approvedAt: cs.approvedAt,
    store: cs.vendor ? {
      id: cs.vendor._id,
      storeId: cs.vendor.storeId,
      storeName: cs.vendor.storeName,
      category: cs.vendor.category,
      address: cs.vendor.address,
      phone: cs.vendor.phone,
      totalOrders: cs.vendor.statistics?.totalOrders || 0
    } : null
  }));

  res.json({
    success: true,
    data: {
      stores: formattedConnections,
      summary: {
        total: connections.length,
        pending: rider.connectedStores.filter(cs => cs.status === 'pending').length,
        approved: rider.connectedStores.filter(cs => cs.status === 'approved').length,
        rejected: rider.connectedStores.filter(cs => cs.status === 'rejected').length
      }
    }
  });
});

// =================================================================
// @route   DELETE /api/rider/stores/:vendorId/disconnect
// @desc    Disconnect from a store
// @access  Private (Rider only)
// =================================================================
exports.disconnectFromStore = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const rider = await Rider.findOne({ user: req.user.id });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  // Find the connection
  const connectionIndex = rider.connectedStores.findIndex(
    cs => cs.vendor.toString() === vendorId
  );

  if (connectionIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'No connection found with this store',
      errorCode: 'CONNECTION_NOT_FOUND'
    });
  }

  // Get store name before removing
  const vendor = await Vendor.findById(vendorId).select('storeName');

  // Remove the connection
  rider.connectedStores.splice(connectionIndex, 1);
  await rider.save();

  res.json({
    success: true,
    message: `Disconnected from ${vendor?.storeName || 'store'}`,
    data: {
      remainingConnections: rider.connectedStores.length
    }
  });
});

// =================================================================
// @route   GET /api/rider/stores/:vendorId
// @desc    Get detailed info about a specific store
// @access  Private (Rider only)
// =================================================================
exports.getStoreDetails = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  // Get rider to check connection status
  const rider = await Rider.findOne({ user: req.user.id });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  // Get vendor/store
  const vendor = await Vendor.findById(vendorId)
    .populate('user', 'name email phone')
    .select('-bankDetails'); // Don't expose bank details

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Store not found',
      errorCode: 'STORE_NOT_FOUND'
    });
  }

  // Check connection status
  const connection = rider.connectedStores.find(
    cs => cs.vendor.toString() === vendorId
  );

  res.json({
    success: true,
    data: {
      store: vendor,
      connectionStatus: connection ? connection.status : 'not_connected',
      connectedAt: connection?.connectedAt,
      approvedAt: connection?.approvedAt,
      isInYourServiceArea: rider.isInServiceArea(
        vendor.address.postcode,
        vendor.address.city
      )
    }
  });
});

// =================================================================
// @route   POST /api/rider/stores/:vendorId/cancel-request
// @desc    Cancel a pending connection request
// @access  Private (Rider only)
// =================================================================
exports.cancelConnectionRequest = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const rider = await Rider.findOne({ user: req.user.id });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  // Find the connection
  const connection = rider.connectedStores.find(
    cs => cs.vendor.toString() === vendorId
  );

  if (!connection) {
    return res.status(404).json({
      success: false,
      message: 'No connection request found',
      errorCode: 'REQUEST_NOT_FOUND'
    });
  }

  if (connection.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Cannot cancel request with status: ${connection.status}`,
      errorCode: 'CANNOT_CANCEL'
    });
  }

  // Remove the pending request
  rider.connectedStores = rider.connectedStores.filter(
    cs => cs.vendor.toString() !== vendorId
  );

  await rider.save();

  res.json({
    success: true,
    message: 'Connection request cancelled'
  });
});
