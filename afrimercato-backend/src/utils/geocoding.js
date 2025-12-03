// =================================================================
// GEOCODING SERVICE - Address/Postcode to Coordinates
// =================================================================
// Converts addresses and postcodes to lat/lng coordinates
// Uses OpenStreetMap Nominatim API (free, no API key required)
// For production: Consider Google Maps Geocoding API or Mapbox

const axios = require('axios');

// =================================================================
// NOMINATIM API (OpenStreetMap) - FREE GEOCODING
// =================================================================

/**
 * Geocode address or postcode to coordinates
 * @param {string} query - Address, postcode, or location (e.g., "Bristol UK", "SW1A 1AA")
 * @returns {Promise<object>} Location data with coordinates
 */
async function geocodeAddress(query) {
  try {
    if (!query || typeof query !== 'string') {
      throw new Error('Query is required');
    }

    // Nominatim API endpoint
    const url = 'https://nominatim.openstreetmap.org/search';

    const response = await axios.get(url, {
      params: {
        q: query,
        format: 'json',
        addressdetails: 1,
        limit: 5 // Get top 5 results
      },
      headers: {
        'User-Agent': 'AfriMercato-Marketplace/1.0' // Required by Nominatim
      },
      timeout: 5000 // 5 second timeout
    });

    if (!response.data || response.data.length === 0) {
      return {
        success: false,
        message: 'Location not found. Please try a different search term.',
        results: []
      };
    }

    // Format results
    const results = response.data.map(place => ({
      displayName: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
      address: {
        city: place.address?.city || place.address?.town || place.address?.village || null,
        state: place.address?.state || place.address?.county || null,
        country: place.address?.country || null,
        postcode: place.address?.postcode || null
      },
      boundingBox: place.boundingbox ? {
        south: parseFloat(place.boundingbox[0]),
        north: parseFloat(place.boundingbox[1]),
        west: parseFloat(place.boundingbox[2]),
        east: parseFloat(place.boundingbox[3])
      } : null,
      type: place.type,
      importance: place.importance
    }));

    return {
      success: true,
      query: query,
      results: results,
      primaryResult: results[0] // Most relevant result
    };

  } catch (error) {
    console.error('Geocoding error:', error.message);

    if (error.code === 'ECONNABORTED') {
      return {
        success: false,
        message: 'Geocoding service timeout. Please try again.',
        error: 'TIMEOUT'
      };
    }

    return {
      success: false,
      message: 'Unable to geocode location. Please try again.',
      error: error.message
    };
  }
}

/**
 * Reverse geocode coordinates to address
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Promise<object>} Address data
 */
async function reverseGeocode(latitude, longitude) {
  try {
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    const url = 'https://nominatim.openstreetmap.org/reverse';

    const response = await axios.get(url, {
      params: {
        lat: latitude,
        lon: longitude,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'AfriMercato-Marketplace/1.0'
      },
      timeout: 5000
    });

    if (!response.data) {
      return {
        success: false,
        message: 'Unable to find address for these coordinates'
      };
    }

    const place = response.data;

    return {
      success: true,
      displayName: place.display_name,
      address: {
        street: place.address?.road || null,
        city: place.address?.city || place.address?.town || place.address?.village || null,
        state: place.address?.state || place.address?.county || null,
        country: place.address?.country || null,
        postcode: place.address?.postcode || null
      },
      coordinates: {
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon)
      }
    };

  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    return {
      success: false,
      message: 'Unable to reverse geocode coordinates',
      error: error.message
    };
  }
}

/**
 * Get user's location from IP address (fallback)
 * Uses ipapi.co (free tier: 1000 requests/day)
 * @param {string} ipAddress - User's IP address
 * @returns {Promise<object>} Location data
 */
async function getLocationFromIP(ipAddress = null) {
  try {
    // If no IP provided, use ipapi's automatic detection
    const url = ipAddress
      ? `https://ipapi.co/${ipAddress}/json/`
      : 'https://ipapi.co/json/';

    const response = await axios.get(url, {
      timeout: 5000
    });

    if (!response.data || response.data.error) {
      return {
        success: false,
        message: 'Unable to detect location from IP'
      };
    }

    const data = response.data;

    return {
      success: true,
      city: data.city,
      region: data.region,
      country: data.country_name,
      countryCode: data.country_code,
      postal: data.postal,
      coordinates: {
        latitude: data.latitude,
        longitude: data.longitude
      },
      timezone: data.timezone
    };

  } catch (error) {
    console.error('IP geolocation error:', error.message);
    return {
      success: false,
      message: 'Unable to detect location from IP',
      error: error.message
    };
  }
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @param {string} unit - Unit of measurement ('km' or 'mi')
 * @returns {number} Distance
 */
function calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
  const R = unit === 'mi' ? 3958.8 : 6371; // Earth's radius in km or miles

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Round to 2 decimal places
}

/**
 * Convert degrees to radians
 * @param {number} degrees - Degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Get bounding box coordinates for a radius search
 * @param {number} latitude - Center latitude
 * @param {number} longitude - Center longitude
 * @param {number} radiusKm - Radius in kilometers
 * @returns {object} Bounding box {minLat, maxLat, minLng, maxLng}
 */
function getBoundingBox(latitude, longitude, radiusKm) {
  const latDelta = radiusKm / 111.32; // 1 degree latitude ≈ 111.32 km
  const lngDelta = radiusKm / (111.32 * Math.cos(toRadians(latitude)));

  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLng: longitude - lngDelta,
    maxLng: longitude + lngDelta
  };
}

// =================================================================
// EXPORTS
// =================================================================

module.exports = {
  geocodeAddress,
  reverseGeocode,
  getLocationFromIP,
  calculateDistance,
  getBoundingBox
};
