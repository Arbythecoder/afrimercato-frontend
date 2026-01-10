// =================================================================
// USER MODEL (DATABASE SCHEMA)
// =================================================================
// This file defines how user data is structured and stored in MongoDB
// Think of it as creating a form template that every user must fill out

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * WHAT IS A SCHEMA?
 * A schema is like a blueprint or template. It defines:
 * - What information we collect (name, email, password, etc.)
 * - What type each field is (text, number, date, etc.)
 * - Which fields are required
 * - Validation rules (email must be valid format, etc.)
 */
const userSchema = new mongoose.Schema(
  {
    // FULL NAME
    // Required: Yes
    // Type: Text (String)
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true, // Removes extra spaces
      maxlength: [50, 'Name cannot be more than 50 characters']
    },

    // EMAIL ADDRESS
    // Required: Yes
    // Must be unique (no two users can have same email)
    // Must match email format (something@domain.com)
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true, // Convert to lowercase before saving
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },

    // PASSWORD
    // Required: Yes
    // Minimum 6 characters
    // select: false means password won't be returned in queries (security!)
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false // Don't return password in queries
    },

    // USER ROLES (Multi-role support)
    // A user can have multiple roles: e.g., both picker AND rider
    // Array of roles: ['customer'], ['vendor'], ['picker', 'rider'], etc.
    // Default: ['customer'] (most users are customers)
    roles: {
      type: [String],
      enum: {
        values: ['customer', 'vendor', 'rider', 'picker', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: ['customer'],
      validate: {
        validator: function(roles) {
          return roles && roles.length > 0;
        },
        message: 'User must have at least one role'
      }
    },

    // PRIMARY ROLE (for backwards compatibility and default context)
    // When user logs in, which role dashboard should they see first?
    // This can be changed by user in their settings
    primaryRole: {
      type: String,
      enum: ['customer', 'vendor', 'rider', 'picker', 'admin'],
      default: function() {
        return this.roles && this.roles.length > 0 ? this.roles[0] : 'customer';
      }
    },

    // DEPRECATED: Keep for backwards compatibility (will be removed in future)
    // Use 'roles' array instead
    role: {
      type: String,
      enum: ['customer', 'vendor', 'rider', 'picker', 'admin']
    },

    // PHONE NUMBER (optional)
    phone: {
      type: String,
      trim: true,
      maxlength: [15, 'Phone number cannot be more than 15 characters']
    },

    // PROFILE AVATAR/PHOTO (optional)
    avatar: {
      type: String, // Stores the file path or URL
      default: null
    },

    // OAUTH / SOCIAL LOGIN
    // Google OAuth ID
    googleId: {
      type: String,
      default: null,
      sparse: true // Allows multiple nulls but unique when set
    },
    // Facebook OAuth ID
    facebookId: {
      type: String,
      default: null,
      sparse: true
    },
    // Authentication provider ('local', 'google', 'facebook')
    authProvider: {
      type: String,
      enum: ['local', 'google', 'facebook'],
      default: 'local'
    },

    // EMAIL VERIFICATION
    // isEmailVerified: Has the user confirmed their email?
    // emailVerificationToken: Random code sent to email for verification
    // emailVerificationExpire: When the verification code expires
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: String,
    emailVerificationExpire: Date,

    // PASSWORD RESET
    // These fields are used when user forgets password
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // ACCOUNT STATUS
    // Is the user's account active or has it been suspended/banned?
    isActive: {
      type: Boolean,
      default: true
    },

    // VENDOR APPROVAL STATUS
    // For vendors only - requires admin approval before they can access dashboard
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: function() {
        // Only vendors need approval, everyone else is auto-approved
        return this.roles && this.roles.includes('vendor') ? 'pending' : 'approved';
      }
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to admin who approved
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: null
    },

    // LAST LOGIN TRACKING
    // Helps you see when users were last active
    lastLogin: {
      type: Date,
      default: null
    },
    
    // MFA (MULTI-FACTOR AUTHENTICATION)
    // Used for two-factor authentication
    mfaToken: String,
    mfaTokenExpire: Date,
    // Maximum failed login attempts before lockout
    loginAttempts: {
      type: Number,
      default: 0
    },
    // When account will be unlocked after too many failed attempts
    lockUntil: {
      type: Date,
      default: null
    },

    // GDPR DATA DELETION (Right to Erasure - Article 17)
    deletionRequested: {
      type: Boolean,
      default: false
    },
    deletionRequestDate: {
      type: Date,
      default: null
    },
    deletionReason: {
      type: String,
      default: null
    },
    scheduledDeletionDate: {
      type: Date,
      default: null
    }
  },
  {
    // TIMESTAMPS
    // Automatically adds 'createdAt' and 'updatedAt' fields
    // createdAt: When user registered
    // updatedAt: When user info was last changed
    timestamps: true
  }
);

