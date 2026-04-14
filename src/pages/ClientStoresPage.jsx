/**
 * AFRIMERCATO - Store Marketplace Page
 * Matches client's design from three.jpg exactly
 */

import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SUGGESTED_CITIES } from '../constants/locations'
import useCustomerStore from '../stores/useCustomerStore'

function StoreCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse">
      <div className="w-full aspect-video bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
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
              <Link to="/stores" className="text-[#00897B] font-medium">Stores</Link>
              <Link to="/partner" className="text-gray-600 hover:text-gray-900 font-medium">Partner With Us</Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium">Log in</Link>
              <Link
                to="/register"
                className="flex items-center gap-2 bg-[#00897B] hover:bg-[#00695C] text-white px-4 py-2 rounded-full font-semibold transition-all"
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
        <section className="bg-gradient-to-br from-[#00897B] via-[#00695C] to-[#004D40] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl sm:text-4xl font-bold text-white mb-3"
                >
                  African Groceries,<br />
                  <span className="text-[#F5A623]">Delivered Across the UK</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-green-100 mb-6"
                >
                  Search by city, postcode, or store name to find authentic African stores near you.
                </motion.p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                  <div className="flex-1 relative">
                    <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-3 shadow-md">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                      <input
                        type="text"
                        value={searchLocation}
                        onChange={(e) => setSearchLocation(e.target.value)}
                        onFocus={() => setShowLocationDropdown(true)}
                        onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                        placeholder="City, postcode, or store name…"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400"
                      />
                    </div>
                    {showLocationDropdown && locationSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
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
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                            <span className="text-gray-700">{loc}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="bg-[#F5A623] hover:bg-[#E59400] text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all"
                  >
                    Search
                  </button>
                </form>

                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {['👩🏾', '👨🏿', '👩🏽'].map((e, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-sm">{e}</div>
                    ))}
                  </div>
                  <span className="bg-white/20 border border-white/30 px-3 py-1 rounded-full text-sm font-medium text-white">
                    4,320+ Vendors across the UK
                  </span>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="relative bg-gradient-to-br from-afri-green-dark to-afri-green rounded-2xl p-4 overflow-hidden shadow-2xl">
                  <div className="w-full h-64 rounded-xl flex items-center justify-center">
                    <div className="text-center text-white/90">
                      <div className="text-7xl mb-3">🛒</div>
                      <p className="font-bold text-lg">African Groceries</p>
                      <p className="text-sm text-white/70">Delivered to your door</p>
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 bg-white rounded-xl px-4 py-2 shadow-lg">
                    <p className="text-xs text-gray-500">Avg. Delivery Time</p>
                    <p className="font-bold text-[#00897B]">ADT 25–40 mins</p>
                  </div>
                </div>
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
                <svg className="w-5 h-5 text-[#00897B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span className="font-semibold text-gray-900">{filteredStores.length} store{filteredStores.length !== 1 ? 's' : ''}</span>
                <span className="text-gray-500">near <span className="text-[#00897B] font-medium">{location}</span></span>
              </div>
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
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
                  className="bg-[#00897B] hover:bg-[#00695C] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all"
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
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Meet Our <span className="text-[#F5A623]">Partners</span>
          </h2>

          {/* Tabs: Stores | Pickers | Riders */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-full">
              {['stores', 'pickers', 'riders'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full font-medium text-sm capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-[#00897B] text-white'
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
                  <svg className="w-10 h-10 text-[#00897B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 13h12L19 8" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-[#00897B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                className="inline-flex items-center gap-2 bg-[#00897B] text-white px-8 py-3 rounded-full font-medium hover:bg-[#00695C] transition-colors"
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
                      ? 'text-[#00897B] border-b-2 border-[#00897B]'
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
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                Onboard your store
              </Link>
              <span className="text-[#00897B] font-medium">See All Stores</span>
            </div>
          </div>
          )}

          {/* Skeleton loading */}
          {loading && activeTab === 'stores' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <StoreCardSkeleton key={i} />)}
            </div>
          )}

          {/* Store Cards Grid */}
          {!loading && activeTab === 'stores' && filteredStores.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store, index) => (
                <motion.div
                  key={store._id || store.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
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
                  className="bg-white rounded-2xl overflow-hidden transition-all duration-200 border border-gray-100 hover:border-gray-200 hover:shadow-xl cursor-pointer group"
                >
                  {/* Store Image */}
                  <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
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
                      className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00897B] to-[#004D40]"
                      style={{ display: (store.image || store.logo) ? 'none' : 'flex' }}
                    >
                      <span className="text-6xl font-black text-white/60">
                        {(store.name || store.storeName || store.businessName || 'S').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Open / Closed badge */}
                    <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold shadow ${
                      store.isOpen !== false ? 'bg-green-500 text-white' : 'bg-gray-700/80 text-white'
                    }`}>
                      {store.isOpen !== false ? 'Open' : 'Closed'}
                    </div>
                  </div>

                  {/* Store Info */}
                  <div className="p-4">
                    {/* Name row */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-1">
                        {store.name || store.storeName || store.businessName}
                      </h3>
                      {store.verified !== false && (
                        <svg className="w-4 h-4 text-[#00897B] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>

                    {/* Category / location subtitle */}
                    <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                      {store.category || store.location || 'African Groceries'}
                    </p>

                    {/* Key info row: rating • time • fee */}
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <span className="font-semibold text-gray-800">{store.rating || '4.5'}</span>
                      <span className="text-gray-300">·</span>
                      <span>{store.deliveryTime || '30 min'}</span>
                      <span className="text-gray-300">·</span>
                      <span>{store.deliveryFee ? `${store.deliveryFee} delivery` : 'Free delivery'}</span>
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
                      className="w-full flex items-center justify-center gap-2 bg-[#00897B] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#00695C] transition-all shadow-md hover:shadow-lg"
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
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#00897B] text-[#00897B] px-6 py-3 rounded-xl font-semibold hover:bg-[#E0F2F1] transition-all"
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
                    <button className="text-[#00897B] font-semibold hover:underline text-sm">
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
            <p>© 2024 Afrimercato. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
