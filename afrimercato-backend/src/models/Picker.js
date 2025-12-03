/**
 * PICKER MODEL
 * Pickers help vendors pick and pack orders from store inventory
 * Different from Riders - Pickers work INSIDE the store, Riders deliver OUTSIDE
 * A person can be BOTH a picker and a rider (multi-role)
 */

const mongoose = require('mongoose');

const pickerSchema = new mongoose.Schema({
  // Link to User account
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // ======================
  // BASIC INFO
  // ======================
  profile: {
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    address: {
      street: String,
      city: String,
      state: String,
      postcode: String,
      country: { type: String, default: 'Ireland' }
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },

  // ======================
  // VENDOR STORE CONNECTIONS
  // ======================
  // Pickers can work at multiple vendor stores
  connectedStores: [{
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending'
    },
    // Role at the store
    storeRole: {
      type: String,
      enum: ['picker', 'packer', 'supervisor', 'inventory_manager'],
      default: 'picker'
    },
    // Which sections can they access?
    sections: [{
      type: String // e.g., 'fresh-produce', 'meat', 'dairy', 'bakery', 'all'
    }],
    requestedAt: {
      type: Date,
      default: Date.now
    },
    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    rejectionReason: String,
    // Work schedule at this store
    schedule: {
      monday: { start: String, end: String, enabled: Boolean },
      tuesday: { start: String, end: String, enabled: Boolean },
      wednesday: { start: String, end: String, enabled: Boolean },
      thursday: { start: String, end: String, enabled: Boolean },
      friday: { start: String, end: String, enabled: Boolean },
      saturday: { start: String, end: String, enabled: Boolean },
      sunday: { start: String, end: String, enabled: Boolean }
    }
  }],

  // ======================
  // AVAILABILITY
  // ======================
  availability: {
    isAvailable: { type: Boolean, default: false },
    // Which store is picker currently at?
    currentStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor'
    },
    lastCheckIn: Date,
    lastCheckOut: Date
  },

  // ======================
  // VERIFICATION & DOCUMENTS
  // ======================
  verification: {
    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending'
    },
    idDocument: {
      type: String, // e.g., 'passport', 'drivers_license', 'national_id'
      number: String,
      frontImage: String,
      backImage: String,
      expiryDate: Date
    },
    backgroundCheck: {
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'passed', 'failed'],
        default: 'not_started'
      },
      completedAt: Date,
      reference: String
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    rejectionReason: String
  },

  // ======================
  // PICKER STATISTICS
  // ======================
  stats: {
    // Performance metrics
    totalOrdersPicked: { type: Number, default: 0 },
    ordersPickedToday: { type: Number, default: 0 },
    ordersPickedThisWeek: { type: Number, default: 0 },
    ordersPickedThisMonth: { type: Number, default: 0 },

    // Currently picking
    activeOrders: { type: Number, default: 0 },

    // Accuracy metrics
    pickingAccuracy: { type: Number, default: 100, min: 0, max: 100 }, // Percentage
    wrongItemsReported: { type: Number, default: 0 },
    missedItems: { type: Number, default: 0 },

    // Speed metrics
    averagePickTime: { type: Number, default: 0 }, // Minutes per order
    fastestPick: { type: Number, default: 0 }, // Minutes
    slowestPick: { type: Number, default: 0 }, // Minutes

    // Rating
    rating: { type: Number, default: 5.0, min: 0, max: 5 },
    totalRatings: { type: Number, default: 0 },

    // Earnings
    totalEarnings: { type: Number, default: 0 }, // Total all-time
    earningsThisWeek: { type: Number, default: 0 },
    earningsThisMonth: { type: Number, default: 0 }
  },

  // ======================
  // PAYMENT INFO
  // ======================
  paymentInfo: {
    method: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'stripe', 'cash'],
      default: 'bank_transfer'
    },
    bankAccount: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      iban: String,
      swift: String
    },
    paypalEmail: String,
    stripeAccountId: String,

    // Payment schedule
    paymentSchedule: {
      type: String,
      enum: ['daily', 'weekly', 'bi_weekly', 'monthly'],
      default: 'weekly'
    }
  },

  // ======================
  // TRAINING & CERTIFICATIONS
  // ======================
  training: {
    foodHandling: {
      completed: { type: Boolean, default: false },
      certificateNumber: String,
      expiryDate: Date
    },
    healthAndSafety: {
      completed: { type: Boolean, default: false },
      completedAt: Date
    },
    inventoryManagement: {
      completed: { type: Boolean, default: false },
      completedAt: Date
    }
  },

  // ======================
  // EQUIPMENT
  // ======================
  equipment: {
    hasSmartphone: { type: Boolean, default: true, required: true },
    hasBarcodScanner: { type: Boolean, default: false },
    hasPrinter: { type: Boolean, default: false }
  },

  // ======================
  // STATUS
  // ======================
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  suspensionReason: String,
  suspendedAt: Date,
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // ======================
  // NOTES
  // ======================
  notes: [{
    content: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: { type: Date, default: Date.now }
  }]

}, {
  timestamps: true // Adds createdAt and updatedAt
});

