import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI } from '../../services/api'
import { getProductImage } from '../../utils/defaultImages'

function ProductReviews() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchProductAndReviews()
  }, [productId])

  const fetchProductAndReviews = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getById(productId)
      if (response.success) {
        setProduct(response.data)
        setReviews(response.data.reviews || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!newReview.comment.trim()) {
      alert('Please write a review')
      return
    }

    setSubmitting(true)
    try {
      // API call to submit review would go here
      const review = {
        ...newReview,
        user: { name: 'You' },
        createdAt: new Date().toISOString()
      }
      setReviews([review, ...reviews])
      setNewReview({ rating: 5, comment: '' })
      setShowReviewForm(false)
      alert('Review submitted successfully!')
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    percentage: reviews.length ? (reviews.filter(r => r.rating === star).length / reviews.length * 100) : 0
  }))

  if (loading) {
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
                <span className="text-gray-500">({reviews.length} reviews)</span>
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
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="w-full mb-6 py-3 bg-afri-green text-white rounded-xl font-semibold hover:bg-afri-green-dark"
        >
          {showReviewForm ? 'Cancel' : '✍️ Write a Review'}
        </button>

        {/* Review Form */}
        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Review</h3>

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
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-afri-green"
                placeholder="Share your experience with this product..."
              />
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

        {/* Reviews List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">All Reviews ({reviews.length})</h3>

          {reviews.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-lg">
              <span className="text-5xl">📝</span>
              <p className="text-gray-500 mt-4">No reviews yet. Be the first to review!</p>
            </div>
          ) : (
            reviews.map((review, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">{review.user?.name || 'Customer'}</p>
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
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductReviews
