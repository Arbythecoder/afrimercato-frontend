// =================================================================
// PRODUCT MODEL (ITEMS SOLD BY VENDORS)
// =================================================================
// This stores information about products that vendors sell

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // LINK TO VENDOR
    // Which vendor is selling this product?
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },

    // PRODUCT NAME
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },

    // PRODUCT DESCRIPTION
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

    // PRODUCT CATEGORY
    category: {
      type: String,
      required: [true, 'Please specify product category'],
      enum: {
        values: [
          'fruits',
          'vegetables',
          'grains',
          'dairy',
          'meat',
          'fish',
          'poultry',
          'bakery',
          'beverages',
          'spices',
          'snacks',
          'household',
          'beauty',
          'other'
        ],
        message: '{VALUE} is not a valid category'
      }
    },

    // PRODUCT IMAGES
    // Array of image URLs/paths
    images: [
      {
        url: {
          type: String,
          required: true
        },
        isPrimary: {
          type: Boolean,
          default: false
        }
      }
    ],

    // PRICING
    price: {
      type: Number,
      required: [true, 'Please provide product price'],
      min: [0, 'Price cannot be negative']
    },
    // Original price (for showing discounts)
    originalPrice: {
      type: Number,
      min: [0, 'Original price cannot be negative']
    },
    // Discount percentage (calculated automatically)
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    // UNIT OF MEASUREMENT
    // How is this product sold?
    unit: {
      type: String,
      required: [true, 'Please specify unit'],
      enum: {
        values: ['kg', 'g', 'lb', 'piece', 'bunch', 'pack', 'liter', 'ml', 'dozen'],
        message: '{VALUE} is not a valid unit'
      }
    },

    // STOCK/INVENTORY
    stock: {
      type: Number,
      required: [true, 'Please specify stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    // Alert when stock is low
    lowStockThreshold: {
      type: Number,
      default: 10
    },
    // Is product currently in stock?
    inStock: {
      type: Boolean,
      default: true
    },

    // PRODUCT STATUS
    isActive: {
      type: Boolean,
      default: true
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    // DRAFT MODE (UberEats-style)
    // Allows vendors to create products while waiting for account approval
    // Products stay in draft until vendor account is approved
    isDraft: {
      type: Boolean,
      default: false
    },
    // PUBLIC VISIBILITY
    // Controls whether product appears in customer searches
    // False for pending vendor accounts, true after approval
    isPublic: {
      type: Boolean,
      default: true
    },

    // PRODUCT SPECIFICATIONS
    specifications: {
      weight: String,
      size: String,
      color: String,
      brand: String,
      origin: String, // Where is it from?
      expiryDate: Date, // For perishable items
      shelfLife: String // How long does it last?
    },

    // TAGS (for searching)
    // Example: ['organic', 'fresh', 'local']
    tags: [
      {
        type: String,
        trim: true
      }
    ],

    // RATINGS AND REVIEWS
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

    // SALES STATISTICS
    salesCount: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// =================================================================
// INDEXES
// =================================================================
productSchema.index({ vendor: 1 });
productSchema.index({ category: 1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' }); // For text search
productSchema.index({ isActive: 1, inStock: 1 });
productSchema.index({ rating: -1 }); // Sort by rating

// =================================================================
// MIDDLEWARE: UPDATE STOCK STATUS
// =================================================================
/**
 * Automatically set inStock to false when stock reaches 0
 */
productSchema.pre('save', function (next) {
  // If stock is 0 or less, mark as out of stock
  if (this.stock <= 0) {
    this.inStock = false;
  } else {
    this.inStock = true;
  }

  // Calculate discount if originalPrice is set
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }

  next();
});

// =================================================================
// VIRTUALS
// =================================================================

// Check if product is low on stock
productSchema.virtual('isLowStock').get(function () {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

// Get primary image
productSchema.virtual('primaryImage').get(function () {
  if (!this.images || this.images.length === 0) return null;
  const primary = this.images.find((img) => img.isPrimary);
  return primary ? primary.url : this.images[0].url;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
