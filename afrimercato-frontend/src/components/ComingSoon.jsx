import { useState, useEffect } from 'react'

// Storage keys
const BYPASS_KEY = 'afrimercato_coming_soon_bypassed'

/**
 * Launch date — reads from VITE_LAUNCH_DATE env var first, falls back to hardcoded.
 * Set VITE_LAUNCH_DATE in .env to override (ISO 8601 string, e.g. "2026-03-01T00:00:00Z").
 * To disable countdown entirely: Set DISABLE_COUNTDOWN to true.
 */
const DISABLE_COUNTDOWN = false // Set to true to skip countdown entirely
const LAUNCH_DATE = (() => {
  const envDate = import.meta.env.VITE_LAUNCH_DATE
  if (envDate) {
    const parsed = new Date(envDate)
    if (!isNaN(parsed.getTime())) return parsed
  }
  return new Date('2026-02-22T00:00:00Z') // fallback: 14 days from Feb 8 2026
})()

function ComingSoon({ children }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [bypassed, setBypassed] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Check if bypassed on mount (client-side only to avoid SSR issues)
  useEffect(() => {
    setIsClient(true)

    // If countdown is disabled globally, bypass immediately
    if (DISABLE_COUNTDOWN) {
      setBypassed(true)
      return
    }

    const isBypassed = localStorage.getItem(BYPASS_KEY) === 'true'
    setBypassed(isBypassed)
  }, [])

  // Countdown timer — ticks every second against fixed LAUNCH_DATE
  useEffect(() => {
    if (bypassed) return

    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = LAUNCH_DATE.getTime() - now.getTime()

      if (difference <= 0) {
        // Countdown complete - auto-unlock the app
        setBypassed(true)
        localStorage.setItem(BYPASS_KEY, 'true')
        return
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [bypassed])

  // Handle bypass for testers
  const handleBypass = () => {
    localStorage.setItem(BYPASS_KEY, 'true')
    setBypassed(true)
  }

  // Show children if bypassed or countdown is over
  if (bypassed) {
    return children
  }

  // Avoid hydration mismatch - show loading until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004d40] via-[#00695C] to-[#F5A623] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004d40] via-[#00695C] to-[#F5A623] flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">
            🛒 Afrimercato
          </h1>
          <p className="text-[#A5D6D0] text-xl md:text-2xl">
            African Marketplace - Coming Soon
          </p>
        </div>

        {/* Countdown */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 shadow-2xl">
          <h2 className="text-white text-xl md:text-2xl mb-6 font-semibold">
            Launching In
          </h2>
          <div className="grid grid-cols-4 gap-4 md:gap-8">
            <div className="bg-white/20 rounded-xl p-4 md:p-6">
              <div className="text-4xl md:text-6xl font-bold text-white">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[#A5D6D0] text-sm md:text-base mt-2">Days</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 md:p-6">
              <div className="text-4xl md:text-6xl font-bold text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[#A5D6D0] text-sm md:text-base mt-2">Hours</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 md:p-6">
              <div className="text-4xl md:text-6xl font-bold text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[#A5D6D0] text-sm md:text-base mt-2">Minutes</div>
            </div>
            <div className="bg-white/20 rounded-xl p-4 md:p-6">
              <div className="text-4xl md:text-6xl font-bold text-white">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[#A5D6D0] text-sm md:text-base mt-2">Seconds</div>
            </div>
          </div>
        </div>

        {/* Features preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 rounded-xl p-4 text-white">
            <span className="text-3xl mb-2 block">🌍</span>
            <h3 className="font-semibold text-lg">African Products</h3>
            <p className="text-[#A5D6D0] text-sm">Authentic African groceries delivered to your door</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-white">
            <span className="text-3xl mb-2 block">🏪</span>
            <h3 className="font-semibold text-lg">Local Vendors</h3>
            <p className="text-[#A5D6D0] text-sm">Support local African businesses in your area</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-white">
            <span className="text-3xl mb-2 block">🚚</span>
            <h3 className="font-semibold text-lg">Fast Delivery</h3>
            <p className="text-[#A5D6D0] text-sm">Same-day delivery for your convenience</p>
          </div>
        </div>

        {/* Tester bypass button */}
        <div className="space-y-4">
          <button
            onClick={handleBypass}
            className="bg-white text-[#004d40] px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#FFE0B2] transition-all transform hover:scale-105 shadow-lg"
          >
            Enter Site (Testers & Clients)
          </button>
          <p className="text-[#80CBC4] text-sm">
            Click above to preview the site during testing phase
          </p>
        </div>

        {/* Social/Newsletter placeholder */}
        <div className="mt-12 text-[#A5D6D0]">
          <p className="text-sm">
            Follow us for updates:
            <span className="ml-2">📧 contact@afrimercato.com</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ComingSoon
