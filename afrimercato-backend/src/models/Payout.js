// File: src/models/Payout.js
// Tracks vendor payouts and commission calculations

const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema(
  {
    payoutNumber: {
      type: String,
      required: true,
      unique: true
    },

    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
      index: true
    },

    // Period covered by this payout
    period: {
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      }
    },

    // Orders included in this payout
    orders: [{
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
      },
      orderNumber: String,
      orderTotal: Number,
      platformFee: Number,
      vendorEarning: Number,
      completedAt: Date
    }],

    // Financial breakdown
    financials: {
      totalOrderValue: {
        type: Number,
        required: true,
        default: 0
      },
      totalPlatformFees: {
        type: Number,
        required: true,
        default: 0
      },
      totalVendorEarnings: {
        type: Number,
        required: true,
        default: 0
      },
      deliveryFeesCollected: {
        type: Number,
        default: 0
      },
      adjustments: {
        type: Number,
        default: 0
      },
      finalPayoutAmount: {
        type: Number,
        required: true
      }
    },

    // Commission structure used
    commission: {
      rate: {
        type: Number,
        required: true,
        default: 15 // 15% platform fee
      },
      type: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
      }
    },

    // Payout status
    status: {
      type: String,
      enum: [
        'pending',        // Payout calculated, awaiting processing
        'processing',     // Payment being processed
        'completed',      // Payment successfully sent
        'failed',         // Payment failed
        'cancelled',      // Payout cancelled
        'on_hold'         // Payout held (e.g., dispute, verification)
      ],
      default: 'pending',
      index: true
    },

    // Payment details
    payment: {
      method: {
        type: String,
        enum: ['bank_transfer', 'paystack', 'stripe', 'paypal', 'manual'],
        default: 'bank_transfer'
      },
      bankDetails: {
        bankName: String,
        accountNumber: String,
        accountName: String,
        routingNumber: String
      },
      transactionId: String,
      reference: String,
      processedAt: Date,
      failureReason: String,
      receiptUrl: String
    },

    // Request tracking
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: Date,

    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    processedAt: Date,

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,

    // Notes and adjustments
    notes: {
      type: String,
      maxlength: 1000
    },
    internalNotes: {
      type: String,
      maxlength: 1000
    },

    // Audit trail
    statusHistory: [{
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
    }]
  },
  {
    timestamps: true
  }
);

// Indexes
payoutSchema.index({ vendor: 1, createdAt: -1 });
payoutSchema.index({ status: 1, createdAt: -1 });
payoutSchema.index({ 'period.startDate': 1, 'period.endDate': 1 });
payoutSchema.index({ payoutNumber: 1 }, { unique: true });

// Static method to generate payout number
payoutSchema.statics.generatePayoutNumber = async function() {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const prefix = `PO${year}${month}`;

  const lastPayout = await this.findOne({
    payoutNumber: new RegExp(`^${prefix}`)
  })
    .sort({ createdAt: -1 })
    .select('payoutNumber');

  let nextNumber = 1;
  if (lastPayout) {
    const lastNumber = parseInt(lastPayout.payoutNumber.replace(prefix, ''));
    nextNumber = lastNumber + 1;
  }

  const paddedNumber = nextNumber.toString().padStart(6, '0');
  return `${prefix}${paddedNumber}`;
};

// Method to calculate platform fee
payoutSchema.methods.calculatePlatformFee = function(orderTotal) {
  if (this.commission.type === 'percentage') {
    return (orderTotal * this.commission.rate) / 100;
  } else {
    return this.commission.rate;
  }
};

// Virtual for vendor earnings percentage
payoutSchema.virtual('vendorEarningsPercentage').get(function() {
  if (this.financials.totalOrderValue === 0) return 0;
  return (this.financials.totalVendorEarnings / this.financials.totalOrderValue) * 100;
});

// Virtual for order count
payoutSchema.virtual('orderCount').get(function() {
  return this.orders.length;
});

payoutSchema.set('toJSON', { virtuals: true });
payoutSchema.set('toObject', { virtuals: true });

const Payout = mongoose.model('Payout', payoutSchema);
module.exports = Payout;
