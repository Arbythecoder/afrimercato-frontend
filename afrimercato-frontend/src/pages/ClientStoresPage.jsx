/**
 * AFRIMERCATO - Store Marketplace Page
 * Matches client's design from three.jpg exactly
 */

import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { searchVendorsByLocation } from '../services/api'

export default function ClientStoresPage() {
  const [searchParams] = useSearchParams()
  const location = searchParams.get('location') || ''
  const navigate = useNavigate()

  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLocation, setSearchLocation] = useState(location)
  const [activeTab, setActiveTab] = useState('stores')
  const [activeFilter, setActiveFilter] = useState('nearby')
  const [showLocationDropdown, setShowLocationDropdown] = useState(false)

  useEffect(() => {
    fetchStores()
  }, [location])

  const fetchStores = async () => {
    try {
      setLoading(true)
      const response = await searchVendorsByLocation(location, 50)

      if (response.success && response.data?.vendors && response.data.vendors.length > 0) {
        setStores(response.data.vendors)
      } else {
        // No real stores found — show demo stores filtered by search location
        setStores(getSampleStores(location))
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[STORE_SEARCH_FAIL]', location, error.message)
      }
      // API failed — show demo stores so customers always see content
      setStores(getSampleStores(location))
    } finally {
      setLoading(false)
    }
  }

  const expandSearchRadius = async (newRadius = 100) => {
    try {
      setLoading(true)
      const response = await searchVendorsByLocation(location, newRadius)

      if (response.success && response.data?.vendors && response.data.vendors.length > 0) {
        setStores(response.data.vendors)
      } else {
        setStores(getSampleStores(location))
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[EXPAND_SEARCH_FAIL]', error.message)
      }
      setStores(getSampleStores(location))
    } finally {
      setLoading(false)
    }
  }

  const browseAllStores = async () => {
    try {
      setLoading(true)
      const response = await searchVendorsByLocation('', 500)

      if (response.success && response.data?.vendors && response.data.vendors.length > 0) {
        setStores(response.data.vendors)
        setSearchLocation('')
      } else {
        setStores(getSampleStores(''))
        setSearchLocation('')
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('[BROWSE_ALL_FAIL]', error.message)
      }
      setStores(getSampleStores(''))
      setSearchLocation('')
    } finally {
      setLoading(false)
    }
  }

  const getSampleStores = (searchLocation) => {
    // Sample stores with unique string IDs for demo purposes
    // These will be replaced by real vendor data from the API
    const allStores = [
      {
        _id: "sample-joshs-african-supermarket",
        name: "Josh's African Supermarket",
        image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600",
        hours: "07:00am - 10:00pm",
        location: "London United Kingdom",
        distance: "0.3km",
        deliveryTime: "25 mins",
        priceRange: "£5-£200",
        rating: 4.9,
        isOpen: true,
        deliveryFee: "Free over £50",
        miles: "0.5 miles",
        methods: ["Delivery", "Pickup", "In-Store"],
        verified: true,
        description: "Authentic Nigerian, Ghanaian & Caribbean groceries. Fresh yams, plantain, palm oil & more."
      },
      {
        _id: "sample-mama-africa-foods",
        name: "Mama Africa Foods",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
        hours: "08:00am - 09:00pm",
        location: "Manchester United Kingdom",
        distance: "1.2km",
        deliveryTime: "30 mins",
        priceRange: "£3-£150",
        rating: 4.8,
        isOpen: true,
        deliveryFee: "£3.99",
        miles: "1.8 miles",
        methods: ["Delivery", "Pickup"],
        verified: true,
        description: "Traditional African spices, seasonings, and fresh produce from trusted suppliers."
      },
      {
        _id: "sample-lagos-provisions",
        name: "Lagos Provisions",
        image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600",
        hours: "06:00am - 11:00pm",
        location: "Birmingham United Kingdom",
        distance: "0.8km",
        deliveryTime: "20 mins",
        priceRange: "£2-£100",
        rating: 4.7,
        isOpen: true,
        deliveryFee: "£2.99",
        miles: "1.2 miles",
        methods: ["Delivery", "Pickup", "In-Store"],
        verified: true,
        description: "Fresh Nigerian ingredients, frozen fish, stockfish, and authentic seasonings."
      },
      {
        _id: "sample-accra-spice-house",
        name: "Accra Spice House",
        image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600",
        hours: "09:00am - 08:00pm",
        location: "Leeds United Kingdom",
        distance: "2.1km",
        deliveryTime: "35 mins",
        priceRange: "£5-£180",
        rating: 4.6,
        isOpen: true,
        deliveryFee: "£4.50",
        miles: "3.2 miles",
        methods: ["Delivery", "Pickup"],
        verified: true,
        description: "Ghanaian specialty foods, kenkey, banku flour, shito, and palm soup base."
      },
      {
        _id: "sample-ethiopian-delights",
        name: "Ethiopian Delights",
        image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600",
        hours: "10:00am - 09:00pm",
        location: "Bristol United Kingdom",
        distance: "1.5km",
        deliveryTime: "40 mins",
        priceRange: "£8-£120",
        rating: 4.5,
        isOpen: true,
        deliveryFee: "£3.50",
        miles: "2.3 miles",
        methods: ["Delivery", "In-Store"],
        verified: true,
        description: "Authentic Ethiopian & Eritrean foods. Injera, berbere spice, teff flour."
      },
      {
        _id: "sample-caribbean-african-mart",
        name: "Caribbean & African Mart",
        image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600",
        hours: "07:00am - 10:00pm",
        location: "Leicester United Kingdom",
        distance: "0.6km",
        deliveryTime: "25 mins",
        priceRange: "£4-£200",
        rating: 4.8,
        isOpen: true,
        deliveryFee: "Free over £40",
        miles: "0.9 miles",
        methods: ["Delivery", "Pickup", "In-Store"],
        verified: true,
        description: "Best of Caribbean & African cuisine. Jerk seasoning, ackee, callaloo & more."
      },
      {
        _id: "sample-naija-fresh-market",
        name: "Naija Fresh Market",
        image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600",
        hours: "06:00am - 10:00pm",
        location: "Liverpool United Kingdom",
        distance: "1.0km",
        deliveryTime: "30 mins",
        priceRange: "£3-£150",
        rating: 4.7,
        isOpen: true,
        deliveryFee: "£2.99",
        miles: "1.5 miles",
        methods: ["Delivery", "Pickup"],
        verified: true,
        description: "Fresh egusi, ogbono, crayfish, dried fish, and Nigerian cooking essentials."
      },
      {
        _id: "sample-taste-of-kenya",
        name: "Taste of Kenya",
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600",
        hours: "08:00am - 09:00pm",
        location: "Sheffield United Kingdom",
        distance: "1.8km",
        deliveryTime: "35 mins",
        priceRange: "£5-£100",
        rating: 4.4,
        isOpen: true,
        deliveryFee: "£3.99",
        miles: "2.7 miles",
        methods: ["Delivery", "In-Store"],
        verified: true,
        description: "Kenyan & East African groceries. Ugali flour, sukuma wiki, nyama choma spices."
      }
    ]

    if (searchLocation) {
      const filtered = allStores.filter(store =>
        store.location.toLowerCase().includes(searchLocation.toLowerCase())
      )
      return filtered.length > 0 ? filtered : allStores
    }
    return allStores
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
            <Link to="/" className="flex items-center gap-2">
              <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                <path d="M8 8L32 32M32 8L8 32" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <span className="text-xl font-bold text-gray-900">Afrimercato</span>
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

      {/* Hero Section */}
      <section className="bg-white py-10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
              >
                African Online Store<br />In the United Kingdom
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-gray-600 mb-6"
              >
                Use existing infrastructure of African products delivered to your doorstep.
                Open stores, no staff needed, deliver to you however convenient.
              </motion.p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <div className="flex-1 relative">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      onFocus={() => setShowLocationDropdown(true)}
                      onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
                      placeholder="Postcode, store name, location"
                      className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-[#00897B] hover:bg-[#00695C] text-white px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Find Store
                </button>
              </form>

              {/* Trust Badge */}
              <div className="flex items-center gap-3">
                <span className="text-gray-600 text-sm">Trusted by</span>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-sm">
                      {['👩🏾', '👨🏿', '👩🏽'][i-1]}
                    </div>
                  ))}
                </div>
                <span className="bg-white border border-gray-200 px-3 py-1 rounded-full text-sm font-medium text-gray-700">
                  4,320+ Vendors
                </span>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block">
              <div className="relative bg-[#F5A623] rounded-2xl p-6 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600"
                  alt="Fresh produce"
                  className="w-full h-64 object-cover rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Partners Section */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Meet Our Partners</h2>

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
                  {(tab === 'pickers' || tab === 'riders') && (
                    <span className="ml-1.5 text-xs opacity-75">(Soon)</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Coming Soon for Pickers/Riders */}
          {(activeTab === 'pickers' || activeTab === 'riders') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-6">
                <svg className="w-10 h-10 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {activeTab === 'pickers' ? 'Pickers Directory Coming Soon!' : 'Riders Directory Coming Soon!'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                {activeTab === 'pickers' 
                  ? 'Our picker network is being built. Soon you\'ll be able to browse and connect with order pickers in your area.'
                  : 'Our delivery partner network is expanding. Soon you\'ll be able to see rider availability and track deliveries in real-time.'}
              </p>
              <p className="text-sm text-gray-500 mb-8">Expected launch: Q2 2026</p>
              <button
                onClick={() => setActiveTab('stores')}
                className="inline-flex items-center gap-2 bg-[#00897B] text-white px-6 py-3 rounded-full font-medium hover:bg-[#00695C] transition-colors"
              >
                Browse Stores Instead
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
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

          {/* Loading State */}
          {loading && activeTab === 'stores' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00897B] mx-auto"></div>
              <p className="text-gray-600 mt-4">Finding stores...</p>
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
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden cursor-pointer transition-all border border-gray-100"
                >
                  {/* Store Image */}
                  <div className="relative h-48">
                    <img
                      src={store.image || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600'}
                      alt={store.name || store.storeName}
                      className="w-full h-full object-cover"
                    />
                    {/* Price Range Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-medium text-gray-700 shadow-md">
                      Shop from {store.priceRange || '£10-£500'}
                    </div>
                    {/* Rating & Open Badge */}
                    <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-sm font-medium shadow-md flex items-center gap-1 ${
                      store.isOpen !== false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      <span>{store.rating || 4.5}</span>
                      <span>{store.isOpen !== false ? 'Open' : 'Closed'}</span>
                    </div>
                  </div>

                  {/* Store Info */}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {store.name || store.storeName || store.businessName}
                      </h3>
                      {store.verified !== false && (
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        </svg>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      Available: {store.hours || '06:00am - 09:00pm'}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Location: {store.location || 'United Kingdom'}
                    </p>

                    {/* Delivery Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      </svg>
                      <span>{store.distance || '0.1km'}</span>
                      <span>•</span>
                      <span>{store.deliveryFee || '£25'} Deliveries</span>
                      <span>•</span>
                      <span>{store.deliveryTime || '30 mins'}</span>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-4 h-4 ${star <= Math.floor(store.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                    </div>

                    {/* Shopping Methods */}
                    <div className="flex flex-wrap gap-1">
                      {(store.methods || ['Shopping', 'In-Shopping', 'Delivery']).map((method) => (
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
                  {searchLocation ? `No stores in ${searchLocation}` : 'No stores found'}
                </h3>
                <p className="text-gray-600 mb-8">
                  {searchLocation 
                    ? `We haven't reached ${searchLocation} yet, but we're expanding! Try one of these options:`
                    : 'Try searching for a specific location or browse all available stores.'}
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
