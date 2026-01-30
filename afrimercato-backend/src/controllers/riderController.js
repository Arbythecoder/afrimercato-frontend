// =================================================================
// RIDER CONTROLLER - Authentication, Profile, Store Connections
// =================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Delivery = require('../models/Delivery');

// Login rider
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    // Find user (select password field explicitly since it's excluded by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user has rider role
    if (!user.roles || !user.roles.includes('rider')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Rider role required.'
      });
    }

    // Verify password using User model method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT (no fallback - JWT_SECRET required)
    const token = jwt.sign(
      { id: user._id, roles: user.roles, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          roles: user.roles,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('Rider login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get rider profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    // Get rider statistics
    const totalDeliveries = await Delivery.countDocuments({
      rider: req.user.id,
      status: 'delivered'
    });

    const activeDeliveries = await Delivery.countDocuments({
      rider: req.user.id,
      status: { $in: ['accepted', 'picked_up', 'in_transit'] }
    });

    const deliveries = await Delivery.find({ rider: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    const totalEarnings = deliveries.reduce((sum, d) => sum + (d.riderEarnings || 0), 0);

    const ratings = deliveries.filter(d => d.riderRating && d.riderRating.rating);
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, d) => sum + d.riderRating.rating, 0) / ratings.length
      : 0;

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalDeliveries,
          activeDeliveries,
          totalEarnings: totalEarnings.toFixed(2),
          averageRating: avgRating.toFixed(1),
          totalRatings: ratings.length
        }
      }
    });
  } catch (error) {
    console.error('Get rider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// Update rider profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          avatar: user.avatar,
          roles: user.roles
        }
      }
    });
  } catch (error) {
    console.error('Update rider profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// Upload verification documents
exports.uploadDocuments = async (req, res) => {
  try {
    const { drivingLicense, insurance, vehicleRegistration, backgroundCheck } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Rider not found'
      });
    }

    // Store document URLs (in production, these would be uploaded to cloud storage)
    if (!user.verificationDocuments) {
      user.verificationDocuments = {};
    }

    if (drivingLicense) user.verificationDocuments.drivingLicense = drivingLicense;
    if (insurance) user.verificationDocuments.insurance = insurance;
    if (vehicleRegistration) user.verificationDocuments.vehicleRegistration = vehicleRegistration;
    if (backgroundCheck) user.verificationDocuments.backgroundCheck = backgroundCheck;

    user.verificationDocuments.uploadedAt = new Date();
    user.verificationDocuments.status = 'pending';

    await user.save();

    res.json({
      success: true,
      message: 'Documents uploaded successfully. Pending admin verification.',
      data: {
        verificationDocuments: user.verificationDocuments
      }
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error uploading documents'
    });
  }
};

// Request connection with store
exports.requestStoreConnection = async (req, res) => {
  try {
    const { storeId } = req.params;

    const vendor = await Vendor.findById(storeId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user.storeConnections) {
      user.storeConnections = [];
    }

    // Check if connection already exists
    const existingConnection = user.storeConnections.find(
      c => c.vendor && c.vendor.toString() === storeId
    );

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: 'Connection request already exists'
      });
    }

    // Add connection request
    user.storeConnections.push({
      vendor: storeId,
      status: 'pending',
      requestedAt: new Date()
    });

    await user.save();

    res.json({
      success: true,
      message: 'Store connection request sent',
      data: {
        storeId,
        storeName: vendor.storeName,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Request store connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error requesting store connection'
    });
  }
};

// Get connected stores
exports.getConnectedStores = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('storeConnections.vendor');

    const connections = user.storeConnections || [];
    const connectedStores = connections
      .filter(c => c.status === 'accepted')
      .map(c => ({
        id: c.vendor._id,
        storeName: c.vendor.storeName,
        location: c.vendor.location,
        rating: c.vendor.rating,
        connectedAt: c.acceptedAt
      }));

    res.json({
      success: true,
      data: {
        stores: connectedStores,
        total: connectedStores.length
      }
    });
  } catch (error) {
    console.error('Get connected stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching connected stores'
    });
  }
};

