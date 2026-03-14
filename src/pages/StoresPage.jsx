import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPinIcon, StarIcon, ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { searchVendorsByLocation } from '../services/api'

function StoreCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200" />
      <div className="p-5 space-y-3">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
        </div>
        <div className="flex justify-between pt-2 border-t">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  )
}

export default function StoresPage() {
  const [searchParams] = useSearchParams()
  const location = searchParams.get('location') || ''
  const navigate = useNavigate()

  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLocation, setSearchLocation] = useState(location)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  // UK cities for autocomplete
  const ukCities = [
    'London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Bristol',
    'Sheffield', 'Edinburgh', 'Glasgow', 'Newcastle', 'Nottingham', 
    'Leicester', 'Southampton', 'Cardiff', 'Belfast', 'Brighton',
    'Hull', 'Bradford', 'Coventry', 'Wolverhampton'
  ]

  // Filter suggestions based on input
  const suggestions = searchLocation
    ? ukCities.filter(city => 
        city.toLowerCase().startsWith(searchLocation.toLowerCase())
      )
    : []

  useEffect(() => {
    fetchStores()

  }, [location])

  const fetchStores = async () => {
    setLoading(true)
    try {
      const response = await searchVendorsByLocation(location || '', 50)
      if (response.success && response.data?.vendors?.length > 0) {
        setStores(response.data.vendors)
      } else {
        setStores([])
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('[STORE_SEARCH_FAIL]', location, error.message)
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setShowSuggestions(false)
    if (searchLocation.trim()) {
      navigate(`/stores?location=${encodeURIComponent(searchLocation)}`)
    }
  }

  const handleSuggestionClick = (city) => {
    setSearchLocation(city)
    setShowSuggestions(false)
    navigate(`/stores?location=${encodeURIComponent(city)}`)
  }

  const handleInputChange = (e) => {
    setSearchLocation(e.target.value)
    setIsTyping(true)
    setShowSuggestions(true)
    
    // Debounce typing indicator
    setTimeout(() => setIsTyping(false), 500)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🛒</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Afri<span className="text-green-600">Hub</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-green-600">Home</Link>
              <Link to="/partner" className="text-gray-600 hover:text-green-600">Partner With Us</Link>
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">Sign In</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Section */}
      <section className="bg-gradient-to-br from-green-600 to-green-700 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center">
            Find African Stores Near You
          </h1>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-3">
            <div className="flex flex-col sm:flex-row gap-3 relative">
              <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 relative">
                <MapPinIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="Enter location (London, Manchester, Birmingham...)"
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                  autoComplete="off"
                />
                {isTyping && (
                  <div className="animate-pulse text-gray-400 text-sm">Searching...</div>
                )}
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                Search
              </button>
              
              {/* Autocomplete Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                  {suggestions.map((city) => (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSuggestionClick(city)}
                      className="w-full text-left px-4 py-3 hover:bg-green-50 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <MapPinIcon className="w-5 h-5 text-green-600" />
                      <span className="text-gray-900 font-medium">{city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {location ? `Stores in ${location}` : 'All Stores'}
            </h2>
            <p className="text-gray-600">
              {loading ? 'Searching...' : stores.length > 0 ? `${stores.length} stores found` : 'No stores found'}
            </p>
          </div>

          {/* Skeleton loading */}
          {loading && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <StoreCardSkeleton key={i} />)}
            </div>
          )}

          {/* Store Grid */}
          {!loading && stores.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => {
                const displayName = store.storeName || store.name
                const displayAddress = typeof store.address === 'object'
                  ? `${store.address.street}, ${store.address.city}`
                  : store.address || store.location?.address || store.location
                const displayImage = store.image || store.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600'
                const displayRating = store.rating ? parseFloat(store.rating).toFixed(1) : '4.8'

                return (
                  <motion.div
                    key={store._id || store.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all"
                    onClick={() => navigate(`/store/${store._id}`)}
                  >
                    {/* Store Image */}
                    <div className="relative h-48">
                      <img src={displayImage} alt={displayName} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                        <span className="font-bold text-gray-900">{displayRating}</span>
                      </div>
                    </div>

                    {/* Store Info */}
                    <div className="p-5">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {displayName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">{store.category}</p>
                      <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3" />
                        {displayAddress}
                      </p>

                      {/* Tags */}
                      {store.tags && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {store.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Delivery Info */}
                      <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t">
                        <div className="flex items-center gap-1">
                          <ClockIcon className="w-4 h-4" />
                          <span>ADT {store.deliveryTime || '30-45 min'}</span>
                        </div>
                        <div className="font-semibold text-gray-900">
                          {`Min. ${store.minOrder || store.minimumOrder || '£10'}`}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
