/**
 * AFRIMERCATO - CLIENT LANDING PAGE
 */

import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getFeaturedVendors, joinWaitlist } from '../../services/api'
import { Phone, Mail, MapPin, Store, Bike, ShoppingBag, Star, ArrowRight, Package, Truck, Globe, Zap, Briefcase, ShoppingBasket, Clock, Tag, Flame, Leaf, Coffee } from 'lucide-react'
import { Star as PhStar, ShoppingCart as PhCart } from '@phosphor-icons/react'

// Fallback stores shown while API loads or if no real vendors exist in DB yet
const FALLBACK_STORES = [
  { id: 'f1', _isSample: true, storeName: 'Green Valley Farms', category: 'Fresh Produce', logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', rating: 4.8, location: { city: 'London' }, isActive: true },
  { id: 'f2', _isSample: true, storeName: 'African Spice Market', category: 'African Groceries', logo: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600', rating: 4.9, location: { city: 'London' }, isActive: true },
  { id: 'f3', _isSample: true, storeName: 'Lagos Kitchen Store', category: 'Nigerian Foods', logo: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', rating: 4.9, location: { city: 'London' }, isActive: true },
  { id: 'f4', _isSample: true, storeName: 'Tropical Fruits Hub', category: 'Exotic Fruits', logo: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600', rating: 4.8, location: { city: 'Manchester' }, isActive: true },
  { id: 'f5', _isSample: true, storeName: 'Handsworth African Foods', category: 'African Groceries', logo: 'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=600', rating: 4.7, location: { city: 'Birmingham' }, isActive: true },
  { id: 'f6', _isSample: true, storeName: 'Bristol African Store', category: 'African Groceries', logo: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600', rating: 4.7, location: { city: 'Bristol' }, isActive: true },
]

const CATEGORIES = [
  { id: 'all',       label: 'All Stores',    Icon: Store },
  { id: 'groceries', label: 'Groceries',     Icon: ShoppingBag },
  { id: 'fresh',     label: 'Fresh Produce', Icon: Leaf },
  { id: 'spices',    label: 'Spices',        Icon: Flame },
  { id: 'african',   label: 'African Food',  Icon: Globe },
  { id: 'drinks',    label: 'Drinks',        Icon: Coffee },
  { id: 'snacks',    label: 'Snacks',        Icon: Package },
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
  const [activeCategory, setActiveCategory] = useState('all')

  // Partners section state
  const [activePartnerTab, setActivePartnerTab] = useState('stores') // stores | pickers | riders
  const [activeFilter, setActiveFilter] = useState('nearby') // nearby | top | featured
  const [stores, setStores] = useState([])
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
          setStores([])
        }
      } catch (_e) {
        setStores([])
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
    if (!location.trim()) {
      navigate('/stores')
      return
    }
    navigate(`/stores?search=${encodeURIComponent(location)}`)
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
    navigate(`/stores?search=${encodeURIComponent(loc)}`)
  }

  return (
    <div className="min-h-screen bg-[#F5A623] dark:bg-gray-900">
      {/* ============================================
          NAVIGATION
          ============================================ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg' : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <img src="/logo.svg" alt="Afrimercato" className="h-8 sm:h-10 w-auto" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center">
              <div className={`flex items-center gap-1 px-2 py-2 rounded-full ${
                isScrolled ? 'bg-gray-100' : 'bg-white/90 backdrop-blur-sm'
              } shadow-sm`}>
                <NavLink href="/stores" active>Stores</NavLink>
                <NavLink href="/about">About us</NavLink>
                <NavLink href="/contact">Contact us</NavLink>
              </div>
            </div>

            {/* Sign Up / Login */}
            <div className="flex items-center gap-3">
              <Link to="/login" className="hidden sm:block font-medium text-gray-800 hover:text-gray-900 transition-colors">
                Log in
              </Link>
              {/* Join dropdown backdrop */}
              {showJoinDropdown && (
                <div className="fixed inset-0 z-40" onClick={() => setShowJoinDropdown(false)} />
              )}

              {/* Join button with role dropdown */}
              <div className="relative z-50">
                <button
                  type="button"
                  onClick={() => setShowJoinDropdown(!showJoinDropdown)}
                  className="flex items-center gap-1 bg-[#1B4D3E] text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-[#0D2B22] transition-all"
                >
                  Join
                  <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showJoinDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white rounded-2xl shadow-xl p-2">
                    <Link
                      to="/register?role=customer"
                      onClick={() => setShowJoinDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FDF8F0] text-[#1A1A1A] font-medium transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag size={16} className="text-[#FFB800]" />
                      </div>
                      Sign up as Customer
                    </Link>
                    <Link
                      to="/register?role=vendor"
                      onClick={() => setShowJoinDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FDF8F0] text-[#1A1A1A] font-medium transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Store size={16} className="text-[#1B4D3E]" />
                      </div>
                      Sign up as Vendor
                    </Link>
                    <Link
                      to="/register?role=rider"
                      onClick={() => setShowJoinDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FDF8F0] text-[#1A1A1A] font-medium transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Bike size={16} className="text-[#FF8C00]" />
                      </div>
                      Sign up as Rider
                    </Link>
                    <Link
                      to="/register?role=picker"
                      onClick={() => setShowJoinDropdown(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#FDF8F0] text-[#1A1A1A] font-medium transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-[#E53E3E]" />
                      </div>
                      Sign up as Picker
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/20"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
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
                className="md:hidden bg-white rounded-2xl mb-4 overflow-hidden shadow-xl"
              >
                <div className="p-4 space-y-2">
                  <MobileNavLink to="/stores" onClick={() => setMobileMenuOpen(false)}>Stores</MobileNavLink>
                  <MobileNavLink to="/about" onClick={() => setMobileMenuOpen(false)}>About us</MobileNavLink>
                  <MobileNavLink to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact us</MobileNavLink>
                  <div className="pt-3 border-t space-y-1">
                    <Link to="/register?role=customer" className="w-full flex items-center gap-3 px-3 py-4 rounded-lg text-gray-700 hover:bg-[#FDF8F0] hover:text-[#1B4D3E] transition-colors border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag size={16} className="text-[#FFB800]" />
                      </div>
                      <span className="font-semibold text-sm">Join as Customer</span>
                    </Link>
                    <Link to="/register?role=vendor" className="w-full flex items-center gap-3 px-3 py-4 rounded-lg text-gray-700 hover:bg-[#FDF8F0] hover:text-[#1B4D3E] transition-colors border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>
                      <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                        <Store size={16} className="text-[#1B4D3E]" />
                      </div>
                      <span className="font-semibold text-sm">Join as Vendor</span>
                    </Link>
                    <Link to="/register?role=rider" className="w-full flex items-center gap-3 px-3 py-4 rounded-lg text-gray-700 hover:bg-[#FDF8F0] hover:text-[#1B4D3E] transition-colors border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Bike size={16} className="text-[#FF8C00]" />
                      </div>
                      <span className="font-semibold text-sm">Join as Rider</span>
                    </Link>
                    <Link to="/register?role=picker" className="w-full flex items-center gap-3 px-3 py-4 rounded-lg text-gray-700 hover:bg-[#FDF8F0] hover:text-[#1B4D3E] transition-colors border-b border-gray-100" onClick={() => setMobileMenuOpen(false)}>
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <Package size={16} className="text-[#E53E3E]" />
                      </div>
                      <span className="font-semibold text-sm">Join as Picker</span>
                    </Link>
                    <Link to="/login" className="block py-3 text-center text-[#1B4D3E] font-semibold border-t mt-1" onClick={() => setMobileMenuOpen(false)}>
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
          HERO SECTION
          ============================================ */}
      <section className="relative pt-28 sm:pt-32 pb-12 overflow-x-clip">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

            {/* Left — no parallax to prevent content overlap */}
            <div className="relative z-10 pt-8 lg:pt-0">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white leading-[1.1] tracking-tight"
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
                className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
              >
                <Link
                  to="/stores"
                  className="inline-flex items-center justify-center gap-2 bg-[#1B4D3E] hover:bg-[#0D2B22] text-white w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold shadow-xl transition-all duration-200 text-base sm:text-lg"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Shop Now
                </Link>

                <Link
                  to="/register?role=vendor"
                  className="inline-flex items-center justify-center gap-2 border-2 border-[#1B4D3E] text-[#1B4D3E] hover:bg-[#1B4D3E] hover:text-white w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 rounded-full font-semibold shadow transition-all duration-200 text-base sm:text-lg"
                >
                  Sell on Afrimercato
                </Link>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative group hidden sm:block"
                >
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                    <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                      <defs>
                        <path id="circlePath" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" />
                      </defs>
                      <text className="text-[8px] sm:text-[9px] fill-gray-700 font-medium uppercase tracking-widest">
                        <textPath href="#circlePath">Learn about us through this video •</textPath>
                      </text>
                    </svg>
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
                  alt="Fresh African groceries delivered"
                  className="w-full h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[560px] object-cover object-center rounded-3xl shadow-2xl"
                  loading="eager"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1200&q=90'
                    e.target.onerror = null
                  }}
                />

                {/* Floating cards — desktop only */}
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
                    <div className="w-12 h-12 bg-[#FFB800]/20 rounded-xl flex items-center justify-center"><Truck size={24} className="text-[#FFB800]" /></div>
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
              SEARCH BAR — UberEats pill style
              ============================================ */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="relative z-20 mt-10 lg:mt-8"
          >
            <form onSubmit={handleFindStore} className="relative">
              <div className="flex items-center bg-white rounded-full shadow-2xl border border-gray-100 p-2 max-w-2xl mx-auto">
                <MapPin size={20} className="ml-4 text-[#FFB800] flex-shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => { setLocation(e.target.value); setShowLocationDropdown(true) }}
                  onFocus={() => setShowLocationDropdown(true)}
                  onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                  placeholder="Enter postcode or area..."
                  className="text-lg flex-1 px-4 py-3 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#FFB800] text-[#1B4D3E] font-bold rounded-full px-8 py-3 whitespace-nowrap hover:bg-[#FF8C00] transition-all"
                >
                  Find Stores
                </motion.button>
              </div>

              <AnimatePresence>
                {showLocationDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 w-full max-w-2xl mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-3">
                      {location.trim().length >= 2 ? (
                        <>
                          <p className="text-xs text-gray-500 font-medium mb-2 px-2">Suggestions</p>
                          {locationLoading && (
                            <div className="flex items-center gap-2 px-3 py-2.5 text-gray-400 text-sm">
                              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Searching...
                            </div>
                          )}
                          {!locationLoading && locationSuggestions.length === 0 && (
                            <p className="text-sm text-gray-400 px-3 py-2.5">No results found</p>
                          )}
                          {!locationLoading && locationSuggestions.map((suggestion) => (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => selectLocation(suggestion)}
                              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-left"
                            >
                              <MapPin size={14} className="text-[#FFB800] flex-shrink-0" />
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
                              <MapPin size={14} className="text-[#FFB800] flex-shrink-0" />
                              <span className="text-gray-700">{city}</span>
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Quick City Tags */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="mt-4 flex flex-wrap items-center gap-2 justify-center"
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
      <section className="bg-white dark:bg-gray-800 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Deliveroo-style section header */}
          <div className="flex items-center justify-between mb-6 px-4 sm:px-0">
            <h2 className="text-2xl font-black text-[#1A1A1A]">Featured Stores</h2>
            <Link to="/stores" className="text-[#1B4D3E] text-sm font-semibold hover:underline">See all →</Link>
          </div>

          {/* Glovo-style category pills */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 mb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === cat.id
                    ? 'border-[#1B4D3E] text-[#1B4D3E] bg-[#FDF8F0]'
                    : 'bg-white border-gray-200 hover:border-[#1B4D3E] hover:text-[#1B4D3E]'
                }`}
              >
                <cat.Icon size={16} />
                {cat.label}
              </button>
            ))}
          </div>

          {/* Meet Our Partners */}
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Meet Our Founding Partners</h3>
            <div className="w-16 h-1 bg-[#FFB800] mx-auto my-2 rounded-full" />
            <p className="text-gray-500 text-sm mb-8">The people behind Afrimercato</p>

            {/* Founding partner profiles */}
            <div className="flex items-center justify-center gap-6 sm:gap-12 mb-8 flex-wrap">
              {[
                {
                  id: 'stores',
                  name: 'Efezino',
                  role: 'Founder & CEO',
                  img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=80',
                },
                {
                  id: 'pickers',
                  name: 'Chukwudi Obi',
                  role: 'Co-Founder, Operations',
                  img: 'https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=300&q=80',
                },
                {
                  id: 'riders',
                  name: 'Emeka Adeyemi',
                  role: 'Co-Founder, Technology',
                  img: 'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=300&q=80',
                },
              ].map((partner) => (
                <button
                  key={partner.id}
                  type="button"
                  onClick={() => setActivePartnerTab(partner.id)}
                  className="flex flex-col items-center gap-3 group"
                >
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 shadow-lg transition-all duration-300 group-hover:shadow-2xl group-hover:scale-110 ${
                    activePartnerTab === partner.id
                      ? 'border-[#FFB800] scale-105 shadow-xl'
                      : 'border-white'
                  }`}>
                    <img
                      src={partner.img}
                      alt={partner.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&q=80'
                        e.target.onerror = null
                      }}
                    />
                  </div>
                  <div className="text-center">
                    <p className={`font-bold text-sm ${activePartnerTab === partner.id ? 'text-[#1B4D3E]' : 'text-gray-800'}`}>
                      {partner.name}
                    </p>
                    <p className="text-xs text-gray-500">{partner.role}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Section separator before community role tabs */}
            <div className="w-full my-10 border-t border-gray-100" />
            <h3 className="text-center text-2xl font-bold text-[#1A1A1A] mb-3">
              Join Our Growing Community
            </h3>
            <div className="w-16 h-1 bg-[#FFB800] mx-auto my-2 rounded-full" />
            <p className="text-center text-gray-500 mb-10">
              Choose your role and start your journey
            </p>

            {/* Role tabs: Stores | Pickers | Riders | Vendors */}
            <div className="grid grid-cols-4 gap-4 sm:gap-8 mb-8 max-w-sm sm:max-w-md mx-auto">
              {[
                { id: 'stores',  label: 'Stores',  Icon: Store,          gradient: 'from-[#1B4D3E] to-[#2D6A4F]',               shadow: 'shadow-green-300' },
                { id: 'pickers', label: 'Pickers', Icon: ShoppingBasket, gradient: 'from-[#E53E3E] to-[#C53030]',               shadow: 'shadow-red-300' },
                { id: 'riders',  label: 'Riders',  Icon: Zap,            gradient: 'from-[#FFB800] to-[#FF8C00]',               shadow: 'shadow-amber-300' },
                { id: 'vendors', label: 'Vendors', Icon: Briefcase,      gradient: 'from-[#991B1B] via-[#DC2626] to-[#F87171]', shadow: 'shadow-red-300' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePartnerTab(tab.id)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${tab.gradient} flex items-center justify-center shadow-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl ${
                    activePartnerTab === tab.id ? `ring-4 ring-[#FFB800] ring-offset-2 scale-110 shadow-xl ${tab.shadow}` : ''
                  }`}>
                    <tab.Icon size={28} color="white" strokeWidth={1.8} />
                  </div>
                  <span className={`font-semibold text-sm transition-colors leading-tight ${activePartnerTab === tab.id ? 'text-[#1A1A1A]' : 'text-gray-500'}`}>
                    {tab.label}
                  </span>
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
                        ? 'text-[#1B4D3E] border-b-2 border-[#1B4D3E]'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
                <Link
                  to="/partner"
                  className="flex items-center gap-2 px-4 py-2 border border-[#1B4D3E] text-[#1B4D3E] rounded-full font-medium text-sm hover:bg-[#1B4D3E] hover:text-white transition-all duration-200"
                >
                  + Onboard your store
                </Link>
              </div>
            )}

            <div className="text-right mb-4">
              <Link to="/stores" className="text-[#1B4D3E] font-medium hover:underline">
                See All Stores →
              </Link>
            </div>
          </div>

          {/* Content based on active tab */}
          {activePartnerTab === 'stores' ? (
            <>
              {storesLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-gray-100 rounded-2xl animate-pulse h-80" />
                  ))}
                </div>
              ) : filteredStores.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredStores.map((store, index) => (
                    <StoreCard key={store._id || store.id} store={store} index={index} navigate={navigate} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Store size={28} className="text-gray-400" />
                  </div>
                  <p className="text-lg font-semibold text-gray-700 mb-1">No stores available yet</p>
                  <p className="text-sm">Check back soon — we&apos;re onboarding new vendors!</p>
                </div>
              )}
            </>
          ) : (
            <PartnerCTA type={activePartnerTab} />
          )}

          {/* Deliveroo-style promo banner */}
          <div className="bg-gradient-to-r from-[#FFB800] to-[#FF8C00] rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between overflow-hidden relative mt-10">
            <div className="relative z-10">
              <p className="text-xs font-bold text-[#1B4D3E] uppercase tracking-widest">Limited time</p>
              <h3 className="text-3xl font-black text-[#1B4D3E] mt-1">Free delivery on first order</h3>
              <Link
                to="/register?role=customer"
                className="mt-4 inline-block bg-[#1B4D3E] text-white rounded-full px-6 py-2.5 font-bold text-sm hover:bg-[#0D2B22] transition-all"
              >
                Order Now
              </Link>
            </div>
            <PhCart size={80} weight="fill" className="text-[#1B4D3E] opacity-20 mt-6 sm:mt-0 flex-shrink-0" />
          </div>

          {/* View All */}
          <div className="text-center mt-10">
            <Link
              to="/stores"
              className="inline-flex items-center gap-2 bg-[#1B4D3E] hover:bg-[#0D2B22] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold shadow-lg transition-all duration-200 text-base sm:text-lg"
            >
              View All Stores
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          WHY AFRIMERCATO EXISTS
          ============================================ */}
      <section className="py-16 sm:py-20 bg-[#FDF8F0] dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-lg text-center border-l-4 border-[#FFB800]"
          >
            <Globe size={32} className="text-[#1B4D3E] mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-black text-center text-gray-900 mb-3">
              Born from an African Story
            </h2>
            <div className="w-16 h-1 bg-[#FFB800] mx-auto my-2 rounded-full mb-4" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 text-center leading-relaxed space-y-4"
            >
              <p>
                Afrimercato was born from a simple but powerful observation. A Nigerian living abroad
                noticed how difficult it was for people outside Africa to reliably access authentic African goods.
              </p>
              <p>
                Local stores struggled with visibility. Customers struggled with trust and convenience.
                Delivery systems were fragmented, expensive, or unfair. Yet the demand was clear.
                And the businesses were ready. They just lacked the right digital bridge.
              </p>
              <p className="text-[#1B4D3E] font-semibold text-xl">Afrimercato is that bridge.</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.3 }}
              className="mt-8"
            >
              <Link to="/about" className="inline-flex items-center gap-2 text-[#1B4D3E] font-semibold hover:underline">
                Read our full story
                <ArrowRight size={16} />
              </Link>
            </motion.div>
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
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white text-center mb-4"
          >
            Who It's For
          </motion.h2>
          <div className="w-16 h-1 bg-[#FFB800] mx-auto my-2 rounded-full mb-10" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { Icon: Store, title: 'Stores', message: 'You control your business, your delivery, your costs.', gradient: 'from-[#1B4D3E] to-[#2D6A4F]', link: '/register?role=vendor' },
              { Icon: Bike, title: 'Riders & Pickers', message: 'Work independently. Choose your stores. Pay only when you earn.', gradient: 'from-[#FFB800] to-[#FF8C00]', link: '/register?role=rider' },
              { Icon: ShoppingBag, title: 'Customers', message: 'Discover authentic African goods from trusted local stores, delivered to your door.', gradient: 'from-[#1B4D3E] to-[#0D2B22]', link: '/register?role=customer' }
            ].map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: 0.15 + index * 0.15 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden p-6 sm:p-8 flex flex-col items-center text-center"
              >
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-6`}>
                  <card.Icon size={32} color="white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{card.message}</p>
                <Link to={card.link} className="text-[#1B4D3E] text-sm font-semibold hover:underline flex items-center gap-1 mt-auto">
                  Learn more <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          VISION & MISSION
          ============================================ */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-gradient-to-br from-[#1B4D3E] to-[#0D2B22]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border-l-4 border-[#FFB800]"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[#FFB800] mb-3">Our Vision</p>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">The Digital Home for African Commerce</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the digital home where African and local businesses thrive, connecting stores, customers, and communities worldwide.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border-l-4 border-[#FFB800]"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-[#FFB800] mb-3">Our Mission</p>
              <h3 className="text-xl font-bold text-[#1A1A1A] mb-4">Empowering Every Merchant</h3>
              <p className="text-gray-600 leading-relaxed">
                Afrimercato empowers local and international merchants to sell, fulfil, and grow through a fair, flexible, and trusted marketplace.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================
          WAITLIST
          ============================================ */}
      <section className="py-8 px-4 bg-[#0a2e2a]">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="bg-[#FFB800] rounded-3xl p-6 sm:p-10 md:p-12 text-center"
          >
            <span className="inline-block bg-[#1B4D3E]/20 text-[#1B4D3E] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
              Coming Soon
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] leading-tight mb-3">
              Be the first to know when we go live
            </h2>
            <p className="text-[#1B4D3E] font-medium mb-8">
              Join shoppers and vendors waiting for Afrimercato to launch across the UK.
            </p>

            {waitlistStatus === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-16 h-16 rounded-full bg-[#1B4D3E]/20 flex items-center justify-center mb-2">
                  <svg className="w-8 h-8 text-[#1B4D3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[#1A1A1A] font-semibold text-lg">{waitlistMessage}</p>
                <p className="text-[#1B4D3E]/70 text-sm">Keep an eye on your inbox.</p>
              </motion.div>
            ) : (
              <form
                onSubmit={handleWaitlistSubmit}
                className="max-w-lg mx-auto"
              >
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 sm:bg-white sm:rounded-full sm:p-2 sm:shadow-xl">
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => { setWaitlistEmail(e.target.value); setWaitlistStatus(''); setWaitlistMessage('') }}
                    placeholder="Enter your email address"
                    className="flex-1 bg-white sm:bg-transparent rounded-full sm:rounded-none px-5 py-4 sm:px-4 sm:py-2 border-none outline-none text-gray-900 placeholder-gray-400 text-sm shadow-lg sm:shadow-none"
                  />
                  <button
                    type="submit"
                    disabled={waitlistStatus === 'loading'}
                    className="flex-shrink-0 w-full sm:w-auto bg-[#1B4D3E] hover:bg-[#0D2B22] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-full transition-all whitespace-nowrap text-sm"
                  >
                    {waitlistStatus === 'loading' ? 'Joining...' : 'Join Waitlist'}
                  </button>
                </div>
              </form>
            )}

            {waitlistStatus === 'duplicate' && (
              <p className="mt-3 text-[#1B4D3E] text-sm">{waitlistMessage}</p>
            )}

            {waitlistStatus === 'error' && (
              <p className="mt-3 text-red-700 text-sm">{waitlistMessage}</p>
            )}

            <p className="mt-6 text-[#1B4D3E]/80 text-sm font-medium">
              We are currently in a guided testing phase to ensure speed, reliability, and strong foundations before scaling to new regions.
            </p>
            <p className="mt-3 text-[#1B4D3E]/60 text-xs">No spam. We'll only email you when we launch.</p>
          </motion.div>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer id="contact" className="bg-[#1a1a1a] text-white py-12 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-4">You've Got Questions?<br />Do Reach Out!</h3>
              <p className="text-gray-400 text-sm mb-4">
                A fair, flexible marketplace connecting African stores, customers, and communities worldwide.
              </p>
              <div className="space-y-3 text-gray-400">
                <p className="flex items-center gap-2"><Phone size={16} className="text-[#FFB800] flex-shrink-0" /> +44 7778 285855</p>
                <p className="flex items-center gap-2"><Mail size={16} className="text-[#FFB800] flex-shrink-0" /> info@afrimercato.co.uk</p>
                <p className="flex items-center gap-2"><MapPin size={16} className="text-[#FFB800] flex-shrink-0" /> Bristol, United Kingdom</p>
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
            <p>Designed by Arbythecoder</p>
            <p>All Rights Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Sticky bottom CTA bar — fixed while scrolling */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#1B4D3E] shadow-lg px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Store size={20} className="text-[#FFB800]" />
            <span className="text-white text-sm font-medium hidden sm:block">Grow your business with Afrimercato</span>
          </div>
          <Link
            to="/register?role=vendor"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#FFB800] hover:bg-[#FF8C00] text-[#1A1A1A] px-5 py-2.5 rounded-full font-bold text-sm shadow-md transition-all duration-200"
          >
            <Store size={14} />
            Partner With Us
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
// STORE CARD COMPONENT — Glovo style
// ============================================
function StoreCard({ store, index, navigate }) {
  const storeImage = store.image || store.logo || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&q=80'
  const storeName = store.storeName || store.name || 'African Store'
  const storeCity = store.location?.city || (typeof store.location === 'string' ? store.location.split(',')[0] : 'UK')
  const rating = store.rating || store.averageRating || 4.5
  const isOpen = store.isOpen !== undefined ? store.isOpen : store.isActive !== false

  const handleClick = () => {
    if (store.slug) navigate(`/store/${store.slug}`)
    else if (store._id) navigate(`/store/${store._id}`)
    else navigate('/stores')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay: 0.1 + index * 0.12 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onClick={handleClick}
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 relative"
    >
      {/* Image */}
      <div className="h-48 overflow-hidden rounded-t-2xl relative">
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
        {/* Discount / closed badge — top-left */}
        {store._isSample && isOpen && (
          <div className="absolute top-3 left-3 bg-[#E53E3E] text-white text-xs font-bold px-2 py-1 rounded-md">
            20% OFF
          </div>
        )}
        {!isOpen && (
          <div className="absolute top-3 left-3 bg-gray-700/80 text-white text-xs font-bold px-2 py-1 rounded-md">
            Closed
          </div>
        )}
        {/* Rating badge — top-right */}
        <div className="absolute top-3 right-3 bg-white text-[#1A1A1A] text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
          <PhStar size={10} weight="fill" color="#FFB800" />
          {rating}
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-bold text-base text-[#1A1A1A] line-clamp-1">{storeName}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Clock size={12} /> 20-30 min
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {storeCity}
          </span>
          <span className="flex items-center gap-1">
            <Tag size={12} /> Free delivery
          </span>
        </div>
        <div className="mt-2 inline-block text-xs bg-amber-50 text-[#1B4D3E] px-2 py-0.5 rounded-full font-medium">
          {store.category || 'African Store'}
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
      Icon: ShoppingBasket,
      gradient: 'from-[#E53E3E] to-[#C53030]',
      title: 'Become a Picker',
      desc: 'Help fulfil orders in local African stores near you. Flexible hours, fair pay, and a growing network of stores to work with.',
      link: '/register?role=picker',
      cta: 'Sign Up as Picker'
    },
    riders: {
      Icon: Zap,
      gradient: 'from-[#FFB800] to-[#FF8C00]',
      title: 'Become a Rider',
      desc: 'Deliver authentic African groceries to customers in your city. Set your own hours and earn on every delivery.',
      link: '/register?role=rider',
      cta: 'Sign Up as Rider'
    },
    vendors: {
      Icon: Briefcase,
      gradient: 'from-[#991B1B] via-[#DC2626] to-[#F87171]',
      title: 'Become a Vendor',
      desc: 'Open your African store online. No staff needed. Reach thousands of customers across the UK with zero upfront cost.',
      link: '/register?role=vendor',
      cta: 'Sign Up as Vendor'
    }
  }
  const c = config[type]
  if (!c) return null
  return (
    <div className="flex flex-col items-center justify-center py-10 sm:py-16 text-center px-4">
      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center mb-5 shadow-lg`}>
        <c.Icon size={32} color="white" />
      </div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{c.title}</h3>
      <p className="text-gray-600 max-w-sm sm:max-w-md mb-8 text-sm sm:text-base">{c.desc}</p>
      <Link
        to={c.link}
        className="inline-flex items-center gap-2 bg-[#1B4D3E] hover:bg-[#0D2B22] text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold shadow-lg transition-all duration-200 text-base sm:text-lg"
      >
        {c.cta}
        <ArrowRight size={18} />
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
        active ? 'bg-[#1B4D3E] text-white' : 'text-gray-800 hover:bg-white/50'
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
      className="block py-4 px-4 text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-100"
    >
      {children}
    </Link>
  )
}
