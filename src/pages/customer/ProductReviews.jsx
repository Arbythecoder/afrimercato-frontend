import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI, reviewAPI } from '../../services/api'
import { getProductImage } from '../../utils/defaultImages'
import { useAuth } from '../../context/AuthContext'

function ProductReviews() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [canReview, setCanReview] = useState(true)
  const [isVerifiedPurchase, setIsVerifiedPurchase] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, title: '', comment: '' })
  const [submitting, setSubmitting] = useState(false)
  const [sortBy, setSortBy] = useState('recent')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchProductAndReviews()
    if (isAuthenticated) {
      checkCanReview()
    }
  }, [productId, sortBy, page, isAuthenticated])

  const fetchProductAndReviews = async () => {
    try {
      setLoading(true)

      // Fetch product details
      const productResponse = await productAPI.getById(productId)
      if (productResponse.success) {
        setProduct(productResponse.data)
      }

      // Fetch reviews from backend
      const reviewsResponse = await reviewAPI.getForProduct(productId, {
        page,
        limit: 10,
        sort: sortBy
      })

      if (reviewsResponse.success) {
        setReviews(reviewsResponse.data)
        setStats(reviewsResponse.stats)
        setTotalPages(reviewsResponse.pages)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkCanReview = async () => {
    try {
      const response = await reviewAPI.canReview(productId)
      if (response.success) {
        setCanReview(response.canReview)
        setIsVerifiedPurchase(response.verifiedPurchase)
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!newReview.comment.trim()) {
      alert('Please write a review')
      return
    }

    if (!isAuthenticated) {
      alert('Please log in to submit a review')
      navigate('/login')
      return
    }

    setSubmitting(true)
    try {
      const response = await reviewAPI.submit({
        productId,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment
      })

      if (response.success) {
        // Add new review to list
        setReviews([response.data, ...reviews])
        setNewReview({ rating: 5, title: '', comment: '' })
        setShowReviewForm(false)
        setCanReview(false)
        // Refresh stats
        fetchProductAndReviews()
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert(error.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      alert('Please log in to mark reviews as helpful')
      return
    }

    try {
      const response = await reviewAPI.markHelpful(reviewId)
      if (response.success) {
        // Update review in list
        setReviews(reviews.map(r =>
          r._id === reviewId
            ? { ...r, helpful: { ...r.helpful, count: response.data.helpfulCount } }
            : r
        ))
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const averageRating = stats?.avgRating?.toFixed(1) || product?.rating || 0
  const totalReviews = stats?.total || reviews.length

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: stats ? stats[`rating${star}`] : reviews.filter(r => r.rating === star).length,
    percentage: totalReviews ? ((stats ? stats[`rating${star}`] : reviews.filter(r => r.rating === star).length) / totalReviews * 100) : 0
  }))

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button onClick={() => navigate(-1)} className="mb-4 text-white/80 hover:text-white">
            ← Back to Product
          </button>
          <h1 className="text-3xl font-bold">Reviews & Ratings</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Product Summary */}
        {product && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 flex gap-6">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="w-24 h-24 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
              <p className="text-afri-green font-semibold">£{product.price?.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= averageRating ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="font-semibold">{averageRating}</span>
                <span className="text-gray-500">({totalReviews} reviews)</span>
              </div>
            </div>
          </div>
        )}

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="space-y-3">
            {ratingDistribution.map(({ star, count, percentage }) => (
              <div key={star} className="flex items-center gap-4">
                <span className="w-12 text-sm text-gray-600">{star} stars</span>
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-12 text-sm text-gray-600 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Write Review Button */}
        {isAuthenticated ? (
          canReview ? (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="w-full mb-6 py-3 bg-afri-green text-white rounded-xl font-semibold hover:bg-afri-green-dark"
            >
              {showReviewForm ? 'Cancel' : '✍️ Write a Review'}
            </button>
          ) : (
            <div className="mb-6 p-4 bg-gray-100 rounded-xl text-center text-gray-600">
              You have already reviewed this product
            </div>
          )
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="w-full mb-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300"
          >
            Log in to write a review
          </button>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Review</h3>

            {isVerifiedPurchase && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center gap-2">
                <span>✓</span> Verified Purchase - Your review will be marked as verified
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={`text-3xl transition-colors ${
                      star <= newReview.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Title (Optional)</label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green"
                placeholder="Summarize your review"
                maxLength={100}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green"
                placeholder="Share your experience with this product..."
                maxLength={1000}
                required
              />
              <p className="text-xs text-gray-500 mt-1">{newReview.comment.length}/1000 characters</p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-afri-green text-white rounded-lg font-semibold hover:bg-afri-green-dark disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Sort Options */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">All Reviews ({totalReviews})</h3>
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <span className="text-5xl">📝</span>
              <p className="text-gray-500 mt-4">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{review.customer?.name || 'Customer'}</p>
                      {review.verifiedPurchase && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className={`text-sm ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
                )}
                <p className="text-gray-600">{review.comment}</p>

                {/* Helpful button */}
                <div className="mt-4 flex items-center gap-4">
                  <button
                    onClick={() => handleMarkHelpful(review._id)}
                    className="text-sm text-gray-500 hover:text-afri-green flex items-center gap-1"
                  >
                    👍 Helpful ({review.helpful?.count || 0})
                  </button>
                </div>

                {/* Vendor Response */}
                {review.vendorResponse?.comment && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-afri-green">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Vendor Response:</p>
                    <p className="text-sm text-gray-600">{review.vendorResponse.comment}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductReviews
