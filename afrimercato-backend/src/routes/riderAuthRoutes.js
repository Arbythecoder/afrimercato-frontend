// =================================================================
// RIDER AUTH ROUTES
// =================================================================
// Routes for rider registration, login, and profile management

const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const User = require('../models/User');

// Public routes
router.post(
	'/register',
	[
		body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
		body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
		body('name').optional().trim(),
		body('firstName').optional().trim(),
		body('lastName').optional().trim(),
		body('phone').optional().trim()
	],
	asyncHandler(async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ success: false, errors: errors.array() });
		}

		const { email, password, name, firstName: fName, lastName: lName, phone } = req.body;

		// Check if user exists
		let user = await User.findOne ? await User.findOne({ email }) : null;
		if (user) {
			return res.status(400).json({ success: false, message: 'Email already registered' });
		}

		// Normalize name
		let firstName = fName;
		let lastName = lName;
		if ((!firstName || !lastName) && name) {
			const parts = name.trim().split(/\s+/);
			firstName = parts.shift();
			lastName = parts.join(' ') || '';
		}

		if (!firstName) {
			return res.status(400).json({ success: false, message: 'First name required' });
		}

		// Create user object (password will be hashed automatically by pre-save hook)
		user = new User({
			name: `${firstName} ${lastName || ''}`.trim(),
			firstName,
			lastName: lastName || '',
			email,
			password, // Will be hashed by User model middleware
			phone,
			roles: ['rider']
		});

		// Generate email verification token if model supports it
		if (typeof user.generateEmailVerificationToken === 'function') {
			user.generateEmailVerificationToken();
		}

		// Save user (model may implement its own save)
		if (typeof user.save === 'function') {
			await user.save();
		}

		// Create JWT token (no fallback - JWT_SECRET required)
		const token = jwt.sign(
			{ id: user._id || null, roles: user.roles },
			process.env.JWT_SECRET,
			{ expiresIn: '7d' }
		);

		res.status(201).json({
			success: true,
			message: 'Rider registration successful. Please verify email if required.',
			data: {
				token,
				user: {
					id: user._id || null,
					email: user.email,
					name: user.name,
					phone: user.phone,
					roles: user.roles
				}
			}
		});
	})
);

const riderController = require('../controllers/riderController');

// Public routes
router.post('/login', riderController.login);

// Protected routes
router.get('/profile', protect, authorize('rider'), riderController.getProfile);
router.put('/profile', protect, authorize('rider'), riderController.updateProfile);
router.post('/documents/upload', protect, authorize('rider'), riderController.uploadDocuments);
router.post('/connect-store/:storeId', protect, authorize('rider'), riderController.requestStoreConnection);
router.get('/connected-stores', protect, authorize('rider'), riderController.getConnectedStores);

module.exports = router;
