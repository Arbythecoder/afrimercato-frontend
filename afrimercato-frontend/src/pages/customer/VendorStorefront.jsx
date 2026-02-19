import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getVendorById, getVendorProductsByVendorId } from '../../services/api'
import { getProductImage, getStoreBanner } from '../../utils/defaultImages'

function VendorStorefront() {
  const { vendorId } = useParams()
  const navigate = useNavigate()

  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchVendorAndProducts()
  }, [vendorId])

  const fetchVendorAndProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch vendor details
      const vendorResponse = await getVendorById(vendorId)
      setVendor(vendorResponse.data || vendorResponse)

      // Fetch vendor products
      const productsResponse = await getVendorProductsByVendorId(vendorId)
      const productsList = productsResponse.data?.products || productsResponse.products || []
      setProducts(productsList)

      // Extract unique categories
      const uniqueCategories = ['All', ...new Set(productsList.map(p => p.category).filter(Boolean))]
      setCategories(uniqueCategories)

    } catch (err) {
      console.error('Error fetching vendor:', err)
      setError(err.message || 'Failed to load store')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item._id === product._id)
    if (existingItem) {
      setCart(cart.map(item =>
        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
    setShowCart(true)
  }

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
    } else {
      setCart(cart.map(item =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item._id !== productId))
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase())
    // inStock undefined means the field was never set — treat as available (opt-out model)
    const isAvailable = product.inStock !== false && (product.stock === undefined || product.stock > 0)
    return matchesCategory && matchesSearch && isAvailable
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#FFB300] mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading store...</p>
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">😔</p>
          <p className="text-gray-600 mb-4">{error || 'Store not found'}</p>
          <button
            onClick={() => navigate('/stores')}
            className="bg-[#FFB300] text-white px-6 py-2 rounded-lg hover:bg-[#FFA726] transition"
          >
            Browse All Stores
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                ⬅️ Go Back
              </button>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛒</span>
                <span className="text-xl font-bold text-gray-900">Afrimercato</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900"
              >
                👤 Account
              </button>
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-[#FFB300] text-white px-4 py-2 rounded-lg hover:bg-[#FFA726] transition"
              >
                🛒 Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Vendor Hero Section */}
      <div className="bg-gradient-to-r from-[#E0F7F4] to-[#FFF4E0] py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Left: Vendor Info */}
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">
                {vendor.storeName || vendor.businessName}
              </h1>
              <p className="text-2xl text-gray-600 mb-4">Got You.</p>
              <p className="text-lg text-[#00897B] font-semibold mb-6">
                Save up to 60% off on your first order
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>🛍️ Shopping Method: In-Shopping, Delivery</span>
                <span>⚡ Deliveries in 20-30 mins</span>
                <span>📞 {vendor.phone || '+44 - 2071 - 234567'}</span>
              </div>
            </div>

            {/* Right: Image */}
            <div className="hidden md:block">
              <img
                src={getStoreBanner(vendor)}
                alt={vendor.storeName || vendor.businessName}
                className="rounded-2xl shadow-xl w-full h-64 object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation + Search */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex gap-4 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 font-semibold whitespace-nowrap transition ${
                    selectedCategory === category
                      ? 'text-[#FFB300] border-b-2 border-[#FFB300]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 min-w-[200px]">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none flex-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">

        {/* Products Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory === 'All' ? 'All Products' : selectedCategory}
          </h2>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={() => addToCart(product)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Promotional Banners */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-r from-[#00897B] to-[#00695C] text-white p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">Free delivery</h3>
            <p className="mb-4">over £50</p>
            <button className="bg-white text-[#00897B] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Shop Now →
            </button>
          </div>

          <div className="bg-gradient-to-r from-[#FFB300] to-[#FFA726] text-white p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">60% off</h3>
            <p className="mb-4">Organic Food</p>
            <button className="bg-white text-[#FFB300] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Order Now →
            </button>
          </div>

          <div className="bg-gradient-to-r from-[#00897B] to-[#00695C] text-white p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-2">Free delivery</h3>
            <p className="mb-4">Shop £50 get...</p>
            <button className="bg-white text-[#00897B] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
              Shop Now →
            </button>
          </div>
        </div>
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setShowCart(false)}
            className="flex-1 bg-black/50"
          ></div>

          {/* Cart Panel */}
          <div className="w-full max-w-md bg-white shadow-2xl overflow-y-auto">
            <div className="p-6">
              {/* Cart Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Cart Items */}
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-2xl mb-2">🛒</p>
                  <p className="text-gray-600">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item._id} className="flex gap-4 border-b pb-4">
                        <img
                          src={getProductImage(item)}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80'
                          }}
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-600">£{item.price.toFixed(2)}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateCartQuantity(item._id, item.quantity - 1)}
                              className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 transition"
                            >
                              -
                            </button>
                            <span className="font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item._id, item.quantity + 1)}
                              className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 transition"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="ml-auto text-red-500 hover:text-red-700"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-semibold">£{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="font-semibold">£{cartTotal >= 50 ? '0.00' : '5.00'}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold border-t pt-2">
                      <span>Total:</span>
                      <span>£{(cartTotal + (cartTotal >= 50 ? 0 : 5)).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={() => {
                      // Save cart to localStorage before navigating
                      localStorage.setItem('afrimercato_cart', JSON.stringify(cart))
                      navigate('/checkout')
                    }}
                    className="w-full bg-gradient-to-r from-[#FFB300] to-[#FFA726] text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition"
                  >
                    Proceed to Checkout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-gray-400">&copy; 2025 Afrimercato. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

// Product Card Component
function ProductCard({ product, onAddToCart }) {
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    onAddToCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden group">
      {/* Product Image */}
      <div className="relative h-40 bg-gray-100 overflow-hidden">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80'
          }}
        />
        {product.discount > 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-1">{product.category}</p>
        <h3 className="font-semibold text-gray-900 mb-2 truncate">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < 4 ? 'text-yellow-400 text-sm' : 'text-gray-300 text-sm'}>
              ⭐
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          {product.discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              £{(product.price / (1 - product.discount / 100)).toFixed(2)}
            </span>
          )}
          <span className="text-lg font-bold text-[#00B207]">
            £{product.price.toFixed(2)}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAdd}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            added
              ? 'bg-green-500 text-white'
              : 'bg-gradient-to-r from-[#FFB300] to-[#FFA726] text-white hover:shadow-lg'
          }`}
        >
          {added ? '✓ Added!' : '🛒 Add'}
        </button>
      </div>
    </div>
  )
}

export default VendorStorefront
