import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { searchVendorsByLocation } from '../../services/api'

function StoreMarketplace() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('nearby') // nearby | top | featured
  const [searchLocation, setSearchLocation] = useState(searchParams.get('location') || '')

  useEffect(() => {
    fetchStores()
  }, [searchLocation, filter])

  const fetchStores = async () => {
    try {
      setLoading(true)
      setError(null)

      // Call location search API
      const response = await searchVendorsByLocation(searchLocation, 50)

      setStores(response.data?.vendors || response.vendors || [])
    } catch (err) {
      console.error('Error fetching stores:', err)
      setError(err.message || 'Failed to load stores')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    fetchStores()
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Filter stores based on selected filter
  const filteredStores = stores.filter(store => {
    if (filter === 'top') {
      return store.rating >= 4.0
    }
    if (filter === 'featured') {
      return store.featured === true
    }
    return true // nearby - show all
  }).sort((a, b) => {
    if (filter === 'top') {
      return b.rating - a.rating // highest rated first
    }
    return a.distance - b.distance // nearest first
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#FFB300] to-[#FFA726] text-white py-6">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-4xl">🛒</span>
              <h1 className="text-3xl font-bold">AfriMercato</h1>
            </div>
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-[#FFB300] px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition"
            >
              Sign Up
            </button>
          </div>

          {/* Hero Text */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">
              African Online Store In the United Kingdom
            </h2>
            <p className="text-white/90 max-w-2xl mx-auto">
              Use existing infrastructure of African products you depend on delivered to your doorstep.
              Open stores, fresh products delivered to you whenever convenient.
            </p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-2 max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Postcode, store name, location"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              onClick={handleSearch}
              className="bg-[#00897B] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#00695C] transition"
            >
              Find Store
            </button>
          </div>

          {/* Trust Indicator */}
          <div className="text-center mt-4">
            <p className="text-white/90">
              <span className="font-bold">Trusted by:</span> 👥 4,320+ Vendors
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setFilter('nearby')}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              filter === 'nearby'
                ? 'border-[#FFB300] text-[#FFB300]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Browse Nearby
          </button>
          <button
            onClick={() => setFilter('top')}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              filter === 'top'
                ? 'border-[#FFB300] text-[#FFB300]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Top Stores
          </button>
          <button
            onClick={() => setFilter('featured')}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              filter === 'featured'
                ? 'border-[#FFB300] text-[#FFB300]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Featured Stores
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#FFB300] mx-auto"></div>
            <p className="text-gray-600 mt-4">Finding stores near you...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">⚠️ {error}</p>
            <button
              onClick={fetchStores}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Store Grid */}
        {!loading && !error && filteredStores.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl mb-2">😔</p>
            <p className="text-gray-600">No stores found in this area</p>
            <button
              onClick={() => setSearchLocation('London')}
              className="mt-4 bg-[#FFB300] text-white px-6 py-2 rounded-lg hover:bg-[#FFA726] transition"
            >
              Try London
            </button>
          </div>
        )}

        {!loading && !error && filteredStores.length > 0 && (
          <>
            <div className="mb-4 text-gray-600">
              Found <span className="font-bold text-gray-900">{filteredStores.length}</span> stores
              {searchLocation && ` near "${searchLocation}"`}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store) => (
                <StoreCard key={store._id || store.id} store={store} onClick={() => navigate(`/store/${store._id || store.id}`)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-8 mt-12">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">&copy; 2025 AfriMercato. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

// Store Card Component
function StoreCard({ store, onClick }) {
  const isOpen = true // TODO: Calculate based on store hours
  const deliveryMethods = store.deliveryOptions || ['Delivery', 'Pickup', 'In-Store Shopping']

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden group"
    >
      {/* Store Image */}
      <div className="relative h-48 bg-gradient-to-br from-[#FFB300]/20 to-[#00897B]/20 overflow-hidden">
        {store.storeImage ? (
          <img
            src={store.storeImage}
            alt={store.storeName || store.businessName}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            🏪
          </div>
        )}

        {/* Open/Closed Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {isOpen ? 'Open' : 'Closed'}
          </span>
          {store.rating >= 4.5 && (
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-[#FFB300] text-white">
              ⭐ {store.rating?.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Store Info */}
      <div className="p-4">
        {/* Store Name */}
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-xl font-bold text-gray-900">
            {store.storeName || store.businessName}
          </h3>
          {store.verified && (
            <span className="text-green-500" title="Verified">✓</span>
          )}
        </div>

        {/* Hours */}
        <p className="text-sm text-gray-600 mb-2">
          🕐 Available: {store.hours || '06:00am - 09:00pm'}
        </p>

        {/* Location */}
        <p className="text-sm text-gray-600 mb-2">
          📍 {store.address?.city || store.city}, {store.address?.country || 'United Kingdom'}
        </p>

        {/* Distance & Delivery Time */}
        <p className="text-sm font-semibold text-[#00897B] mb-3">
          {store.distance ? `${store.distance.toFixed(1)}km` : '0.1km'} •
          Deliveries in {store.estimatedDeliveryTime || '30-50'} mins
        </p>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < Math.floor(store.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}>
              ⭐
            </span>
          ))}
          <span className="text-sm text-gray-600 ml-2">
            ({store.totalReviews || 0} reviews)
          </span>
        </div>

        {/* Delivery Methods */}
        <div className="flex flex-wrap gap-2">
          {deliveryMethods.map((method, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {method}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StoreMarketplace