// Get connection requests
exports.getConnectionRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('storeConnections.vendor');

    const connections = user.storeConnections || [];
    const pendingRequests = connections
      .filter(c => c.status === 'pending')
      .map(c => ({
        id: c.vendor._id,
        storeName: c.vendor.storeName,
        location: c.vendor.location,
        requestedAt: c.requestedAt
      }));

    res.json({
      success: true,
      data: {
        requests: pendingRequests,
        total: pendingRequests.length
      }
    });
  } catch (error) {
    console.error('Get connection requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching connection requests'
    });
  }
};

// Get rider earnings
exports.getEarnings = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      rider: req.user.id,
      status: 'delivered'
    };

    if (startDate || endDate) {
      query.actualDeliveryTime = {};
      if (startDate) query.actualDeliveryTime.$gte = new Date(startDate);
      if (endDate) query.actualDeliveryTime.$lte = new Date(endDate);
    }

    const deliveries = await Delivery.find(query)
      .populate('vendor', 'storeName')
      .populate('order', 'orderNumber totalAmount')
      .sort({ actualDeliveryTime: -1 });

    const totalEarnings = deliveries.reduce((sum, d) => sum + (d.riderEarnings || 0), 0);
    const totalDeliveries = deliveries.length;
    const averageEarningsPerDelivery = totalDeliveries > 0 ? totalEarnings / totalDeliveries : 0;

    const earningsByDate = deliveries.reduce((acc, d) => {
      const date = d.actualDeliveryTime.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, earnings: 0, deliveries: 0 };
      }
      acc[date].earnings += d.riderEarnings || 0;
      acc[date].deliveries += 1;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalEarnings: totalEarnings.toFixed(2),
          totalDeliveries,
          averageEarningsPerDelivery: averageEarningsPerDelivery.toFixed(2)
        },
        deliveries: deliveries.map(d => ({
          id: d._id,
          orderNumber: d.order ? d.order.orderNumber : null,
          vendor: d.vendor ? d.vendor.storeName : null,
          earnings: d.riderEarnings,
          deliveredAt: d.actualDeliveryTime,
          distance: d.distance,
          duration: d.duration
        })),
        earningsByDate: Object.values(earningsByDate)
      }
    });
  } catch (error) {
    console.error('Get rider earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching earnings'
    });
  }
};

// Get rider ratings
exports.getRatings = async (req, res) => {
  try {
    const deliveries = await Delivery.find({
      rider: req.user.id,
      'riderRating.rating': { $exists: true }
    })
      .populate('customer', 'name')
      .populate('vendor', 'storeName')
      .sort({ 'riderRating.ratedAt': -1 });

    const ratings = deliveries.map(d => ({
      id: d._id,
      rating: d.riderRating.rating,
      comment: d.riderRating.comment,
      customer: d.customer ? d.customer.name : 'Anonymous',
      vendor: d.vendor ? d.vendor.storeName : null,
      ratedAt: d.riderRating.ratedAt
    }));

    const totalRatings = ratings.length;
    const averageRating = totalRatings > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => {
      ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        summary: {
          averageRating: averageRating.toFixed(1),
          totalRatings,
          distribution: ratingDistribution
        },
        ratings
      }
    });
  } catch (error) {
    console.error('Get rider ratings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching ratings'
    });
  }
};

// Rate store
exports.rateStore = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Find a completed delivery for this store
    const delivery = await Delivery.findOne({
      rider: req.user.id,
      vendor: storeId,
      status: 'delivered'
    }).sort({ actualDeliveryTime: -1 });

    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: 'No completed deliveries found for this store'
      });
    }

    // Add vendor rating to delivery
    delivery.vendorRating = {
      rating,
      comment,
      ratedAt: new Date()
    };

    await delivery.save();

    // Update vendor's overall rating (optional)
    const vendor = await Vendor.findById(storeId);
    if (vendor) {
      const allRatings = await Delivery.find({
        vendor: storeId,
        'vendorRating.rating': { $exists: true }
      });

      if (allRatings.length > 0) {
        const avgRating = allRatings.reduce((sum, d) => sum + d.vendorRating.rating, 0) / allRatings.length;
        vendor.rating = Math.round(avgRating * 10) / 10;
        vendor.reviews = allRatings.length;
        await vendor.save();
      }
    }

    res.json({
      success: true,
      message: 'Store rated successfully',
      data: {
        rating,
        comment
      }
    });
  } catch (error) {
    console.error('Rate store error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rating store'
    });
  }
};