// =================================================================
// MIDDLEWARE: HASH PASSWORD BEFORE SAVING
// =================================================================
/**
 * WHAT IS MIDDLEWARE?
 * Middleware runs automatically before or after certain actions.
 * This one runs BEFORE saving a user to the database.
 *
 * WHAT DOES IT DO?
 * It converts the plain text password into a scrambled hash.
 *
 * WHY?
 * If someone hacks your database, they can't see actual passwords!
 * They only see scrambled text like: $2a$10$xYz123...
 *
 * EXAMPLE:
 * User types: "mypassword123"
 * Stored in DB: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
 */
userSchema.pre('save', async function (next) {
  // Only hash password if it was modified (or is new)
  if (!this.isModified('password')) {
    next(); // Skip to next middleware
    return;
  }

  // Hash the password
  // process.env.BCRYPT_ROUNDS controls how secure (and slow) the hashing is
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// =================================================================
// METHOD: COMPARE PASSWORD FOR LOGIN
// =================================================================
/**
 * This method checks if a login password matches the stored hash
 *
 * HOW IT WORKS:
 * User logs in with: "mypassword123"
 * We compare it with stored hash: "$2a$10$N9qo8..."
 * bcrypt.compare() checks if they match
 *
 * RETURNS:
 * true = correct password
 * false = wrong password
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// =================================================================
// METHOD: GENERATE JWT TOKEN
// =================================================================
/**
 * JWT (JSON Web Token) is like a VIP pass card
 *
 * WHAT IS IT?
 * After logging in, user gets a token (long random string)
 * They send this token with every request to prove who they are
 * No need to send username/password every time!
 *
 * WHAT'S INSIDE THE TOKEN?
 * - User ID
 * - User role
 * - Expiration time
 *
 * TOKEN LOOKS LIKE:
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
 */
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      id: this._id, // User's database ID
      role: this.primaryRole || this.roles[0] || 'customer', // User's primary role
      roles: this.roles, // All user roles
      email: this.email // User's email
    },
    process.env.JWT_SECRET, // Secret key to sign the token
    {
      expiresIn: process.env.JWT_EXPIRE // Token expires after this time
    }
  );
};

// =================================================================
// METHOD: GENERATE REFRESH TOKEN
// =================================================================
/**
 * WHAT IS A REFRESH TOKEN?
 * A refresh token is a longer-lasting token used to get new access tokens
 *
 * WHY TWO TOKENS?
 * - Access token: Short-lived (7 days), used for API requests
 * - Refresh token: Long-lived (30 days), used to get new access tokens
 *
 * SECURITY BENEFIT:
 * If someone steals an access token, it expires quickly
 * Refresh token is stored more securely and used less often
 */
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRE
    }
  );
};

// =================================================================
// METHOD: GENERATE PASSWORD RESET TOKEN
// =================================================================
/**
 * Used when user clicks "Forgot Password"
 *
 * HOW IT WORKS:
 * 1. User clicks "Forgot Password"
 * 2. System generates a random token
 * 3. Token is sent to user's email
 * 4. User clicks link with token
 * 5. System verifies token and lets user reset password
 *
 * TOKEN EXPIRES:
 * Reset links only work for 10 minutes (security!)
 */
userSchema.methods.generatePasswordResetToken = function () {
  // Generate random token
  const resetToken = jwt.sign(
    { id: this._id, purpose: 'password-reset' },
    process.env.JWT_SECRET,
    { expiresIn: '10m' } // Expires in 10 minutes
  );

  // Save hashed version to database
  this.resetPasswordToken = bcrypt.hashSync(resetToken, 10);
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes from now

  return resetToken; // Return unhashed token (this goes in the email)
};

// =================================================================
// METHOD: GENERATE EMAIL VERIFICATION TOKEN
// =================================================================
/**
 * Used when user registers to verify their email
 *
 * HOW IT WORKS:
 * 1. User registers
 * 2. System sends email with verification link
 * 3. User clicks link
 * 4. Email is marked as verified
 */
