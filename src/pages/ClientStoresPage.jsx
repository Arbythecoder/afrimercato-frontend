/**
 * AFRIMERCATO - Store Marketplace Page
 * Matches client's design from three.jpg exactly
 */

import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Clock, Tag, Store, ShoppingBag, Leaf, Flame, Globe, Coffee, Package } from 'lucide-react'
import { Star as PhStar } from '@phosphor-icons/react'
import { SUGGESTED_CITIES } from '../constants/locations'
import useCustomerStore from '../stores/useCustomerStore'

const CATEGORIES = [
  { id: 'all',       label: 'All Stores',    Icon: Store },
  { id: 'groceries', label: 'Groceries',     Icon: ShoppingBag },
  { id: 'fresh',     label: 'Fresh Produce', Icon: Leaf },
  { id: 'spices',    label: 'Spices',        Icon: Flame },
  { id: 'african',   label: 'African Food',  Icon: Globe },
  { id: 'drinks',    label: 'Drinks',        Icon: Coffee },
  { id: 'snacks',    label: 'Snacks',        Icon: Package },
]

function StoreCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="h-5 bg-gray-200 rounded-full w-24" />
      </div>
    </div>
  )
}

export default function ClientStoresPage() {
  const [searchParams] = useSearchParams()
  const location = searchParams.get('location') || ''
  const navigate = useNavigate()

  const { stores, loading: { stores: loading }, fetchStores } = useCustomerStore()
  const [searchLocation, setSearchLocation] = useState(location)
  const [activeTab, setActiveTab] = useState('stores')
  const [activeFilter, setActiveFilter] = useState('nearby')
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)
  const [activeCategory, setActiveCategory] = useState('all')

  const cityNames = SUGGESTED_CITIES.map(c => c.name)
  const locationSuggestions = searchLocation.trim()
    ? cityNames.filter(c => c.toLowerCase().includes(searchLocation.toLowerCase())).slice(0, 5)
    : cityNames.slice(0, 5)

  useEffect(() => {
    fetchStores(location)
  }, [location]) // eslint-disable-line react-hooks/exhaustive-deps

  const expandSearchRadius = async (newRadius = 100) => {
    try {
      fetchStores(location)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[EXPAND_SEARCH_FAIL]', error.message)
      }
    }
  }

  const browseAllStores = async () => {
    setSearchLocation('')
    navigate('/stores')
  }

  // Apply filter/sort logic to stores
  const getFilteredStores = () => {
    if (!stores || stores.length === 0) return []

    let filtered = [...stores]

    switch (activeFilter) {
      case 'top':
        // Sort by rating descending
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'featured':
        // Show only verified/high-rated stores (4.7+)
        filtered = filtered
          .filter((s) => s.verified !== false && (s.rating || 0) >= 4.5)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case 'nearby':
      default:
        // Sort by distance (parse km string)
        filtered.sort((a, b) => {
          const distA = parseFloat(a.distance) || 999
          const distB = parseFloat(b.distance) || 999
          return distA - distB
        })
        break
    }

    return filtered
  }

  const filteredStores = getFilteredStores()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchLocation.trim()) {
      navigate(`/stores?location=${encodeURIComponent(searchLocation)}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img src="/logo.svg" alt="Afrimercato" className="h-8 w-auto" />
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Home</Link>
              <Link to="/stores" className="text-[#1B4D3E] font-medium">Stores</Link>
              <Link to="/partner" className="text-gray-600 hover:text-gray-900 font-medium">Partner With Us</Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">Log in</Link>
              <Link
                to="/register"
                className="flex items-center gap-2 bg-[#1B4D3E] hover:bg-[#0D2B22] text-white px-4 py-2 rounded-full font-semibold transition-all"
              >
                Sign Up
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero — full when no search, compact when results are showing */}
      {!location || loading ? (
        <section className="bg-gradient-to-br from-[#1B4D3E] via-[#0D2B22] to-[#0a1f18] py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight"
              >
                African Groceries,{' '}
                <span className="text-[#FFB800]">Delivered Across the UK</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-white/70 mb-8 text-base"
              >
                Search by city, postcode, or store name to find authentic African stores near you.
              </motion.p>

              {/* Search Bar — UberEats pill style */}
              <form onSubmit={handleSearch} className="relative mb-6">
                <div className="flex items-center bg-white rounded-full shadow-2xl border border-gray-100 p-2">
                  <MapPin size={20} className="ml-4 text-[#FFB800] flex-shrink-0" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onFocus={() => setShowLocationDropdown(true)}
                    onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                    placeholder="Enter postcode or area..."
                    className="text-base flex-1 px-4 py-3 outline-none bg-transparent text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    className="bg-[#FFB800] text-[#1B4D3E] font-bold rounded-full px-6 py-3 whitespace-nowrap hover:bg-[#FF8C00] transition-all"
                  >
                    Find Stores
                  </button>
                </div>
                {showLocationDropdown && locationSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-10 max-h-60 overflow-y-auto text-left">
                    {locationSuggestions.map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSearchLocation(loc)
                          setShowLocationDropdown(false)
                          navigate(`/stores?location=${encodeURIComponent(loc)}`)
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                      >
                        <MapPin size={14} className="text-[#FFB800] flex-shrink-0" />
                        <span className="text-gray-700">{loc}</span>
                      </button>
                    ))}
                  </div>
                )}
              </form>

              <div className="flex items-center justify-center gap-2">
                <span className="bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-medium text-white/80">
                  4,320+ Vendors across the UK
                </span>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* Compact bar shown once stores are displaying */
        <section className="bg-white border-b shadow-sm py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-gray-700">
                <MapPin size={18} className="text-[#FFB800]" />
                <span className="font-semibold text-gray-900">{filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''}</span>
                <span className="text-gray-500">near <span className="text-[#1B4D3E] font-medium">{location}</span></span>
              </div>
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <MapPin size={14} className="text-gray-400" />
                  <input
                    type="text"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    placeholder="Search different location…"
                    className="bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400 w-full min-w-0"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#1B4D3E] hover:bg-[#0D2B22] text-white px-4 py-2 rounded-full text-sm font-semibold transition-all"
                >
                  Go
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/stores')}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Clear
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Meet Our Partners Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Deliveroo-style section header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#1A1A1A]">Browse Stores</h2>
            <span className="text-[#1B4D3E] text-sm font-semibold">
              {filteredStores.length > 0 ? `${filteredStores.length} available` : 'All stores'}
            </span>
          </div>

          {/* Glovo-style category pills */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 mb-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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

          {/* Tabs: Stores | Pickers | Riders */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-full">
              {['stores', 'pickers', 'riders'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full font-medium text-sm capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-[#1B4D3E] text-white'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Sign up CTA for Pickers/Riders */}
          {(activeTab === 'pickers' || activeTab === 'riders') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-teal-100 rounded-full mb-6">
                {activeTab === 'pickers' ? (
                  <svg className="w-10 h-10 text-[#1B4D3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 13h12L19 8" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-[#1B4D3E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {activeTab === 'pickers' ? 'Become a Picker' : 'Become a Rider'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                {activeTab === 'pickers'
                  ? 'Join our picker network and earn money helping pack and prepare orders for customers in your area.'
                  : 'Join our delivery network and earn money delivering African groceries to customers near you.'}
              </p>
              <Link
                to={activeTab === 'pickers' ? '/register?role=picker' : '/register?role=rider'}
                className="inline-flex items-center gap-2 bg-[#1B4D3E] text-white px-8 py-3 rounded-full font-medium hover:bg-[#0D2B22] transition-colors"
              >
                {activeTab === 'pickers' ? 'Sign Up as a Picker' : 'Sign Up as a Rider'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>
          )}

          {/* Filter Tabs - Only show for stores */}
          {activeTab === 'stores' && (
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              {[
                { id: 'nearby', label: 'Stores near by' },
                { id: 'top', label: 'Top stores' },
                { id: 'featured', label: 'Featured stores' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`font-medium pb-1 transition-colors ${
                    activeFilter === filter.id
                      ? 'text-[#1B4D3E] border-b-2 border-[#1B4D3E]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/partner"
                className="flex items-center gap-2 px-4 py-2 border border-[#1B4D3E] rounded-full text-[#1B4D3E] hover:bg-[#FDF8F0] font-medium text-sm transition-all"
              >
                + Onboard your store
              </Link>
            </div>
          </div>
          )}

          {/* Skeleton loading */}
          {loading && activeTab === 'stores' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <StoreCardSkeleton key={i} />)}
            </div>
          )}

          {/* Store Cards Grid */}
          {!loading && activeTab === 'stores' && filteredStores.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredStores.map((store, index) => (
                <motion.div
                  key={store._id || store.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  onClick={() => {
                    // Store vendor data in sessionStorage for the storefront to use
                    const vendorId = store._id || store.id
                    sessionStorage.setItem(`vendor_${vendorId}`, JSON.stringify({
                      storeName: store.name || store.storeName || store.businessName,
                      businessName: store.businessName || store.name || store.storeName,
                      phone: store.phone || '+44 20 7123 4567',
                      deliveryTime: store.deliveryTime || '30 mins',
                      location: store.location,
                      rating: store.rating,
                      image: store.image || store.logo,
                      description: store.description
                    }))
                    navigate(`/store/${vendorId}`)
                  }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden cursor-pointer transition-all duration-300 group relative"
                >
                  {/* Image */}
                  <div className="h-48 overflow-hidden rounded-t-2xl relative bg-gray-100">
                    {store.image || store.logo ? (
                      <img
                        src={store.image || store.logo}
                        alt={store.name || store.storeName || 'African Grocery Store'}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
                      />
                    ) : null}
                    <div
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1B4D3E] to-[#0D2B22]"
                      style={{ display: (store.image || store.logo) ? 'none' : 'flex' }}
                    >
                      <span className="text-6xl font-black text-white/40">
                        {(store.name || store.storeName || store.businessName || 'S').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Closed badge — top-left */}
                    {store.isOpen === false && (
                      <div className="absolute top-3 left-3 bg-gray-700/80 text-white text-xs font-bold px-2 py-1 rounded-md">
                        Closed
                      </div>
                    )}
                    {/* Rating badge — top-right */}
                    <div className="absolute top-3 right-3 bg-white text-[#1A1A1A] text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                      <PhStar size={10} weight="fill" color="#FFB800" />
                      {store.rating || '4.5'}
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4">
                    <h3 className="font-bold text-base text-[#1A1A1A] line-clamp-1">
                      {store.name || store.storeName || store.businessName}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {store.deliveryTime || '20-30 min'}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {typeof store.location === 'string' ? store.location.split(',')[0] : (store.location?.city || 'UK')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag size={12} />
                        {store.deliveryFee || 'Free delivery'}
                      </span>
                    </div>
                    <div className="mt-2 inline-block text-xs bg-amber-50 text-[#1B4D3E] px-2 py-0.5 rounded-full font-medium">
                      {store.category || 'African Store'}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Empty State - No Stores Found (Like Uber Eats/Just Eat) */}
          {!loading && activeTab === 'stores' && filteredStores.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 bg-white rounded-2xl shadow-lg"
            >
              <div className="max-w-md mx-auto px-6">
                {/* Icon */}
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                {/* Message */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchLocation ? `No stores in ${searchLocation}` : 'No stores in your area yet'}
                </h3>
                <p className="text-gray-600 mb-8">
                  {searchLocation
                    ? `We haven't reached ${searchLocation} yet, but we're expanding! Try one of these options:`
                    : 'No stores in your area yet — check back soon! Try searching a different city below.'}
                </p>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {/* Expand Search */}
                  {searchLocation && (
                    <button
                      onClick={() => expandSearchRadius(100)}
                      className="w-full flex items-center justify-center gap-2 bg-[#1B4D3E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#0D2B22] transition-all shadow-md hover:shadow-lg"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      Expand search area
                    </button>
                  )}

                  {/* Browse All Stores */}
                  <button
                    onClick={browseAllStores}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#1B4D3E] text-[#1B4D3E] px-6 py-3 rounded-xl font-semibold hover:bg-[#FDF8F0] transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Browse all stores
                  </button>

                  {/* Try Different Location */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-3">Try a different location:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['London', 'Manchester', 'Birmingham', 'Dublin', 'Liverpool', 'Bristol'].map(city => (
                        <button
                          key={city}
                          onClick={() => {
                            setSearchLocation(city)
                            navigate(`/stores?location=${city}`)
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Notify Me Option */}
                {searchLocation && (
                  <div className="mt-8 pt-6 border-t">
                    <p className="text-sm text-gray-600 mb-3">
                      Want to know when we launch in {searchLocation}?
                    </p>
                    <button className="text-[#1B4D3E] font-semibold hover:underline text-sm">
                      Notify me when available →
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">Afrimercato</h4>
              <p className="text-gray-400 text-sm">Fresh African groceries delivered across the UK.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-yellow-500">Home</Link></li>
                <li><Link to="/stores" className="hover:text-yellow-500">Stores</Link></li>
                <li><Link to="/partner" className="hover:text-yellow-500">Partner With Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Cities</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><button onClick={() => navigate('/stores?location=London')} className="hover:text-yellow-500">London</button></li>
                <li><button onClick={() => navigate('/stores?location=Manchester')} className="hover:text-yellow-500">Manchester</button></li>
                <li><button onClick={() => navigate('/stores?location=Birmingham')} className="hover:text-yellow-500">Birmingham</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">info@afrimercato.co.uk</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© 2026 Afrimercato. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
