// =================================================================
// ORDER MODEL - MongoDB Schema for Orders
// =================================================================

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: String,
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  status: String,
  paymentStatus: String,
  deliveryAddress: String,
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  picker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryDate: Date,
  // Repeat purchase subscription data
  repeatPurchase: {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly'],
      default: null
    },
    nextRepeatDate: Date,
    active: { type: Boolean, default: true }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
