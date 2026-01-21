// =================================================================
// PAYOUT MODEL - STUB FOR MVP
// =================================================================
// Placeholder model for vendor payouts
// Full implementation coming in Phase 2

const mongoose = require('mongoose');

const payoutSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'GBP'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  payoutMethod: {
    type: String,
    enum: ['bank_transfer', 'paypal', 'stripe'],
    default: 'bank_transfer'
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    sortCode: String,
    bankName: String
  },
  processedAt: Date,
  failureReason: String,
  reference: String
}, {
  timestamps: true
});

// Indexes for queries
payoutSchema.index({ vendor: 1, createdAt: -1 });
payoutSchema.index({ status: 1 });

module.exports = mongoose.model('Payout', payoutSchema);
