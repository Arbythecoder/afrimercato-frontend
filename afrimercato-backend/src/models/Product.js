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

    // PRODUCT CATEGORY (FREE TEXT - UK Standard)
    // Allows custom categories like "African Foods", "Organic Products", etc.
    category: {
      type: String,
      required: [true, 'Please specify product category'],
      trim: true,
      minlength: [2, 'Category must be at least 2 characters'],
      maxlength: [50, 'Category cannot exceed 50 characters']
    },

    // PRODUCT IMAGES (1-5 images, UK Standard)
    images: [
      {
        url: {
          type: String,
          required: true
        },
        publicId: {
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

    // UNIT OF MEASUREMENT (UK Standard)
    unit: {
      type: String,
      required: [true, 'Please specify unit'],
      enum: {
        values: ['kg', 'g', 'lb', 'oz', 'l', 'ml', 'pint', 'piece', 'pack', 'bunch', 'bag', 'box', 'tray'],
        message: '{VALUE} is not a valid unit'
      }
    },
    // Unit Quantity (e.g., 0.5kg, 250g)
    unitQuantity: {
      type: Number,
      min: [0, 'Unit quantity cannot be negative']
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
    // Unlimited stock option
    unlimitedStock: {
      type: Boolean,
      default: false
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

    // PRODUCT VARIANTS (SIZES) - UK Standard
    // Like Uber Eats: Small/Medium/Large with different prices
    variants: [
      {
        name: {
          type: String,
          required: true,
          trim: true
        },
        size: {
          type: String,
          trim: true
        },
        price: {
          type: Number,
          required: true,
          min: 0
        },
        stock: {
          type: Number,
          default: 0,
          min: 0
        },
        inStock: {
          type: Boolean,
          default: true
        }
      }
    ],

    // TAGS (for searching) - UK Standard with dietary info
    // Example: ['Vegan', 'Organic', 'Gluten-Free', 'Halal']
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

    // AVAILABILITY & SCHEDULING - UK Standard
    availability: {
      days: {
        monday: { type: Boolean, default: true },
        tuesday: { type: Boolean, default: true },
        wednesday: { type: Boolean, default: true },
        thursday: { type: Boolean, default: true },
        friday: { type: Boolean, default: true },
        saturday: { type: Boolean, default: true },
        sunday: { type: Boolean, default: true }
      },
      timeSlots: {
        enabled: { type: Boolean, default: false },
        start: { type: String, default: '09:00' },
        end: { type: String, default: '18:00' }
      },
      maxOrdersPerDay: {
        type: Number,
        min: 0
      },
      prepTime: {
        type: Number,
        min: 0,
        default: 15
      }
    },

    // SEO & METADATA
    slug: {
      type: String,
      unique: true,
      sparse: true
    },
    keywords: [String],
    sortOrder: {
      type: Number,
      default: 0
    },

    // VENDOR INFO (auto-filled)
    storeName: {
      type: String
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
// MIDDLEWARE: UPDATE STOCK STATUS & AUTO-GENERATE FIELDS
// =================================================================
productSchema.pre('save', function (next) {
  // Handle unlimited stock
  if (this.unlimitedStock) {
    this.inStock = true;
  } else {
    // If stock is 0 or less, mark as out of stock
    if (this.stock <= 0) {
      this.inStock = false;
    } else {
      this.inStock = true;
    }
  }

  // Calculate discount if originalPrice is set
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(
      ((this.originalPrice - this.price) / this.originalPrice) * 100
    );
  }

  // Auto-generate slug from name
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Extract keywords from name and description
  if (!this.keywords || this.keywords.length === 0) {
    const text = `${this.name} ${this.description}`.toLowerCase();
    this.keywords = text
      .split(/\s+/)
      .filter(word => word.length > 3)
      .slice(0, 20);
  }

  // Ensure at least one image is marked as primary
  if (this.images && this.images.length > 0) {
    const hasPrimary = this.images.some(img => img.isPrimary);
    if (!hasPrimary) {
      this.images[0].isPrimary = true;
    }
  }

  next();
});

// =================================================================
// VALIDATION
// =================================================================
productSchema.path('images').validate(function(images) {
  return images && images.length >= 1 && images.length <= 5;
}, 'Product must have between 1 and 5 images');

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
