// =================================================================
// PICKER CONTROLLER - Authentication, Profile, Store Connections
// =================================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const PickingSession = require('../models/PickingSession');

// Register picker
exports.register = async (req, res) => {
  try {
    const { email, password, name, firstName, lastName, phone } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Normalize name
    let fName = firstName;
    let lName = lastName;
    if ((!fName || !lName) && name) {
      const parts = name.trim().split(/\s+/);
      fName = parts.shift();
      lName = parts.join(' ') || '';
    }

    if (!fName) {
      return res.status(400).json({
        success: false,
        message: 'First name required'
      });
    }

    // Create user (password will be hashed automatically by pre-save hook)
    user = new User({
      name: `${fName} ${lName || ''}`.trim(),
      firstName: fName,
      lastName: lName || '',
      email,
      password, // Will be hashed by User model middleware
      phone,
      roles: ['picker']
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, roles: user.roles, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Picker registration successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          roles: user.roles
        }
      }
    });
  } catch (error) {
    console.error('Picker registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login picker
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

    // Check if user has picker role
    if (!user.roles || !user.roles.includes('picker')) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Picker role required.'
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

    // Generate JWT
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
    console.error('Picker login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get picker profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Picker not found'
      });
    }

    // Get picker statistics
    const totalOrders = await PickingSession.countDocuments({
      picker: req.user.id,
      status: 'completed'
    });

    const activeOrders = await PickingSession.countDocuments({
      picker: req.user.id,
      status: { $in: ['assigned', 'in_progress'] }
    });

    const sessions = await PickingSession.find({ picker: req.user.id })
      .sort({ createdAt: -1 })
      .limit(10);

    const totalEarnings = sessions.reduce((sum, s) => sum + (s.earnings || 0), 0);

    const completedSessions = sessions.filter(s => s.status === 'completed');
    const avgAccuracy = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + (s.accuracy || 100), 0) / completedSessions.length
      : 100;

    res.json({
      success: true,
      data: {
        user,
        stats: {
          totalOrders,
          activeOrders,
          totalEarnings: totalEarnings.toFixed(2),
          averageAccuracy: avgAccuracy.toFixed(1)
        }
      }
    });
  } catch (error) {
    console.error('Get picker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
};

// Update picker profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Picker not found'
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
    console.error('Update picker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// Upload verification documents
exports.uploadDocuments = async (req, res) => {
  try {
    const { identityProof, addressProof, backgroundCheck } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Picker not found'
      });
    }

    // Store document URLs
    if (!user.verificationDocuments) {
      user.verificationDocuments = {};
    }

    if (identityProof) user.verificationDocuments.identityProof = identityProof;
    if (addressProof) user.verificationDocuments.addressProof = addressProof;
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

// Check in at store
exports.checkIn = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { latitude, longitude } = req.body;

    const vendor = await Vendor.findById(storeId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    const user = await User.findById(req.user.id);

    // Store check-in information
    if (!user.checkIns) {
      user.checkIns = [];
    }

    user.checkIns.push({
      vendor: storeId,
      checkInTime: new Date(),
      location: { latitude, longitude }
    });

    user.currentCheckIn = {
      vendor: storeId,
      checkInTime: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: {
        storeId,
        storeName: vendor.storeName,
        checkInTime: user.currentCheckIn.checkInTime
      }
    });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during check-in'
    });
  }
};

// Check out from store
exports.checkOut = async (req, res) => {
  try {
    const { storeId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user.currentCheckIn || user.currentCheckIn.vendor.toString() !== storeId) {
      return res.status(400).json({
        success: false,
        message: 'Not checked in at this store'
      });
    }

    const checkInTime = user.currentCheckIn.checkInTime;
    const checkOutTime = new Date();
    const duration = Math.round((checkOutTime - checkInTime) / (1000 * 60)); // minutes

    user.currentCheckIn = null;

    await user.save();

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: {
        storeId,
        checkInTime,
        checkOutTime,
        duration: `${duration} minutes`
      }
    });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during check-out'
    });
  }
};
