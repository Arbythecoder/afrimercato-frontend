import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { vendorAPI } from '../../services/api'

const categories = [
  { id: 'all', name: 'All Stores', icon: '🏪' },
  { id: 'fresh-produce', name: 'Fresh Produce', icon: '🥬' },
  { id: 'meat-fish', name: 'Meat & Fish', icon: '🥩' },
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'bakery', name: 'Bakery', icon: '🍞' },
  { id: 'spices', name: 'Spices', icon: '🌶️' },
  { id: 'beverages', name: 'Beverages', icon: '🧃' },
  { id: 'pantry', name: 'Pantry', icon: '🥫' }
]

const sortOptions = [
  { id: 'distance', name: 'Nearest First' },
  { id: 'rating', name: 'Highest Rated' },
  { id: 'popular', name: 'Most Popular' },
  { id: 'newest', name: 'Newest' }
]

function VendorDiscovery() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')
  const [sort, setSort] = useState(searchParams.get('sort') || 'distance')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  // Location detection
  const [userLocation, setUserLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)

  useEffect(() => {
    fetchVendors()
  }, [category, sort, location])

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (category !== 'all') params.set('category', category)
    if (sort !== 'distance') params.set('sort', sort)
    if (location) params.set('location', location)
    setSearchParams(params)
  }, [search, category, sort, location])

  const fetchVendors = async () => {
    try {
      setLoading(true)
      const params = {
        category: category !== 'all' ? category : undefined,
        sort,
        search,
        location: userLocation ? `${userLocation.lat},${userLocation.lng}` : location
      }
      const response = await vendorAPI.getVendors(params)
      if (response.success) {
        setVendors(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
        setLocation('Current Location')
        setLocationLoading(false)
      },
      (error) => {
        console.error('Location error:', error)
        alert('Unable to get your location. Please enter it manually.')
        setLocationLoading(false)
      }
    )
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchVendors()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Search */}
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-2">Discover African Grocery Stores</h1>
          <p className="text-afri-green-light text-center mb-8">Fresh produce, authentic spices, and more near you</p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search stores or products..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-afri-gold"
                />
              </div>
              <div className="relative flex-1 md:max-w-xs">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📍</span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter postcode or area"
                  className="w-full pl-12 pr-12 py-4 rounded-xl text-gray-900 focus:ring-2 focus:ring-afri-gold"
                />
                <button
                  type="button"
                  onClick={detectLocation}
                  disabled={locationLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-afri-green hover:text-afri-green-dark"
                  title="Use current location"
                >
                  {locationLoading ? '⏳' : '🎯'}
                </button>
              </div>
              <button
                type="submit"
                className="bg-afri-gold text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-yellow-400 transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Pills */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full whitespace-nowrap transition-all ${
                category === cat.id
                  ? 'bg-afri-green text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span className="font-medium">{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <p className="text-gray-600">
            {loading ? 'Finding stores...' : `${vendors.length} stores found`}
          </p>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-afri-green"
            >
              {sortOptions.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex bg-white rounded-lg border overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-afri-green text-white' : ''}`}
              >
                ▦
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-afri-green text-white' : ''}`}
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        {/* Vendors Grid/List */}
        {loading ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-5 rounded w-2/3 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <span className="text-8xl">🏪</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-6">No stores found</h2>
            <p className="text-gray-500 mt-2">Try adjusting your search or location</p>
            <button
              onClick={() => { setSearch(''); setCategory('all'); setLocation(''); }}
              className="mt-6 px-6 py-3 bg-afri-green text-white rounded-xl font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
            {vendors.map(vendor => (
              <div
                key={vendor._id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onClick={() => navigate(`/store/${vendor._id}`)}
              >
                {/* Store Image */}
                <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                  <img
                    src={vendor.coverImage || vendor.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'}
                    alt={vendor.storeName}
                    className={`w-full object-cover group-hover:scale-105 transition-transform ${
                      viewMode === 'list' ? 'h-full' : 'h-48'
                    }`}
                  />
                  {vendor.isOpen !== false && (
                    <span className="absolute top-3 left-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Open Now
                    </span>
                  )}
                  {vendor.featured && (
                    <span className="absolute top-3 right-3 bg-afri-gold text-gray-900 text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                {/* Store Info */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{vendor.storeName}</h3>
                      <p className="text-sm text-gray-500">{vendor.category || 'African Groceries'}</p>
                    </div>
                    {vendor.logo && (
                      <img
                        src={vendor.logo}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                      />
                    )}
                  </div>

                  {/* Rating & Distance */}
                  <div className="flex items-center gap-4 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold">{vendor.rating?.toFixed(1) || '4.5'}</span>
                      <span className="text-gray-400">({vendor.reviewCount || 0})</span>
                    </div>
                    {vendor.distance && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <span>📍</span>
                        <span>{vendor.distance.toFixed(1)} miles</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {vendor.tags?.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Delivery Info */}
                  <div className="flex items-center justify-between text-sm pt-3 border-t">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span>🚚</span>
                      <span>{vendor.deliveryTime || '30-45 min'}</span>
                    </div>
                    <div className="text-gray-600">
                      {vendor.deliveryFee === 0 ? (
                        <span className="text-green-600 font-semibold">Free Delivery</span>
                      ) : (
                        <span>Delivery: £{vendor.deliveryFee?.toFixed(2) || '2.99'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured Stores Section */}
        {!loading && vendors.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular in Your Area</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vendors.slice(0, 4).map(vendor => (
                <div
                  key={vendor._id + '-featured'}
                  className="bg-white rounded-xl p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/store/${vendor._id}`)}
                >
                  <img
                    src={vendor.logo || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                    alt={vendor.storeName}
                    className="w-20 h-20 rounded-full mx-auto object-cover mb-3"
                  />
                  <h3 className="font-semibold text-gray-900 truncate">{vendor.storeName}</h3>
                  <div className="flex items-center justify-center gap-1 text-sm">
                    <span className="text-yellow-400">★</span>
                    <span>{vendor.rating?.toFixed(1) || '4.5'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VendorDiscovery