// ======================
// INDEXES FOR PERFORMANCE
// ======================
pickerSchema.index({ user: 1 });
pickerSchema.index({ 'connectedStores.vendorId': 1 });
pickerSchema.index({ 'availability.isAvailable': 1 });
pickerSchema.index({ 'availability.currentStore': 1 });
pickerSchema.index({ 'verification.status': 1 });
pickerSchema.index({ isActive: 1 });

// ======================
// VIRTUAL FIELDS
// ======================

// Get approved stores only
pickerSchema.virtual('approvedStores').get(function() {
  return this.connectedStores.filter(store => store.status === 'approved');
});

// Check if picker is currently working
pickerSchema.virtual('isWorking').get(function() {
  return this.availability.isAvailable && this.availability.currentStore !== null;
});

// ======================
// INSTANCE METHODS
// ======================

/**
 * Check if picker is approved to work at a specific vendor store
 */
pickerSchema.methods.isApprovedForStore = function(vendorId) {
  return this.connectedStores.some(
    store => store.vendorId.toString() === vendorId.toString() && store.status === 'approved'
  );
};

/**
 * Get store connection details
 */
pickerSchema.methods.getStoreConnection = function(vendorId) {
  return this.connectedStores.find(
    store => store.vendorId.toString() === vendorId.toString()
  );
};

/**
 * Check in at a store (start shift)
 */
pickerSchema.methods.checkIn = async function(vendorId) {
  if (!this.isApprovedForStore(vendorId)) {
    throw new Error('Picker is not approved for this store');
  }

  this.availability.isAvailable = true;
  this.availability.currentStore = vendorId;
  this.availability.lastCheckIn = new Date();

  await this.save();
  return true;
};

/**
 * Check out from store (end shift)
 */
pickerSchema.methods.checkOut = async function() {
  this.availability.isAvailable = false;
  this.availability.currentStore = null;
  this.availability.lastCheckOut = new Date();

  await this.save();
  return true;
};

/**
 * Update picking statistics
 */
pickerSchema.methods.updateStats = async function(orderData) {
  this.stats.totalOrdersPicked += 1;
  this.stats.ordersPickedToday += 1;
  this.stats.ordersPickedThisWeek += 1;
  this.stats.ordersPickedThisMonth += 1;
  this.stats.activeOrders = Math.max(0, this.stats.activeOrders - 1);

  // Update pick time
  if (orderData.pickTime) {
    const totalPicks = this.stats.totalOrdersPicked;
    this.stats.averagePickTime =
      ((this.stats.averagePickTime * (totalPicks - 1)) + orderData.pickTime) / totalPicks;

    if (!this.stats.fastestPick || orderData.pickTime < this.stats.fastestPick) {
      this.stats.fastestPick = orderData.pickTime;
    }

    if (orderData.pickTime > this.stats.slowestPick) {
      this.stats.slowestPick = orderData.pickTime;
    }
  }

  // Update accuracy
  if (orderData.accuracy !== undefined) {
    const totalPicks = this.stats.totalOrdersPicked;
    this.stats.pickingAccuracy =
      ((this.stats.pickingAccuracy * (totalPicks - 1)) + orderData.accuracy) / totalPicks;
  }

  await this.save();
};

/**
 * Reset daily statistics (run this at midnight)
 */
pickerSchema.methods.resetDailyStats = async function() {
  this.stats.ordersPickedToday = 0;
  await this.save();
};

/**
 * Add note
 */
pickerSchema.methods.addNote = async function(content, userId) {
  this.notes.push({
    content,
    createdBy: userId,
    createdAt: new Date()
  });
  await this.save();
};

// ======================
// STATIC METHODS
// ======================

/**
 * Find available pickers at a specific store
 */
pickerSchema.statics.findAvailablePickersAtStore = async function(vendorId) {
  return this.find({
    'connectedStores.vendorId': vendorId,
    'connectedStores.status': 'approved',
    'availability.isAvailable': true,
    'availability.currentStore': vendorId,
    'verification.status': 'verified',
    isActive: true,
    isSuspended: false
  }).populate('user', 'name email phone');
};

/**
 * Find best picker for order (highest accuracy + fastest)
 */
pickerSchema.statics.findBestPickerForOrder = async function(vendorId) {
  const availablePickers = await this.findAvailablePickersAtStore(vendorId);

  if (availablePickers.length === 0) {
    return null;
  }

  // Score pickers based on performance
  const scoredPickers = availablePickers.map(picker => {
    let score = 0;
    score += picker.stats.pickingAccuracy; // 0-100 points
    score += picker.stats.rating * 10; // 0-50 points
    score -= picker.stats.activeOrders * 10; // Fewer active orders better

    // Speed bonus (inverse of pick time)
    if (picker.stats.averagePickTime > 0) {
      score += 100 / picker.stats.averagePickTime; // Faster = higher score
    }

    return { picker, score };
  });

  // Sort by score (highest first)
  scoredPickers.sort((a, b) => b.score - a.score);

  return scoredPickers[0].picker;
};

const Picker = mongoose.model('Picker', pickerSchema);

module.exports = Picker;
