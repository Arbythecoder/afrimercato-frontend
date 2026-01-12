// =================================================================
// VENDOR AUTHENTICATION CONTROLLER
// =================================================================
// Handles vendor registration, authentication and verification

const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/emailService');
const { generateOTP } = require('../utils/otp');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

/**
 * Generate a unique store ID
 * Format: XX-YYYY-ZZZZ
 * XX: 2 letter category code
 * YYYY: 4 digit sequential number
 * ZZZZ: 4 random characters
 */
async function generateStoreId(category) {
  // Category codes
  const categoryMap = {
    'fresh-produce': 'FP',
    'groceries': 'GR',
    'meat-fish': 'MF',
    'bakery': 'BK',
    'beverages': 'BV',
    'household': 'HH',
    'beauty-health': 'BH',
    'other': 'OT'
  };

  const prefix = categoryMap[category] || 'VD';
  const randomChars = crypto.randomBytes(2).toString('hex').toUpperCase();
  
  // Find the latest store with this prefix
  const latestVendor = await Vendor.findOne(
    { storeId: new RegExp('^' + prefix) },
    { storeId: 1 },
    { sort: { storeId: -1 } }
  );

  let sequentialNum = '0001';
  if (latestVendor) {
    const lastNum = parseInt(latestVendor.storeId.split('-')[1]);
    sequentialNum = String(lastNum + 1).padStart(4, '0');
  }

  return `${prefix}-${sequentialNum}-${randomChars}`;
}

// =================================================================
// @route   POST /api/vendor/register
// @desc    Register a new vendor
// @access  Public
// =================================================================
exports.registerVendor = asyncHandler(async (req, res) => {
  const {
    storeName,
    fullName,
    email,
    phone,
    password,
    storeDescription,
    category,
    address
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

  // Create user account
  const user = await User.create({
    name: fullName,
    email,
    password,
    phone,
    role: 'vendor'
  });

  // Generate unique store ID
  const storeId = await generateStoreId(category);

  // Create vendor profile
  const vendor = await Vendor.create({
    user: user._id,
    storeId,
    storeName,
    description: storeDescription,
    category,
    address,
    phone
  });

  // Generate email verification token
  const verificationToken = user.generateEmailVerificationToken();
  await user.save();

  // Send verification email
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify Your Vendor Account',
    template: 'vendor-verification',
    context: {
      name: fullName,
      storeName,
      storeId,
      verificationUrl
    }
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful! Please check your email to verify your account.',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      vendor: {
        id: vendor._id,
        storeId: vendor.storeId,
        storeName: vendor.storeName,
        isVerified: vendor.isVerified
      }
    }
  });
});

// =================================================================
// @route   POST /api/vendor/login
// @desc    Vendor login with MFA
// @access  Public
// =================================================================
exports.loginVendor = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email, role: 'vendor' }).select('+password');

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

  // Get vendor profile
  const vendor = await Vendor.findOne({ user: user._id });
  if (!vendor) {
    return res.status(403).json({
      success: false,
      message: 'Vendor profile not found',
      errorCode: 'NO_VENDOR_PROFILE'
    });
  }

  // Check if vendor is verified
  if (!vendor.isVerified) {
    return res.status(403).json({
      success: false,
      message: 'Your vendor account is not verified yet. Please contact support.',
      errorCode: 'VENDOR_NOT_VERIFIED'
    });
  }

  // Generate and store OTP
  const otp = generateOTP();
  user.mfaToken = await bcrypt.hash(otp, 10);
  user.mfaTokenExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  // Send OTP via email
  await sendEmail({
    to: email,
    subject: 'Your Login Verification Code',
    template: 'vendor-otp',
    context: {
      name: user.name,
      storeName: vendor.storeName,
      otp,
      validityMinutes: 10
    }
  });

  res.json({
    success: true,
    message: 'Please check your email for the verification code',
    data: {
      userId: user._id,
      requiresOTP: true
    }
  });
});

// =================================================================
// @route   POST /api/vendor/verify-otp
// @desc    Verify OTP and complete login
// @access  Public
// =================================================================
exports.verifyOTP = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findOne({
    _id: userId,
    mfaTokenExpire: { $gt: Date.now() }
  }).select('+mfaToken');

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP',
      errorCode: 'INVALID_OTP'
    });
  }

  // Verify OTP
  const isValid = await bcrypt.compare(otp, user.mfaToken);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired OTP',
      errorCode: 'INVALID_OTP'
    });
  }

  // Clear MFA data
  user.mfaToken = undefined;
  user.mfaTokenExpire = undefined;
  user.lastLogin = Date.now();
  await user.save();

  // Get vendor data
  const vendor = await Vendor.findOne({ user: user._id });

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
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      vendor: {
        id: vendor._id,
        storeId: vendor.storeId,
        storeName: vendor.storeName,
        isVerified: vendor.isVerified
      },
      token,
      refreshToken
    }
  });
});

// =================================================================
// @route   GET /api/vendor/verify-email/:token
// @desc    Verify vendor email address
// @access  Public
// =================================================================
exports.verifyVendorEmail = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // Find user with valid verification token
  const user = await User.findOne({
    emailVerificationExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token',
      errorCode: 'INVALID_VERIFICATION_TOKEN'
    });
  }

  // Verify token
  const isTokenValid = await bcrypt.compare(token, user.emailVerificationToken);
  if (!isTokenValid) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired verification token',
      errorCode: 'INVALID_VERIFICATION_TOKEN'
    });
  }

  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpire = undefined;
  await user.save();

  // Get vendor profile
  const vendor = await Vendor.findOne({ user: user._id });

  // Send notification to admin for vendor verification
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: 'New Vendor Awaiting Verification',
    template: 'admin-vendor-verification',
    context: {
      storeName: vendor.storeName,
      storeId: vendor.storeId,
      vendorName: user.name,
      vendorEmail: user.email,
      vendorPhone: user.phone
    }
  });

  res.json({
    success: true,
    message: 'Email verified successfully! Your vendor account is now pending admin verification.'
  });
});