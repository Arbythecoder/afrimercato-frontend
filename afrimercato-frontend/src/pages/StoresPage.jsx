import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPinIcon, StarIcon, ClockIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { searchVendorsByLocation } from '../services/api'

export default function StoresPage() {
  const [searchParams] = useSearchParams()
  const location = searchParams.get('location') || ''
  const navigate = useNavigate()

  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchLocation, setSearchLocation] = useState(location)

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
        setStores([])
      }
    } catch (error) {
      console.error('[STORE_SEARCH_FAIL]', location, error.message)
      setStores([])
    } finally {
      setLoading(false)
    }
  }

  const expandSearchRadius = async () => {
    try {
      setLoading(true)
      const response = await searchVendorsByLocation(location, 100)
      
      if (response.success && response.data?.vendors && response.data.vendors.length > 0) {
        setStores(response.data.vendors)
      }
    } catch (error) {
      console.error('[EXPAND_SEARCH_FAIL]', error.message)
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
      }
    } catch (error) {
      console.error('[BROWSE_ALL_FAIL]', error.message)
    } finally {
      setLoading(false)
    }
  }

  const getSampleStores = (searchLocation) => {
    // Sample stores with UK locations
    const allStores = [
      // London stores
      { id: 1, name: 'Green Valley Farms', category: 'Fresh Produce', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', rating: 4.8, deliveryTime: '20-30 min', minOrder: '£10', tags: ['Vegetables', 'Fruits', 'Organic'], location: 'London', address: '123 High Street, London E1 6AN' },
      { id: 2, name: 'African Spice Market', category: 'African Groceries', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600', rating: 4.9, deliveryTime: '25-35 min', minOrder: '£15', tags: ['Spices', 'Grains', 'Authentic'], location: 'London', address: '45 Peckham High St, London SE15' },
      { id: 3, name: 'Lagos Kitchen Store', category: 'Nigerian Foods', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', rating: 4.9, deliveryTime: '25-35 min', minOrder: '£15', tags: ['Nigerian', 'Palm Oil', 'Cassava'], location: 'London', address: '78 Brixton Road, London SW9' },
      { id: 4, name: 'Tropical Fruits Hub', category: 'Exotic Fruits', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600', rating: 4.8, deliveryTime: '20-30 min', minOrder: '£12', tags: ['Plantain', 'Mango', 'Yam'], location: 'London', address: '12 Ridley Road Market, London E8' },
      { id: 5, name: 'Hackney Fresh Foods', category: 'Fresh Produce', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', rating: 4.7, deliveryTime: '20-30 min', minOrder: '£10', tags: ['Vegetables', 'Fruits'], location: 'London', address: 'Hackney Market, London E8 5RT' },

      // Manchester stores
      { id: 6, name: 'Manchester African Market', category: 'African Groceries', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600', rating: 4.6, deliveryTime: '30-40 min', minOrder: '£12', tags: ['African', 'Spices', 'Grains'], location: 'Manchester', address: '34 Cheetham Hill Road, Manchester M8' },
      { id: 7, name: 'Moss Side Grocers', category: 'Fresh Produce', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', rating: 4.5, deliveryTime: '25-35 min', minOrder: '£10', tags: ['Vegetables', 'Fruits'], location: 'Manchester', address: '56 Great Western Street, Manchester M14' },
      { id: 8, name: 'Afro-Caribbean Store MCR', category: 'Caribbean Foods', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', rating: 4.7, deliveryTime: '30-40 min', minOrder: '£15', tags: ['Caribbean', 'Plantain', 'Rice'], location: 'Manchester', address: '89 Princess Road, Manchester M14' },

      // Birmingham stores
      { id: 9, name: 'Handsworth African Foods', category: 'African Groceries', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600', rating: 4.8, deliveryTime: '20-30 min', minOrder: '£10', tags: ['African', 'Fresh', 'Halal'], location: 'Birmingham', address: '23 Soho Road, Birmingham B21' },
      { id: 10, name: 'Birmingham Tropical Market', category: 'Tropical Foods', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600', rating: 4.6, deliveryTime: '25-35 min', minOrder: '£12', tags: ['Plantain', 'Yam', 'Cassava'], location: 'Birmingham', address: '45 Stratford Road, Birmingham B11' },

      // Bristol stores
      { id: 11, name: 'Bristol African Store', category: 'African Groceries', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600', rating: 4.7, deliveryTime: '30-40 min', minOrder: '£12', tags: ['African', 'Caribbean', 'Fresh'], location: 'Bristol', address: '12 Stapleton Road, Bristol BS5' },
      { id: 12, name: 'St Pauls Fresh Market', category: 'Fresh Produce', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', rating: 4.5, deliveryTime: '25-35 min', minOrder: '£10', tags: ['Vegetables', 'Fruits'], location: 'Bristol', address: '34 Grosvenor Road, Bristol BS2' },

      // Leeds stores
      { id: 13, name: 'Leeds African Groceries', category: 'African Foods', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', rating: 4.6, deliveryTime: '30-40 min', minOrder: '£12', tags: ['African', 'Spices', 'Grains'], location: 'Leeds', address: '67 Harehills Lane, Leeds LS8' },
      { id: 14, name: 'Chapeltown Fresh Foods', category: 'Fresh Produce', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600', rating: 4.5, deliveryTime: '25-35 min', minOrder: '£10', tags: ['Vegetables', 'Fruits'], location: 'Leeds', address: '89 Chapeltown Road, Leeds LS7' },

      // Liverpool stores
      { id: 15, name: 'Liverpool African Market', category: 'African Groceries', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600', rating: 4.7, deliveryTime: '30-40 min', minOrder: '£15', tags: ['African', 'Caribbean', 'Halal'], location: 'Liverpool', address: '45 Granby Street, Liverpool L8' },
      { id: 16, name: 'Toxteth Tropical Foods', category: 'Tropical Foods', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600', rating: 4.6, deliveryTime: '25-35 min', minOrder: '£12', tags: ['Plantain', 'Yam'], location: 'Liverpool', address: '23 Upper Parliament Street, Liverpool L8' },
    ]

    // Filter by location
    if (searchLocation) {
      const filtered = allStores.filter(store =>
        store.location.toLowerCase().includes(searchLocation.toLowerCase()) ||
        store.address.toLowerCase().includes(searchLocation.toLowerCase())
      )
      return filtered.length > 0 ? filtered : allStores.slice(0, 6)
    }

    return allStores
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchLocation.trim()) {
      navigate(`/stores?location=${encodeURIComponent(searchLocation)}`)
    }
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
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
              <MapPinIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Enter location (London, Manchester, Birmingham...)"
                className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              Search
            </button>
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
              {loading ? 'Searching...' : `${stores.length} stores found`}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Finding stores...</p>
            </div>
          )}

          {/* Empty State - Production Ready (Like Uber Eats) */}
          {!loading && stores.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg max-w-2xl mx-auto">
              <div className="px-6">
                {/* Icon */}
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                {/* Message */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchLocation ? `No stores in ${searchLocation}` : 'No stores available'}
                </h3>
                <p className="text-gray-600 mb-8">
                  {searchLocation 
                    ? `We're working to bring Afrimercato to ${searchLocation}. Meanwhile, try these options:`
                    : 'Try searching for a specific location or explore our available stores.'}
                </p>

                {/* Actions */}
                <div className="space-y-3 max-w-sm mx-auto">
                  {searchLocation && (
                    <button
                      onClick={expandSearchRadius}
                      className="w-full bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md"
                    >
                      Search wider area
                    </button>
                  )}
                  
                  <button
                    onClick={browseAllStores}
                    className="w-full border-2 border-green-600 text-green-600 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all"
                  >
                    Browse all stores
                  </button>

                  {/* Suggested Locations */}
                  <div className="pt-4">
                    <p className="text-sm text-gray-500 mb-3">Try these locations:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {['London', 'Manchester', 'Birmingham', 'Dublin', 'Liverpool'].map(city => (
                        <button
                          key={city}
                          onClick={() => {
                            setSearchLocation(city)
                            navigate(`/stores?location=${city}`)
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          {city}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Store Grid */}
          {!loading && stores.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stores.map((store) => (
                <motion.div
                  key={store.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all"
                  onClick={() => navigate(`/store/${store.id}`)}
                >
                  {/* Store Image */}
                  <div className="relative h-48">
                    <img src={store.image} alt={store.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                      <StarIcon className="w-4 h-4 text-yellow-500" />
                      <span className="font-bold text-gray-900">{store.rating}</span>
                    </div>
                  </div>

                  {/* Store Info */}
                  <div className="p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {store.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">{store.category}</p>
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3" />
                      {store.address || store.location}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {store.tags?.slice(0, 3).map((tag, i) => (
                        <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Delivery Info */}
                    <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{store.deliveryTime}</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        Min. {store.minOrder}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
