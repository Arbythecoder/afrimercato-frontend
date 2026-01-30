// =================================================================
// USER MODEL - MongoDB Schema for Users
// =================================================================
// PRODUCTION-READY: Secure, backward-compatible, with password hashing

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // REQUIRED FIELDS - enforced at schema level
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  roles: {
    type: [String],
    required: true,
    default: ['customer'],
    enum: ['customer', 'vendor', 'rider', 'picker', 'admin']
  },

  // NAME FIELDS - support both legacy 'name' and new 'firstName/lastName'
  // This ensures backward compatibility with existing data
  name: {
    type: String,
    trim: true
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },

  // OPTIONAL FIELDS
  phone: {
    type: String,
    trim: true
  },
  avatar: String,
  verified: {
    type: Boolean,
    default: false
  },
  emailVerified: {
    type: Boolean,
    default: false
  },

  // EMAIL VERIFICATION
  emailVerificationToken: String,
  emailVerificationExpires: Date,

  // PASSWORD RESET
  passwordResetToken: String,
  passwordResetExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // REPEAT PURCHASE
  repeatPurchaseFrequency: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly', null],
    default: null
  },
  repeatPurchaseSettings: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly'],
      default: 'weekly'
    },
    nextRepeatDate: Date,
    autoRenewNotificationSent: { type: Boolean, default: false }
  },

  // VENDOR-SPECIFIC (backward compatibility)
  primaryRole: String,
  approvalStatus: String,

  // TIMESTAMPS
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true // Automatically manage createdAt and updatedAt
});

// =================================================================
// PRE-SAVE MIDDLEWARE - PASSWORD HASHING
// =================================================================
// CRITICAL: This ensures passwords are ALWAYS hashed before saving
// This prevents plaintext password storage and ensures consistency
userSchema.pre('save', async function(next) {
  // Only hash password if it's new or modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Hash password with bcrypt (salt rounds: 10)
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// =================================================================
// PRE-SAVE MIDDLEWARE - NAME SYNCHRONIZATION
// =================================================================
// Ensure backward compatibility between 'name' and 'firstName/lastName'
userSchema.pre('save', function(next) {
  // If firstName/lastName exist but name doesn't, create name
  if ((this.firstName || this.lastName) && !this.name) {
    this.name = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  // If name exists but firstName doesn't, split name
  if (this.name && !this.firstName) {
    const parts = this.name.trim().split(/\s+/);
    this.firstName = parts[0];
    this.lastName = parts.slice(1).join(' ');
  }

  next();
});

// =================================================================
// INSTANCE METHODS
// =================================================================

/**
 * Compare password for login
 * @param {String} candidatePassword - Password to check
 * @returns {Boolean} - True if password matches
 */
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

/**
 * Generate email verification token
 * @returns {String} - Verification token
 */
userSchema.methods.generateEmailVerificationToken = function() {
  const token = 'token_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  this.emailVerificationToken = token;
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

/**
 * Generate password reset token
 * @returns {String} - Reset token
 */
userSchema.methods.generatePasswordResetToken = function() {
  const token = 'reset_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  this.passwordResetToken = token;
  this.resetPasswordToken = token; // Backward compatibility
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token;
};

/**
 * Get safe user object (without password)
 * @returns {Object} - User object without sensitive fields
 */
userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.resetPasswordToken;
  delete obj.emailVerificationToken;
  return obj;
};

// =================================================================
// INDEXES FOR PERFORMANCE
// =================================================================
userSchema.index({ email: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);
