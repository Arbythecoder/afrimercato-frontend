import { useState } from 'react'
import { useLocation } from 'react-router-dom'

export default function BetaFeedbackButton() {
  const location = useLocation()
  const [isHovered, setIsHovered] = useState(false)
  
  const feedbackUrl = import.meta.env.VITE_FEEDBACK_URL
  const appVersion = import.meta.env.VITE_APP_VERSION || 'beta-1.0'
  
  const getUserRole = () => {
    const user = localStorage.getItem('user')
    if (!user) return 'guest'
    try {
      const userData = JSON.parse(user)
      return userData.role || 'guest'
    } catch {
      return 'guest'
    }
  }

  const handleFeedbackClick = () => {
    if (!feedbackUrl) return
    
    const params = new URLSearchParams({
      role: getUserRole(),
      path: location.pathname,
      timestamp: new Date().toISOString(),
      version: appVersion
    })
    
    window.open(`${feedbackUrl}?${params.toString()}`, '_blank', 'noopener,noreferrer')
  }

  const isDisabled = !feedbackUrl

  return (
    <>
      {/* Desktop & Tablet (>= 768px) */}
      <div className="hidden md:block">
        <button
          onClick={handleFeedbackClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isDisabled}
          className={`fixed bottom-6 right-6 z-40 group ${
            isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
          title={isDisabled ? 'Feedback link coming soon' : 'Share your beta feedback'}
        >
          <div className={`flex items-center gap-3 bg-gradient-to-r from-[#00897B] to-[#00695C] text-white px-6 py-4 rounded-full shadow-2xl transition-all duration-300 ${
            isHovered && !isDisabled ? 'pr-8 shadow-3xl scale-105' : ''
          } ${isDisabled ? 'grayscale' : 'hover:shadow-green-500/50'}`}>
            {/* Icon */}
            <svg 
              className={`w-6 h-6 transition-transform duration-300 ${isHovered && !isDisabled ? 'rotate-12' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" 
              />
            </svg>
            
            {/* Text - expands on hover */}
            <span className={`font-bold text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isHovered && !isDisabled ? 'max-w-[200px] opacity-100' : 'max-w-0 opacity-0'
            }`}>
              Beta Feedback
            </span>
          </div>
          
          {/* Pulse animation when not disabled */}
          {!isDisabled && (
            <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20"></div>
          )}
        </button>
      </div>

      {/* Mobile (< 768px) */}
      <div className="md:hidden">
        <button
          onClick={handleFeedbackClick}
          disabled={isDisabled}
          className={`fixed bottom-4 right-4 z-40 ${
            isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
          title={isDisabled ? 'Feedback link coming soon' : 'Share your beta feedback'}
          aria-label="Beta Feedback"
        >
          <div className={`flex items-center justify-center w-14 h-14 bg-gradient-to-r from-[#00897B] to-[#00695C] text-white rounded-full shadow-2xl transition-all duration-300 active:scale-95 ${
            isDisabled ? 'grayscale' : ''
          }`}>
            <svg 
              className="w-6 h-6"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" 
              />
            </svg>
          </div>
          
          {!isDisabled && (
            <div className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20"></div>
          )}
        </button>
      </div>
    </>
  )
}
