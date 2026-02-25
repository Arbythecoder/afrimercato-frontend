const axios = require('axios');
const GeoCache = require('../models/GeoCache');

/**
 * Geocoding service using OpenStreetMap Nominatim (free)
 * with MongoDB caching to avoid rate limits
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'Afrimercato/1.0 (beta)';

// Validate UK postcode
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i;

// Validate Ireland Eircode
const IE_EIRCODE_REGEX = /^[A-Z]\d{2}\s?[A-Z0-9]{4}$/i;

// Dublin-specific validation (D01-D24, A41-A96)
const DUBLIN_EIRCODE_PREFIX = /^(D\d{2}|A[4-9]\d)/i;

/**
 * Geocode a postcode or address to lat/lng
 * Uses cache first, then calls Nominatim API
 */
async function geocode(query) {
  try {
    // Normalize query
    const normalizedQuery = query.trim().toUpperCase();

    // Check cache first
    const cached = await GeoCache.findOne({ query: normalizedQuery });
    if (cached && !cached.isExpired()) {
      return {
        lat: cached.latitude,
        lng: cached.longitude,
        displayName: cached.displayName,
        cached: true
      };
    }

    // Call Nominatim API
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: query,
        format: 'json',
        limit: 1,
        countrycodes: 'gb,ie', // UK + Ireland only
        addressdetails: 1
      },
      headers: {
        'User-Agent': USER_AGENT
      },
      timeout: 5000
    });

    if (!response.data || response.data.length === 0) {
      return null;
    }

    const result = response.data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const displayName = result.display_name;

    // Cache the result (30 days TTL)
    await GeoCache.create({
      query: normalizedQuery,
      latitude: lat,
      longitude: lng,
      displayName,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    return { lat, lng, displayName, cached: false };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    throw new Error('Unable to geocode location');
  }
}

/**
 * Validate if location is in allowed regions (UK + Dublin)
 */
function isAllowedLocation(location) {
  if (!location) return false;

  const normalized = location.trim().toUpperCase();

  // Check if it's a valid UK postcode
  if (UK_POSTCODE_REGEX.test(normalized)) {
    return true;
  }

  // Check if it's a valid Dublin Eircode
  if (IE_EIRCODE_REGEX.test(normalized)) {
    return DUBLIN_EIRCODE_PREFIX.test(normalized);
  }

  // Check if it's a known city name
  const allowedCities = [
    'LONDON', 'MANCHESTER', 'BIRMINGHAM', 'LEEDS', 'LIVERPOOL',
    'BRISTOL', 'NOTTINGHAM', 'SHEFFIELD', 'NEWCASTLE', 'LEICESTER',
    'WORTHING', 'HULL', 'SOUTHAMPTON', 'CARDIFF', 'EDINBURGH',
    'GLASGOW', 'DUBLIN'
  ];

  return allowedCities.some(city => normalized.includes(city));
}

/**
 * Validate address object for UK/Dublin only
 * UPDATED: Market-aware validation with grandfathering
 * - MARKET_MODE=UK: Enforces UK postcode format
 * - MARKET_MODE=GLOBAL: Allows any country/postcode
 * - Grandfathers existing addresses (only validates new/changed fields)
 */
function validateAddress(address, options = {}) {
  if (!address) {
    return { valid: false, error: 'Address is required' };
  }

  const { country, postcode } = address;
  const { isUpdate = false, changedFields = [] } = options;

  // Check market mode
  const marketMode = process.env.MARKET_MODE || 'GLOBAL';

  // GLOBAL mode: Allow any country
  if (marketMode === 'GLOBAL') {
    return { valid: true };
  }

  // UK mode: Enforce UK/Dublin restrictions
  // Grandfathering: On updates, only validate if country/postcode is being changed
  if (isUpdate && changedFields.length > 0) {
    const isCountryChanged = changedFields.includes('country');
    const isPostcodeChanged = changedFields.includes('postcode');
    
    // If neither country nor postcode is being changed, skip validation (grandfather)
    if (!isCountryChanged && !isPostcodeChanged) {
      return { valid: true };
    }
  }

  // Check country
  const allowedCountries = ['united kingdom', 'ireland', 'uk', 'ie', 'gb'];
  if (!country || !allowedCountries.includes(country.toLowerCase())) {
    return {
      valid: false,
      error: 'We currently support delivery only in Dublin (Ireland) and the UK.'
    };
  }

  // For Ireland, must be Dublin
  if (country.toLowerCase() === 'ireland' || country.toLowerCase() === 'ie') {
    if (!postcode || !IE_EIRCODE_REGEX.test(postcode)) {
      return {
        valid: false,
        error: 'Please provide a valid Dublin Eircode'
      };
    }

    if (!DUBLIN_EIRCODE_PREFIX.test(postcode.toUpperCase())) {
      return {
        valid: false,
        error: 'We currently support delivery only in Dublin, Ireland'
      };
    }
  }

  // For UK, validate postcode format
  if (
    (country.toLowerCase() === 'united kingdom' ||
      country.toLowerCase() === 'uk' ||
      country.toLowerCase() === 'gb') &&
    postcode &&
    !UK_POSTCODE_REGEX.test(postcode)
  ) {
    return {
      valid: false,
      error: 'Please provide a valid UK postcode'
    };
  }

  return { valid: true };
}

/**
 * Get normalized location label from geocoding result
 */
function getNormalizedLabel(displayName) {
  if (!displayName) return null;

  // Extract city name from display name
  // Format: "Street, City, County, Postcode, Country"
  const parts = displayName.split(',').map(p => p.trim());

  // Find the city (usually 2nd or 3rd part)
  if (parts.length >= 2) {
    return parts[1]; // Usually the city
  }

  return parts[0];
}

module.exports = {
  geocode,
  isAllowedLocation,
  validateAddress,
  getNormalizedLabel,
  UK_POSTCODE_REGEX,
  IE_EIRCODE_REGEX,
  DUBLIN_EIRCODE_PREFIX
};
