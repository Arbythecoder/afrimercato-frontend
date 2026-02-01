// =================================================================
// PRODUCTION-GRADE CORS CONFIGURATION
// =================================================================
// Dynamic CORS that supports environment-based origins.
// Future domains can be added via FRONTEND_ORIGINS env var without code changes.
//
// SUPPORTED PATTERNS IN FRONTEND_ORIGINS:
// - Exact domains: https://afrimercato.com
// - Wildcard subdomains: https://*.vercel.app (matches any.vercel.app)
// - Multiple origins: comma-separated list
//
// EXAMPLE:
// FRONTEND_ORIGINS=https://afrimercato.com,https://www.afrimercato.com,https://*.vercel.app

/**
 * Parse FRONTEND_ORIGINS env var into an array of origins/patterns
 * Supports: exact strings, wildcard patterns (*.domain.com)
 */
const parseOrigins = () => {
  const origins = [];
  const patterns = [];

  // Priority 1: FRONTEND_ORIGINS (new standard - comma-separated, supports wildcards)
  const frontendOrigins = process.env.FRONTEND_ORIGINS;
  if (frontendOrigins) {
    frontendOrigins.split(',').forEach(origin => {
      const trimmed = origin.trim();
      if (!trimmed) return;

      // Check if it's a wildcard pattern (e.g., https://*.vercel.app)
      if (trimmed.includes('*')) {
        // Convert wildcard pattern to regex
        // Escape special regex chars except *, then replace * with regex pattern
        const regexStr = trimmed
          .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special chars
          .replace(/\*/g, '[a-z0-9-]+');          // * matches subdomain chars
        patterns.push(new RegExp(`^${regexStr}$`));
      } else {
        origins.push(trimmed);
      }
    });
  }

  // Priority 2: Legacy support - CLIENT_URL (single origin for backward compatibility)
  if (process.env.CLIENT_URL) {
    const clientUrl = process.env.CLIENT_URL.trim();
    if (clientUrl && !origins.includes(clientUrl)) {
      origins.push(clientUrl);
    }
  }

  // Priority 3: Legacy support - ALLOWED_ORIGINS (comma-separated, no wildcards)
  if (process.env.ALLOWED_ORIGINS) {
    process.env.ALLOWED_ORIGINS.split(',').forEach(origin => {
      const trimmed = origin.trim();
      if (trimmed && !origins.includes(trimmed)) {
        origins.push(trimmed);
      }
    });
  }

  // Priority 4: Development fallbacks (always include in dev mode)
  if (process.env.NODE_ENV === 'development') {
    const devOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173'
    ];
    devOrigins.forEach(devOrigin => {
      if (!origins.includes(devOrigin)) {
        origins.push(devOrigin);
      }
    });
  }

  return { origins, patterns };
};

/**
 * Validate if an origin is allowed
 * Returns true if origin matches explicit list or wildcard patterns
 */
const isOriginAllowed = (origin, allowedOrigins, allowedPatterns) => {
  // Check exact match first (faster)
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // Check wildcard patterns
  for (const pattern of allowedPatterns) {
    if (pattern.test(origin)) {
      return true;
    }
  }

  return false;
};

/**
 * Get CORS options for Express middleware
 * @param {Object} options - Configuration overrides
 * @param {boolean} options.allowNoOrigin - Allow requests without Origin header (default: dev only)
 */
const getCorsOptions = (options = {}) => {
  const { origins: allowedOrigins, patterns: allowedPatterns } = parseOrigins();
  const isDev = process.env.NODE_ENV === 'development';
  const allowNoOrigin = options.allowNoOrigin ?? isDev;

  return {
    origin: (origin, callback) => {
      // Handle requests with no Origin header (mobile apps, Postman, server-to-server)
      // In production, only allow this for specific paths (webhooks) - handled at route level
      if (!origin) {
        if (allowNoOrigin) {
          return callback(null, true);
        }
        // Log in production for monitoring (no crash, just reject)
        if (process.env.NODE_ENV === 'production') {
          console.warn('[CORS] Rejected: No origin header in production');
        }
        return callback(null, false);
      }

      // Check if origin is allowed
      if (isOriginAllowed(origin, allowedOrigins, allowedPatterns)) {
        return callback(null, true);
      }

      // Log rejected origins for debugging (safe - no sensitive data, no crash)
      console.warn(`[CORS] Rejected origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true, // Required for cookies and Authorization headers
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cache-Control'
    ],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400, // 24 hours - cache preflight responses
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  };
};

/**
 * Get allowed origins array for Socket.IO configuration
 * Socket.IO needs an array of origins/functions, not the full CORS callback
 */
const getSocketOrigins = () => {
  const { origins, patterns } = parseOrigins();

  // If we have wildcard patterns, return a validation function
  if (patterns.length > 0) {
    return (origin, callback) => {
      // Socket.IO may send undefined origin in some cases
      if (!origin) {
        return callback(null, true);
      }

      if (isOriginAllowed(origin, origins, patterns)) {
        return callback(null, true);
      }

      console.warn(`[Socket.IO CORS] Rejected origin: ${origin}`);
      return callback(new Error('CORS not allowed'), false);
    };
  }

  // No wildcards - return simple array (more efficient)
  return origins;
};

/**
 * Get CORS configuration summary for logging at startup
 */
const getCorsConfigSummary = () => {
  const { origins, patterns } = parseOrigins();
  return {
    explicitOrigins: origins,
    wildcardPatterns: patterns.map(p => p.source),
    allowNoOriginInDev: process.env.NODE_ENV === 'development',
    credentialsEnabled: true
  };
};

module.exports = {
  getCorsOptions,
  getSocketOrigins,
  getCorsConfigSummary,
  parseOrigins,      // Exported for testing
  isOriginAllowed    // Exported for testing
};
