// =================================================================
// PRODUCT MODEL - MongoDB Schema for Products
// =================================================================

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  name: String,
  description: String,
  category: String,
  price: Number,
  originalPrice: Number,
  unit: String,
  stock: Number,
  images: [String],
  rating: Number,
  reviews: Number,
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
