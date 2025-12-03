/**
 * PICKER AUTHENTICATION CONTROLLER
 * Handles picker registration, login, profile management, and store connections
 * Pickers work INSIDE vendor stores to pick and pack orders
 */

const User = require('../models/User');
const Picker = require('../models/Picker');
const Vendor = require('../models/Vendor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { emitToUser } = require('../config/socket');

/**
 * Register new picker
 * POST /api/picker/auth/register
 */
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      equipment
    } = req.body;

    // Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, password, and phone'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters'
      });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please login or use a different email.'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user account with picker role
    const user = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      roles: ['picker'], // Multi-role array
      primaryRole: 'picker',
      role: 'picker', // Backwards compatibility
      isVerified: false // Pickers need verification
    });

    await user.save();

    // Create picker profile
    const picker = new Picker({
      user: user._id,
      profile: {
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        address: address || {},
        emergencyContact: emergencyContact || {}
      },
      equipment: {
        hasSmartphone: equipment?.hasSmartphone !== false, // Default true
        hasBarcodeScanner: equipment?.hasBarcodeScanner || false,
        hasPrinter: equipment?.hasPrinter || false
      }
    });

    await picker.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.roles, primaryRole: user.primaryRole },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Picker registration successful. Please complete verification to start working.',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          roles: user.roles,
          primaryRole: user.primaryRole
        },
        picker: {
          id: picker._id,
          verificationStatus: picker.verification.status,
          isActive: picker.isActive
        }
      }
    });

    console.log(`✅ New picker registered: ${user.email}`);
  } catch (error) {
    console.error('Picker registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

/**
 * Login picker
 * POST /api/picker/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user with password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user has picker role
    if (!user.hasRole('picker')) {
      return res.status(403).json({
        success: false,
        message: 'This account is not registered as a picker. Please use the correct login portal.'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Get picker profile
    const picker = await Picker.findOne({ user: user._id })
      .populate('connectedStores.vendorId', 'businessName address');

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker profile not found'
      });
    }

    // Check if suspended
    if (picker.isSuspended) {
      return res.status(403).json({
        success: false,
        message: `Your account is suspended. Reason: ${picker.suspensionReason || 'Contact support for details'}`
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, roles: user.roles, primaryRole: user.primaryRole },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          roles: user.roles,
          primaryRole: user.primaryRole
        },
        picker: {
          id: picker._id,
          verificationStatus: picker.verification.status,
          isActive: picker.isActive,
          isAvailable: picker.availability.isAvailable,
          currentStore: picker.availability.currentStore,
          connectedStores: picker.approvedStores.length,
          stats: picker.stats
        }
      }
    });

    console.log(`✅ Picker logged in: ${user.email}`);
  } catch (error) {
    console.error('Picker login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

/**
 * Get picker profile
 * GET /api/picker/auth/profile
 */
exports.getProfile = async (req, res) => {
  try {
    const picker = await Picker.findOne({ user: req.user._id })
      .populate('user', 'name email phone roles')
      .populate('connectedStores.vendorId', 'businessName address phone rating')
      .populate('availability.currentStore', 'businessName address');

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        picker
      }
    });
  } catch (error) {
    console.error('Get picker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

/**
 * Update picker profile
 * PUT /api/picker/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const {
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      equipment,
      paymentInfo
    } = req.body;

    const picker = await Picker.findOne({ user: req.user._id });

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker profile not found'
      });
    }

    // Update profile fields
    if (dateOfBirth) picker.profile.dateOfBirth = dateOfBirth;
    if (gender) picker.profile.gender = gender;
    if (address) picker.profile.address = { ...picker.profile.address, ...address };
    if (emergencyContact) picker.profile.emergencyContact = { ...picker.profile.emergencyContact, ...emergencyContact };
    if (equipment) picker.equipment = { ...picker.equipment, ...equipment };
    if (paymentInfo) picker.paymentInfo = { ...picker.paymentInfo, ...paymentInfo };

    await picker.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        picker
      }
    });

    console.log(`✅ Picker profile updated: ${req.user.email}`);
  } catch (error) {
    console.error('Update picker profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

/**
 * Upload verification documents
 * POST /api/picker/auth/documents
 */
exports.uploadDocuments = async (req, res) => {
  try {
    const {
      idType,
      idNumber,
      idFrontImage,
      idBackImage,
      idExpiryDate,
      foodHandlingCert,
      foodHandlingCertNumber,
      foodHandlingCertExpiry
    } = req.body;

    const picker = await Picker.findOne({ user: req.user._id });

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker profile not found'
      });
    }

    // Update ID document
    if (idType && idNumber) {
      picker.verification.idDocument = {
        type: idType,
        number: idNumber,
        frontImage: idFrontImage,
        backImage: idBackImage,
        expiryDate: idExpiryDate
      };
      picker.verification.status = 'under_review';
    }

    // Update food handling certification
    if (foodHandlingCert) {
      picker.training.foodHandling = {
        completed: true,
        certificateNumber: foodHandlingCertNumber,
        expiryDate: foodHandlingCertExpiry
      };
    }

    await picker.save();

    res.json({
      success: true,
      message: 'Documents uploaded successfully. Your application is under review.',
      data: {
        verificationStatus: picker.verification.status
      }
    });

    console.log(`📄 Documents uploaded for picker: ${req.user.email}`);
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload documents',
      error: error.message
    });
  }
};

