// =================================================================
// GENERATE RIDER ID UTILITY
// =================================================================
// Generates unique rider IDs in format: RD-0001-A3B4

const crypto = require('crypto');
const Rider = require('../models/Rider');

/**
 * Generate a unique Rider ID
 * Format: RD-XXXX-YYYY
 * - RD: Prefix for Rider
 * - XXXX: 4-digit sequential number
 * - YYYY: 4-character random string (uppercase alphanumeric)
 *
 * Example: RD-0001-A3B4, RD-0142-X9K2
 */
async function generateRiderId() {
  // Generate random 4-character suffix
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();

  // Find the latest rider to get sequential number
  const latestRider = await Rider.findOne(
    { riderId: /^RD-/ },
    { riderId: 1 },
    { sort: { riderId: -1 } }
  );

  let sequentialNumber = '0001';

  if (latestRider && latestRider.riderId) {
    try {
      // Extract number from format RD-0001-A3B4
      const parts = latestRider.riderId.split('-');
      if (parts.length >= 2) {
        const lastNumber = parseInt(parts[1]);
        if (!isNaN(lastNumber)) {
          sequentialNumber = String(lastNumber + 1).padStart(4, '0');
        }
      }
    } catch (error) {
      console.error('Error parsing last rider ID:', error);
      // Keep default 0001 if parsing fails
    }
  }

  const riderId = `RD-${sequentialNumber}-${randomSuffix}`;

  // Check if ID already exists (very unlikely but just in case)
  const exists = await Rider.findOne({ riderId });
  if (exists) {
    // If by some chance it exists, recursively generate a new one
    return generateRiderId();
  }

  return riderId;
}

module.exports = { generateRiderId };
