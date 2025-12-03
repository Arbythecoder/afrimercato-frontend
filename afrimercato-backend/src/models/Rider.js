// =================================================================
// RIDER MODEL
// =================================================================
// Handles rider (delivery agent) information and performance tracking
// Per SRS Section 2.1.4 - Rider Functionality

const mongoose = require('mongoose');
const { encrypt, decrypt, maskData } = require('../utils/encryption');

/**
 * RIDER MODEL SCHEMA
 *
 * A Rider is a delivery agent who:
 * - Picks up orders from vendors
 * - Delivers to customers
 * - Tracks delivery timeline
 * - Communicates with customers via in-app chat
 * - Can also be a picker (dual role per SRS 2.1.4.1.b)
 */

const riderSchema = new mongoose.Schema({
  // =================================================================
  // USER REFERENCE
  // =================================================================
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // =================================================================
  // RIDER IDENTIFICATION
  // =================================================================
  riderId: {
    type: String,
    required: true,
    unique: true,
    // Format: RD-0001-A3B4 (RD = Rider, 0001 = sequential, A3B4 = random)
    // Generated automatically during registration
  },

  // =================================================================
  // PERSONAL INFORMATION
  // =================================================================
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },

  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },

  profileImage: {
    type: String,
    default: null
    // URL to profile photo stored in cloud storage
  },

  // =================================================================
  // VEHICLE INFORMATION
  // =================================================================
  vehicle: {
    type: {
      type: String,
      enum: ['bicycle', 'motorcycle', 'car', 'van'],
      required: [true, 'Vehicle type is required']
    },
    plate: {
      type: String,
      required: [true, 'Vehicle plate number is required'],
      trim: true,
      uppercase: true
    },
    color: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    }
  },

  // =================================================================
  // SERVICE AREAS (Per SRS 2.1.4.1.a - Connect with stores in location)
  // =================================================================
  serviceAreas: {
    postcodes: [{
      type: String,
      trim: true,
      uppercase: true
      // UK postcodes (e.g., "SW1A 1AA", "M1 1AE")
    }],
    cities: [{
      type: String,
      trim: true
      // Cities/regions they serve (e.g., "London", "Manchester")
    }],
    maxDistance: {
      type: Number,
      default: 10
      // Maximum delivery distance in kilometers
    }
  },

  // =================================================================
  // DUAL ROLE (Per SRS 2.1.4.1.b - Riders can also be pickers)
  // =================================================================
  isAlsoPicker: {
    type: Boolean,
    default: false
  },

  pickerStores: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
    // Stores where rider also works as picker
  }],

  // =================================================================
  // CONNECTED STORES (Per SRS 2.1.4.1.a)
  // =================================================================
  connectedStores: [{
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
      // Vendor user who approved
    },
    approvedAt: {
      type: Date
    }
  }],

  // =================================================================
  // VERIFICATION & STATUS
  // =================================================================
  isVerified: {
    type: Boolean,
    default: false
    // Admin must verify rider before they can accept deliveries
  },

  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // Admin who verified
  },

  verifiedAt: {
    type: Date
  },

  isActive: {
    type: Boolean,
    default: true
    // Can be deactivated by admin
  },

  isAvailable: {
    type: Boolean,
    default: false
    // Currently available for new deliveries (online/offline)
  },

  // =================================================================
  // DOCUMENTS (Required for verification)
  // =================================================================
  documents: {
    drivingLicense: {
      url: String,
      verified: {
        type: Boolean,
        default: false
      },
      expiryDate: Date
    },
    insurance: {
      url: String,
      verified: {
        type: Boolean,
        default: false
      },
      expiryDate: Date
    },
    backgroundCheck: {
      status: {
        type: String,
        enum: ['pending', 'passed', 'failed'],
        default: 'pending'
      },
      completedAt: Date
    }
  },

  // =================================================================
  // BANK DETAILS (For payments)
  // =================================================================
  bankDetails: {
    bankName: {
      type: String,
      trim: true
    },
    accountNumber: {
      type: String,
      trim: true
    },
    accountName: {
      type: String,
      trim: true
    },
    sortCode: {
      type: String,
      trim: true
    }
  },

  // =================================================================
  // PERFORMANCE METRICS
  // =================================================================
  performance: {
    totalDeliveries: {
      type: Number,
      default: 0
    },
    completedDeliveries: {
      type: Number,
      default: 0
    },
    cancelledDeliveries: {
      type: Number,
      default: 0
    },
    failedDeliveries: {
      type: Number,
      default: 0
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    },
    averageDeliveryTime: {
      type: Number,
      default: 0
      // In minutes
    },
    onTimeDeliveryRate: {
      type: Number,
      default: 0
      // Percentage (0-100)
    },
    lastDeliveryAt: {
      type: Date
    }
  },

  // =================================================================
  // EARNINGS
  // =================================================================
  earnings: {
    totalEarnings: {
      type: Number,
      default: 0
    },
    pendingEarnings: {
      type: Number,
      default: 0
      // Earnings from completed but unpaid deliveries
    },
    paidEarnings: {
      type: Number,
      default: 0
    },
    lastPaymentAt: {
      type: Date
    }
  },

  // =================================================================
  // CURRENT LOCATION (For tracking)
  // =================================================================
  currentLocation: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    lastUpdated: {
      type: Date
    }
  },

  // =================================================================
  // SETTINGS & PREFERENCES
  // =================================================================
  settings: {
    notificationsEnabled: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    autoAcceptDeliveries: {
      type: Boolean,
      default: false
      // Automatically accept deliveries from approved stores
    },
    preferredDeliveryTime: {
      start: String, // e.g., "09:00"
      end: String    // e.g., "18:00"
    }
  },

  // =================================================================
  // NOTES (Admin use)
  // =================================================================
  notes: {
    type: String,
    trim: true
    // Internal notes from admin
  }

}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// =================================================================
// INDEXES for faster queries
// =================================================================
riderSchema.index({ user: 1 });
riderSchema.index({ riderId: 1 });
riderSchema.index({ isVerified: 1, isActive: 1, isAvailable: 1 });
riderSchema.index({ 'serviceAreas.postcodes': 1 });
riderSchema.index({ 'serviceAreas.cities': 1 });
riderSchema.index({ 'connectedStores.vendor': 1 });
riderSchema.index({ 'performance.averageRating': -1 });

