/**
 * AFRIMERCATO - CLIENT-EXACT LANDING PAGE
 * Matches client's design EXACTLY with premium UX surpassing Just Eat / Uber Eats
 * Brand: Afrimercato
 */

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'

// Hero images - Beautiful fresh groceries and produce
const HERO_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=90' // Fresh colorful vegetables and groceries

export default function ClientLandingPage() {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [priceTag, setPriceTag] = useState('all')
  const [shoppingMethod, setShoppingMethod] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [recentSearches] = useState(['Bristol', 'London', 'Manchester', 'Birmingham'])
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const searchInputRef = useRef(null)

  // Parallax scroll effect
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3])

  // Detect scroll for nav styling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle search
  const handleFindStore = (e) => {
    e?.preventDefault()
    if (!location.trim()) {
      searchInputRef.current?.focus()
      return
    }
    navigate(`/stores?location=${encodeURIComponent(location)}&price=${priceTag}&method=${shoppingMethod}`)
  }

  // Quick location select
  const selectLocation = (loc) => {
    setLocation(loc)
    setShowLocationDropdown(false)
    navigate(`/stores?location=${encodeURIComponent(loc)}`)
  }

  // Featured stores data
  const featuredStores = [
    {
      id: 1,
      name: "Yours Supermarket",
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80", // Fresh produce aisle
      hours: "06:00am - 09:00pm",
      location: "Leicester United Kingdom",
      distance: "0.1km",
      deliveryTime: "50 mins",
      priceRange: "£10-£500",
      rating: 4.5,
      isOpen: true,
      deliveryFee: "£25",
      methods: ["Shopping", "Pickup", "Delivery"]
    },
    {
      id: 2,
      name: "TESCO Supermarket",
      image: "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=600&q=80", // Modern grocery store
      hours: "06:00am - 08:00pm",
      location: "Leicester United Kingdom",
      distance: "1.2km",
      deliveryTime: "30 mins",
      priceRange: "£10-£500",
      rating: 4.8,
      isOpen: true,
      deliveryFee: "£25",
      methods: ["In-Shopping", "Delivery"]
    },
    {
      id: 3,
      name: "Fresh Market",
      image: "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=600&q=80", // Colorful vegetables display
      hours: "06:00am - 06:00pm",
      location: "Leicester United Kingdom",
      distance: "2.8km",
      deliveryTime: "20 mins",
      priceRange: "£10-£500",
      rating: 4.2,
      isOpen: true,
      deliveryFee: "£25",
      methods: ["Shopping", "Fitted", "In-Shopping", "Delivery"]
    }
  ]

  return (
    <div className="min-h-screen bg-[#F5A623] dark:bg-gray-900">
      {/* ============================================
          NAVIGATION - Afrimercato branding
          ============================================ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo - Afrimercato with X icon */}
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* X Icon */}
                <svg className="w-8 h-8 sm:w-10 sm:h-10" viewBox="0 0 40 40" fill="none">
                  <path
                    d="M8 8L32 32M32 8L8 32"
                    stroke="#1a1a1a"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900">
                Afrimercato
              </span>
            </Link>

            {/* Desktop Navigation - Pill shaped */}
            <div className="hidden md:flex items-center">
              <div className={`flex items-center gap-1 px-2 py-2 rounded-full ${
                isScrolled ? 'bg-gray-100' : 'bg-white/90 backdrop-blur-sm'
              } shadow-sm`}>
                <NavLink href="/delivery">Delivery</NavLink>
                <NavLink href="/stores" active>Stores</NavLink>
                <NavLink href="/about">About us</NavLink>
                <NavLink href="/contact">Contact us</NavLink>
              </div>
            </div>

            {/* Sign Up Button with Cart Icon */}
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="hidden sm:block font-medium text-gray-800 hover:text-gray-900 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 bg-[#00897B] hover:bg-[#00695C] text-white px-4 sm:px-5 py-2.5 rounded-full font-semibold shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                <span className="hidden sm:inline">Sign Up</span>
                <span className="sm:hidden">Join</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/20"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white rounded-2xl mb-4 overflow-hidden shadow-xl"
              >
                <div className="p-4 space-y-2">
                  <MobileNavLink to="/stores" onClick={() => setMobileMenuOpen(false)}>Stores</MobileNavLink>
                  <MobileNavLink to="/delivery" onClick={() => setMobileMenuOpen(false)}>Delivery</MobileNavLink>
                  <MobileNavLink to="/about" onClick={() => setMobileMenuOpen(false)}>About us</MobileNavLink>
                  <MobileNavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact us</MobileNavLink>
                  <div className="pt-3 border-t">
                    <Link
                      to="/login"
                      className="block py-3 text-center text-[#00897B] font-semibold"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Log in
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ============================================
          HERO SECTION - Exact client design
          ============================================ */}
      <section className="relative pt-20 sm:pt-24 pb-12 overflow-x-clip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left Side - Hero Content */}
            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
              className="relative z-10 pt-8 lg:pt-0"
            >
              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight"
              >
                We Help With the Shopping and Bring it to your{' '}
                <span className="text-[#00897B] relative inline-block">
                  "DoorStep"
                  <motion.svg
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="absolute -bottom-2 left-0 w-full h-3"
                    viewBox="0 0 200 12"
                  >
                    <motion.path
                      d="M2 10C50 2 150 2 198 10"
                      stroke="#00897B"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-6 text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-xl leading-relaxed"
              >
                Experience the convenience of African and international groceries
                delivered right to your door. Fresh produce, authentic flavors,
                fast delivery across the UK.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                {/* Partner With Us Button */}
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/partner"
                    className="inline-flex items-center gap-2 bg-[#00897B] hover:bg-[#00695C] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold shadow-xl transition-all text-base sm:text-lg"
                  >
                    Partner With Us
                  </Link>
                </motion.div>

                {/* Video Button with rotating text */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group"
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                    {/* Rotating text */}
                    <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                      <defs>
                        <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                      </defs>
                      <text className="text-[8px] sm:text-[9px] fill-gray-700 font-medium uppercase tracking-widest">
                        <textPath href="#circlePath">
                          Learn about us through this video •
                        </textPath>
                      </text>
                    </svg>
                    {/* Play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#00897B] ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </motion.button>
              </motion.div>

              {/* Trust Indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="mt-10 flex items-center gap-4"
              >
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/80 border-3 border-[#F5A623] flex items-center justify-center text-lg"
                    >
                      {['👩🏾', '👨🏿', '👩🏽'][i-1]}
                    </div>
                  ))}
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white border-3 border-[#F5A623] flex items-center justify-center text-xs sm:text-sm font-bold text-gray-700">
                    +4K
                  </div>
                </div>
                <p className="text-gray-800 font-medium text-sm sm:text-base">
                  Trusted by <span className="font-bold text-gray-900">4,320+</span> Vendors
                </p>
              </motion.div>
            </motion.div>

            {/* Right Side - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="relative">
                {/* Main Image */}
                <div className="relative z-10">
                  <img
                    src={HERO_IMAGE}
                    alt="Happy customer with fresh groceries"
                    className="w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[600px] object-cover object-center rounded-3xl shadow-2xl"
                    loading="eager"
                    fetchpriority="high"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=90'
                      e.target.onerror = null
                    }}
                  />
                </div>

                {/* Floating Elements — hidden on mobile to prevent overflow */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="hidden md:block absolute top-10 left-0 lg:-left-4 bg-white rounded-2xl p-4 shadow-xl z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Fresh Daily</p>
                      <p className="text-sm text-gray-600">Quality guaranteed</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="hidden md:block absolute bottom-20 right-0 lg:-right-4 bg-white rounded-2xl p-4 shadow-xl z-20"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                      🚚
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Fast Delivery</p>
                      <p className="text-sm text-gray-600">20-30 minutes</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* ============================================
              SEARCH BAR - Exact client design
              ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative z-20 mt-8 lg:-mt-4"
          >
            <form
              onSubmit={handleFindStore}
              className="bg-white rounded-2xl sm:rounded-full shadow-2xl p-3 sm:p-4"
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:items-center">
                {/* Location Input */}
                <div className="flex-1 relative">
                  <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-0">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onFocus={() => setShowLocationDropdown(true)}
                      onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                      placeholder="Postcode, store name, location"
                      className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500 text-base sm:text-lg"
                    />
                  </div>

                  {/* Recent Searches Dropdown */}
                  <AnimatePresence>
                    {showLocationDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="p-3">
                          <p className="text-xs text-gray-500 font-medium mb-2 px-2">Recent searches</p>
                          {recentSearches.map((city) => (
                            <button
                              key={city}
                              type="button"
                              onClick={() => selectLocation(city)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                            >
                              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                              </svg>
                              <span className="text-gray-700">{city}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-10 bg-gray-200 mx-2"></div>

                {/* Price Tag */}
                <div className="sm:w-36">
                  <div className="flex items-center gap-2 px-4 py-3 sm:py-0">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <select
                      value={priceTag}
                      onChange={(e) => setPriceTag(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-gray-700 cursor-pointer text-sm appearance-none"
                    >
                      <option value="all">Price Tag</option>
                      <option value="budget">Budget</option>
                      <option value="mid">Mid Range</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-10 bg-gray-200 mx-2"></div>

                {/* Shopping Method */}
                <div className="sm:w-44">
                  <div className="flex items-center gap-2 px-4 py-3 sm:py-0">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <select
                      value={shoppingMethod}
                      onChange={(e) => setShoppingMethod(e.target.value)}
                      className="flex-1 bg-transparent border-none outline-none text-gray-700 cursor-pointer text-sm appearance-none"
                    >
                      <option value="all">Shopping Method</option>
                      <option value="delivery">Delivery</option>
                      <option value="pickup">Pickup</option>
                      <option value="in-store">In-Store</option>
                    </select>
                  </div>
                </div>

                {/* Find Store Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#00897B] hover:bg-[#00695C] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-full font-bold shadow-lg transition-all text-base whitespace-nowrap"
                >
                  Find Store
                </motion.button>
              </div>
            </form>

            {/* Quick City Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-4 flex flex-wrap items-center gap-2 justify-center sm:justify-start"
            >
              <span className="text-gray-700 text-sm font-medium">Popular:</span>
              {['London', 'Birmingham', 'Manchester', 'Leeds', 'Bristol'].map((city) => (
                <button
                  key={city}
                  onClick={() => selectLocation(city)}
                  className="px-3 py-1.5 bg-white/60 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md"
                >
                  {city}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Background Decorations — contained to prevent horizontal scroll */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 right-0 w-64 md:w-96 h-64 md:h-96 bg-yellow-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-48 md:w-64 h-48 md:h-64 bg-orange-300/20 rounded-full blur-2xl"></div>
        </div>
      </section>

      {/* ============================================
          STORE MARKETPLACE SECTION - From three.jpg
          ============================================ */}
      <section className="bg-white dark:bg-gray-800 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3"
            >
              African Online Store In the United Kingdom
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 max-w-2xl mx-auto"
            >
              Use existing infrastructure of African products delivered to your doorstep.
              Open stores, no staff needed, deliver to you however convenient.
            </motion.p>
          </div>

          {/* Meet Our Partners */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Meet Our Partners</h3>

            {/* Tabs: Stores | Pickers | Riders */}
            <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-full mb-6">
              <button className="px-6 py-2 bg-[#00897B] text-white rounded-full font-medium text-sm">
                Stores
              </button>
              <button className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-full font-medium text-sm transition-colors">
                Pickers
              </button>
              <button className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-full font-medium text-sm transition-colors">
                Riders
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <button className="text-[#00897B] font-medium border-b-2 border-[#00897B] pb-1">
                Stores near by
              </button>
              <button className="text-gray-600 hover:text-gray-900 font-medium pb-1">
                Top stores
              </button>
              <button className="text-gray-600 hover:text-gray-900 font-medium pb-1">
                Featured stores
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50">
                Onboard your store
              </button>
            </div>

            <div className="text-right mb-4">
              <Link to="/stores" className="text-[#00897B] font-medium hover:underline">
                See All Stores →
              </Link>
            </div>
          </div>

          {/* Store Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStores.map((store, index) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                onClick={() => navigate(`/store/${store.id}`)}
                className="bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-600 overflow-hidden cursor-pointer transition-all"
              >
                {/* Store Image */}
                <div className="relative h-48">
                  <img
                    src={store.image}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                  {/* Price Range Badge */}
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 shadow-md">
                    Shop from {store.priceRange}
                  </div>
                  {/* Open Status Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-sm font-medium shadow-md ${
                    store.isOpen
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {store.rating} {store.isOpen ? 'Open' : 'Closed'}
                  </div>
                </div>

                {/* Store Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {store.name}
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </h3>
                  </div>

                  <p className="text-sm text-gray-600 mb-1">
                    Available: {store.hours}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Location: {store.location}
                  </p>

                  {/* Delivery Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {store.distance}
                    </span>
                    <span>•</span>
                    <span>{store.deliveryFee} Deliveries</span>
                    <span>•</span>
                    <span>{store.deliveryTime}</span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`w-4 h-4 ${star <= Math.floor(store.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Shopping Methods */}
                  <div className="flex flex-wrap gap-1">
                    {store.methods.map((method) => (
                      <span
                        key={method}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium"
                      >
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-10">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                to="/stores"
                className="inline-flex items-center gap-2 bg-[#00897B] hover:bg-[#00695C] text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all text-lg"
              >
                View All Stores
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          JOIN WAITLIST SECTION - From client design
          ============================================ */}
      <section className="relative py-16 overflow-hidden">
        {/* Wavy yellow background */}
        <div className="absolute inset-0 bg-[#F5A623]">
          <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none">
            <path d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V0H0V50Z" fill="white"/>
          </svg>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center py-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4"
          >
            Join the waitlist for Our App
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-700 mb-8 max-w-xl mx-auto"
          >
            Exciting things are coming your way! Be the first to experience the ultimate shopping
            convenience with our upcoming app. Whether you prefer an in-store shopping experience or
            hassle-free home delivery, our app puts the power of choice in your hands.
          </motion.p>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Enter email address"
              className="flex-1 px-5 py-3 rounded-full border-2 border-gray-200 focus:border-[#00897B] outline-none text-gray-900"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-[#00897B] hover:bg-[#00695C] text-white px-8 py-3 rounded-full font-bold shadow-lg transition-all whitespace-nowrap"
            >
              Join List
            </motion.button>
          </motion.form>
        </div>
      </section>

      {/* ============================================
          WHY AFRIMERCATO EXISTS
          ============================================ */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Why Afrimercato Exists
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg leading-relaxed space-y-4"
          >
            <p>
              Afrimercato was born from a simple but powerful observation. A Nigerian living abroad
              noticed how difficult it was for people outside Africa — and even within Africa — to
              reliably access authentic African goods.
            </p>
            <p>
              Local stores struggled with visibility. Customers struggled with trust and convenience.
              Delivery systems were fragmented, expensive, or unfair. Yet the demand was clear.
              And the businesses were ready — they just lacked the right digital bridge.
            </p>
            <p className="text-[#00897B] font-semibold text-xl">
              Afrimercato is that bridge.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-[#00897B] font-semibold hover:underline"
            >
              Read our full story
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          WHO IT'S FOR — Audience Cards
          ============================================ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12"
          >
            Who It's For
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🏪',
                title: 'Stores',
                message: 'You control your business, your delivery, your costs.',
                color: 'from-[#00897B] to-[#00695C]'
              },
              {
                icon: '🚴',
                title: 'Riders & Pickers',
                message: 'Work independently. Choose your stores. Pay only when you earn.',
                color: 'from-[#F5A623] to-[#FF9800]'
              },
              {
                icon: '🛒',
                title: 'Customers',
                message: 'Discover authentic African goods from trusted local stores, delivered to your door.',
                color: 'from-[#4285F4] to-[#1a73e8]'
              }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${card.color} p-6`}>
                  <span className="text-4xl">{card.icon}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{card.message}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          VISION & MISSION
          ============================================ */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#00897B] to-[#00695C] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-3">Our Vision</h3>
              <p className="text-xl sm:text-2xl font-semibold leading-relaxed">
                To be the digital home where African and local businesses thrive — connecting stores,
                customers, and communities worldwide.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-3">Our Mission</h3>
              <p className="text-xl sm:text-2xl font-semibold leading-relaxed">
                Afrimercato empowers local and international merchants to sell, fulfil, and grow
                through a fair, flexible, and trusted marketplace.
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="mt-10 pt-8 border-t border-white/20 text-center"
          >
            <p className="text-white/80 text-sm">
              We are currently in a guided testing phase to ensure speed, reliability, and strong
              foundations before scaling to new regions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          FOOTER - From client design (six.jpg)
          ============================================ */}
      <footer id="contact" className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-4">You've Got Questions?<br />Do Reach Out!</h3>
              <p className="text-gray-400 text-sm mb-4">
                A fair, flexible marketplace connecting African stores, customers, and communities worldwide.
              </p>
              <div className="space-y-3 text-gray-400">
                <p className="flex items-center gap-2">
                  <span className="text-yellow-500">📞</span>
                  +44 7778 285855
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-yellow-500">📧</span>
                  Email: info@afrimercato.co.uk
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-yellow-500">📍</span>
                  Location: Washington Ave, Manchester, United Kingdom.
                </p>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/delivery" className="hover:text-yellow-500 transition-colors">Delivery</Link></li>
                <li><Link to="/stores" className="hover:text-yellow-500 transition-colors">Stores</Link></li>
                <li><Link to="/about" className="hover:text-yellow-500 transition-colors">About us</Link></li>
                <li><Link to="/contact" className="hover:text-yellow-500 transition-colors">Contact us</Link></li>
                <li><Link to="/stores" className="hover:text-yellow-500 transition-colors">Stores near me</Link></li>
                <li><Link to="/partner" className="hover:text-yellow-500 transition-colors">Partner With Us</Link></li>
              </ul>
            </div>

            {/* Cities */}
            <div>
              <h4 className="font-bold mb-4">Cities</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => selectLocation('Bristol')} className="hover:text-yellow-500 transition-colors">Bristol</button></li>
                <li><button onClick={() => selectLocation('London')} className="hover:text-yellow-500 transition-colors">London</button></li>
                <li><button onClick={() => selectLocation('Leicester')} className="hover:text-yellow-500 transition-colors">Leicester</button></li>
                <li><button onClick={() => selectLocation('Liverpool')} className="hover:text-yellow-500 transition-colors">Liverpool</button></li>
                <li><button onClick={() => selectLocation('Beckham')} className="hover:text-yellow-500 transition-colors">Beckham</button></li>
                <li><button onClick={() => selectLocation('Birmingham')} className="hover:text-yellow-500 transition-colors">Birmingham</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
            <p>© 2026 Afrimercato</p>
            <p>Designed By thedesignpygi</p>
            <p>All Right Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Custom Styles */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  )
}

// Nav Link Component
function NavLink({ href, children, active }) {
  const isRoute = href?.startsWith('/')
  const Component = isRoute ? Link : 'a'

  return (
    <Component
      to={isRoute ? href : undefined}
      href={!isRoute ? href : undefined}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-[#00897B] text-white'
          : 'text-gray-800 hover:bg-white/50'
      }`}
    >
      {children}
    </Component>
  )
}

// Mobile Nav Link Component
function MobileNavLink({ to, onClick, children }) {
  const isRoute = to?.startsWith('/')
  const Component = isRoute ? Link : 'a'

  return (
    <Component
      to={isRoute ? to : undefined}
      href={!isRoute ? to : undefined}
      onClick={onClick}
      className="block py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors"
    >
      {children}
    </Component>
  )
}
