// =================================================================
// ENCRYPTION UTILITY - AES-256-GCM
// =================================================================
// For encrypting sensitive data (bank account details, etc.)
// Uses industry-standard AES-256-GCM encryption
// Per PCI DSS compliance requirements

const crypto = require('crypto');

// Encryption configuration
const ALGORITHM = 'aes-256-gcm'; // AES-256 with Galois/Counter Mode (authenticated encryption)
const IV_LENGTH = 16; // Initialization vector length (128 bits)
const SALT_LENGTH = 64; // Salt length for key derivation
const TAG_LENGTH = 16; // Authentication tag length
const KEY_LENGTH = 32; // Key length (256 bits)
const ITERATIONS = 100000; // PBKDF2 iterations (industry standard)

/**
 * Get encryption key from environment variable
 * In production, this should be in secure environment variable
 */
function getEncryptionKey() {
  const secret = process.env.ENCRYPTION_SECRET || process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('ENCRYPTION_SECRET must be at least 32 characters long');
  }

  // Derive a proper 256-bit key from the secret using PBKDF2
  const salt = crypto.createHash('sha256').update('afrimercato-encryption-salt').digest();
  return crypto.pbkdf2Sync(secret, salt, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt sensitive data
 * @param {string} text - Plain text to encrypt
 * @returns {string} Encrypted text in format: iv:authTag:encryptedData
 *
 * @example
 * const encrypted = encrypt('1234567890'); // '5f3b...a8c2:9d4e...b7f1:a1b2...c3d4'
 */
function encrypt(text) {
  try {
    if (!text || typeof text !== 'string') {
      throw new Error('Text to encrypt must be a non-empty string');
    }

    // Get encryption key
    const key = getEncryptionKey();

    // Generate random IV (initialization vector)
    const iv = crypto.randomBytes(IV_LENGTH);

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Get authentication tag (for data integrity)
    const authTag = cipher.getAuthTag();

    // Return: iv:authTag:encryptedData (all in hex format)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error.message);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt encrypted data
 * @param {string} encryptedText - Encrypted text in format: iv:authTag:encryptedData
 * @returns {string} Decrypted plain text
 *
 * @example
 * const decrypted = decrypt('5f3b...a8c2:9d4e...b7f1:a1b2...c3d4'); // '1234567890'
 */
function decrypt(encryptedText) {
  try {
    if (!encryptedText || typeof encryptedText !== 'string') {
      return null;
    }

    // Split the encrypted text into components
    const parts = encryptedText.split(':');

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivHex, authTagHex, encrypted] = parts;

    // Convert from hex to Buffer
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getEncryptionKey();

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    // Decrypt the data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    throw new Error('Failed to decrypt data - data may be corrupted or key may be wrong');
  }
}

/**
 * Hash sensitive data (one-way)
 * Use for data that needs to be verified but never retrieved
 * @param {string} text - Text to hash
 * @returns {string} SHA-256 hash
 */
function hash(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

/**
 * Verify if text matches hash
 * @param {string} text - Plain text
 * @param {string} hashedText - Hashed text to compare
 * @returns {boolean} True if match
 */
function verifyHash(text, hashedText) {
  return hash(text) === hashedText;
}

/**
 * Encrypt object fields
 * Useful for encrypting specific fields in a document
 * @param {object} obj - Object containing fields to encrypt
 * @param {string[]} fields - Array of field names to encrypt
 * @returns {object} Object with encrypted fields
 *
 * @example
 * const rider = { name: 'John', accountNumber: '1234567890' };
 * const encrypted = encryptFields(rider, ['accountNumber']);
 * // { name: 'John', accountNumber: 'iv:tag:encrypted...' }
 */
function encryptFields(obj, fields) {
  const result = { ...obj };

  fields.forEach(field => {
    if (result[field]) {
      result[field] = encrypt(String(result[field]));
    }
  });

  return result;
}

/**
 * Decrypt object fields
 * @param {object} obj - Object containing encrypted fields
 * @param {string[]} fields - Array of field names to decrypt
 * @returns {object} Object with decrypted fields
 */
function decryptFields(obj, fields) {
  const result = { ...obj };

  fields.forEach(field => {
    if (result[field]) {
      try {
        result[field] = decrypt(result[field]);
      } catch (error) {
        console.error(`Failed to decrypt field: ${field}`);
        result[field] = null;
      }
    }
  });

  return result;
}

/**
 * Mask sensitive data for display
 * @param {string} text - Text to mask
 * @param {number} visibleChars - Number of characters to show at end
 * @returns {string} Masked text
 *
 * @example
 * maskData('1234567890', 4); // '******7890'
 */
function maskData(text, visibleChars = 4) {
  if (!text || text.length <= visibleChars) {
    return '****';
  }

  const masked = '*'.repeat(text.length - visibleChars);
  const visible = text.slice(-visibleChars);

  return masked + visible;
}

/**
 * Test encryption/decryption
 * Used for validating encryption setup
 */
function testEncryption() {
  try {
    const testData = 'Test123!@#';
    const encrypted = encrypt(testData);
    const decrypted = decrypt(encrypted);

    if (decrypted !== testData) {
      throw new Error('Encryption test failed: decrypted data does not match original');
    }

    console.log('✅ Encryption system working correctly');
    return true;
  } catch (error) {
    console.error('❌ Encryption system test failed:', error.message);
    return false;
  }
}

module.exports = {
  encrypt,
  decrypt,
  hash,
  verifyHash,
  encryptFields,
  decryptFields,
  maskData,
  testEncryption
};
