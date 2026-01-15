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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add methods
userSchema.methods.generateEmailVerificationToken = function() {
  return 'token_' + Math.random().toString(36).substring(2, 15);
};

userSchema.methods.save = async function() {
  return this;
};

module.exports = mongoose.model('User', userSchema);
