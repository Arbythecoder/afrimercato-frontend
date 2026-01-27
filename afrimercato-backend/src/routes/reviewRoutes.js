// =================================================================
// REVIEW ROUTES
// =================================================================
// Routes for product reviews and ratings

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  submitReview,
  getProductReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  markHelpful,
  canReview
} = require('../controllers/reviewController');

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes (require authentication)
router.use(protect);

router.post('/', submitReview);
router.get('/my-reviews', getMyReviews);
router.get('/can-review/:productId', canReview);
router.put('/:reviewId', updateReview);
router.delete('/:reviewId', deleteReview);
router.post('/:reviewId/helpful', markHelpful);

module.exports = router;
