// =================================================================
// VALIDATION MIDDLEWARE
// =================================================================
// This validates user input before it reaches your route handlers
// Prevents bad data from entering your database

const { body, param, query, validationResult } = require('express-validator');

/**
 * WHY VALIDATION IS CRITICAL:
 *
 * WITHOUT VALIDATION:
 * User sends: { email: "not-an-email" }
 * Your code tries to send email → Crashes!
 *
 * WITH VALIDATION:
 * System checks: "Is this a valid email?"
 * If no → Send error message before processing
 * If yes → Continue safely
 *
 * ALSO PREVENTS:
 * - SQL injection attacks
 * - XSS (Cross-Site Scripting) attacks
 * - Invalid data corrupting your database
 */

// =================================================================
// VALIDATE MIDDLEWARE: Check Validation Results
// =================================================================
/**
 * This function runs after validation rules
 * If there are errors, it sends them back to user
 * If no errors, it lets the request continue
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors in a nice structure
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      errors: formattedErrors
    });
  }

  next();
};

// =================================================================
// REGISTRATION VALIDATION RULES
// =================================================================
/**
 * Validates user registration data
 * Checks: name, email, password, role
 */
exports.validateRegister = [
  // NAME VALIDATION
  // NAME VALIDATION - ALLOW ALL CHARACTERS
body('name')
  .trim()
  .notEmpty()
  .withMessage('Name is required')
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters'),

  // EMAIL VALIDATION
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(), // Converts to lowercase and removes dots from Gmail

  // PASSWORD VALIDATION
 // PASSWORD VALIDATION - SIMPLE VERSION
body('password')
  .notEmpty()
  .withMessage('Password is required')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters'),

// PASSWORD CONFIRMATION - OPTIONAL
body('confirmPassword')
  .optional()
  .custom((value, { req }) => !value || value === req.body.password)
  .withMessage('Passwords do not match'),

  // ROLE VALIDATION (optional)
  body('role')
    .optional()
    .isIn(['customer', 'vendor', 'rider', 'picker'])
    .withMessage('Invalid role'),

  // PHONE VALIDATION (optional)
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number format'),

  validate
];

// =================================================================
// LOGIN VALIDATION RULES
// =================================================================
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('password').notEmpty().withMessage('Password is required'),

  validate
];

// =================================================================
// PASSWORD RESET VALIDATION
// =================================================================
exports.validatePasswordReset = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  validate
];

exports.validateNewPassword = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your password')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),

  validate
];

// =================================================================
// PRODUCT VALIDATION RULES
// =================================================================
exports.validateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 200 })
    .withMessage('Product name cannot exceed 200 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn([
      'fruits',
      'vegetables',
      'grains',
      'dairy',
      'meat',
      'fish',
      'poultry',
      'bakery',
      'beverages',
      'spices',
      'snacks',
      'household',
      'beauty',
      'other'
    ])
    .withMessage('Invalid category'),

  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(['kg', 'g', 'lb', 'piece', 'bunch', 'pack', 'liter', 'ml', 'dozen'])
    .withMessage('Invalid unit'),

  body('stock')
    .notEmpty()
    .withMessage('Stock quantity is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('originalPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Original price must be a positive number'),

  validate
];