/**
 * Request connection to vendor store
 * POST /api/picker/auth/stores/request
 */
exports.requestStoreConnection = async (req, res) => {
  try {
    const { vendorId, storeRole, sections, schedule } = req.body;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vendor ID'
      });
    }

    const picker = await Picker.findOne({ user: req.user._id });
    const vendor = await Vendor.findById(vendorId);

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker profile not found'
      });
    }

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Check if already connected
    const existingConnection = picker.connectedStores.find(
      store => store.vendorId.toString() === vendorId
    );

    if (existingConnection) {
      return res.status(400).json({
        success: false,
        message: `Connection already exists with status: ${existingConnection.status}`
      });
    }

    // Add connection request
    picker.connectedStores.push({
      vendorId,
      status: 'pending',
      storeRole: storeRole || 'picker',
      sections: sections || ['all'],
      requestedAt: new Date(),
      schedule: schedule || {}
    });

    await picker.save();

    // Notify vendor
    emitToUser(vendor.user, 'new_picker_request', {
      pickerId: picker._id,
      pickerName: req.user.name,
      storeRole: storeRole || 'picker',
      message: `${req.user.name} wants to work at your store as a ${storeRole || 'picker'}`
    });

    res.json({
      success: true,
      message: 'Connection request sent to vendor',
      data: {
        vendor: {
          id: vendor._id,
          businessName: vendor.businessName
        },
        status: 'pending'
      }
    });

    console.log(`🤝 Picker ${req.user.email} requested connection to vendor ${vendor.businessName}`);
  } catch (error) {
    console.error('Request store connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send connection request',
      error: error.message
    });
  }
};

/**
 * Get all connected stores
 * GET /api/picker/auth/stores
 */
exports.getConnectedStores = async (req, res) => {
  try {
    const { status } = req.query;

    const picker = await Picker.findOne({ user: req.user._id })
      .populate('connectedStores.vendorId', 'businessName address phone rating');

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker profile not found'
      });
    }

    let stores = picker.connectedStores;

    // Filter by status if provided
    if (status) {
      stores = stores.filter(store => store.status === status);
    }

    res.json({
      success: true,
      data: {
        stores,
        total: stores.length,
        approved: picker.approvedStores.length
      }
    });
  } catch (error) {
    console.error('Get connected stores error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch connected stores',
      error: error.message
    });
  }
};

/**
 * Check in to a store (start shift)
 * POST /api/picker/auth/checkin
 */
