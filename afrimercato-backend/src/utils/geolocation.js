// =================================================================
// GEOLOCATION UTILITY - UK & IRELAND
// =================================================================
// Handles postcode validation, zone detection, and distance calculation
// Primary focus: Dublin (Ireland) and UK postcodes
// Per SRS requirements for service area matching

/**
 * IRELAND POSTCODE SYSTEM (Eircode)
 * Format: A65 F4E2
 * - First 3 characters: Routing key (geographic area)
 * - Space
 * - Last 4 characters: Unique identifier
 *
 * Dublin Routing Keys:
 * - D01, D02, D03, D04, D05, D06, D06W, D07, D08
 * - D09, D10, D11, D12, D13, D14, D15, D16, D17, D18
 * - D20, D22, D24
 */

/**
 * UK POSTCODE SYSTEM
 * Format: SW1A 1AA
 * - Outward code: Area + District (SW1A)
 * - Space
 * - Inward code: Sector + Unit (1AA)
 *
 * Major UK Cities:
 * - London: E, EC, N, NW, SE, SW, W, WC
 * - Birmingham: B
 * - Manchester: M
 * - Liverpool: L
 * - Leeds: LS
 * - Glasgow: G
 * - Edinburgh: EH
 */

// =================================================================
// IRELAND (EIRCODE) VALIDATION
// =================================================================

/**
 * Validate Irish Eircode format
 * @param {string} eircode - Irish postcode
 * @returns {boolean} True if valid format
 */
function isValidEircode(eircode) {
  if (!eircode || typeof eircode !== 'string') return false;

  // Remove spaces and convert to uppercase
  const cleaned = eircode.replace(/\s/g, '').toUpperCase();

  // Eircode format: A65F4E2 (7 characters exactly)
  // Routing key: Letter + 2 digits (e.g., D02, A65)
  // Unique identifier: 4 alphanumeric characters
  // Must be exactly 7 characters
  const eircodeRegex = /^[A-Z]\d{2}[A-Z0-9]{4}$/;

  return eircodeRegex.test(cleaned) && cleaned.length === 7;
}

/**
 * Extract routing key from Eircode
 * @param {string} eircode - Irish postcode
 * @returns {string|null} Routing key (first 3 characters)
 */
function getEircodeRoutingKey(eircode) {
  if (!isValidEircode(eircode)) return null;

  const cleaned = eircode.replace(/\s/g, '').toUpperCase();
  return cleaned.substring(0, 3);
}

/**
 * Check if Eircode is in Dublin
 * @param {string} eircode - Irish postcode
 * @returns {boolean} True if Dublin postcode
 */
function isDublinEircode(eircode) {
  const routingKey = getEircodeRoutingKey(eircode);
  if (!routingKey) return false;

  // Dublin routing keys start with 'D' followed by digits
  const dublinRegex = /^D\d{2}$/;
  return dublinRegex.test(routingKey);
}

/**
 * Get Dublin zone from Eircode
 * @param {string} eircode - Dublin postcode
 * @returns {string|null} Dublin postal district (D01-D24)
 */
function getDublinZone(eircode) {
  if (!isDublinEircode(eircode)) return null;
  return getEircodeRoutingKey(eircode);
}

/**
 * Get Dublin region name from zone
 * @param {string} zone - Dublin zone (D01, D02, etc.)
 * @returns {string} Region name
 */
function getDublinRegionName(zone) {
  const dublinRegions = {
    'D01': 'Dublin 1 - North City Centre',
    'D02': 'Dublin 2 - South City Centre',
    'D03': 'Dublin 3 - Clontarf, Killester',
    'D04': 'Dublin 4 - Ballsbridge, Donnybrook',
    'D05': 'Dublin 5 - Artane, Raheny',
    'D06': 'Dublin 6 - Ranelagh, Rathmines',
    'D06W': 'Dublin 6W - Terenure, Templeogue',
    'D07': 'Dublin 7 - Cabra, Phibsborough',
    'D08': 'Dublin 8 - Kilmainham, Inchicore',
    'D09': 'Dublin 9 - Drumcondra, Glasnevin',
    'D10': 'Dublin 10 - Ballyfermot',
    'D11': 'Dublin 11 - Finglas',
    'D12': 'Dublin 12 - Crumlin, Drimnagh',
    'D13': 'Dublin 13 - Baldoyle, Sutton',
    'D14': 'Dublin 14 - Dundrum, Churchtown',
    'D15': 'Dublin 15 - Blanchardstown, Castleknock',
    'D16': 'Dublin 16 - Ballinteer, Rathfarnham',
    'D17': 'Dublin 17 - Coolock, Darndale',
    'D18': 'Dublin 18 - Sandyford, Foxrock',
    'D20': 'Dublin 20 - Palmerstown, Chapelizod',
    'D22': 'Dublin 22 - Clondalkin',
    'D24': 'Dublin 24 - Tallaght'
  };

  return dublinRegions[zone] || zone;
}