userSchema.methods.generateEmailVerificationToken = function () {
  const verificationToken = jwt.sign(
    { id: this._id, purpose: 'email-verification' },
    process.env.JWT_SECRET,
    { expiresIn: '24h' } // Expires in 24 hours
  );

  this.emailVerificationToken = bcrypt.hashSync(verificationToken, 10);
  this.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

// =================================================================
// MULTI-ROLE HELPER METHODS
// =================================================================

/**
 * Check if user has a specific role
 * @param {String} role - Role to check ('customer', 'vendor', 'rider', 'picker', 'admin')
 * @returns {Boolean} - True if user has the role
 *
 * Example: user.hasRole('picker') → true/false
 */
userSchema.methods.hasRole = function(role) {
  return this.roles && this.roles.includes(role);
};

/**
 * Check if user has ANY of the specified roles
 * @param {Array} roles - Array of roles to check
 * @returns {Boolean} - True if user has at least one of the roles
 *
 * Example: user.hasAnyRole(['picker', 'rider']) → true/false
 */
userSchema.methods.hasAnyRole = function(roles) {
  return this.roles && roles.some(role => this.roles.includes(role));
};

/**
 * Check if user has ALL of the specified roles
 * @param {Array} roles - Array of roles to check
 * @returns {Boolean} - True if user has all the roles
 *
 * Example: user.hasAllRoles(['picker', 'rider']) → true/false
 */
userSchema.methods.hasAllRoles = function(roles) {
  return this.roles && roles.every(role => this.roles.includes(role));
};

/**
 * Add a new role to user
 * @param {String} role - Role to add
 * @returns {Boolean} - True if role was added, false if already exists
 *
 * Example: user.addRole('picker')
 */
userSchema.methods.addRole = function(role) {
  const validRoles = ['customer', 'vendor', 'rider', 'picker', 'admin'];

  if (!validRoles.includes(role)) {
    throw new Error(`Invalid role: ${role}`);
  }

  if (!this.roles) {
    this.roles = [];
  }

  if (this.roles.includes(role)) {
    return false; // Role already exists
  }

  this.roles.push(role);

  // Set as primary role if it's the first role
  if (this.roles.length === 1) {
    this.primaryRole = role;
  }

  return true;
};

/**
 * Remove a role from user
 * @param {String} role - Role to remove
 * @returns {Boolean} - True if role was removed, false if not found
 *
 * Example: user.removeRole('picker')
 */
userSchema.methods.removeRole = function(role) {
  if (!this.roles || !this.roles.includes(role)) {
    return false; // Role doesn't exist
  }

  // Don't allow removing last role
  if (this.roles.length === 1) {
    throw new Error('Cannot remove last role. User must have at least one role.');
  }

  this.roles = this.roles.filter(r => r !== role);

  // Update primary role if we removed it
  if (this.primaryRole === role) {
    this.primaryRole = this.roles[0];
  }

  return true;
};

/**
 * Set primary role (which dashboard to show by default)
 * @param {String} role - Role to set as primary
 * @returns {Boolean} - True if successful
 *
 * Example: user.setPrimaryRole('rider')
 */
userSchema.methods.setPrimaryRole = function(role) {
  if (!this.roles || !this.roles.includes(role)) {
    throw new Error(`User does not have role: ${role}`);
  }

  this.primaryRole = role;
  return true;
};

/**
 * Get all roles as formatted string
 * @returns {String} - Comma-separated roles
 *
 * Example: user.getRolesString() → "picker, rider"
 */
userSchema.methods.getRolesString = function() {
  return this.roles ? this.roles.join(', ') : 'No roles';
};

// =================================================================
// BACKWARDS COMPATIBILITY MIDDLEWARE
// =================================================================
// Automatically sync 'role' field with 'roles' array for old code

userSchema.pre('save', function(next) {
  // Sync role field with roles array for backwards compatibility
  if (this.roles && this.roles.length > 0) {
    this.role = this.primaryRole || this.roles[0];
  }

  // Ensure primaryRole is set
  if (!this.primaryRole && this.roles && this.roles.length > 0) {
    this.primaryRole = this.roles[0];
  }

  next();
});

// Create the model from schema and export it
// Model name: 'User'
// Collection in MongoDB will be: 'users' (lowercase and pluralized)
const User = mongoose.model('User', userSchema);

module.exports = User;
