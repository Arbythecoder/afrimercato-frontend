import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { productAPI, customerAPI, cartAPI } from '../../services/api'
import { getProductImage } from '../../utils/defaultImages'
import { useAuth } from '../../context/AuthContext'
import { checkVendorLock } from '../../utils/cartVendorLock'
import VendorSwitchModal from '../../components/customer/VendorSwitchModal'

const categories = [
  { id: 'all', name: 'All Products', icon: '🛒' },
  { id: 'fresh-produce', name: 'Fresh Produce', icon: '🥬' },
  { id: 'fruits', name: 'Fruits', icon: '🍎' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥕' },
  { id: 'meat-fish', name: 'Meat & Fish', icon: '🥩' },
  { id: 'dairy', name: 'Dairy', icon: '🥛' },
  { id: 'grains', name: 'Grains & Cereals', icon: '🌾' },
  { id: 'spices', name: 'Spices', icon: '🌶️' },
  { id: 'beverages', name: 'Beverages', icon: '🍹' }
]

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' }
]

function ProductBrowsing() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [wishlist, setWishlist] = useState([])
  const [vendorSwitchModal, setVendorSwitchModal] = useState({
    isOpen: false,
    currentStoreName: '',
    newStoreName: '',
    pendingProduct: null
  })

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'all',
    sort: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true'
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  })

  useEffect(() => {
    fetchProducts()
    fetchWishlist()
  }, [filters, pagination.page])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.sort && { sort: filters.sort }),
        ...(filters.minPrice && { minPrice: filters.minPrice }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
        ...(filters.inStock && { inStock: true })
      }

      const response = await productAPI.getAll(params)
      if (response.success) {
        setProducts(response.data.products || response.data || [])
        if (response.data.pagination) {
          setPagination(prev => ({ ...prev, ...response.data.pagination }))
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWishlist = async () => {
    try {
      const response = await customerAPI.getWishlist()
      if (response.success) {
        setWishlist(response.data?.map(item => item.productId || item._id) || [])
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))

    const newParams = new URLSearchParams(searchParams)
    if (value && value !== 'all') {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const toggleWishlist = async (productId) => {
    try {
      if (wishlist.includes(productId)) {
        await customerAPI.removeFromWishlist(productId)
        setWishlist(prev => prev.filter(id => id !== productId))
      } else {
        await customerAPI.addToWishlist(productId)
        setWishlist(prev => [...prev, productId])
      }
    } catch (error) {
      console.error('Wishlist error:', error)
    }
  }

  const addToCart = async (product) => {
    try {
      // Get current cart
      const currentCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
      
      // Check vendor lock
      const lockCheck = checkVendorLock(product, currentCart)
      
      if (lockCheck.needsConfirmation) {
        // Show modal
        setVendorSwitchModal({
          isOpen: true,
          currentStoreName: lockCheck.currentVendorName,
          newStoreName: lockCheck.newVendorName,
          pendingProduct: product
        })
        return
      }

      // Proceed with adding
      await performAddToCart(product)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart. Please try again.')
    }
  }

  const performAddToCart = async (product) => {
    try {
      if (isAuthenticated) {
        // Use backend cart API for authenticated users
        await cartAPI.add(product._id, 1)
      } else {
        // Use localStorage for guests
        const cart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
        const existingIndex = cart.findIndex(item => item._id === product._id)

        if (existingIndex >= 0) {
          cart[existingIndex].quantity += 1
        } else {
          cart.push({ ...product, quantity: 1 })
        }

        localStorage.setItem('afrimercato_cart', JSON.stringify(cart))
      }
      window.dispatchEvent(new Event('cartUpdated'))
      alert(`${product.name} added to cart!`)
    } catch (error) {
      throw error
    }
  }

  const handleVendorSwitch = async () => {
    // Clear cart
    localStorage.setItem('afrimercato_cart', JSON.stringify([]))
    if (isAuthenticated) {
      try {
        await cartAPI.clear()
      } catch (error) {
        console.log('Backend cart clear deferred:', error.message)
      }
    }
    
    // Add new product
    if (vendorSwitchModal.pendingProduct) {
      await performAddToCart(vendorSwitchModal.pendingProduct)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Browse Products</h1>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-3 pl-12 rounded-xl text-gray-900 focus:ring-2 focus:ring-yellow-400"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="px-4 py-3 rounded-xl text-gray-900 bg-white"
            >
              {sortOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <div className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              <h3 className="font-bold text-lg mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleFilterChange('category', cat.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                      filters.category === cat.id
                        ? 'bg-afri-green text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>

              <hr className="my-6" />

              <h3 className="font-bold text-lg mb-4">Price Range</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-1/2 px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-1/2 px-3 py-2 border rounded-lg"
                />
              </div>

              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.inStock}
                  onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  className="w-5 h-5 rounded text-afri-green"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* View Toggle & Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                {pagination.total || products.length} products found
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-afri-green text-white' : 'bg-gray-200'}`}
                >
                  ▦
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-afri-green text-white' : 'bg-gray-200'}`}
                >
                  ☰
                </button>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
                    <div className="bg-gray-200 h-4 rounded mb-2"></div>
                    <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-6xl">🔍</span>
                <p className="text-gray-500 mt-4">No products found</p>
                <button
                  onClick={() => {
                    setFilters({ search: '', category: 'all', sort: 'newest', minPrice: '', maxPrice: '', inStock: false })
                    setSearchParams({})
                  }}
                  className="mt-4 px-6 py-2 bg-afri-green text-white rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {products.map((product) => (
                  <div
                    key={product._id}
                    className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div
                      className={`relative cursor-pointer ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className={`w-full object-cover group-hover:scale-105 transition-transform ${
                          viewMode === 'list' ? 'h-full' : 'h-48'
                        }`}
                      />
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id) }}
                        className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                      >
                        {wishlist.includes(product._id) ? '❤️' : '🤍'}
                      </button>
                    </div>

                    <div className="p-4 flex-1">
                      <p className="text-xs text-afri-green font-semibold mb-1">
                        {product.vendor?.storeName || 'AfriMercato'}
                      </p>
                      <h3
                        className="font-semibold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-afri-green"
                        onClick={() => navigate(`/product/${product._id}`)}
                      >
                        {product.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{product.unit || 'per item'}</p>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-afri-green">
                            £{product.price?.toFixed(2)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-gray-400 line-through ml-2">
                              £{product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-afri-green text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-afri-green-dark transition-colors"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {[...Array(pagination.pages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                    className={`w-10 h-10 rounded-lg ${
                      pagination.page === i + 1
                        ? 'bg-afri-green text-white'
                        : 'bg-white hover:bg-gray-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Switch Modal */}
      <VendorSwitchModal
        isOpen={vendorSwitchModal.isOpen}
        onClose={() => setVendorSwitchModal({ ...vendorSwitchModal, isOpen: false })}
        currentStoreName={vendorSwitchModal.currentStoreName}
        newStoreName={vendorSwitchModal.newStoreName}
        onConfirmSwitch={handleVendorSwitch}
      />
    </div>
  )
}

export default ProductBrowsing