// =================================================================
// UK POSTCODE VALIDATION
// =================================================================

/**
 * Validate UK postcode format
 * @param {string} postcode - UK postcode
 * @returns {boolean} True if valid format
 */
function isValidUKPostcode(postcode) {
  if (!postcode || typeof postcode !== 'string') return false;

  // Remove spaces and convert to uppercase
  const cleaned = postcode.replace(/\s/g, '').toUpperCase();

  // UK postcode regex (comprehensive)
  // Covers all valid UK postcode formats
  const ukPostcodeRegex = /^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/;

  return ukPostcodeRegex.test(cleaned);
}

/**
 * Extract outward code from UK postcode
 * @param {string} postcode - UK postcode
 * @returns {string|null} Outward code (area + district)
 */
function getUKOutwardCode(postcode) {
  if (!isValidUKPostcode(postcode)) return null;

  const cleaned = postcode.replace(/\s/g, '').toUpperCase();
  const match = cleaned.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/);

  return match ? match[1] : null;
}

/**
 * Extract area from UK postcode
 * @param {string} postcode - UK postcode
 * @returns {string|null} Area code (e.g., 'SW', 'M', 'B')
 */
function getUKPostcodeArea(postcode) {
  const outward = getUKOutwardCode(postcode);
  if (!outward) return null;

  // Extract letters at the beginning
  const match = outward.match(/^([A-Z]{1,2})/);
  return match ? match[1] : null;
}

/**
 * Get UK city from postcode area
 * @param {string} postcode - UK postcode
 * @returns {string|null} City name
 */
function getUKCity(postcode) {
  const area = getUKPostcodeArea(postcode);
  if (!area) return null;

  const ukCities = {
    // London
    'E': 'London (East)',
    'EC': 'London (City)',
    'N': 'London (North)',
    'NW': 'London (North West)',
    'SE': 'London (South East)',
    'SW': 'London (South West)',
    'W': 'London (West)',
    'WC': 'London (West Central)',

    // Major Cities
    'B': 'Birmingham',
    'M': 'Manchester',
    'L': 'Liverpool',
    'LS': 'Leeds',
    'S': 'Sheffield',
    'BS': 'Bristol',
    'G': 'Glasgow',
    'EH': 'Edinburgh',
    'CF': 'Cardiff',
    'BT': 'Belfast',
    'OX': 'Oxford',
    'CB': 'Cambridge',
    'NG': 'Nottingham',
    'LE': 'Leicester',
    'CV': 'Coventry',
    'NE': 'Newcastle',
    'PL': 'Plymouth',
    'SO': 'Southampton',
    'PO': 'Portsmouth',
    'BN': 'Brighton'
  };

  return ukCities[area] || null;
}

// =================================================================
// POSTCODE MATCHING & ZONES
// =================================================================

/**
 * Check if two postcodes are in the same zone
 * @param {string} postcode1 - First postcode
 * @param {string} postcode2 - Second postcode
 * @returns {boolean} True if in same zone
 */
function isSameZone(postcode1, postcode2) {
  // Try Ireland first
  const zone1 = getEircodeRoutingKey(postcode1);
  const zone2 = getEircodeRoutingKey(postcode2);

  if (zone1 && zone2) {
    return zone1 === zone2;
  }

  // Try UK
  const area1 = getUKPostcodeArea(postcode1);
  const area2 = getUKPostcodeArea(postcode2);

  if (area1 && area2) {
    return area1 === area2;
  }

  return false;
}

/**
 * Check if postcodes are in nearby zones (for service area matching)
 * @param {string} riderPostcode - Rider's service postcode
 * @param {string} vendorPostcode - Vendor's postcode
 * @returns {boolean} True if serviceable
 */
function isServiceable(riderPostcode, vendorPostcode) {
  // Exact zone match
  if (isSameZone(riderPostcode, vendorPostcode)) {
    return true;
  }

  // Dublin zones - all Dublin zones can serve each other
  if (isDublinEircode(riderPostcode) && isDublinEircode(vendorPostcode)) {
    return true;
  }

  // London zones - all London zones can serve each other
  const riderCity = getUKCity(riderPostcode);
  const vendorCity = getUKCity(vendorPostcode);

  if (riderCity && vendorCity &&
      riderCity.startsWith('London') && vendorCity.startsWith('London')) {
    return true;
  }

  return false;
}

/**
 * Calculate delivery zone tier (affects delivery fees)
 * @param {string} pickupPostcode - Pickup location postcode
 * @param {string} deliveryPostcode - Delivery location postcode
 * @returns {number} Zone tier (1-4)
 */
