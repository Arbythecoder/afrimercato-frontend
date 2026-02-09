// =================================================================
// VENDOR MODEL - MongoDB Schema for Vendors/Stores
// =================================================================
// PRODUCTION-READY: Enforced validation, secure defaults

const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  // REQUIRED FIELDS
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid user ID format'
    }
  },
  storeName: {
    type: String,
    required: [true, 'Store name is required'],
    trim: true,
    minlength: [2, 'Store name must be at least 2 characters'],
    maxlength: [100, 'Store name cannot exceed 100 characters']
  },
  storeId: {
    type: String,
    required: [true, 'Store ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },

  // OPTIONAL FIELDS
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  storeDescription: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  address: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  alternativePhone: {
    type: String,
    trim: true
  },
  logo: String,
  coverImage: String,

  // VERIFICATION & APPROVAL
  isVerified: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  submittedForReviewAt: Date,
  approvedAt: Date,
  verificationStep: String,

  // LOCATION
  location: {
    address: String,
    postcode: String,
    city: String,
    country: String,
    latitude: Number,
    longitude: Number,
    // GeoJSON for MongoDB geospatial queries
    coordinates: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  currency: {
    type: String,
    enum: ['GBP', 'EUR'],
    default: 'GBP'
  },
  isSeeded: {
    type: Boolean,
    default: false,
    select: false
  },

  // BUSINESS DETAILS
  businessLicense: String,
  taxId: String,
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    sortCode: String,
    bankName: String
  },
  businessHours: Object,

  // DELIVERY SETTINGS
  deliveryRadius: {
    type: Number,
    min: [0, 'Delivery radius cannot be negative'],
    default: 5
  },
  deliveryFee: {
    type: Number,
    min: [0, 'Delivery fee cannot be negative'],
    default: 0
  },
  freeDeliveryAbove: {
    type: Number,
    min: [0, 'Free delivery threshold cannot be negative']
  },
  deliverySettings: {
    estimatedPrepTime: { type: Number, default: 30 },
    minimumOrderValue: { type: Number, default: 0 },
    acceptingOrders: { type: Boolean, default: true },
    autoAcceptOrders: { type: Boolean, default: false },
    maxOrdersPerHour: { type: Number, default: 20 },
    deliverySlots: { type: Object, default: {} },
    peakHours: { type: Array, default: [] }
  },

  // STATISTICS
  stats: {
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 }
  },
  rating: {
    type: Number,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  reviews: {
    type: Number,
    min: [0, 'Reviews count cannot be negative'],
    default: 0
  },
  totalOrders: {
    type: Number,
    min: [0, 'Total orders cannot be negative'],
    default: 0
  },
  totalRevenue: {
    type: Number,
    min: [0, 'Total revenue cannot be negative'],
    default: 0
  },

  // STATUS
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  isClosed: {
    type: Boolean,
    default: false
  },
  isDemo: {
    type: Boolean,
    default: false,
    select: false // Don't include in queries by default
  },
  closureReason: String,
  socialMedia: Object,

  // TIMESTAMPS
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// =================================================================
// INDEXES FOR PERFORMANCE
// =================================================================
vendorSchema.index({ user: 1 });
vendorSchema.index({ storeId: 1 });
vendorSchema.index({ category: 1, isActive: 1 });
vendorSchema.index({ approvalStatus: 1 });
vendorSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
vendorSchema.index({ 'location.coordinates.coordinates': '2dsphere' }); // Geospatial index
vendorSchema.index({ 'location.city': 1 }); // CRITICAL: Enable fast city-based store search
vendorSchema.index({ isActive: 1, isVerified: 1, approvalStatus: 1 }); // Compound index for common queries

module.exports = mongoose.model('Vendor', vendorSchema);
