import { useState } from 'react'
import { vendorAPI } from '../../services/api'

function RiderRating({ order, onRatingSubmitted }) {
  const [rating, setRating] = useState(order?.riderRating?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [feedback, setFeedback] = useState(order?.riderRating?.feedback || '')
  const [submitting, setSubmitting] = useState(false)

  const hasRated = !!order?.riderRating

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      setSubmitting(true)
      const response = await vendorAPI.rateRider(order._id, {
        rating,
        feedback: feedback.trim(),
      })

      if (response.success) {
        alert('Thank you for rating the delivery agent!')
        if (onRatingSubmitted) {
          onRatingSubmitted(response.data)
        }
      }
    } catch (error) {
      console.error('Rating submission error:', error)
      alert(error.response?.data?.message || 'Failed to submit rating')
    } finally {
      setSubmitting(false)
    }
  }

  const renderStars = () => {
    return (
      <div className="flex items-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={hasRated || submitting}
            onMouseEnter={() => !hasRated && setHoveredRating(star)}
            onMouseLeave={() => !hasRated && setHoveredRating(0)}
            onClick={() => !hasRated && setRating(star)}
            className={`text-4xl transition-all transform ${
              hasRated ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } ${star <= (hoveredRating || rating) ? 'animate-starPulse' : ''}`}
          >
            {star <= (hoveredRating || rating) ? (
              <span className="text-afri-yellow drop-shadow-lg">⭐</span>
            ) : (
              <span className="text-gray-300">☆</span>
            )}
          </button>
        ))}
      </div>
    )
  }

  if (!order?.rider) {
    return (
      <div className="bg-gray-50 rounded-xl p-6 text-center">
        <p className="text-afri-gray-600">No delivery agent assigned to this order</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center space-x-4 pb-4 border-b">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-afri-green to-afri-green-dark flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {order.rider.name?.charAt(0).toUpperCase() || 'R'}
        </div>
        <div>
          <h3 className="text-xl font-bold text-afri-gray-900">
            {hasRated ? 'Your Rating' : 'Rate Delivery Agent'}
          </h3>
          <p className="text-afri-gray-600">{order.rider.name}</p>
          {order.rider.phone && (
            <p className="text-sm text-afri-gray-500">{order.rider.phone}</p>
          )}
        </div>
        {hasRated && (
          <div className="ml-auto">
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Rated
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Star Rating */}
        <div className="text-center">
          <label className="block text-sm font-semibold text-afri-gray-900 mb-3">
            How was your delivery experience?
          </label>
          {renderStars()}
          <div className="mt-2">
            {rating > 0 && (
              <p className="text-sm text-afri-gray-600 animate-slideDown">
                {rating === 5 && '🎉 Excellent!'}
                {rating === 4 && '😊 Great!'}
                {rating === 3 && '👍 Good'}
                {rating === 2 && '😐 Could be better'}
                {rating === 1 && '😞 Poor'}
              </p>
            )}
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-semibold text-afri-gray-900 mb-2">
            Additional Feedback {!hasRated && <span className="text-afri-gray-500 font-normal">(Optional)</span>}
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={hasRated || submitting}
            rows={4}
            placeholder={
              hasRated
                ? 'No feedback provided'
                : 'Share your thoughts about the delivery service...'
            }
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent resize-none ${
              hasRated ? 'bg-gray-50 cursor-default' : ''
            }`}
          />
        </div>

        {/* Submit Button */}
        {!hasRated && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || rating === 0}
              className="px-8 py-3 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                  Submit Rating
                </>
              )}
            </button>
          </div>
        )}

        {hasRated && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-afri-gray-700">
              Thank you for your feedback! Your rating helps us improve our delivery service.
            </p>
          </div>
        )}
      </form>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes starPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-starPulse {
          animation: starPulse 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default RiderRating