function calculateDeliveryZoneTier(pickupPostcode, deliveryPostcode) {
  // Tier 1: Same exact postcode area (cheapest)
  if (isSameZone(pickupPostcode, deliveryPostcode)) {
    return 1;
  }

  // Tier 2: Same city/region (Dublin or London)
  if (isDublinEircode(pickupPostcode) && isDublinEircode(deliveryPostcode)) {
    const zone1 = getDublinZone(pickupPostcode);
    const zone2 = getDublinZone(deliveryPostcode);

    // Adjacent Dublin zones
    const zoneNum1 = parseInt(zone1.substring(1));
    const zoneNum2 = parseInt(zone2.substring(1));

    if (Math.abs(zoneNum1 - zoneNum2) <= 2) {
      return 2;
    }
    return 3;
  }

  const city1 = getUKCity(pickupPostcode);
  const city2 = getUKCity(deliveryPostcode);

  if (city1 && city2) {
    // Same city
    if (city1 === city2) {
      return 2;
    }

    // Both in London
    if (city1.startsWith('London') && city2.startsWith('London')) {
      return 2;
    }

    // Different cities
    return 3;
  }

  // Tier 4: Long distance (most expensive)
  return 4;
}

/**
 * Calculate estimated delivery fee based on zone tier
 * @param {number} zoneTier - Zone tier (1-4)
 * @param {string} vehicleType - Vehicle type
 * @returns {object} Fee breakdown
 */
function calculateDeliveryFee(zoneTier, vehicleType = 'bicycle') {
  const baseFees = {
    bicycle: { 1: 2.50, 2: 4.50, 3: 7.00, 4: 10.00 },
    motorcycle: { 1: 3.50, 2: 6.00, 3: 9.00, 4: 13.00 },
    car: { 1: 5.00, 2: 8.00, 3: 12.00, 4: 18.00 },
    van: { 1: 7.00, 2: 11.00, 3: 16.00, 4: 24.00 }
  };

  const baseFee = baseFees[vehicleType]?.[zoneTier] || baseFees.bicycle[zoneTier];

  return {
    baseFee: baseFee.toFixed(2),
    serviceFee: (baseFee * 0.15).toFixed(2), // 15% service fee
    total: (baseFee * 1.15).toFixed(2),
    currency: 'EUR', // Change to GBP for UK
    zoneTier: zoneTier,
    vehicleType: vehicleType
  };
}

// =================================================================
// VALIDATION HELPERS
// =================================================================

/**
 * Validate postcode (auto-detect Ireland or UK)
 * @param {string} postcode - Postcode to validate
 * @returns {object} Validation result
 */
function validatePostcode(postcode) {
  if (!postcode) {
    return {
      valid: false,
      type: null,
      message: 'Postcode is required'
    };
  }

  // Try Ireland
  if (isValidEircode(postcode)) {
    return {
      valid: true,
      type: 'IRELAND',
      country: 'Ireland',
      routingKey: getEircodeRoutingKey(postcode),
      isDublin: isDublinEircode(postcode),
      zone: getDublinZone(postcode),
      region: isDublinEircode(postcode) ? getDublinRegionName(getDublinZone(postcode)) : null
    };
  }

  // Try UK
  if (isValidUKPostcode(postcode)) {
    return {
      valid: true,
      type: 'UK',
      country: 'United Kingdom',
      outwardCode: getUKOutwardCode(postcode),
      area: getUKPostcodeArea(postcode),
      city: getUKCity(postcode)
    };
  }

  return {
    valid: false,
    type: null,
    message: 'Invalid postcode format. Must be UK (e.g., SW1A 1AA) or Irish Eircode (e.g., D02 X285)'
  };
}

/**
 * Format postcode for display
 * @param {string} postcode - Postcode to format
 * @returns {string} Formatted postcode
 */
function formatPostcode(postcode) {
  if (!postcode) return '';

  const cleaned = postcode.replace(/\s/g, '').toUpperCase();

  // Irish Eircode: A65 F4E2
  if (isValidEircode(postcode)) {
    return `${cleaned.substring(0, 3)} ${cleaned.substring(3)}`;
  }

  // UK Postcode: SW1A 1AA
  // Inward code is always last 3 characters
  if (isValidUKPostcode(postcode)) {
    const inward = cleaned.slice(-3);
    const outward = cleaned.slice(0, -3);
    return `${outward} ${inward}`;
  }

  return postcode.toUpperCase();
}

// =================================================================
// EXPORTS
// =================================================================

module.exports = {
  // Ireland
  isValidEircode,
  getEircodeRoutingKey,
  isDublinEircode,
  getDublinZone,
  getDublinRegionName,

  // UK
  isValidUKPostcode,
  getUKOutwardCode,
  getUKPostcodeArea,
  getUKCity,

  // Matching
  isSameZone,
  isServiceable,
  calculateDeliveryZoneTier,
  calculateDeliveryFee,

  // Helpers
  validatePostcode,
  formatPostcode
};
