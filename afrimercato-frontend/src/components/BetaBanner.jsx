import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function BetaBanner() {
  const [isDismissed, setIsDismissed] = useState(false)
  const [daysRemaining, setDaysRemaining] = useState(7)

  useEffect(() => {
    // Check if banner was dismissed
    const dismissed = sessionStorage.getItem('betaBannerDismissed')
    if (dismissed) {
      setIsDismissed(true)
    }

    // Calculate days remaining
    const launchDays = parseInt(import.meta.env.VITE_LAUNCH_DAYS || '7')
    const launchDate = import.meta.env.VITE_LAUNCH_DATE
    
    if (launchDate) {
      const targetDate = new Date(launchDate)
      const now = new Date()
      const diffTime = targetDate - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysRemaining(Math.max(0, diffDays))
    } else {
      setDaysRemaining(launchDays)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem('betaBannerDismissed', 'true')
  }

  const feedbackUrl = import.meta.env.VITE_FEEDBACK_URL

  if (isDismissed) return null

  return (
    <>
      {/* Desktop & Tablet */}
      <div className="hidden md:block bg-gradient-to-r from-[#00897B] via-[#00695C] to-[#00897B] text-white py-3 px-4 shadow-lg relative z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Beta Badge */}
            <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              Beta
            </span>
            
            {/* Message */}
            <p className="text-sm font-medium">
              🎉 Beta testing in progress — we launch in{' '}
              <span className="font-bold text-yellow-300">{daysRemaining} days</span>!{' '}
              Please share your feedback to help us improve.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Feedback Link */}
            {feedbackUrl && (
              <a
                href={feedbackUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#00897B] px-4 py-1.5 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
              >
                Share Feedback
              </a>
            )}
            
            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Dismiss banner"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden bg-gradient-to-r from-[#00897B] via-[#00695C] to-[#00897B] text-white py-3 px-4 shadow-lg relative z-50">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            {/* Beta Badge */}
            <span className="inline-block bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              Beta
            </span>
            
            {/* Message */}
            <p className="text-xs leading-relaxed">
              🎉 Beta testing — launch in{' '}
              <span className="font-bold text-yellow-300">{daysRemaining} days</span>!{' '}
              {feedbackUrl && (
                <a
                  href={feedbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline font-semibold"
                >
                  Share feedback
                </a>
              )}
            </p>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors flex-shrink-0 p-1"
            aria-label="Dismiss banner"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  )
}
