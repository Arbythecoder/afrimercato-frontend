// =================================================================
// VENDOR-RIDER MANAGEMENT CONTROLLER
// =================================================================
// Handles vendor's management of rider connections
// Per SRS Section 2.1.4.1.a - Vendors approve/reject riders

const Vendor = require('../models/Vendor');
const Rider = require('../models/Rider');
const { asyncHandler } = require('../middleware/errorHandler');

// =================================================================
// @route   GET /api/vendor/riders/requests
// @desc    Get pending rider connection requests
// @access  Private (Vendor only)
// =================================================================
/**
 * VENDOR RECEIVES RIDER CONNECTION REQUESTS:
 * 1. Riders in vendor's area send connection requests
 * 2. Vendor sees list of pending requests
 * 3. Vendor can see rider details, ratings, vehicle info
 * 4. Vendor approves or rejects
 */
exports.getRiderRequests = asyncHandler(async (req, res) => {
  // Get vendor profile
  const vendor = await Vendor.findOne({ user: req.user.id });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'VENDOR_NOT_FOUND'
    });
  }

  // Find all riders who have pending connection requests with this vendor
  const ridersWithRequests = await Rider.find({
    'connectedStores.vendor': vendor._id,
    'connectedStores.status': 'pending'
  })
    .populate('user', 'name email phone')
    .select('riderId fullName phone vehicle serviceAreas performance documents connectedStores');

  // Format the response
  const requests = ridersWithRequests.map(rider => {
    const connection = rider.connectedStores.find(
      cs => cs.vendor.toString() === vendor._id.toString() && cs.status === 'pending'
    );

    return {
      requestId: connection._id,
      requestedAt: connection.connectedAt,
      rider: {
        id: rider._id,
        riderId: rider.riderId,
        fullName: rider.fullName,
        phone: rider.phone,
        email: rider.user.email,
        vehicle: {
          type: rider.vehicle.type,
          plate: rider.vehicle.plate,
          color: rider.vehicle.color,
          model: rider.vehicle.model
        },
        serviceAreas: rider.serviceAreas,
        performance: {
          totalDeliveries: rider.performance.totalDeliveries,
          completedDeliveries: rider.performance.completedDeliveries,
          averageRating: rider.performance.averageRating,
          onTimeDeliveryRate: rider.performance.onTimeDeliveryRate
        },
        documents: {
          drivingLicenseVerified: rider.documents.drivingLicense.verified,
          insuranceVerified: rider.documents.insurance.verified,
          backgroundCheckStatus: rider.documents.backgroundCheck.status
        },
        isAlsoPicker: rider.isAlsoPicker
      }
    };
  });

  res.json({
    success: true,
    message: `Found ${requests.length} pending rider requests`,
    data: {
      requests,
      total: requests.length
    }
  });
});