// =================================================================
// VIRTUAL FIELDS
// =================================================================

// Completion rate
riderSchema.virtual('completionRate').get(function() {
  if (this.performance.totalDeliveries === 0) return 0;
  return (this.performance.completedDeliveries / this.performance.totalDeliveries * 100).toFixed(2);
});

// Success rate (completed vs failed)
riderSchema.virtual('successRate').get(function() {
  const totalCompleted = this.performance.completedDeliveries;
  const totalFailed = this.performance.failedDeliveries;
  const total = totalCompleted + totalFailed;
  if (total === 0) return 0;
  return (totalCompleted / total * 100).toFixed(2);
});

// =================================================================
// INSTANCE METHODS
// =================================================================

/**
 * Update performance metrics after delivery
 */
riderSchema.methods.updatePerformanceAfterDelivery = async function(deliveryData) {
  this.performance.totalDeliveries += 1;

  if (deliveryData.status === 'delivered') {
    this.performance.completedDeliveries += 1;
    this.performance.lastDeliveryAt = new Date();

    // Update average delivery time
    if (deliveryData.deliveryTime) {
      const currentTotal = this.performance.averageDeliveryTime * (this.performance.completedDeliveries - 1);
      this.performance.averageDeliveryTime = (currentTotal + deliveryData.deliveryTime) / this.performance.completedDeliveries;
    }

    // Update on-time delivery rate
    if (deliveryData.onTime !== undefined) {
      const onTimeDeliveries = (this.performance.onTimeDeliveryRate / 100) * (this.performance.completedDeliveries - 1);
      this.performance.onTimeDeliveryRate = ((onTimeDeliveries + (deliveryData.onTime ? 1 : 0)) / this.performance.completedDeliveries) * 100;
    }
  } else if (deliveryData.status === 'cancelled') {
    this.performance.cancelledDeliveries += 1;
  } else if (deliveryData.status === 'failed') {
    this.performance.failedDeliveries += 1;
  }

  await this.save();
};

/**
 * Update rating
 */
riderSchema.methods.updateRating = async function(newRating) {
  const currentTotal = this.performance.averageRating * this.performance.totalRatings;
  this.performance.totalRatings += 1;
  this.performance.averageRating = (currentTotal + newRating) / this.performance.totalRatings;
  await this.save();
};

/**
 * Update earnings
 */
riderSchema.methods.addEarnings = async function(amount) {
  this.earnings.totalEarnings += amount;
  this.earnings.pendingEarnings += amount;
  await this.save();
};

/**
 * Process payment
 */
riderSchema.methods.processPayment = async function(amount) {
  if (this.earnings.pendingEarnings >= amount) {
    this.earnings.pendingEarnings -= amount;
    this.earnings.paidEarnings += amount;
    this.earnings.lastPaymentAt = new Date();
    await this.save();
    return true;
  }
  return false;
};

/**
 * Check if rider is in service area
 */
