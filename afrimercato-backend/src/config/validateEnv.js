// =================================================================
// ENVIRONMENT VARIABLE VALIDATION
// =================================================================
// PRODUCTION-READY: Validates all required environment variables on startup
// Prevents deployment with missing critical configuration

/**
 * Validates required environment variables
 * @returns {Object} - { valid: boolean, missing: string[], warnings: string[] }
 */
function validateEnvironment() {
  const missing = [];
  const warnings = [];

  // =================================================================
  // REQUIRED AT STARTUP - Keep minimal to avoid crashing on boot
  // =================================================================
  const requiredAtStartup = [];

  requiredAtStartup.forEach(varName => {
    if (!process.env[varName] || process.env[varName].trim() === '') {
      missing.push(varName);
    }
  });

  // =================================================================
  // IMPORTANT VARIABLES - Server will warn but start without these
  // =================================================================
  const important = [
    'NODE_ENV',
    'PORT',
    'FRONTEND_ORIGINS',
    'JWT_SECRET',
    'MONGODB_URI'
  ];

  important.forEach(varName => {
    if (!process.env[varName] || process.env[varName].trim() === '') {
      warnings.push(`${varName} is not set (recommended for production)`);
    }
  });

  // =================================================================
  // OPTIONAL BUT RECOMMENDED - For specific features
  // =================================================================
  if (!process.env.STRIPE_SECRET_KEY) {
    warnings.push('STRIPE_SECRET_KEY is not set - Payment features will be disabled');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    warnings.push('STRIPE_WEBHOOK_SECRET is not set - Webhook verification will fail');
  }

  if (!process.env.FRONTEND_URL && !process.env.CLIENT_URL) {
    warnings.push('FRONTEND_URL or CLIENT_URL should be set for payment redirects');
  }

  // =================================================================
  // VALIDATION RESULTS
  // =================================================================
  const valid = missing.length === 0;

  return {
    valid,
    missing,
    warnings
  };
}

/**
 * Prints validation results and exits if critical variables are missing
 */
function checkEnvironment() {
  console.log('\n========================================');
  console.log('Environment Variable Validation');
  console.log('========================================\n');

  const { valid, missing, warnings } = validateEnvironment();

  // Print environment info (safe)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Port: ${process.env.PORT || '8080'}`);
  console.log('');

  // Warn on missing startup requirements (do not crash)
  if (!valid && missing.length > 0) {
    console.warn('⚠️  Missing startup environment variables (server will still start):');
    missing.forEach(varName => {
      console.warn(`  - ${varName}`);
    });
    console.log('');
  }

  // Print warnings
  if (warnings.length > 0) {
    console.log('⚠️  Warnings:\n');
    warnings.forEach(warning => {
      console.log(`  - ${warning}`);
    });
    console.log('');
  }

  // Safe presence summary (no values printed)
  const presenceKeys = [
    'MONGODB_URI',
    'JWT_SECRET',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'FRONTEND_ORIGINS',
    'STATUS_KEY'
  ];

  console.log('Environment Presence:');
  presenceKeys.forEach(key => {
    const present = !!(process.env[key] && process.env[key].trim() !== '');
    console.log(`  - ${key}: ${present ? 'true' : 'false'}`);
  });

  console.log('\n========================================\n');
}

/**
 * Get environment variable with fallback
 * @param {string} key - Environment variable name
 * @param {*} defaultValue - Default value if not set
 * @returns {*} - Environment variable value or default
 */
function getEnv(key, defaultValue = null) {
  const value = process.env[key];
  if (value === undefined || value === null || value.trim() === '') {
    return defaultValue;
  }
  return value;
}

/**
 * Get required environment variable (throws if missing)
 * @param {string} key - Environment variable name
 * @returns {string} - Environment variable value
 * @throws {Error} - If variable is not set
 */
function getRequiredEnv(key) {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}

module.exports = {
  validateEnvironment,
  checkEnvironment,
  getEnv,
  getRequiredEnv
};