exports.checkIn = async (req, res) => {
  try {
    const { vendorId } = req.body;

    if (!vendorId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide vendor ID'
      });
    }

    const picker = await Picker.findOne({ user: req.user._id })
      .populate('connectedStores.vendorId', 'businessName address');

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker profile not found'
      });
    }

    // Check if approved for this store
    if (!picker.isApprovedForStore(vendorId)) {
      return res.status(403).json({
        success: false,
        message: 'You are not approved to work at this store'
      });
    }

    // Check if already checked in somewhere else
    if (picker.availability.isAvailable && picker.availability.currentStore) {
      const currentStore = picker.connectedStores.find(
        s => s.vendorId._id.toString() === picker.availability.currentStore.toString()
      );

      return res.status(400).json({
        success: false,
        message: `You are already checked in at ${currentStore?.vendorId?.businessName}. Please check out first.`
      });
    }

    // Check in
    await picker.checkIn(vendorId);

    const store = picker.getStoreConnection(vendorId);

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: {
        store: {
          vendor: store.vendorId,
          storeRole: store.storeRole,
          sections: store.sections
        },
        checkInTime: picker.availability.lastCheckIn
      }
    });

    console.log(`✅ Picker ${req.user.email} checked in at vendor ${vendorId}`);
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check in',
      error: error.message
    });
  }
};

/**
 * Check out from store (end shift)
 * POST /api/picker/auth/checkout
 */
exports.checkOut = async (req, res) => {
  try {
    const picker = await Picker.findOne({ user: req.user._id });

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker profile not found'
      });
    }

    if (!picker.availability.isAvailable || !picker.availability.currentStore) {
      return res.status(400).json({
        success: false,
        message: 'You are not currently checked in'
      });
    }

    const currentStore = picker.availability.currentStore;

    // Check out
    await picker.checkOut();

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: {
        checkOutTime: picker.availability.lastCheckOut,
        todayOrders: picker.stats.ordersPickedToday,
        todayEarnings: picker.stats.earningsThisWeek // Approximation
      }
    });

    console.log(`✅ Picker ${req.user.email} checked out from vendor ${currentStore}`);
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check out',
      error: error.message
    });
  }
};

/**
 * Get picker statistics
 * GET /api/picker/auth/stats
 */
exports.getStats = async (req, res) => {
  try {
    const picker = await Picker.findOne({ user: req.user._id })
      .populate('user', 'name email');

    if (!picker) {
      return res.status(404).json({
        success: false,
        message: 'Picker profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        picker: {
          name: picker.user.name,
          rating: picker.stats.rating,
          isAvailable: picker.availability.isAvailable
        },
        stats: picker.stats,
        performance: {
          accuracy: `${picker.stats.pickingAccuracy.toFixed(1)}%`,
          averageTime: `${picker.stats.averagePickTime.toFixed(1)} min`,
          fastestPick: `${picker.stats.fastestPick || 0} min`
        }
      }
    });
  } catch (error) {
    console.error('Get picker stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};

/**
 * Add/update additional role (e.g., add rider role to picker)
 * POST /api/picker/auth/add-role
 */
exports.addRole = async (req, res) => {
  try {
    const { role } = req.body;

    const validRoles = ['customer', 'vendor', 'rider', 'picker', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Valid roles: ${validRoles.join(', ')}`
      });
    }

    const user = await User.findById(req.user._id);

    if (user.hasRole(role)) {
      return res.status(400).json({
        success: false,
        message: `You already have the ${role} role`
      });
    }

    user.addRole(role);
    await user.save();

    res.json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} role added successfully`,
      data: {
        roles: user.roles,
        primaryRole: user.primaryRole,
        rolesString: user.getRolesString()
      }
    });

    console.log(`✅ Role '${role}' added to user ${user.email}. Now has: ${user.getRolesString()}`);
  } catch (error) {
    console.error('Add role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add role',
      error: error.message
    });
  }
};

/**
 * Switch primary role (changes default dashboard)
 * POST /api/picker/auth/switch-role
 */
exports.switchPrimaryRole = async (req, res) => {
  try {
    const { primaryRole } = req.body;

    const user = await User.findById(req.user._id);

    if (!user.hasRole(primaryRole)) {
      return res.status(400).json({
        success: false,
        message: `You don't have the ${primaryRole} role. Your roles: ${user.getRolesString()}`
      });
    }

    user.setPrimaryRole(primaryRole);
    await user.save();

    res.json({
      success: true,
      message: `Switched to ${primaryRole} dashboard`,
      data: {
        primaryRole: user.primaryRole,
        availableRoles: user.roles
      }
    });

    console.log(`✅ User ${user.email} switched to ${primaryRole} role`);
  } catch (error) {
    console.error('Switch role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to switch role',
      error: error.message
    });
  }
};

module.exports = exports;
