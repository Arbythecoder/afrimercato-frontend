// =================================================================
// ERROR HANDLING MIDDLEWARE
// =================================================================
// This catches all errors and sends nice, consistent error messages

/**
 * WHY NEEDED?
 * Without proper error handling:
 * - Users see scary technical error messages
 * - Hackers can learn about your system from error messages
 * - Errors crash your entire server
 *
 * With error handling:
 * - Users see friendly error messages
 * - Security information is hidden
 * - Server keeps running even when errors happen
 */

/**
 * ERROR RESPONSE FORMAT
 * All errors will be sent in this consistent format:
 *
 * {
 *   success: false,
 *   message: "Human-readable error message",
 *   errorCode: "MACHINE_READABLE_CODE",
 *   errors: [] // Array of detailed errors (for validation)
 * }
 */

// =================================================================
// MAIN ERROR HANDLER
// =================================================================
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging (but not in production to avoid log spam)
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ ERROR:', err);
  }

  // =================================================================
  // MONGOOSE BAD OBJECT ID ERROR
  // =================================================================
  /**
   * WHAT IS THIS?
   * When someone tries to access /products/invalid-id
   * MongoDB IDs must be 24 hex characters, like: 507f1f77bcf86cd799439011
   *
   * ERROR: "Cast to ObjectId failed for value 'invalid-id'"
   * FRIENDLY MESSAGE: "Resource not found"
   */
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      message,
      errorCode: 'RESOURCE_NOT_FOUND',
      statusCode: 404
    };
  }

  // =================================================================
  // MONGOOSE DUPLICATE KEY ERROR
  // =================================================================
  /**
   * WHAT IS THIS?
   * When someone tries to register with an email that already exists
   * Or create a product with a duplicate SKU
   *
   * ERROR: "E11000 duplicate key error"
   * FRIENDLY MESSAGE: "Email already exists"
   */
  if (err.code === 11000) {
    // Extract which field is duplicate
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists`;

    error = {
      message,
      errorCode: 'DUPLICATE_ENTRY',
      statusCode: 400,
      field
    };
  }

  // =================================================================
  // MONGOOSE VALIDATION ERROR
  // =================================================================
  /**
   * WHAT IS THIS?
   * When data doesn't match the schema requirements
   * Examples:
   * - Required field is missing
   * - Email is not in valid format
   * - Number is below minimum value
   *
   * RETURNS: Array of all validation errors
   */
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));

    error = {
      message: 'Validation failed',
      errorCode: 'VALIDATION_ERROR',
      statusCode: 400,
      errors
    };
  }

  // =================================================================
  // JWT ERRORS
  // =================================================================
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: 'Invalid token. Please log in again.',
      errorCode: 'INVALID_TOKEN',
      statusCode: 401
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: 'Your session has expired. Please log in again.',
      errorCode: 'TOKEN_EXPIRED',
      statusCode: 401
    };
  }

  // =================================================================
  // FILE UPLOAD ERRORS
  // =================================================================
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      message: `File too large. Maximum size is ${
        process.env.MAX_FILE_SIZE / 1024 / 1024
      }MB`,
      errorCode: 'FILE_TOO_LARGE',
      statusCode: 400
    };
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      message: 'Unexpected field in file upload',
      errorCode: 'INVALID_FILE_FIELD',
      statusCode: 400
    };
  }

  // =================================================================
  // RATE LIMIT ERRORS
  // =================================================================
  /**
   * WHAT IS THIS?
   * When someone makes too many requests too quickly
   * Protects against spam and denial-of-service attacks
   */
  if (err.name === 'TooManyRequests' || err.statusCode === 429) {
    error = {
      message: 'Too many requests. Please try again later.',
      errorCode: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429
    };
  }

  // =================================================================
  // SEND ERROR RESPONSE
  // =================================================================
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    errorCode: error.errorCode || 'INTERNAL_SERVER_ERROR',
    ...(error.errors && { errors: error.errors }), // Include validation errors if present
    ...(error.field && { field: error.field }), // Include duplicate field if present
    // Only show error stack in development (helps with debugging)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// =================================================================
// NOT FOUND HANDLER
// =================================================================
/**
 * WHAT IS THIS?
 * When someone tries to access a route that doesn't exist
 * Example: GET /api/invalid-route
 *
 * This middleware catches it and sends a 404 error
 */
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// =================================================================
// ASYNC ERROR WRAPPER
// =================================================================
/**
 * WHAT IS THIS?
 * A helper function to catch errors in async route handlers
 *
 * WITHOUT THIS:
 * You need try-catch in every route handler
 *
 * WITH THIS:
 * Just wrap your route handler and errors are caught automatically
 *
 * USAGE:
 * router.get('/products', asyncHandler(async (req, res) => {
 *   const products = await Product.find();
 *   res.json(products);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