// =================================================================
// ORDER VALIDATION RULES
// =================================================================
exports.validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),

  body('items.*.product')
    .notEmpty()
    .withMessage('Product ID is required')
    .isMongoId()
    .withMessage('Invalid product ID'),

  body('items.*.quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),

  body('deliveryAddress.fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required for delivery'),

  body('deliveryAddress.phone')
    .notEmpty()
    .withMessage('Phone number is required for delivery')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number format'),

  body('deliveryAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),

  body('deliveryAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),

  body('deliveryAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),

  body('payment.method')
    .notEmpty()
    .withMessage('Payment method is required')
    .isIn(['cash', 'card', 'bank-transfer', 'mobile-money'])
    .withMessage('Invalid payment method'),

  validate
];

// =================================================================
// VENDOR PROFILE VALIDATION
// =================================================================
exports.validateVendorProfile = [
  body('storeName')
    .trim()
    .notEmpty()
    .withMessage('Store name is required')
    .isLength({ max: 100 })
    .withMessage('Store name cannot exceed 100 characters'),

  body('category')
    .notEmpty()
    .withMessage('Business category is required')
    .isIn([
      'fresh-produce',
      'groceries',
      'meat-fish',
      'bakery',
      'beverages',
      'household',
      'beauty-health',
      'snacks',
      'other'
    ])
    .withMessage('Invalid category'),

  body('address.street').trim().notEmpty().withMessage('Street address is required'),

  body('address.city').trim().notEmpty().withMessage('City is required'),

  body('address.state').trim().notEmpty().withMessage('State is required'),

  body('phone')
    .notEmpty()
    .withMessage('Business phone is required')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number format'),

  validate
];

// =================================================================
// MONGODB ID VALIDATION
// =================================================================
exports.validateMongoId = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
  validate
];

// =================================================================
// PAGINATION VALIDATION
// =================================================================
exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  validate
];

// =================================================================
// BULK OPERATION VALIDATORS (for products)
// =================================================================
exports.validateBulkDelete = [
  body('productIds')
    .isArray({ min: 1 })
    .withMessage('productIds must be a non-empty array'),
  body('productIds.*')
    .isMongoId()
    .withMessage('Each productId must be a valid MongoDB ID'),
  validate
];

exports.validateBulkStatus = [
  body('productIds')
    .isArray({ min: 1 })
    .withMessage('productIds must be a non-empty array'),
  body('productIds.*')
    .isMongoId()
    .withMessage('Each productId must be a valid MongoDB ID'),
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  validate
];

exports.validateBulkPrice = [
  body('productIds')
    .isArray({ min: 1 })
    .withMessage('productIds must be a non-empty array'),
  body('productIds.*')
    .isMongoId()
    .withMessage('Each productId must be a valid MongoDB ID'),
  body('type')
    .isIn(['fixed', 'percentage'])
    .withMessage('type must be either "fixed" or "percentage"'),
  body('value')
    .isFloat()
    .withMessage('value must be a number'),
  validate
];

exports.validateBulkStock = [
  body('productIds')
    .isArray({ min: 1 })
    .withMessage('productIds must be a non-empty array'),
  body('productIds.*')
    .isMongoId()
    .withMessage('Each productId must be a valid MongoDB ID'),
  body('type')
    .isIn(['set', 'adjust'])
    .withMessage('type must be either "set" or "adjust"'),
  body('value')
    .isFloat()
    .withMessage('value must be a number'),
  validate
];

// =================================================================
// RIDER REGISTRATION VALIDATION RULES (Per SRS 2.1.4.1)
// =================================================================
exports.validateRiderRegistration = [
  // Personal Information
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number format'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  // Vehicle Information
  body('vehicleType')
    .notEmpty()
    .withMessage('Vehicle type is required')
    .isIn(['bicycle', 'motorcycle', 'car', 'van'])
    .withMessage('Vehicle type must be: bicycle, motorcycle, car, or van'),

  body('vehiclePlate')
    .trim()
    .notEmpty()
    .withMessage('Vehicle plate number is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Vehicle plate must be between 2 and 20 characters'),

  body('vehicleColor')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Vehicle color cannot exceed 50 characters'),

  body('vehicleModel')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Vehicle model cannot exceed 50 characters'),

  // Service Areas (Per SRS 2.1.4.1.a)
  body('postcodes')
    .optional()
    .isArray()
    .withMessage('Postcodes must be an array'),

  body('postcodes.*')
    .optional()
    .trim()
    .matches(/^[A-Z]{1,2}[0-9]{1,2}[A-Z]?\s?[0-9][A-Z]{2}$/i)
    .withMessage('Invalid UK postcode format'),

  body('cities')
    .optional()
    .isArray()
    .withMessage('Cities must be an array'),

  body('cities.*')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City name must be between 2 and 100 characters'),

  body('maxDistance')
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage('Max distance must be between 1 and 100 km'),

  // Dual Role (Per SRS 2.1.4.1.b)
  body('isAlsoPicker')
    .optional()
    .isBoolean()
    .withMessage('isAlsoPicker must be a boolean'),

  // Bank Details
  body('bankName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Bank name cannot exceed 100 characters'),

  body('accountNumber')
    .optional()
    .trim()
    .matches(/^[0-9]{8,20}$/)
    .withMessage('Invalid account number format'),

  body('accountName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Account name cannot exceed 100 characters'),

  body('sortCode')
    .optional()
    .trim()
    .matches(/^[0-9]{6}$/)
    .withMessage('Sort code must be 6 digits'),

  validate
];

// =================================================================
// RIDER PROFILE UPDATE VALIDATION
// =================================================================
exports.validateRiderProfileUpdate = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),

  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Invalid phone number format'),

  body('vehicleType')
    .optional()
    .isIn(['bicycle', 'motorcycle', 'car', 'van'])
    .withMessage('Vehicle type must be: bicycle, motorcycle, car, or van'),

  body('vehiclePlate')
    .optional()
    .trim()
    .isLength({ min: 2, max: 20 })
    .withMessage('Vehicle plate must be between 2 and 20 characters'),

  body('vehicleColor')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Vehicle color cannot exceed 50 characters'),

  body('vehicleModel')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Vehicle model cannot exceed 50 characters'),

  body('postcodes')
    .optional()
    .isArray()
    .withMessage('Postcodes must be an array'),

  body('cities')
    .optional()
    .isArray()
    .withMessage('Cities must be an array'),

  body('maxDistance')
    .optional()
    .isFloat({ min: 1, max: 100 })
    .withMessage('Max distance must be between 1 and 100 km'),

  body('notificationsEnabled')
    .optional()
    .isBoolean()
    .withMessage('notificationsEnabled must be a boolean'),

  body('pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('pushNotifications must be a boolean'),

  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('emailNotifications must be a boolean'),

  body('autoAcceptDeliveries')
    .optional()
    .isBoolean()
    .withMessage('autoAcceptDeliveries must be a boolean'),

  validate
];

// =================================================================
// DOCUMENT UPLOAD VALIDATION
// =================================================================
exports.validateDocumentUpload = [
  body('drivingLicenseUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Driving license URL must be a valid URL'),

  body('drivingLicenseExpiry')
    .optional()
    .isISO8601()
    .withMessage('Driving license expiry must be a valid date'),

  body('insuranceUrl')
    .optional()
    .trim()
    .isURL()
    .withMessage('Insurance URL must be a valid URL'),

  body('insuranceExpiry')
    .optional()
    .isISO8601()
    .withMessage('Insurance expiry must be a valid date'),

  validate
];

// =================================================================
// LOCATION UPDATE VALIDATION (For GPS tracking)
// =================================================================
exports.validateLocation = [
  body('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  validate
];

// Export the validate function for custom use
exports.validate = validate;
