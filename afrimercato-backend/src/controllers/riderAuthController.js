// =================================================================
// RIDER AUTHENTICATION CONTROLLER
// =================================================================
// Handles rider registration, login, and profile management
// Per SRS Section 2.1.4.1 - Rider Registration & Account Management

const User = require('../models/User');
const Rider = require('../models/Rider');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateRiderId } = require('../utils/generateRiderId');

// =================================================================
// @route   POST /api/rider/register
// @desc    Register a new rider
// @access  Public
// =================================================================
/**
 * RIDER REGISTRATION FLOW (Per SRS 2.1.4.1):
 * 1. User provides personal info, vehicle info, service areas
 * 2. Create User account with role="rider"
 * 3. Generate unique rider ID
 * 4. Create Rider profile
 * 5. Rider can optionally enable "also picker" mode (SRS 2.1.4.1.b)
 * 6. Admin verifies documents before rider can accept deliveries
 */
exports.registerRider = asyncHandler(async (req, res) => {
  const {
    // Personal Information
    fullName,
    email,
    phone,
    password,

    // Vehicle Information
    vehicleType,
    vehiclePlate,
    vehicleColor,
    vehicleModel,

    // Service Areas (Per SRS 2.1.4.1.a)
    postcodes,
    cities,
    maxDistance,

    // Dual Role (Per SRS 2.1.4.1.b)
    isAlsoPicker,

    // Bank Details
    bankName,
    accountNumber,
    accountName,
    sortCode
  } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'A user with this email already exists',
      errorCode: 'EMAIL_EXISTS'
    });
  }

  // Validate vehicle type
  const validVehicleTypes = ['bicycle', 'motorcycle', 'car', 'van'];
  if (!validVehicleTypes.includes(vehicleType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid vehicle type. Must be: bicycle, motorcycle, car, or van',
      errorCode: 'INVALID_VEHICLE_TYPE'
    });
  }

  // Create user account
  const user = await User.create({
    name: fullName,
    email,
    password,
    phone,
    role: 'rider'
  });

  // Generate unique rider ID
  const riderId = await generateRiderId();

  // Create rider profile
  const rider = await Rider.create({
    user: user._id,
    riderId,
    fullName,
    phone,
    vehicle: {
      type: vehicleType,
      plate: vehiclePlate,
      color: vehicleColor,
      model: vehicleModel
    },
    serviceAreas: {
      postcodes: postcodes || [],
      cities: cities || [],
      maxDistance: maxDistance || 10
    },
    isAlsoPicker: isAlsoPicker || false,
    bankDetails: {
      bankName,
      accountNumber,
      accountName,
      sortCode
    }
  });

  // Generate JWT token for immediate login
  const token = user.generateAuthToken();

  res.status(201).json({
    success: true,
    message: 'Rider registration successful! Please upload your documents for verification.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      rider: {
        id: rider._id,
        riderId: rider.riderId,
        fullName: rider.fullName,
        vehicleType: rider.vehicle.type,
        isVerified: rider.isVerified,
        isAlsoPicker: rider.isAlsoPicker
      },
      token
    }
  });
});

// =================================================================
// @route   POST /api/rider/login
// @desc    Login rider
// @access  Public
// =================================================================
exports.loginRider = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user with rider role
  const user = await User.findOne({ email, role: 'rider' }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      errorCode: 'INVALID_CREDENTIALS'
    });
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
      errorCode: 'INVALID_CREDENTIALS'
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been deactivated. Please contact support.',
      errorCode: 'ACCOUNT_DEACTIVATED'
    });
  }

  // Get rider profile
  const rider = await Rider.findOne({ user: user._id });
  if (!rider) {
    return res.status(403).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'NO_RIDER_PROFILE'
    });
  }

  // Update last login
  user.lastLogin = Date.now();
  await user.save();

  // Generate tokens
  const token = user.generateAuthToken();
  const refreshToken = user.generateRefreshToken();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      rider: {
        id: rider._id,
        riderId: rider.riderId,
        fullName: rider.fullName,
        isVerified: rider.isVerified,
        isActive: rider.isActive,
        isAvailable: rider.isAvailable,
        isAlsoPicker: rider.isAlsoPicker,
        completionRate: rider.completionRate,
        averageRating: rider.performance.averageRating
      },
      token,
      refreshToken
    }
  });
});

// =================================================================
// @route   GET /api/rider/profile
// @desc    Get rider profile
// @access  Private (Rider only)
// =================================================================
exports.getRiderProfile = asyncHandler(async (req, res) => {
  const rider = await Rider.findOne({ user: req.user.id })
    .populate('user', 'name email phone')
    .populate('connectedStores.vendor', 'storeName storeId')
    .populate('pickerStores', 'storeName storeId');

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  res.json({
    success: true,
    data: {
      rider
    }
  });
});

