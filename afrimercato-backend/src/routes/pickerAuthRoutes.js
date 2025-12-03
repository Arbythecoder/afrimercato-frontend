/**
 * PICKER AUTHENTICATION ROUTES
 * Registration, login, profile management, store connections
 */

const express = require('express');
const router = express.Router();
const pickerAuthController = require('../controllers/pickerAuthController');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');

// ======================
// VALIDATION MIDDLEWARE
// ======================

const registerValidation = [
  body('name').notEmpty().trim().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
  body('phone').notEmpty().withMessage('Phone number is required')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// ======================
// PUBLIC ROUTES (No Authentication Required)
// ======================

/**
 * Register new picker
 * POST /api/picker/auth/register
 * Body: {name, email, password, confirmPassword, phone, dateOfBirth, gender, address, emergencyContact, equipment}
 */
router.post('/register', registerValidation, pickerAuthController.register);

/**
 * Login picker
 * POST /api/picker/auth/login
 * Body: {email, password}
 */
router.post('/login', loginValidation, pickerAuthController.login);

// ======================
// PROTECTED ROUTES (Authentication Required)
// ======================
router.use(protect); // All routes below require authentication
router.use(authorize('picker')); // Must have picker role

/**
 * Get picker profile
 * GET /api/picker/auth/profile
 */
router.get('/profile', pickerAuthController.getProfile);

/**
 * Update picker profile
 * PUT /api/picker/auth/profile
 * Body: {dateOfBirth, gender, address, emergencyContact, equipment, paymentInfo}
 */
router.put('/profile', pickerAuthController.updateProfile);

/**
 * Upload verification documents
 * POST /api/picker/auth/documents
 * Body: {idType, idNumber, idFrontImage, idBackImage, idExpiryDate, foodHandlingCert, etc}
 */
router.post('/documents', pickerAuthController.uploadDocuments);

/**
 * Request connection to vendor store
 * POST /api/picker/auth/stores/request
 * Body: {vendorId, storeRole, sections, schedule}
 */
router.post('/stores/request', pickerAuthController.requestStoreConnection);

/**
 * Get all connected stores
 * GET /api/picker/auth/stores?status=approved
 */
router.get('/stores', pickerAuthController.getConnectedStores);

/**
 * Check in to store (start shift)
 * POST /api/picker/auth/checkin
 * Body: {vendorId}
 */
router.post('/checkin', pickerAuthController.checkIn);

/**
 * Check out from store (end shift)
 * POST /api/picker/auth/checkout
 */
router.post('/checkout', pickerAuthController.checkOut);

/**
 * Get picker statistics
 * GET /api/picker/auth/stats
 */
router.get('/stats', pickerAuthController.getStats);

/**
 * Add additional role (e.g., add rider role to existing picker)
 * POST /api/picker/auth/add-role
 * Body: {role: 'rider'}
 */
router.post('/add-role', pickerAuthController.addRole);

/**
 * Switch primary role (change default dashboard)
 * POST /api/picker/auth/switch-role
 * Body: {primaryRole: 'rider'}
 */
router.post('/switch-role', pickerAuthController.switchPrimaryRole);

module.exports = router;