riderSchema.methods.isInServiceArea = function(postcode, city) {
  if (postcode && this.serviceAreas.postcodes.length > 0) {
    // Check if postcode prefix matches
    const postcodePrefix = postcode.split(' ')[0].toUpperCase();
    return this.serviceAreas.postcodes.some(pc => pc.startsWith(postcodePrefix));
  }

  if (city && this.serviceAreas.cities.length > 0) {
    return this.serviceAreas.cities.some(c => c.toLowerCase() === city.toLowerCase());
  }

  return false;
};

/**
 * Check if rider is connected to a specific store
 */
riderSchema.methods.isConnectedToStore = function(vendorId) {
  return this.connectedStores.some(
    store => store.vendor.toString() === vendorId.toString() && store.status === 'approved'
  );
};

/**
 * Toggle availability
 */
riderSchema.methods.toggleAvailability = async function() {
  this.isAvailable = !this.isAvailable;
  await this.save();
  return this.isAvailable;
};

/**
 * Get decrypted bank details
 * IMPORTANT: Only call this when absolutely necessary (admin viewing, payouts)
 * Never send to client-side!
 */
riderSchema.methods.getDecryptedBankDetails = function() {
  try {
    return {
      bankName: this.bankDetails.bankName,
      accountNumber: this.bankDetails.accountNumber ? decrypt(this.bankDetails.accountNumber) : null,
      accountName: this.bankDetails.accountName,
      sortCode: this.bankDetails.sortCode ? decrypt(this.bankDetails.sortCode) : null
    };
  } catch (error) {
    console.error('Failed to decrypt bank details for rider:', this.riderId);
    return null;
  }
};

/**
 * Get masked bank details (safe for display)
 * Shows last 4 digits only
 */
riderSchema.methods.getMaskedBankDetails = function() {
  try {
    const decrypted = this.getDecryptedBankDetails();
    if (!decrypted) return null;

    return {
      bankName: decrypted.bankName,
      accountNumber: decrypted.accountNumber ? maskData(decrypted.accountNumber, 4) : null,
      accountName: decrypted.accountName,
      sortCode: decrypted.sortCode ? maskData(decrypted.sortCode, 2) : null
    };
  } catch (error) {
    return {
      bankName: this.bankDetails.bankName,
      accountNumber: '****',
      accountName: this.bankDetails.accountName,
      sortCode: '****'
    };
  }
};

// =================================================================
// STATIC METHODS
// =================================================================

/**
 * Find available riders in a service area
 */
riderSchema.statics.findAvailableRiders = function(postcode, city) {
  return this.find({
    isVerified: true,
    isActive: true,
    isAvailable: true,
    $or: [
      { 'serviceAreas.postcodes': new RegExp(`^${postcode.split(' ')[0]}`, 'i') },
      { 'serviceAreas.cities': new RegExp(city, 'i') }
    ]
  }).sort({ 'performance.averageRating': -1, 'performance.onTimeDeliveryRate': -1 });
};

/**
 * Get top performers
 */
riderSchema.statics.getTopPerformers = function(limit = 10) {
  return this.find({
    isVerified: true,
    isActive: true,
    'performance.totalDeliveries': { $gte: 10 } // Minimum 10 deliveries
  })
  .sort({ 'performance.averageRating': -1, 'performance.onTimeDeliveryRate': -1 })
  .limit(limit);
};

// =================================================================
// PRE-SAVE MIDDLEWARE
// =================================================================

riderSchema.pre('save', function(next) {
  // Ensure averageRating is between 0 and 5
  if (this.performance.averageRating > 5) {
    this.performance.averageRating = 5;
  }
  if (this.performance.averageRating < 0) {
    this.performance.averageRating = 0;
  }

  // Ensure onTimeDeliveryRate is between 0 and 100
  if (this.performance.onTimeDeliveryRate > 100) {
    this.performance.onTimeDeliveryRate = 100;
  }
  if (this.performance.onTimeDeliveryRate < 0) {
    this.performance.onTimeDeliveryRate = 0;
  }

  // Encrypt sensitive bank details before saving
  // Only encrypt if modified and not already encrypted
  if (this.isModified('bankDetails.accountNumber') && this.bankDetails.accountNumber) {
    // Check if already encrypted (contains colons from iv:tag:data format)
    if (!this.bankDetails.accountNumber.includes(':')) {
      try {
        this.bankDetails.accountNumber = encrypt(this.bankDetails.accountNumber);
      } catch (error) {
        return next(new Error('Failed to encrypt account number'));
      }
    }
  }

  if (this.isModified('bankDetails.sortCode') && this.bankDetails.sortCode) {
    if (!this.bankDetails.sortCode.includes(':')) {
      try {
        this.bankDetails.sortCode = encrypt(this.bankDetails.sortCode);
      } catch (error) {
        return next(new Error('Failed to encrypt sort code'));
      }
    }
  }

  next();
});

// =================================================================
// EXPORT MODEL
// =================================================================

module.exports = mongoose.model('Rider', riderSchema);
