// File: src/models/Vendor.js

const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    storeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // ✅ REMOVED index: true and unique: true from here - defined below
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    storeName: {
      type: String,
      required: [true, 'Please provide a store name'],
      trim: true,
      maxlength: [100, 'Store name cannot exceed 100 characters']
    },

    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      trim: true
    },

    logo: {
      type: String,
      default: null
    },

    category: {
      type: String,
      required: [true, 'Please provide a business category'],
      trim: true,
      minlength: [2, 'Category must be at least 2 characters'],
      maxlength: [50, 'Category cannot exceed 50 characters']
    },

    address: {
      street: {
        type: String,
        required: [true, 'Please provide street address']
      },
      city: {
        type: String,
        required: [true, 'Please provide city']
      },
      state: {
        type: String,
        required: false  // County is optional for UK addresses
      },
      postalCode: {
        type: String
      },
      country: {
        type: String,
        default: 'Nigeria'
      },
      coordinates: {
        latitude: {
          type: Number,
          min: -90,
          max: 90
        },
        longitude: {
          type: Number,
          min: -180,
          max: 180
        }
      }
    },

    phone: {
      type: String,
      required: [true, 'Please provide business phone number'],
      trim: true
    },
    alternativePhone: {
      type: String,
      trim: true
    },

    businessHours: {
      monday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: true }
      },
      tuesday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: true }
      },
      wednesday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: true }
      },
      thursday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: true }
      },
      friday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: true }
      },
      saturday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '18:00' },
        isOpen: { type: Boolean, default: true }
      },
      sunday: {
        open: { type: String, default: '10:00' },
        close: { type: String, default: '16:00' },
        isOpen: { type: Boolean, default: false }
      }
    },

    bankDetails: {
      bankName: String,
      accountNumber: String,
      accountName: String,
      routingNumber: String
    },

    // Store Approval Status (Auto-approved - no admin verification required)
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended', 'needs_info'],
      default: 'approved'
    },
    approvalNote: {
      type: String,
      default: null
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    approvedAt: {
      type: Date,
      default: null
    },
    rejectedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: null
    },

    // Verification tracking
    submittedForReviewAt: {
      type: Date,
      default: null
    },
    lastReviewedAt: {
      type: Date,
      default: null
    },
    reviewerNotes: {
      type: String,
      default: null
    },

    isVerified: {
      type: Boolean,
      default: false
    },
    // PUBLIC VISIBILITY (UberEats-style)
    // Controls whether store appears in customer searches
    // False for pending approval, true after admin approves
    isPublic: {
      type: Boolean,
      default: false
    },
    verificationDocuments: [
      {
        type: String
      }
    ],
    verifiedAt: {
      type: Date,
      default: null
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },

    stats: {
      totalOrders: {
        type: Number,
        default: 0
      },
      totalRevenue: {
        type: Number,
        default: 0
      },
      totalProducts: {
        type: Number,
        default: 0
      }
    },

    isActive: {
      type: Boolean,
      default: true
    },
    isClosed: {
      type: Boolean,
      default: false
    },
    closureReason: {
      type: String,
      default: null
    },

    deliveryRadius: {
      type: Number,
      default: 10,
      min: 1,
      max: 50
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0
    },
    freeDeliveryAbove: {
      type: Number,
      default: null
    },

    // Delivery Timeline Settings (Premium Features)
    deliverySettings: {
      estimatedPrepTime: {
        type: Number,
        default: 30, // minutes
        min: 5,
        max: 180
      },
      minimumOrderValue: {
        type: Number,
        default: 0,
        min: 0
      },
      acceptingOrders: {
        type: Boolean,
        default: true
      },
      autoAcceptOrders: {
        type: Boolean,
        default: false
      },
      maxOrdersPerHour: {
        type: Number,
        default: 20,
        min: 1,
        max: 100
      },
      deliverySlots: {
        enabled: {
          type: Boolean,
          default: false
        },
        slots: [{
          day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
          },
          startTime: String,
          endTime: String,
          maxOrders: Number
        }]
      },
      peakHours: [{
        day: {
          type: String,
          enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        },
        startTime: String,
        endTime: String,
        surcharge: Number // percentage
      }]
    },

    socialMedia: {
      facebook: String,
      instagram: String,
      twitter: String,
      whatsapp: String
    }
  },
  {
    timestamps: true
  }
);

// ✅ Indexes defined ONLY here (not in field definitions)
vendorSchema.index({ user: 1 }, { unique: true });
vendorSchema.index({ 'address.coordinates': '2dsphere' });
vendorSchema.index({ category: 1 });
vendorSchema.index({ isVerified: 1, isActive: 1 });

// Virtuals
vendorSchema.virtual('fullAddress').get(function () {
  if (!this.address) return '';
  const { street, city, state, postalCode, country } = this.address;
  return `${street}, ${city}, ${state} ${postalCode || ''}, ${country}`.trim();
});

vendorSchema.virtual('isCurrentlyOpen').get(function () {
  if (this.isClosed) return false;
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.toTimeString().slice(0, 5);
  const todayHours = this.businessHours[day];
  if (!todayHours || !todayHours.isOpen) return false;
  return currentTime >= todayHours.open && currentTime <= todayHours.close;
});

vendorSchema.set('toJSON', { virtuals: true });
vendorSchema.set('toObject', { virtuals: true });

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;