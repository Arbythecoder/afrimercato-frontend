// =================================================================
// VENDOR MODEL - MongoDB Schema for Vendors/Stores
// =================================================================

const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  storeName: String,
  storeId: String,
  storeDescription: String,
  category: String,
  logo: String,
  coverImage: String,
  isVerified: Boolean,
  approvalStatus: String,
  location: {
    address: String,
    postcode: String,
    latitude: Number,
    longitude: Number
  },
  businessLicense: String,
  taxId: String,
  bankDetails: {
    accountHolder: String,
    accountNumber: String,
    sortCode: String
  },
  rating: Number,
  reviews: Number,
  totalOrders: Number,
  totalRevenue: Number,
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vendor', vendorSchema);
