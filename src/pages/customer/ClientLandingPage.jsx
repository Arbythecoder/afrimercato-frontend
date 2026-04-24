/**
 * AFRIMERCATO - CLIENT LANDING PAGE
 */

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getFeaturedVendors, joinWaitlist } from '../../services/api'
import {
  ShoppingCart,
  Menu,
  X as Close,
  ChevronDown,
  Search,
  Store,
  MapPin,
  Tag,
  ShoppingBag,
  Globe,
  ArrowRight
} from 'lucide-react';

// Fallback stores shown while API loads or if no real vendors exist in DB yet
const FALLBACK_STORES = [
  { id: 'f1', _isSample: true, storeName: 'Green Valley Farms', category: 'Fresh Produce', logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', rating: 4.8, location: { city: 'London' }, isActive: true },
  { id: 'f2', _isSample: true, storeName: 'African Spice Market', category: 'African Groceries', logo: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600', rating: 4.9, location: { city: 'London' }, isActive: true },
  { id: 'f3', _isSample: true, storeName: 'Lagos Kitchen Store', category: 'Nigerian Foods', logo: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', rating: 4.9, location: { city: 'London' }, isActive: true },
  { id: 'f4', _isSample: true, storeName: 'Tropical Fruits Hub', category: 'Exotic Fruits', logo: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600', rating: 4.8, location: { city: 'Manchester' }, isActive: true },
  { id: 'f5', _isSample: true, storeName: 'Handsworth African Foods', category: 'African Groceries', logo: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=600', rating: 4.7, location: { city: 'Birmingham' }, isActive: true },
  { id: 'f6', _isSample: true, storeName: 'Bristol African Store', category: 'African Groceries', logo: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600', rating: 4.7, location: { city: 'Bristol' }, isActive: true },
]

export default function ClientLandingPage() {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [priceTag, setPriceTag] = useState('all')
  const [shoppingMethod, setShoppingMethod] = useState('all')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showJoinDropdown, setShowJoinDropdown] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)

  // Partners section state
  const [activePartnerTab, setActivePartnerTab] = useState('stores') // stores | pickers | riders
  const [activeFilter, setActiveFilter] = useState('nearby') // nearby | top | featured
  const [stores, setStores] = useState(FALLBACK_STORES)
  const [storesLoading, setStoresLoading] = useState(true)

  // Waitlist
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistStatus, setWaitlistStatus] = useState('') // '' | 'loading' | 'success' | 'error'
  const [waitlistMessage, setWaitlistMessage] = useState('')

  // Location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState([])
  const [locationLoading, setLocationLoading] = useState(false)
  const debounceRef = useRef(null)

  const recentSearches = ['Bristol', 'London', 'Manchester', 'Birmingham']

  // Detect scroll for nav styling
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Static UK fallback locations for when LocationIQ is unavailable
  const UK_CITIES = [
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Sheffield',
    'Bristol', 'Liverpool', 'Leicester', 'Edinburgh', 'Glasgow',
    'Coventry', 'Bradford', 'Nottingham', 'Southampton', 'Cardiff',
    'Peckham, London', 'Brixton, London', 'Tottenham, London',
    'East Ham, London', 'Hackney, London', 'Lewisham, London',
    'Croydon, London', 'Southwark, London', 'Newham, London',
    'Moss Side, Manchester', 'Handsworth, Birmingham', 'Chapeltown, Leeds',
    'Sparkbrook, Birmingham', 'Toxteth, Liverpool',
  ]

  // Live location autocomplete — LocationIQ with static UK fallback
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    const query = location.trim()
    if (query.length < 2) {
      setLocationSuggestions([])
      return
    }

    // Static fallback filter (instant)
    const staticMatches = UK_CITIES.filter(c =>
      c.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6)

    const locationIQKey = import.meta.env.VITE_LOCATIONIQ_TOKEN

    // If no API key, use static list only
    if (!locationIQKey) {
      setLocationSuggestions(staticMatches)
      return
    }

    debounceRef.current = setTimeout(async () => {
      setLocationLoading(true)
      try {
        const params = new URLSearchParams({
          key: locationIQKey,
          q: query,
          limit: '6',
          countrycodes: 'gb,ie',
          dedupe: '1',
          normalizecity: '1',
          tag: 'place:city,place:town,place:village,place:suburb,boundary:administrative'
        })
        const res = await fetch(`https://api.locationiq.com/v1/autocomplete?${params}`)
        const data = await res.json()
        if (!Array.isArray(data) || data.length === 0) {
          setLocationSuggestions(staticMatches)
          return
        }
        const suggestions = data
          .map((item) => {
            if (item.display_place && item.display_address) {
              const region = item.display_address.split(',')[0].trim()
              return region ? `${item.display_place}, ${region}` : item.display_place
            }
            return item.display_name?.split(',').slice(0, 2).join(',').trim() || ''
          })
          .filter(Boolean)
        // If API returned data but mapping produced nothing, use static fallback
        setLocationSuggestions(suggestions.length > 0 ? [...new Set(suggestions)] : staticMatches)
      } catch (_e) {
        // API failed — fall back to static list
        setLocationSuggestions(staticMatches)
      } finally {
        setLocationLoading(false)
      }
    }, 350)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [location])

  // Fetch real stores from API
  useEffect(() => {
    const fetchStores = async () => {
      setStoresLoading(true)
      try {
        const response = await getFeaturedVendors(9)
        if (response.success && response.data && response.data.length > 0) {
          setStores(response.data)
        } else {
          // No real vendors yet — show fallback sample stores
          setStores(FALLBACK_STORES)
        }
      } catch (_e) {
        // API unreachable — show fallback sample stores
        setStores(FALLBACK_STORES)
      } finally {
        setStoresLoading(false)
      }
    }
    fetchStores()
  }, [])

  // Filter stores based on active filter tab
  const filteredStores = (() => {
    if (activeFilter === 'top') {
      return [...stores].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }
    return stores
  })().slice(0, 3)

  // Handle search
  const handleFindStore = (e) => {
    e?.preventDefault()
    if (!location.trim()) return
    navigate(`/stores?location=${encodeURIComponent(location)}&price=${priceTag}&method=${shoppingMethod}`)
  }

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault()
    if (!waitlistEmail.trim()) return
    setWaitlistStatus('loading')
    setWaitlistMessage('')
    try {
      const result = await joinWaitlist(waitlistEmail.trim())
      if (result?.success) {
        setWaitlistStatus('success')
        setWaitlistMessage(result.message)
        setWaitlistEmail('')
      } else {
        setWaitlistStatus('error')
        setWaitlistMessage(result?.message || 'Something went wrong. Please try again.')
      }
    } catch (_e) {
      if (_e.status === 409) {
        setWaitlistStatus('duplicate')
        setWaitlistMessage(_e.message)
      } else {
        setWaitlistStatus('error')
        setWaitlistMessage('Something went wrong. Please try again.')
      }
    }
  }

  // Quick location select
  const selectLocation = (loc) => {
    setLocation(loc)
    setShowLocationDropdown(false)
    navigate(`/stores?location=${encodeURIComponent(loc)}`)
  }

  return (
    <div className="min-h-screen bg-[#FDF8F0]">
      {/* ============================================
          NAVIGATION
          ============================================ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 left-0 right-0 z-50 bg-white shadow-sm transition-all duration-300`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <span className="font-black text-2xl text-[#1B4D3E] tracking-tight">Afrimercato</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center flex-1 justify-center">
              <nav className="flex gap-8">
                <Link to="/stores" className="text-gray-700 font-medium hover:text-[#1B4D3E] transition-colors">Stores</Link>
                <Link to="/delivery" className="text-gray-700 font-medium hover:text-[#1B4D3E] transition-colors">Delivery</Link>
                <Link to="/about" className="text-gray-700 font-medium hover:text-[#1B4D3E] transition-colors">About</Link>
                <Link to="/contact" className="text-gray-700 font-medium hover:text-[#1B4D3E] transition-colors">Contact</Link>
              </nav>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-2">
              <Link to="/login" className="hidden sm:inline-block border border-[#1B4D3E] text-[#1B4D3E] font-semibold px-5 py-2 rounded-full hover:bg-[#FDF8F0] transition-colors">Log in</Link>
              <Link to="/register" className="inline-flex items-center gap-2 bg-[#1B4D3E] text-white font-semibold px-5 py-2 rounded-full shadow-sm hover:bg-[#163e32] transition-colors">
                <ShoppingCart className="w-5 h-5" />
                <span>Sign Up</span>
              </Link>
              {/* Mobile Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1B4D3E]"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <Close className="w-7 h-7 text-[#1B4D3E]" /> : <Menu className="w-7 h-7 text-[#1B4D3E]" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white rounded-2xl mb-4 overflow-hidden shadow-xl border border-gray-100"
              >
                <div className="p-4 space-y-2">
                  <Link to="/stores" className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-[#FDF8F0]" onClick={() => setMobileMenuOpen(false)}>Stores</Link>
                  <Link to="/delivery" className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-[#FDF8F0]" onClick={() => setMobileMenuOpen(false)}>Delivery</Link>
                  <Link to="/about" className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-[#FDF8F0]" onClick={() => setMobileMenuOpen(false)}>About</Link>
                  <Link to="/contact" className="block px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-[#FDF8F0]" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                  <div className="pt-3 border-t space-y-1">
                    <Link to="/login" className="block w-full text-center border border-[#1B4D3E] text-[#1B4D3E] font-semibold px-4 py-2 rounded-full hover:bg-[#FDF8F0]" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                    <Link to="/register" className="block w-full text-center bg-[#1B4D3E] text-white font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-[#163e32] mt-2" onClick={() => setMobileMenuOpen(false)}>
                      <span className="inline-flex items-center gap-2 justify-center"><ShoppingCart className="w-5 h-5" />Sign Up</span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="relative pt-28 sm:pt-32 pb-12 overflow-x-clip bg-[#FFB800]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left — Hero Text */}
            <div className="relative z-10 pt-8 lg:pt-0">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white text-[#1B4D3E] font-semibold rounded-full px-4 py-1.5 mb-6 text-sm shadow">
                <Globe className="w-4 h-4" />
                Now delivering across the UK
              </div>
              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="font-black text-5xl sm:text-6xl xl:text-7xl text-[#1A1A1A] leading-[1.1] tracking-tight mb-6"
              >
                Shop African Stores,<br />
                Delivered to Your <span className="text-[#1B4D3E] underline decoration-4 decoration-[#1B4D3E] underline-offset-4">Doorstep</span>
              </motion.h1>
              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="mt-4 text-lg text-gray-700 max-w-xl leading-relaxed"
              >
                Browse hundreds of African stores near you. Fresh groceries, spices, and more — delivered fast.
              </motion.p>
              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <Link
                  to="/stores"
                  className="inline-flex items-center gap-2 bg-[#1B4D3E] hover:bg-[#163e32] text-white rounded-full px-8 py-4 font-bold shadow-xl transition-all text-lg"
                >
                  <Search className="w-5 h-5" />
                  Find Stores Near You
                </Link>
                <Link
                  to="/register?role=vendor"
                  className="inline-flex items-center gap-2 border-2 border-[#1B4D3E] text-[#1B4D3E] rounded-full px-8 py-4 font-bold bg-white hover:bg-[#FDF8F0] transition-all text-lg"
                >
                  <Store className="w-5 h-5" />
                  Sell on Afrimercato
                </Link>
              </motion.div>
            </div>

            {/* Right — Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-8 lg:mt-0"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=90"
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="relative z-20 mt-10"
                  >
                    <form onSubmit={handleFindStore} className="bg-white rounded-full shadow-xl px-2 py-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-0">
                      {/* Location */}
                      <div className="flex items-center gap-2 px-4 py-3 flex-1">
                        <MapPin className="w-5 h-5 text-[#1B4D3E]" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => { setLocation(e.target.value); setShowLocationDropdown(true) }}
                          onFocus={() => setShowLocationDropdown(true)}
                          onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                          placeholder="Enter postcode or area"
                          className="flex-1 bg-transparent border-none outline-none text-[#1A1A1A] placeholder-gray-500 text-base sm:text-lg"
                        />
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-gray-200 mx-2"></div>
                      {/* Price Range */}
                      <div className="flex items-center gap-2 px-4 py-3">
                        <Tag className="w-5 h-5 text-[#1B4D3E]" />
                        <select
                          value={priceTag}
                          onChange={(e) => setPriceTag(e.target.value)}
                          className="bg-transparent border-none outline-none text-[#1A1A1A] cursor-pointer text-base appearance-none"
                        >
                          <option value="all">Price range</option>
                          <option value="budget">Budget</option>
                          <option value="mid">Mid Range</option>
                          <option value="premium">Premium</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 ml-[-20px] pointer-events-none" />
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-gray-200 mx-2"></div>
                      {/* Delivery or Pickup */}
                      <div className="flex items-center gap-2 px-4 py-3">
                        <ShoppingBag className="w-5 h-5 text-[#1B4D3E]" />
                        <select
                          value={shoppingMethod}
                          onChange={(e) => setShoppingMethod(e.target.value)}
                          className="bg-transparent border-none outline-none text-[#1A1A1A] cursor-pointer text-base appearance-none"
                        >
                          <option value="all">Delivery or Pickup</option>
                          <option value="delivery">Delivery</option>
                          <option value="pickup">Pickup</option>
                          <option value="in-store">In-Store</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-gray-400 ml-[-20px] pointer-events-none" />
                      </div>
                      <button
                        type="submit"
                        className="bg-[#1B4D3E] hover:bg-[#163e32] text-white rounded-full px-8 py-3 font-bold flex items-center gap-2 ml-2 shadow-lg transition-all text-base whitespace-nowrap"
                      >
                        Find Store <ArrowRight className="w-5 h-5" />
                      </button>
                    </form>
                  </motion.div>
                                  type="button"
                                  onClick={() => selectLocation(suggestion)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                >
                                  <svg className="w-4 h-4 text-[#00897B] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-gray-700">{suggestion}</span>
                                </button>
                              ))}
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-gray-500 font-medium mb-2 px-2">Popular locations</p>
                              {recentSearches.map((city) => (
                                <button
                                  key={city}
                                  type="button"
                                  onClick={() => selectLocation(city)}
                                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                >
                                  <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-gray-700">{city}</span>
                                </button>
                              ))}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

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
                  type="button"
                  onClick={() => selectLocation(city)}
                  className="px-3 py-1.5 bg-white/60 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md"
                >
                  {city}
                </button>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 right-0 w-64 md:w-96 h-64 md:h-96 bg-yellow-300/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-48 md:w-64 h-48 md:h-64 bg-orange-300/20 rounded-full blur-2xl"></div>
        </div>
      </section>

      {/* ============================================
          STORE MARKETPLACE SECTION
          ============================================ */}
      <section className="bg-white dark:bg-gray-800 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3"
            >
              African Online Store In the United Kingdom
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
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
              {[
                { id: 'stores', label: 'Stores' },
                { id: 'pickers', label: 'Pickers' },
                { id: 'riders', label: 'Riders' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePartnerTab(tab.id)}
                  className={`px-6 py-2 rounded-full font-medium text-sm transition-all ${
                    activePartnerTab === tab.id
                      ? 'bg-[#00897B] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Store filter tabs — only show for stores */}
            {activePartnerTab === 'stores' && (
              <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                {[
                  { id: 'nearby', label: 'Stores near by' },
                  { id: 'top', label: 'Top stores' },
                  { id: 'featured', label: 'Featured stores' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    className={`font-medium pb-1 transition-colors ${
                      activeFilter === f.id
                        ? 'text-[#00897B] border-b-2 border-[#00897B]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                <Link
                  to="/partner"
                  className="flex items-center gap-2 px-4 py-2 border border-[#00897B] text-[#00897B] rounded-full font-medium text-sm hover:bg-[#00897B] hover:text-white transition-all"
                >
                  + Onboard your store
                </Link>
              </div>
            )}

            <div className="text-right mb-4">
              <Link to="/stores" className="text-[#00897B] font-medium hover:underline">
                See All Stores →
              </Link>
            </div>
          </div>

          {/* Content based on active tab */}
          {activePartnerTab === 'stores' ? (
            <>
              {storesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-2xl animate-pulse h-80" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStores.map((store, index) => (
                    <StoreCard key={store._id || store.id} store={store} index={index} navigate={navigate} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <PartnerCTA type={activePartnerTab} />
          )}

          {/* View All */}
          <div className="text-center mt-10">
            <Link
              to="/stores"
              className="inline-flex items-center gap-2 bg-[#00897B] hover:bg-[#00695C] text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all text-lg"
            >
              View All Stores
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
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
            viewport={{ once: true, amount: 0.2 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Why Afrimercato Exists
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600 text-lg leading-relaxed space-y-4"
          >
            <p>
              Afrimercato was born from a simple but powerful observation. A Nigerian living abroad
              noticed how difficult it was for people outside Africa to reliably access authentic African goods.
            </p>
            <p>
              Local stores struggled with visibility. Customers struggled with trust and convenience.
              Delivery systems were fragmented, expensive, or unfair. Yet the demand was clear.
              And the businesses were ready — they just lacked the right digital bridge.
            </p>
            <p className="text-[#00897B] font-semibold text-xl">Afrimercato is that bridge.</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Link to="/about" className="inline-flex items-center gap-2 text-[#00897B] font-semibold hover:underline">
              Read our full story
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          WHO IT'S FOR
          ============================================ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white text-center mb-12"
          >
            Who It's For
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🏪', title: 'Stores', message: 'You control your business, your delivery, your costs.', color: 'from-[#00897B] to-[#00695C]' },
              { icon: '🚴', title: 'Riders & Pickers', message: 'Work independently. Choose your stores. Pay only when you earn.', color: 'from-[#F5A623] to-[#FF9800]' },
              { icon: '🛒', title: 'Customers', message: 'Discover authentic African goods from trusted local stores, delivered to your door.', color: 'from-[#4285F4] to-[#1a73e8]' }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.15 + index * 0.15 }}
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
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-3">Our Vision</h3>
              <p className="text-xl sm:text-2xl font-semibold leading-relaxed">
                To be the digital home where African and local businesses thrive — connecting stores, customers, and communities worldwide.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ delay: 0.15 }}>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white/70 mb-3">Our Mission</h3>
              <p className="text-xl sm:text-2xl font-semibold leading-relaxed">
                Afrimercato empowers local and international merchants to sell, fulfil, and grow through a fair, flexible, and trusted marketplace.
              </p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.3 }}
            className="mt-10 pt-8 border-t border-white/20 text-center"
          >
            <p className="text-white/80 text-sm">
              We are currently in a guided testing phase to ensure speed, reliability, and strong foundations before scaling to new regions.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          WAITLIST
          ============================================ */}
      <section className="py-20 sm:py-24 bg-[#0a2e2a] relative overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#00897B]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
          >
            {/* eyebrow */}
            <span className="inline-block bg-[#00897B]/30 text-[#4db6ac] text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              Coming Soon
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              Be the first to know<br className="hidden sm:block" /> when we go live
            </h2>
            <p className="text-white/60 text-base sm:text-lg mb-10">
              Join thousands of shoppers and vendors waiting for Afrimercato to launch across the UK.
            </p>

            {waitlistStatus === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-[#00897B]/20 flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-[#4db6ac]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-white font-semibold text-lg">{waitlistMessage}</p>
                <p className="text-white/50 text-sm">Keep an eye on your inbox.</p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleWaitlistSubmit}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-lg mx-auto"
              >
                <input
                  type="email"
                  required
                  value={waitlistEmail}
                  onChange={(e) => { setWaitlistEmail(e.target.value); setWaitlistStatus(''); setWaitlistMessage('') }}
                  placeholder="Enter your email address"
                  className="flex-1 px-5 py-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#00897B] focus:border-transparent transition text-sm sm:text-base"
                />
                <button
                  type="submit"
                  disabled={waitlistStatus === 'loading'}
                  className="flex-shrink-0 bg-[#00897B] hover:bg-[#00695C] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-7 py-4 rounded-xl shadow-lg transition-all text-sm sm:text-base whitespace-nowrap"
                >
                  {waitlistStatus === 'loading' ? 'Joining…' : 'Join Waitlist'}
                </button>
              </form>
            )}

            {waitlistStatus === 'duplicate' && (
              <p className="mt-3 text-green-400 text-sm">{waitlistMessage}</p>
            )}

            {waitlistStatus === 'error' && (
              <p className="mt-3 text-red-400 text-sm">{waitlistMessage}</p>
            )}

            <p className="mt-6 text-white/30 text-xs">No spam. We'll only email you when we launch.</p>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer id="contact" className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-4">You've Got Questions?<br />Do Reach Out!</h3>
              <p className="text-gray-400 text-sm mb-4">
                A fair, flexible marketplace connecting African stores, customers, and communities worldwide.
              </p>
              <div className="space-y-3 text-gray-400">
                <p className="flex items-center gap-2"><span className="text-yellow-500">📞</span> +44 7778 285855</p>
                <p className="flex items-center gap-2"><span className="text-yellow-500">📧</span> info@afrimercato.co.uk</p>
                <p className="flex items-center gap-2"><span className="text-yellow-500">📍</span> Washington Ave, Manchester, United Kingdom.</p>
              </div>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/stores" className="hover:text-yellow-500 transition-colors">Stores</Link></li>
                <li><Link to="/about" className="hover:text-yellow-500 transition-colors">About us</Link></li>
                <li><Link to="/contact" className="hover:text-yellow-500 transition-colors">Contact us</Link></li>
                <li><Link to="/feedback" className="hover:text-yellow-500 transition-colors">Share Feedback</Link></li>
                <li><Link to="/register?role=vendor" className="hover:text-yellow-500 transition-colors">Partner With Us</Link></li>
                <li><Link to="/privacy" className="hover:text-yellow-500 transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Cities */}
            <div>
              <h4 className="font-bold mb-4">Cities</h4>
              <ul className="space-y-2 text-gray-400">
                {['Bristol', 'London', 'Leicester', 'Liverpool', 'Birmingham', 'Manchester'].map((city) => (
                  <li key={city}>
                    <button
                      type="button"
                      onClick={() => selectLocation(city)}
                      className="hover:text-yellow-500 transition-colors text-left"
                    >
                      {city}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
            <p>© 2026 Afrimercato</p>
            <p>Designed By thedesignpygi</p>
            <p>All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sticky bottom CTA bar — fixed while scrolling */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {['👩🏾','👨🏿','👩🏽'].map((e,i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-sm">{e}</div>
              ))}
            </div>
          </div>
          <Link
            to="/register?role=vendor"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#00897B] hover:bg-[#00695C] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all"
          >
            Partner With Us
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 10s linear infinite; }
      `}</style>
    </div>
  )
}

// ============================================
// STORE CARD COMPONENT
// ============================================
function StoreCard({ store, index, navigate }) {
  const storeImage = store.image || store.logo || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80'
  const storeName = store.storeName || store.name || 'African Store'
  const storeLocation = store.location?.city
    ? `${store.location.city}${store.location.country ? ', ' + store.location.country : ''}`
    : (store.location || 'United Kingdom')
  const rating = store.rating || store.averageRating || 4.5
  const isOpen = store.isOpen !== undefined ? store.isOpen : store.isActive !== false

  const handleClick = () => {
    if (store._isSample) navigate('/stores')
    else if (store.slug) navigate(`/store/${store.slug}`)
    else if (store._id) navigate(`/store/${store._id}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: 0.1 + index * 0.12 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={handleClick}
      className="group bg-white dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-600 overflow-hidden cursor-pointer transition-all"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img
          src={storeImage}
          alt={storeName}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80'
            e.target.onerror = null
          }}
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 shadow-md">
          {store.priceRange || store.category || 'African Store'}
        </div>
        <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-sm font-medium shadow-md ${isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {rating} ★ {isOpen ? 'Open' : 'Closed'}
        </div>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
          {storeName}
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </h3>
        <p className="text-sm text-gray-500 mb-3">📍 {storeLocation}</p>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg key={star} className={`w-4 h-4 ${star <= Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-gray-500 ml-1">{rating}</span>
        </div>
      </div>
    </motion.div>
  )
}

// ============================================
// PARTNER CTA — for Pickers and Riders tabs
// ============================================
function PartnerCTA({ type }) {
  const config = {
    pickers: {
      icon: '📦',
      title: 'Become a Picker',
      desc: 'Help fulfil orders in local African stores near you. Flexible hours, fair pay, and a growing network of stores to work with.',
      link: '/register?role=picker',
      cta: 'Sign Up as Picker'
    },
    riders: {
      icon: '🏍️',
      title: 'Become a Rider',
      desc: 'Deliver authentic African groceries to customers in your city. Set your own hours and earn on every delivery.',
      link: '/register?role=rider',
      cta: 'Sign Up as Rider'
    }
  }
  const c = config[type]
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-4">{c.icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{c.title}</h3>
      <p className="text-gray-600 max-w-md mb-8">{c.desc}</p>
      <Link
        to={c.link}
        className="inline-flex items-center gap-2 bg-[#00897B] hover:bg-[#00695C] text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all text-lg"
      >
        {c.cta}
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  )
}

// Nav helpers
function NavLink({ href, children, active }) {
  return (
    <Link
      to={href}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active ? 'bg-[#00897B] text-white' : 'text-gray-800 hover:bg-white/50'
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block py-3 px-4 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors"
    >
      {children}
    </Link>
  )
}
