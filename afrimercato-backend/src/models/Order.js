// File: src/models/Order.js

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    // ✅ REMOVED unique: true and index: true from here
    orderNumber: {
      type: String,
      required: true
    },

    // ✅ REMOVED index: true
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // ✅ REMOVED index: true
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        name: String,
        price: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1']
        },
        unit: String,
        subtotal: Number
      }
    ],

    pricing: {
      subtotal: {
        type: Number,
        required: true
      },
      deliveryFee: {
        type: Number,
        default: 0
      },
      tax: {
        type: Number,
        default: 0
      },
      discount: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        required: true
      }
    },

    deliveryAddress: {
      fullName: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      street: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      postalCode: String,
      landmark: String,
      instructions: String
    },

    status: {
      type: String,
      enum: {
        values: [
          'pending',        // Just created, waiting for confirmation
          'confirmed',      // Confirmed, waiting for picker assignment
          'assigned_picker', // NEW: Picker assigned, waiting to start
          'picking',        // NEW: Picker is picking items
          'picked',         // NEW: All items picked, ready for packing
          'packing',        // NEW: Picker is packing items
          'ready_for_pickup', // NEW: Packed and ready for rider pickup
          'preparing',      // (Legacy) Vendor preparing order
          'ready',          // (Legacy) Ready for delivery
          'out-for-delivery', // Rider has picked up and is delivering
          'delivered',      // Delivered to customer
          'completed',      // Order completed and paid
          'cancelled'       // Order cancelled
        ],
        message: '{VALUE} is not a valid order status'
      },
      default: 'pending'
    },

    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now
        },
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ],

    payment: {
      method: {
        type: String,
        enum: ['cash', 'card', 'bank-transfer', 'mobile-money'],
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
      },
      paidAt: Date,
      transactionId: String,
      receiptUrl: String
    },

    // ======================
    // PICKING SECTION (NEW)
    // ======================
    // Tracks order picking/packing by warehouse pickers
    picking: {
      // Picking status
      status: {
        type: String,
        enum: ['pending', 'assigned', 'picking', 'picked', 'packing', 'packed', 'ready_for_pickup', 'skipped'],
        default: 'pending'
      },

      // Assigned picker
      picker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },

      // When was picker assigned?
      assignedAt: Date,

      // When did picker start picking?
      startedAt: Date,

      // When did picker finish picking all items?
      pickedAt: Date,

      // When did picker finish packing?
      packedAt: Date,

      // When is order ready for rider pickup?
      readyAt: Date,

      // Track which items have been picked
      itemsPicked: [{
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product'
        },
        quantityPicked: {
          type: Number,
          default: 0
        },
        quantityRequested: Number,
        isPicked: {
          type: Boolean,
          default: false
        },
        pickedAt: Date,
        // Issues during picking
        issues: [{
          type: {
            type: String,
            enum: ['out_of_stock', 'wrong_quantity', 'damaged', 'expired', 'substitute_offered', 'other']
          },
          description: String,
          reportedAt: { type: Date, default: Date.now }
        }],
        // Substitute product if original unavailable
        substitute: {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
          },
          name: String,
          price: Number,
          customerApproved: { type: Boolean, default: false }
        }
      }],

      // Picker's notes
      notes: String,

      // Photos of packed order
      packingPhotos: [String],

      // Picking accuracy (auto-calculated)
      accuracy: {
        type: Number, // Percentage 0-100
        min: 0,
        max: 100
      },

      // Total time taken (minutes)
      pickTime: Number,

      // Problems encountered
      issues: [{
        type: String,
        description: String,
        resolvedAt: Date
      }]
    },

    delivery: {
      type: {
        type: String,
        enum: ['pickup', 'home-delivery'],
        default: 'home-delivery'
      },
      rider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      estimatedTime: Date,
      actualTime: Date,
      trackingNumber: String
    },

    customerNotes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },

    vendorNotes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },

    cancellation: {
      cancelledBy: {
        type: String,
        enum: ['customer', 'vendor', 'admin']
      },
      reason: String,
      cancelledAt: Date
    },

    review: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: String,
      reviewedAt: Date
    },

    riderRating: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: false
      },
      feedback: {
        type: String,
        maxlength: [500, 'Feedback cannot exceed 500 characters']
      },
      ratedAt: Date
    }
  },
  {
    timestamps: true
  }
);

// ✅ Indexes defined ONLY here
orderSchema.index({ orderNumber: 1 }, { unique: true }); // unique goes here
orderSchema.index({ customer: 1 });
orderSchema.index({ vendor: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
// NEW: Picking indexes
orderSchema.index({ 'picking.status': 1 });
orderSchema.index({ 'picking.picker': 1 });
orderSchema.index({ 'picking.assignedAt': -1 });

// Middleware
orderSchema.pre('save', function (next) {
  this.items.forEach((item) => {
    item.subtotal = item.price * item.quantity;
  });

  const subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.pricing.subtotal = subtotal;

  this.pricing.total =
    subtotal +
    (this.pricing.deliveryFee || 0) +
    (this.pricing.tax || 0) -
    (this.pricing.discount || 0);

  next();
});

// Static method
orderSchema.statics.generateOrderNumber = async function () {
  const year = new Date().getFullYear();
  const prefix = `AFM${year}`;

  const lastOrder = await this.findOne({
    orderNumber: new RegExp(`^${prefix}`)
  })
    .sort({ createdAt: -1 })
    .select('orderNumber');

  let nextNumber = 1;

  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderNumber.replace(prefix, ''));
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(6, '0');
  return `${prefix}${paddedNumber}`;
};

// Virtuals
orderSchema.virtual('canBeCancelled').get(function () {
  return ['pending', 'confirmed'].includes(this.status);
});

orderSchema.virtual('isCompleted').get(function () {
  return ['delivered', 'completed'].includes(this.status);
});

orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;