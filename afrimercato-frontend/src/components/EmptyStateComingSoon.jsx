import { useState } from 'react'
import { NEARBY_SUGGESTIONS, SUGGESTED_CITIES } from '../constants/locations'

export default function EmptyStateComingSoon({ 
  location, 
  onLocationChange, 
  onNotifyMe,
  onBrowseAll 
}) {
  const [email, setEmail] = useState('')
  const [notified, setNotified] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNotifySubmit = async (e) => {
    e.preventDefault()
    if (!email || isSubmitting) return

    setIsSubmitting(true)
    try {
      // Try backend API first, fallback to localStorage
      try {
        await onNotifyMe?.(email, location)
      } catch {
        // Fallback to localStorage
        const notifications = JSON.parse(localStorage.getItem('locationNotifications') || '[]')
        notifications.push({ email, location, timestamp: new Date().toISOString() })
        localStorage.setItem('locationNotifications', JSON.stringify(notifications))
      }
      
      setNotified(true)
      setEmail('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nearbyCities = NEARBY_SUGGESTIONS[location] || NEARBY_SUGGESTIONS.default
  const displayLocation = location || 'this area'

  return (
    <div className="w-full">
      {/* Desktop & Tablet */}
      <div className="hidden md:block">
        <div className="max-w-2xl mx-auto text-center py-16 px-6">
          {/* Icon */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full">
              <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Coming Soon in {displayLocation}
          </h2>
          
          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            We're not in your area yet, but we're expanding fast! Get notified when we launch.
          </p>

          {/* Notify Me Form */}
          {!notified ? (
            <form onSubmit={handleNotifySubmit} className="mb-8">
              <div className="flex gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00897B] focus:border-transparent"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-[#00897B] to-[#00695C] text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Notify Me'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl max-w-md mx-auto">
              <p className="text-green-800 font-medium flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                You'll be notified when we launch!
              </p>
            </div>
          )}

          {/* Nearby Areas */}
          {nearbyCities.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-3 font-medium">Try nearby areas:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {nearbyCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => onLocationChange?.(city)}
                    className="px-4 py-2 bg-white border-2 border-[#00897B] text-[#00897B] rounded-lg hover:bg-[#00897B] hover:text-white font-medium transition-colors"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Browse All Stores */}
          <div>
            <button
              onClick={onBrowseAll}
              className="inline-flex items-center gap-2 text-[#00897B] hover:text-[#00695C] font-semibold text-lg group"
            >
              <span>Browse all stores (not location-based)</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <div className="text-center py-8 px-4">
          {/* Icon */}
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Coming Soon
          </h2>
          <p className="text-sm text-gray-500 mb-1">in {displayLocation}</p>
          
          {/* Description */}
          <p className="text-sm text-gray-600 mb-6">
            We're expanding fast! Get notified when we launch.
          </p>

          {/* Notify Me Form */}
          {!notified ? (
            <form onSubmit={handleNotifySubmit} className="mb-6">
              <div className="space-y-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00897B] focus:border-transparent text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#00897B] to-[#00695C] text-white font-semibold rounded-xl active:scale-95 transition-all disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Notify Me'}
                </button>
              </div>
            </form>
          ) : (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800 text-sm font-medium flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                You'll be notified!
              </p>
            </div>
          )}

          {/* Nearby Areas */}
          {nearbyCities.length > 0 && (
            <div className="mb-6">
              <p className="text-xs text-gray-600 mb-2 font-medium">Try nearby:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {nearbyCities.map((city) => (
                  <button
                    key={city}
                    onClick={() => onLocationChange?.(city)}
                    className="px-3 py-1.5 bg-white border-2 border-[#00897B] text-[#00897B] rounded-lg active:bg-[#00897B] active:text-white font-medium transition-colors text-sm"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Browse All Stores */}
          <div>
            <button
              onClick={onBrowseAll}
              className="inline-flex items-center gap-1 text-[#00897B] active:text-[#00695C] font-semibold text-sm"
            >
              <span>Browse all stores</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <p className="text-xs text-gray-500 mt-1">(not location-based)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
