// =================================================================
// USER MODEL - MongoDB Schema for Users
// =================================================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  roles: [String],
  phone: String,
  avatar: String,
  verified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  // Repeat purchase subscription preferences
  repeatPurchaseFrequency: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly', null],
    default: null
  },
  repeatPurchaseSettings: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly'],
      default: 'weekly'
    },
    nextRepeatDate: Date,
    autoRenewNotificationSent: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add methods
userSchema.methods.generateEmailVerificationToken = function() {
  return 'token_' + Math.random().toString(36).substring(2, 15);
};

// NOTE: Do NOT override save() - use default Mongoose persistence

module.exports = mongoose.model('User', userSchema);
