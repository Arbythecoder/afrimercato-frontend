// =================================================================
// RIDER AUTHENTICATION ROUTES
// =================================================================
// Routes for rider registration, login, and profile management
// Per SRS Section 2.1.4.1 - Rider Registration & Account Management

const express = require('express');
const router = express.Router();

// Import controllers
const {
  registerRider,
  loginRider,
  getRiderProfile,
  updateRiderProfile,
  uploadDocuments,
  getVerificationStatus,
  toggleAvailability,
  enablePickerMode,
  updateLocation
} = require('../controllers/riderAuthController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');
const {
  validateRiderRegistration,
  validateLogin,
  validateRiderProfileUpdate,
  validateDocumentUpload,
  validateLocation
} = require('../middleware/validator');

/**
 * ROUTE STRUCTURE:
 *
 * Public Routes (No authentication):
 * - POST /api/rider/auth/register - Register new rider
 * - POST /api/rider/auth/login - Login rider
 *
 * Protected Routes (Require authentication + rider role):
 * - GET /api/rider/auth/profile - Get profile
 * - PUT /api/rider/auth/profile - Update profile
 * - POST /api/rider/auth/documents - Upload documents
 * - GET /api/rider/auth/verification - Check verification status
 * - PUT /api/rider/auth/availability - Toggle online/offline
 * - POST /api/rider/auth/picker-mode - Enable dual role
 * - PUT /api/rider/auth/location - Update GPS location
 */

// =================================================================
// PUBLIC ROUTES (No authentication required)
// =================================================================

// @route   POST /api/rider/auth/register
// @desc    Register a new rider
// @access  Public
router.post('/register', validateRiderRegistration, registerRider);

// @route   POST /api/rider/auth/login
// @desc    Login rider
// @access  Public
router.post('/login', validateLogin, loginRider);

// =================================================================
// PROTECTED ROUTES (Authentication + Rider role required)
// =================================================================
// All routes below require:
// 1. Valid JWT token (protect middleware)
// 2. User role = 'rider' (authorize middleware)

router.use(protect, authorize('rider'));

// @route   GET /api/rider/auth/profile
// @desc    Get rider profile
// @access  Private (Rider only)
router.get('/profile', getRiderProfile);

// @route   PUT /api/rider/auth/profile
// @desc    Update rider profile
// @access  Private (Rider only)
router.put('/profile', validateRiderProfileUpdate, updateRiderProfile);

// @route   POST /api/rider/auth/documents
// @desc    Upload rider documents (license, insurance)
// @access  Private (Rider only)
router.post('/documents', validateDocumentUpload, uploadDocuments);

// @route   GET /api/rider/auth/verification
// @desc    Check rider verification status
// @access  Private (Rider only)
router.get('/verification', getVerificationStatus);

// @route   PUT /api/rider/auth/availability
// @desc    Toggle rider availability (online/offline)
// @access  Private (Rider only)
router.put('/availability', toggleAvailability);

// @route   POST /api/rider/auth/picker-mode
// @desc    Enable dual role: Rider + Picker (Per SRS 2.1.4.1.b)
// @access  Private (Rider only)
router.post('/picker-mode', enablePickerMode);

// @route   PUT /api/rider/auth/location
// @desc    Update current GPS location
// @access  Private (Rider only)
router.put('/location', validateLocation, updateLocation);

module.exports = router;
