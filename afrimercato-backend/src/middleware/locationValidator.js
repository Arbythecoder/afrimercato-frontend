// =================================================================
// LOCATION VALIDATION MIDDLEWARE
// =================================================================
// Ensures only UK and Dublin (Ireland) locations are accepted

const {
  isAllowedLocation,
  validateAddress: validateAddressHelper,
  UK_POSTCODE_REGEX,
  IE_EIRCODE_REGEX
} = require('../services/geocodingService');

/**
 * Validate location middleware for API requests
 * Used for search queries
 */
exports.validateLocation = (req, res, next) => {
  const location = req.query.postcode || req.query.locationText || req.query.location;

  if (!location) {
    // No location provided - will be handled by controller
    return next();
  }

  if (!isAllowedLocation(location)) {
    return res.status(400).json({
      success: false,
      message: 'We currently support delivery only in Dublin (Ireland) and the UK.',
      errorCode: 'LOCATION_NOT_SUPPORTED',
      supportedRegions: ['United Kingdom', 'Dublin (Ireland)']
    });
  }

  next();
};

/**
 * Validate address object (for checkout, vendor registration)
 * Strict validation for saved addresses
 */
exports.validateAddress = (req, res, next) => {
  const address = req.body.address || req.body.deliveryAddress || req.body.location;

  if (!address) {
    return res.status(400).json({
      success: false,
      message: 'Address is required'
    });
  }

  const validation = validateAddressHelper(address);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      message: validation.error,
      errorCode: 'INVALID_ADDRESS',
      supportedRegions: ['United Kingdom', 'Dublin (Ireland)']
    });
  }

  next();
};

module.exports = {
  validateLocation: exports.validateLocation,
  validateAddress: exports.validateAddress,
  UK_POSTCODE_REGEX,
  IE_EIRCODE_REGEX
};
