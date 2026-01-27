// =================================================================
// REVIEW MODEL
// =================================================================
// Stores product reviews and ratings from customers

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    maxlength: 1000
  },
  verifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: { type: Number, default: 0 },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  images: [{
    type: String
  }],
  vendorResponse: {
    comment: String,
    respondedAt: Date
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved' // Auto-approve for MVP
  }
}, {
  timestamps: true
});

// Ensure one review per product per customer
reviewSchema.index({ product: 1, customer: 1 }, { unique: true });

// Index for product queries
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });

// Static method to calculate product rating
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const stats = await this.aggregate([
    { $match: { product: productId, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
      }
    }
  ]);

  if (stats.length > 0) {
    const Product = mongoose.model('Product');
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].numReviews,
      ratingDistribution: {
        1: stats[0].rating1,
        2: stats[0].rating2,
        3: stats[0].rating3,
        4: stats[0].rating4,
        5: stats[0].rating5
      }
    });
  } else {
    const Product = mongoose.model('Product');
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      reviewCount: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    });
  }
};

// Update product rating after save
reviewSchema.post('save', async function() {
  await this.constructor.calculateAverageRating(this.product);
});

// Update product rating after remove
reviewSchema.post('remove', async function() {
  await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