// =================================================================
// @route   PUT /api/rider/profile
// @desc    Update rider profile
// @access  Private (Rider only)
// =================================================================
exports.updateRiderProfile = asyncHandler(async (req, res) => {
  const {
    fullName,
    phone,
    vehicleType,
    vehiclePlate,
    vehicleColor,
    vehicleModel,
    postcodes,
    cities,
    maxDistance,
    bankName,
    accountNumber,
    accountName,
    sortCode,
    notificationsEnabled,
    pushNotifications,
    emailNotifications,
    autoAcceptDeliveries,
    preferredDeliveryTime
  } = req.body;

  const rider = await Rider.findOne({ user: req.user.id });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  // Update personal info
  if (fullName) rider.fullName = fullName;
  if (phone) rider.phone = phone;

  // Update vehicle info
  if (vehicleType) rider.vehicle.type = vehicleType;
  if (vehiclePlate) rider.vehicle.plate = vehiclePlate;
  if (vehicleColor) rider.vehicle.color = vehicleColor;
  if (vehicleModel) rider.vehicle.model = vehicleModel;

  // Update service areas
  if (postcodes !== undefined) rider.serviceAreas.postcodes = postcodes;
  if (cities !== undefined) rider.serviceAreas.cities = cities;
  if (maxDistance) rider.serviceAreas.maxDistance = maxDistance;

  // Update bank details
  if (bankName) rider.bankDetails.bankName = bankName;
  if (accountNumber) rider.bankDetails.accountNumber = accountNumber;
  if (accountName) rider.bankDetails.accountName = accountName;
  if (sortCode) rider.bankDetails.sortCode = sortCode;

  // Update settings
  if (notificationsEnabled !== undefined) rider.settings.notificationsEnabled = notificationsEnabled;
  if (pushNotifications !== undefined) rider.settings.pushNotifications = pushNotifications;
  if (emailNotifications !== undefined) rider.settings.emailNotifications = emailNotifications;
  if (autoAcceptDeliveries !== undefined) rider.settings.autoAcceptDeliveries = autoAcceptDeliveries;
  if (preferredDeliveryTime) rider.settings.preferredDeliveryTime = preferredDeliveryTime;

  await rider.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      rider
    }
  });
});

// =================================================================
// @route   POST /api/rider/upload-documents
// @desc    Upload rider documents (license, insurance)
// @access  Private (Rider only)
// =================================================================
exports.uploadDocuments = asyncHandler(async (req, res) => {
  const {
    drivingLicenseUrl,
    drivingLicenseExpiry,
    insuranceUrl,
    insuranceExpiry
  } = req.body;

  const rider = await Rider.findOne({ user: req.user.id });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  // Update documents
  if (drivingLicenseUrl) {
    rider.documents.drivingLicense.url = drivingLicenseUrl;
    rider.documents.drivingLicense.expiryDate = drivingLicenseExpiry;
  }

  if (insuranceUrl) {
    rider.documents.insurance.url = insuranceUrl;
    rider.documents.insurance.expiryDate = insuranceExpiry;
  }

  await rider.save();

  res.json({
    success: true,
    message: 'Documents uploaded successfully. Awaiting admin verification.',
    data: {
      documents: rider.documents
    }
  });
});

// =================================================================
// @route   GET /api/rider/verification-status
// @desc    Check rider verification status
// @access  Private (Rider only)
// =================================================================
exports.getVerificationStatus = asyncHandler(async (req, res) => {
  const rider = await Rider.findOne({ user: req.user.id });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  res.json({
    success: true,
    data: {
      isVerified: rider.isVerified,
      verifiedAt: rider.verifiedAt,
      documents: {
        drivingLicense: {
          uploaded: !!rider.documents.drivingLicense.url,
          verified: rider.documents.drivingLicense.verified,
          expiryDate: rider.documents.drivingLicense.expiryDate
        },
        insurance: {
          uploaded: !!rider.documents.insurance.url,
          verified: rider.documents.insurance.verified,
          expiryDate: rider.documents.insurance.expiryDate
        },
        backgroundCheck: {
          status: rider.documents.backgroundCheck.status,
          completedAt: rider.documents.backgroundCheck.completedAt
        }
      }
    }
  });
});

// =================================================================
// @route   PUT /api/rider/toggle-availability
// @desc    Toggle rider availability (online/offline)
// @access  Private (Rider only)
// =================================================================
exports.toggleAvailability = asyncHandler(async (req, res) => {
  const rider = await Rider.findOne({ user: req.user.id });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  if (!rider.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'You must be verified before going online',
      errorCode: 'NOT_VERIFIED'
    });
  }

  const newStatus = await rider.toggleAvailability();

  res.json({
    success: true,
    message: `You are now ${newStatus ? 'online' : 'offline'}`,
    data: {
      isAvailable: newStatus
    }
  });
});

// =================================================================
// @route   POST /api/rider/enable-picker-mode
// @desc    Enable dual role: Rider + Picker (Per SRS 2.1.4.1.b)
// @access  Private (Rider only)
// =================================================================
exports.enablePickerMode = asyncHandler(async (req, res) => {
  const { pickerStores } = req.body; // Array of vendor IDs

  const rider = await Rider.findOne({ user: req.user.id });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  rider.isAlsoPicker = true;
  if (pickerStores && pickerStores.length > 0) {
    rider.pickerStores = pickerStores;
  }

  await rider.save();

  res.json({
    success: true,
    message: 'Picker mode enabled! You can now accept picking tasks from selected stores.',
    data: {
      isAlsoPicker: rider.isAlsoPicker,
      pickerStores: rider.pickerStores
    }
  });
});

// =================================================================
// @route   PUT /api/rider/location
// @desc    Update current location (for GPS tracking)
// @access  Private (Rider only)
// =================================================================
exports.updateLocation = asyncHandler(async (req, res) => {
  const { latitude, longitude } = req.body;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Latitude and longitude are required',
      errorCode: 'MISSING_LOCATION'
    });
  }

  const rider = await Rider.findOne({ user: req.user.id });

  if (!rider) {
    return res.status(404).json({
      success: false,
      message: 'Rider profile not found',
      errorCode: 'RIDER_NOT_FOUND'
    });
  }

  rider.currentLocation = {
    latitude,
    longitude,
    lastUpdated: new Date()
  };

  await rider.save();

  // Note: In production, this would also broadcast location via WebSocket
  // to customers tracking their deliveries in real-time

  res.json({
    success: true,
    message: 'Location updated',
    data: {
      location: rider.currentLocation
    }
  });
});
