// =================================================================
// PRODUCT MODEL - MongoDB Schema for Products
// =================================================================
// PRODUCTION-READY: Enforced validation, prevents CastErrors

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // REQUIRED FIELDS - enforced at schema level
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: [true, 'Vendor ID is required'],
    validate: {
      validator: function(v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: 'Invalid vendor ID format'
    }
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [2, 'Product name must be at least 2 characters'],
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true,
    default: 'piece'
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  images: {
    type: [String],
    validate: {
      validator: function(v) {
        return Array.isArray(v) && v.every(img => typeof img === 'string');
      },
      message: 'Images must be an array of strings'
    },
    default: []
  },

  // OPTIONAL FIELDS
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  lowStockThreshold: {
    type: Number,
    min: [0, 'Low stock threshold cannot be negative'],
    default: 10
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
  isActive: {
    type: Boolean,
    default: true
  },
  inStock: {
    type: Boolean,
    default: true
  },
  unlimitedStock: {
    type: Boolean,
    default: false
  },
  tags: {
    type: [String],
    default: []
  },
  variants: {
    type: Array,
    default: []
  },
  availability: {
    type: Object,
    default: {}
  },

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
  timestamps: true // Automatically manage createdAt and updatedAt
});

// =================================================================
// PRE-SAVE MIDDLEWARE - STOCK VALIDATION
// =================================================================
productSchema.pre('save', function(next) {
  // Auto-set inStock based on stock level
  if (!this.unlimitedStock) {
    this.inStock = this.stock > 0;
  }
  next();
});

// =================================================================
// INDEXES FOR PERFORMANCE
// =================================================================
productSchema.index({ vendor: 1, isActive: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