// =================================================================
// @route   POST /api/vendor/riders/:riderId/approve
// @desc    Approve rider connection request
// @access  Private (Vendor only)
// =================================================================
exports.approveRider = asyncHandler(async (req, res) => {
  const { riderId } = req.params;

  // Get vendor profile
  const vendor = await Vendor.findOne({ user: req.user.id });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'VENDOR_NOT_FOUND'
    });
  }

  // Get rider
  const rider = await Rider.findById(riderId);

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  // Find the connection
  const connection = rider.connectedStores.find(
    cs => cs.vendor.toString() === vendor._id.toString()
  );

  if (!connection) {
    return res.status(404).json({
      success: false,
      message: 'No connection request found from this rider',
      errorCode: 'REQUEST_NOT_FOUND'
    });
  }

  if (connection.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Connection request is already ${connection.status}`,
      errorCode: 'REQUEST_NOT_PENDING'
    });
  }

  // Approve the connection
  connection.status = 'approved';
  connection.approvedBy = req.user.id;
  connection.approvedAt = new Date();

  await rider.save();

  // TODO: Send notification to rider about approval

  res.json({
    success: true,
    message: `${rider.fullName} is now connected to your store`,
    data: {
      rider: {
        id: rider._id,
        riderId: rider.riderId,
        fullName: rider.fullName,
        vehicleType: rider.vehicle.type
      },
      connectionStatus: 'approved',
      approvedAt: connection.approvedAt
    }
  });
});

// =================================================================
// @route   POST /api/vendor/riders/:riderId/reject
// @desc    Reject rider connection request
// @access  Private (Vendor only)
// =================================================================
exports.rejectRider = asyncHandler(async (req, res) => {
  const { riderId } = req.params;
  const { reason } = req.body; // Optional rejection reason

  // Get vendor profile
  const vendor = await Vendor.findOne({ user: req.user.id });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'VENDOR_NOT_FOUND'
    });
  }

  // Get rider
  const rider = await Rider.findById(riderId);

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  // Find the connection
  const connection = rider.connectedStores.find(
    cs => cs.vendor.toString() === vendor._id.toString()
  );

  if (!connection) {
    return res.status(404).json({
      success: false,
      message: 'No connection request found from this rider',
      errorCode: 'REQUEST_NOT_FOUND'
    });
  }

  if (connection.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: `Connection request is already ${connection.status}`,
      errorCode: 'REQUEST_NOT_PENDING'
    });
  }

  // Reject the connection
  connection.status = 'rejected';

  await rider.save();

  // TODO: Send notification to rider about rejection

  res.json({
    success: true,
    message: `Connection request from ${rider.fullName} has been rejected`,
    data: {
      riderId: rider.riderId,
      connectionStatus: 'rejected'
    }
  });
});

// =================================================================
// @route   GET /api/vendor/riders/connected
// @desc    Get list of connected riders
// @access  Private (Vendor only)
// =================================================================
exports.getConnectedRiders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  // Get vendor profile
  const vendor = await Vendor.findOne({ user: req.user.id });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'VENDOR_NOT_FOUND'
    });
  }

  // Find all riders connected to this vendor (approved status)
  const connectedRiders = await Rider.find({
    'connectedStores.vendor': vendor._id,
    'connectedStores.status': 'approved'
  })
    .populate('user', 'name email phone')
    .select('riderId fullName phone vehicle serviceAreas performance isAvailable isAlsoPicker connectedStores')
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .sort({ 'performance.averageRating': -1 }); // Best rated first

  // Get total count
  const total = await Rider.countDocuments({
    'connectedStores.vendor': vendor._id,
    'connectedStores.status': 'approved'
  });

  // Format response
  const riders = connectedRiders.map(rider => {
    const connection = rider.connectedStores.find(
      cs => cs.vendor.toString() === vendor._id.toString() && cs.status === 'approved'
    );

    return {
      rider: {
        id: rider._id,
        riderId: rider.riderId,
        fullName: rider.fullName,
        phone: rider.phone,
        email: rider.user.email,
        vehicle: rider.vehicle,
        isAvailable: rider.isAvailable,
        isAlsoPicker: rider.isAlsoPicker,
        performance: {
          totalDeliveries: rider.performance.totalDeliveries,
          completedDeliveries: rider.performance.completedDeliveries,
          averageRating: rider.performance.averageRating,
          onTimeDeliveryRate: rider.performance.onTimeDeliveryRate,
          lastDeliveryAt: rider.performance.lastDeliveryAt
        }
      },
      connectedAt: connection.connectedAt,
      approvedAt: connection.approvedAt
    };
  });

  res.json({
    success: true,
    data: {
      riders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      summary: {
        totalConnected: total,
        currentlyAvailable: connectedRiders.filter(r => r.isAvailable).length
      }
    }
  });
});

// =================================================================
// @route   DELETE /api/vendor/riders/:riderId/remove
// @desc    Remove/disconnect a rider
// @access  Private (Vendor only)
// =================================================================
exports.removeRider = asyncHandler(async (req, res) => {
  const { riderId } = req.params;
  const { reason } = req.body; // Optional reason for removal

  // Get vendor profile
  const vendor = await Vendor.findOne({ user: req.user.id });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'VENDOR_NOT_FOUND'
    });
  }

  // Get rider
  const rider = await Rider.findById(riderId);

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  // Find the connection
  const connectionIndex = rider.connectedStores.findIndex(
    cs => cs.vendor.toString() === vendor._id.toString()
  );

  if (connectionIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Rider is not connected to your store',
      errorCode: 'NOT_CONNECTED'
    });
  }

  // Remove the connection
  rider.connectedStores.splice(connectionIndex, 1);
  await rider.save();

  // TODO: Send notification to rider about removal
  // TODO: Reassign any active deliveries from this rider

  res.json({
    success: true,
    message: `${rider.fullName} has been disconnected from your store`,
    data: {
      riderId: rider.riderId,
      reason: reason || 'No reason provided'
    }
  });
});

// =================================================================
// @route   GET /api/vendor/riders/:riderId
// @desc    Get detailed info about a specific rider
// @access  Private (Vendor only)
// =================================================================
exports.getRiderDetails = asyncHandler(async (req, res) => {
  const { riderId } = req.params;

  // Get vendor profile
  const vendor = await Vendor.findOne({ user: req.user.id });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'VENDOR_NOT_FOUND'
    });
  }

  // Get rider
  const rider = await Rider.findById(riderId)
    .populate('user', 'name email phone lastLogin')
    .populate('pickerStores', 'storeName storeId');

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  // Find connection status
  const connection = rider.connectedStores.find(
    cs => cs.vendor.toString() === vendor._id.toString()
  );

  res.json({
    success: true,
    data: {
      rider: {
        id: rider._id,
        riderId: rider.riderId,
        fullName: rider.fullName,
        email: rider.user.email,
        phone: rider.phone,
        vehicle: rider.vehicle,
        serviceAreas: rider.serviceAreas,
        isVerified: rider.isVerified,
        isActive: rider.isActive,
        isAvailable: rider.isAvailable,
        isAlsoPicker: rider.isAlsoPicker,
        pickerStores: rider.pickerStores,
        performance: rider.performance,
        earnings: {
          totalEarnings: rider.earnings.totalEarnings,
          pendingEarnings: rider.earnings.pendingEarnings
        },
        documents: {
          drivingLicense: {
            verified: rider.documents.drivingLicense.verified,
            expiryDate: rider.documents.drivingLicense.expiryDate
          },
          insurance: {
            verified: rider.documents.insurance.verified,
            expiryDate: rider.documents.insurance.expiryDate
          },
          backgroundCheck: {
            status: rider.documents.backgroundCheck.status
          }
        },
        lastLogin: rider.user.lastLogin,
        createdAt: rider.createdAt
      },
      connectionStatus: connection ? connection.status : 'not_connected',
      connectedAt: connection?.connectedAt,
      approvedAt: connection?.approvedAt
    }
  });
});

// =================================================================
// @route   GET /api/vendor/riders/available
// @desc    Get currently available riders (online and ready)
// @access  Private (Vendor only)
// =================================================================
exports.getAvailableRiders = asyncHandler(async (req, res) => {
  // Get vendor profile
  const vendor = await Vendor.findOne({ user: req.user.id });

  if (!vendor) {
    return res.status(404).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'VENDOR_NOT_FOUND'
    });
  }

  // Find riders who are:
  // 1. Connected to this vendor (approved)
  // 2. Currently available (online)
  // 3. Verified and active
  const availableRiders = await Rider.find({
    'connectedStores.vendor': vendor._id,
    'connectedStores.status': 'approved',
    isAvailable: true,
    isVerified: true,
    isActive: true
  })
    .select('riderId fullName phone vehicle performance currentLocation')
    .sort({ 'performance.averageRating': -1 }); // Best rated first

  res.json({
    success: true,
    message: `${availableRiders.length} riders available for delivery`,
    data: {
      riders: availableRiders.map(rider => ({
        id: rider._id,
        riderId: rider.riderId,
        fullName: rider.fullName,
        phone: rider.phone,
        vehicleType: rider.vehicle.type,
        averageRating: rider.performance.averageRating,
        totalDeliveries: rider.performance.totalDeliveries,
        onTimeRate: rider.performance.onTimeDeliveryRate,
        currentLocation: rider.currentLocation,
        lastLocationUpdate: rider.currentLocation?.lastUpdated
      })),
      total: availableRiders.length
    }
  });
});
