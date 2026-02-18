// =================================================================
// AUTH ROUTES - USER AUTHENTICATION
// =================================================================
// Complete implementation: login, registration, password reset for all users
// Supports JWT via Authorization header AND secure HTTP-only cookies

const express = require('express');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const router = express.Router();

const { protect } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Strict rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

// ==============================================
// POST /api/auth/register - Register new user
// ==============================================
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new customer account
 *     description: Create a new customer account with email and password. Sends verification email.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               name:
 *                 type: string
 *                 example: John Doe
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               phone:
 *                 type: string
 *                 example: +1234567890
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    // Accept either a combined `name` or separate `firstName`/`lastName`
    body('name').optional().trim(),
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('phone').optional().trim(),
  ],
  (req, res, next) => {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  authController.registerCustomer
);

// ==============================================
// POST /api/auth/login - User login
// ==============================================
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login to user account
 *     description: Authenticate user with email and password. Returns JWT token and sets HTTP-only cookie.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: customer@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  loginLimiter, // Apply rate limiting
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required')
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array(), code: 'VALIDATION_ERROR' });
    }
    next();
  },
  authController.loginUser
);

// ==============================================
// GET /api/auth/me - Get current user (alias for profile)
// ==============================================
router.get('/me', protect, authController.getMe);

// ==============================================
// GET /api/auth/profile - Get logged-in user profile
// ==============================================
router.get('/profile', protect, authController.getProfile);

// ==============================================
// PUT /api/auth/profile - Update user profile
// ==============================================
router.put(
  '/profile',
  protect,
  [
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('phone').optional().trim()
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  authController.updateProfile
);

// ==============================================
// POST /api/auth/forgot-password - Request password reset
// ==============================================
router.post(
  '/forgot-password',
  [body('email').isEmail()],
  authController.forgotPassword
);

// ==============================================
// POST /api/auth/reset-password/:token - Reset password
// ==============================================
router.post(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
  authController.resetPassword
);

// ==============================================
// POST /api/auth/verify-email - Verify email address
// ==============================================
router.post(
  '/verify-email',
  [body('token').notEmpty().withMessage('Verification token required')],
  authController.verifyEmail
);

// ==============================================
// POST /api/auth/resend-verification - Resend verification email
// ==============================================
router.post(
  '/resend-verification',
  protect,
  authController.resendVerification
);

// ==============================================
// POST /api/auth/logout - Logout user
// ==============================================
router.post('/logout', authController.logout);

// ==============================================
// POST /api/auth/refresh-token - Get new access token
// ==============================================
router.post(
  '/refresh-token',
  authController.refreshToken
);

// ==============================================
// GET /api/auth/google - Initiate Google OAuth
// ==============================================
router.get('/google', authController.googleAuthStart);

// ==============================================
// GET /api/auth/google/callback - Google OAuth callback
// ==============================================
router.get('/google/callback', authController.googleAuthCallback);

module.exports = router;
