// =================================================================
// COUPON MODEL
// =================================================================
const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: [3, 'Code must be at least 3 characters'],
    maxlength: [20, 'Code cannot exceed 20 characters']
  },
  type: {
    type: String,
    enum: ['percent', 'fixed'],
    required: [true, 'Discount type is required']
  },
  discount: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount cannot be negative']
  },
  minOrderValue: {
    type: Number,
    default: 0,
    min: 0
  },
  maxUses: {
    type: Number,
    default: null  // null = unlimited
  },
  usesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  // null = platform-wide; set vendorId to restrict to one vendor's orders
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    default: null
  },
  expiresAt: {
    type: Date,
    default: null  // null = never expires
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, { timestamps: true });

// Index for fast lookups by code
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1, expiresAt: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
