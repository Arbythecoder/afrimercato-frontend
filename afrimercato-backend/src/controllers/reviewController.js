// =================================================================
// REVIEW CONTROLLER
// =================================================================
// Handles product reviews and ratings

const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   POST /api/reviews
 * @desc    Submit a product review
 * @access  Private (customer)
 */
exports.submitReview = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment, orderId } = req.body;

  // Validate required fields
  if (!productId || !rating || !comment) {
    return res.status(400).json({
      success: false,
      message: 'Product ID, rating, and comment are required'
    });
  }

  // Validate rating
  if (rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      message: 'Rating must be between 1 and 5'
    });
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    return res.status(404).json({
      success: false,
      message: 'Product not found'
    });
  }

  // Check if user already reviewed this product
  const existingReview = await Review.findOne({
    product: productId,
    customer: req.user.id
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this product'
    });
  }

  // Check if this is a verified purchase
  let verifiedPurchase = false;
  if (orderId) {
    const order = await Order.findOne({
      _id: orderId,
      customer: req.user.id,
      'items.product': productId,
      status: { $in: ['delivered', 'completed'] }
    });
    verifiedPurchase = !!order;
  } else {
    // Check if user has ever purchased this product
    const hasOrder = await Order.findOne({
      customer: req.user.id,
      'items.product': productId,
      status: { $in: ['delivered', 'completed'] }
    });
    verifiedPurchase = !!hasOrder;
  }

  // Create review
  const review = await Review.create({
    product: productId,
    customer: req.user.id,
    order: orderId || undefined,
    rating,
    title,
    comment,
    verifiedPurchase
  });

  // Populate customer info for response
  await review.populate('customer', 'name avatar');

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: review
  });
});

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get reviews for a product
 * @access  Public
 */
exports.getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, sort = 'recent' } = req.query;

  const skip = (page - 1) * limit;

  // Sort options
  let sortOption = { createdAt: -1 }; // Default: recent
  if (sort === 'helpful') sortOption = { 'helpful.count': -1 };
  if (sort === 'highest') sortOption = { rating: -1 };
  if (sort === 'lowest') sortOption = { rating: 1 };

  const reviews = await Review.find({
    product: productId,
    status: 'approved'
  })
    .populate('customer', 'name avatar')
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({
    product: productId,
    status: 'approved'
  });

  // Get rating distribution
  const stats = await Review.aggregate([
    { $match: { product: require('mongoose').Types.ObjectId(productId), status: 'approved' } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        total: { $sum: 1 },
        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    stats: stats[0] || {
      avgRating: 0,
      total: 0,
      rating1: 0,
      rating2: 0,
      rating3: 0,
      rating4: 0,
      rating5: 0
    },
    data: reviews
  });
});

/**
 * @route   GET /api/reviews/my-reviews
 * @desc    Get current customer's reviews
 * @access  Private (customer)
 */
exports.getMyReviews = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const reviews = await Review.find({ customer: req.user.id })
    .populate('product', 'name images price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Review.countDocuments({ customer: req.user.id });

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pages: Math.ceil(total / limit),
    data: reviews
  });
});

/**
 * @route   PUT /api/reviews/:reviewId
 * @desc    Update own review
 * @access  Private (customer)
 */
exports.updateReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check ownership
  if (review.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review'
    });
  }

  // Update fields
  if (rating) review.rating = rating;
  if (title !== undefined) review.title = title;
  if (comment) review.comment = comment;

  await review.save();

  res.status(200).json({
    success: true,
    message: 'Review updated',
    data: review
  });
});

/**
 * @route   DELETE /api/reviews/:reviewId
 * @desc    Delete own review
 * @access  Private (customer)
 */
exports.deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check ownership
  if (review.customer.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review'
    });
  }

  const productId = review.product;
  await review.deleteOne();

  // Recalculate product rating
  await Review.calculateAverageRating(productId);

  res.status(200).json({
    success: true,
    message: 'Review deleted'
  });
});

/**
 * @route   POST /api/reviews/:reviewId/helpful
 * @desc    Mark review as helpful
 * @access  Private
 */
exports.markHelpful = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  const review = await Review.findById(reviewId);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check if user already marked as helpful
  const alreadyMarked = review.helpful.users.includes(req.user.id);

  if (alreadyMarked) {
    // Remove helpful vote
    review.helpful.users = review.helpful.users.filter(
      id => id.toString() !== req.user.id
    );
    review.helpful.count = Math.max(0, review.helpful.count - 1);
  } else {
    // Add helpful vote
    review.helpful.users.push(req.user.id);
    review.helpful.count += 1;
  }

  await review.save();

  res.status(200).json({
    success: true,
    message: alreadyMarked ? 'Helpful vote removed' : 'Marked as helpful',
    data: {
      helpfulCount: review.helpful.count,
      isHelpful: !alreadyMarked
    }
  });
});

/**
 * @route   GET /api/reviews/can-review/:productId
 * @desc    Check if user can review a product
 * @access  Private
 */
exports.canReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  // Check if already reviewed
  const existingReview = await Review.findOne({
    product: productId,
    customer: req.user.id
  });

  if (existingReview) {
    return res.status(200).json({
      success: true,
      canReview: false,
      reason: 'already_reviewed',
      existingReview
    });
  }

  // Check if user has purchased
  const hasPurchased = await Order.findOne({
    customer: req.user.id,
    'items.product': productId,
    status: { $in: ['delivered', 'completed'] }
  });

  res.status(200).json({
    success: true,
    canReview: true,
    verifiedPurchase: !!hasPurchased
  });
});
