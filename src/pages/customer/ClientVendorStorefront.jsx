import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getVendorProductsByVendorId, cartAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { getProductImage } from '../../utils/defaultImages'
import { checkVendorLock, checkMinimumOrder } from '../../utils/cartVendorLock'
import { getCartCount, getCartSubtotal } from '../../utils/cartUtils'
import VendorSwitchModal from '../../components/customer/VendorSwitchModal'
import ProductDetailModal from '../../components/customer/ProductDetailModal'
import { Clock, MapPin, Tag, PackageX, Eye, Star } from 'lucide-react'

// Helper to check if an ID is a valid MongoDB ObjectId (24 hex characters)
const isValidMongoId = (id) => {
  if (!id) return false
  const stringId = String(id)
  return /^[0-9a-fA-F]{24}$/.test(stringId)
}

export default function ClientVendorStorefront() {
  const { vendorId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const [vendor, setVendor] = useState(null)
  // STRIPPED MOCK DATA: Start with completely empty array
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Initialize cart from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('afrimercato_cart')
      return savedCart ? JSON.parse(savedCart) : []
    } catch (_e) {
      return []
    }
  })
  const [showCart, setShowCart] = useState(false)
  const [selectedProductForDetail, setSelectedProductForDetail] = useState(null)
  const [countdown, setCountdown] = useState({ hours: 10, minutes: 56, seconds: 21 })
  const [vendorSwitchModal, setVendorSwitchModal] = useState({
    isOpen: false,
    currentStoreName: '',
    newStoreName: '',
    pendingProduct: null
  })

  useEffect(() => {
    localStorage.setItem('afrimercato_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
  }, [cart])

  // Category tabs derived purely from loaded products
  const categoryTabs = products.length > 0
    ? ['All', ...new Set(products.map(p => p.category).filter(Boolean))]
    : ['All']

  useEffect(() => {
    fetchVendorAndProducts()
  }, [vendorId])

  // Countdown timer (For dynamic sales later)
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchVendorAndProducts = async () => {
    try {
      setLoading(true)
      const response = await getVendorProductsByVendorId(vendorId)

      if (response.success) {
        if (response.vendor) {
          setVendor({
            ...response.vendor,
            storeName: response.vendor.storeName || response.vendor.name,
            businessName: response.vendor.businessName || response.vendor.name,
            _id: response.vendor.id || response.vendor._id
          })
        } else {
          const storedVendor = sessionStorage.getItem(`vendor_${vendorId}`)
          if (storedVendor) setVendor(JSON.parse(storedVendor))
        }

        // Properly handle the products array, even if it's empty
        const productsList = Array.isArray(response.data) ? response.data : []
        setProducts(productsList)
      }
    } catch (error) {
      console.log('Fetching vendor data:', error.message)
      const storedVendor = sessionStorage.getItem(`vendor_${vendorId}`)
      if (storedVendor) {
        setVendor(JSON.parse(storedVendor))
      } else {
        setVendor({
          storeName: 'Store Unavailable',
          businessName: 'Store Unavailable',
          phone: 'Contact support',
          deliveryTime: '—',
          notFound: true
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const addToCart = async (product) => {
    const productWithVendor = {
      ...product,
      vendor: product.vendor || vendor,
      vendorId: product.vendorId || vendorId,
      storeName: product.storeName || vendor?.storeName
    }

    const lockCheck = checkVendorLock(productWithVendor, cart)

    if (lockCheck.needsConfirmation) {
      setVendorSwitchModal({
        isOpen: true,
        currentStoreName: lockCheck.currentVendorName,
        newStoreName: lockCheck.newVendorName,
        pendingProduct: productWithVendor
      })
      return
    }

    await performAddToCart(productWithVendor)
  }

  const performAddToCart = async (product) => {
    const productId = product._id || product.id

    setCart(prevCart => {
      const existingItem = prevCart.find(item => (item._id || item.id) === productId)
      if (existingItem) {
        return prevCart.map(item =>
          (item._id || item.id) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevCart, {
        _id: productId,
        id: productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        unit: product.unit || 'piece',
        images: product.images?.length > 0 ? product.images : (product.image ? [product.image] : []),
        vendor: product.vendor,
        vendorId: product.vendorId,
        storeName: product.storeName
      }]
    })

    if (isAuthenticated && user?.roles?.includes('customer') && isValidMongoId(productId)) {
      try {
        await cartAPI.add(productId, 1)
      } catch (error) {
        console.log('Backend cart sync deferred:', error.message)
      }
    }
  }

  const handleVendorSwitch = async () => {
    setCart([])
    localStorage.setItem('afrimercato_cart', JSON.stringify([]))
    localStorage.removeItem('vendor_lock')

    if (isAuthenticated && user?.roles?.includes('customer')) {
      try {
        await cartAPI.clear()
      } catch (error) {
        console.log('Backend cart clear deferred:', error.message)
      }
    }

    setVendorSwitchModal({ isOpen: false, currentStoreName: '', newStoreName: '', pendingProduct: null })

    if (vendorSwitchModal.pendingProduct) {
      await performAddToCart(vendorSwitchModal.pendingProduct)
    }

    window.dispatchEvent(new Event('cartUpdated'))
  }

  const updateCartQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart(cart.map(item =>
      (item.id === productId || item._id === productId) ? { ...item, quantity: newQuantity } : item
    ))

    if (isAuthenticated && user?.roles?.includes('customer') && isValidMongoId(productId)) {
      try {
        await cartAPI.update(productId, newQuantity)
      } catch (error) {
        console.log('Backend cart update deferred:', error.message)
      }
    }
  }

  const removeFromCart = async (productId) => {
    setCart(cart.filter(item => item.id !== productId && item._id !== productId))

    if (isAuthenticated && user?.roles?.includes('customer') && isValidMongoId(productId)) {
      try {
        await cartAPI.remove(productId)
      } catch (error) {
        console.log('Backend cart remove deferred:', error.message)
      }
    }
  }

  const cartTotal = getCartSubtotal(cart)
  const cartItemCount = getCartCount(cart)

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00897B] mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading store...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center">
                <img src="/logo.svg" alt="Afrimercato" className="h-8 w-auto" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Account
              </Link>
              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center gap-2 bg-[#00897B] hover:bg-[#00695C] text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Cart
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t text-sm">
            <div className="flex items-center gap-6">
              <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[#00897B] font-medium hover:underline">
                ← Go Back
              </button>
              <span className="text-gray-600 hidden sm:block">
                Shopping Method: <span className="text-gray-900 font-medium">In-Shopping, Delivery</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-600">
              <span className="flex items-center gap-1">
                <Clock size={14} /> ADT {vendor?.deliveryTime || '20 mins'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Vendor Image Background */}
      <section className="relative py-14 sm:py-16 overflow-hidden min-h-[380px] flex items-center">
        {/* Background Image (Vendor Image / Logo / Store Image) */}
        <div className="absolute inset-0 z-0">
          <img
            src={vendor?.banner || vendor?.storeImage || vendor?.logo || vendor?.image || "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200"}
            alt={vendor?.storeName || "Store Background"}
            className="w-full h-full object-cover object-center scale-105 filter blur-[0.5px] transition-transform duration-700 hover:scale-100"
          />
          {/* Dark Overlay Gradient for Maximum Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-slate-900/75 to-slate-950/10 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 /99 via-transparent to-black/30" />
        </div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid lg:grid-cols-12 gap-8 items-center">

            {/* Left Column: Store Text & Actions */}
            <div className="lg:col-span-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-400/40 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest text-emerald-300">
                  Official Store
                </span>
                {vendor?.category && (
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-white/80 capitalize">
                    {vendor.category}
                  </span>
                )}
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="text-4xl sm:text-6xl font-black text-white mb-2 leading-tight drop-shadow-md">
                {vendor?.storeName || vendor?.businessName || 'African Store'}
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl text-[#FFB800] font-semibold mb-3">
                Got You.
              </motion.p>

              <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base sm:text-lg text-gray-200 mb-6 max-w-xl leading-relaxed">
                {vendor?.storeDescription || vendor?.description || "Authentic African groceries delivered straight to your door"}
              </motion.p>

              {vendor?.deliverySettings?.minimumOrderValue > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl mb-6 shadow-md">
                  <span className="text-white font-semibold text-sm">📦 Minimum order: £{vendor.deliverySettings.minimumOrderValue.toFixed(2)}</span>
                </motion.div>
              )}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="flex flex-wrap gap-3">
                {products.length > 0 && (
                  <button onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[#FFB800] hover:bg-[#E6A600] text-[#1B4D3E] px-8 py-3.5 rounded-full font-bold transition-all shadow-xl active:scale-95 flex items-center gap-2">
                    Shop Now →
                  </button>
                )}
                <Link to="/stores" className="border-2 border-white/80 bg-white/10 backdrop-blur-md text-white rounded-full px-8 py-3.5 font-semibold hover:bg-white hover:text-gray-900 transition-all active:scale-95">
                  Browse More Stores
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex flex-wrap items-center gap-4 mt-6">
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-sm text-white font-medium shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span> ADT {vendor?.deliveryTime || '20 mins'}
                </div>
                {vendor?.rating > 0 && (
                  <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-sm text-white font-medium shadow-sm">
                    ⭐ {vendor.rating} rating
                  </div>
                )}
                {vendor?.location?.city && (
                  <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full text-sm text-white/90 font-medium shadow-sm">
                    📍 {vendor.location.city}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column: Glassmorphism Store Branding Badge */}
            <div className="lg:col-span-4 hidden lg:flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl text-center w-full max-w-xs relative overflow-hidden group"
              >
                <div className="w-28 h-28 mx-auto rounded-2xl bg-white p-3 shadow-lg border border-gray-100 flex items-center justify-center overflow-hidden mb-4 transition-transform duration-300 group-hover:scale-105">
                  <img
                    src={vendor?.logo || vendor?.storeLogo || vendor?.storeImage || vendor?.image || "/logo.svg"}
                    alt={vendor?.storeName || "Vendor Logo"}
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = "/logo.svg" }}
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-1 truncate">{vendor?.storeName || 'Store'}</h3>
                <p className="text-xs text-emerald-300 font-semibold uppercase tracking-wider mb-3">Verified Partner Store</p>
                <div className="pt-3 border-t border-white/15 flex items-center justify-around text-xs text-gray-300">
                  <div>
                    <span className="block font-bold text-white text-sm">{products.length}</span>
                    <span>Products</span>
                  </div>
                  <div className="h-6 w-px bg-white/20" />
                  <div>
                    <span className="block font-bold text-emerald-400 text-sm">Active</span>
                    <span>Delivery</span>
                  </div>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Content Area */}
      {products.length === 0 ? (
        // EMPTY STATE: If the vendor has no products
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <PackageX size={40} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No products available yet</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            This vendor hasn't uploaded any items to their digital storefront yet. Check back soon!
          </p>
          <Link to="/stores" className="inline-flex items-center gap-2 bg-[#1B4D3E] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0D2B22] transition-colors">
            Browse Other Stores
          </Link>
        </div>
      ) : (
        // RENDER PRODUCTS: Normal view
        <>
          {/* Category Navigation */}
          <div className="bg-white border-b sticky top-16 sm:top-[104px] z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between py-3 gap-3">
                <div className="flex items-center gap-2 overflow-x-auto flex-nowrap py-1 max-w-full scroll-smooth [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
                  {categoryTabs.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${selectedCategory === cat ? 'bg-[#1B4D3E] text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 w-full md:w-auto min-w-[200px]">
                  <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent outline-none flex-1 text-gray-900 w-full text-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div id="products-section" className="mb-12">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#1A1A1A]">
                  {selectedCategory === 'All' ? 'All Products' : selectedCategory}
                </h2>
                <span className="text-sm font-semibold text-gray-500">{filteredProducts.length} items</span>
              </div>
              <div className="w-12 h-1 bg-[#FFB800] mt-2 mb-6 rounded-full" />

              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                  <p className="text-gray-500 font-medium">No products found matching your search.</p>
                  <button onClick={() => { setSearchQuery(''); setSelectedCategory('All') }} className="mt-4 text-[#1B4D3E] font-bold hover:underline">Clear filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id || product._id || index}
                      product={product}
                      onAddToCart={() => addToCart(product)}
                      onOpenDetail={() => setSelectedProductForDetail(product)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Shopping Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCart(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                  <button onClick={() => setShowCart(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                </div>

                {cart.length > 0 && (() => {
                  const uniqueVendorIds = [...new Set(cart.map(item => item.vendor?._id || item.vendor?.id || item.vendorId || 'unknown'))]
                  if (uniqueVendorIds.length > 1) {
                    return (
                      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-lg">🏪</span>
                          <span className="text-gray-700">Shopping from <strong className="text-gray-900">{uniqueVendorIds.length}</strong> stores</span>
                        </div>
                      </div>
                    )
                  }
                  return vendor ? (
                    <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-lg">🏪</span>
                        <span className="text-gray-700">Shopping from: <strong className="text-gray-900">{vendor.storeName || vendor.businessName}</strong></span>
                      </div>
                    </div>
                  ) : null
                })()}

                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-2">🛒</p>
                    <p className="text-gray-600">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((item) => (
                        <div key={item.id || item._id} className="flex gap-4 border-b pb-4">
                          <img
                            src={getProductImage(item)}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100' }}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">£{(item.price || 0).toFixed(2)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button onClick={() => updateCartQuantity(item.id || item._id, item.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">-</button>
                              <span className="font-semibold">{item.quantity}</span>
                              <button onClick={() => updateCartQuantity(item.id || item._id, item.quantity + 1)} className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300">+</button>
                              <button onClick={() => removeFromCart(item.id || item._id)} className="ml-auto text-red-500 hover:text-red-700">🗑️</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

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

                      {(() => {
                        const minimumOrderValue = vendor?.deliverySettings?.minimumOrderValue || 0
                        const minCheck = checkMinimumOrder(cartTotal, minimumOrderValue)
                        if (!minCheck.meetsMinimum && minCheck.minimumOrder > 0) {
                          return (
                            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                              <p className="text-sm text-yellow-800 font-medium">
                                ⚠️ Add £{minCheck.shortfall.toFixed(2)} more to reach the minimum order of £{minCheck.minimumOrder.toFixed(2)}
                              </p>
                            </div>
                          )
                        }
                        return null
                      })()}
                    </div>

                    <button
                      onClick={() => {
                        const minimumOrderValue = vendor?.deliverySettings?.minimumOrderValue || 0
                        const minCheck = checkMinimumOrder(cartTotal, minimumOrderValue)
                        if (!minCheck.meetsMinimum && minCheck.minimumOrder > 0) {
                          alert(`Minimum order is £${minCheck.minimumOrder.toFixed(2)}. Please add £${minCheck.shortfall.toFixed(2)} more to your cart.`)
                          return
                        }
                        localStorage.setItem('afrimercato_cart', JSON.stringify(cart))
                        navigate('/checkout')
                      }}
                      disabled={(() => {
                        const minimumOrderValue = vendor?.deliverySettings?.minimumOrderValue || 0
                        const minCheck = checkMinimumOrder(cartTotal, minimumOrderValue)
                        return !minCheck.meetsMinimum && minCheck.minimumOrder > 0
                      })()}
                      className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${(() => {
                        const minimumOrderValue = vendor?.deliverySettings?.minimumOrderValue || 0
                        const minCheck = checkMinimumOrder(cartTotal, minimumOrderValue)
                        return !minCheck.meetsMinimum && minCheck.minimumOrder > 0 ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#00897B] hover:bg-[#00695C] text-white'
                      })()}`}
                    >
                      Proceed to Checkout
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <VendorSwitchModal
        isOpen={vendorSwitchModal.isOpen}
        onClose={() => setVendorSwitchModal({ ...vendorSwitchModal, isOpen: false })}
        currentStoreName={vendorSwitchModal.currentStoreName}
        newStoreName={vendorSwitchModal.newStoreName}
        onConfirmSwitch={handleVendorSwitch}
      />

      <ProductDetailModal
        product={selectedProductForDetail}
        isOpen={!!selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onAddToCart={async (prod, qty) => {
          const times = qty || 1
          for (let i = 0; i < times; i++) {
            await addToCart(prod)
          }
        }}
        vendor={vendor}
      />
    </div>
  )
}

function ProductCard({ product, onAddToCart, onOpenDetail, isDiscount }) {
  const [added, setAdded] = useState(false)
  const outOfStock = product.stock === 0 || product.inStock === false

  const handleAdd = (e) => {
    e.stopPropagation()
    if (outOfStock) return
    onAddToCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  const imageUrl = getProductImage(product)

  return (
    <motion.div
      whileHover={{ y: outOfStock ? 0 : -4 }}
      onClick={onOpenDetail}
      className={`group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between ${outOfStock ? 'opacity-60' : ''}`}
    >
      <div>
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-44 w-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-300"
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200' }}
          />

          {/* Quick Details Hover Badge */}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-white/95 text-[#1B4D3E] text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
              <Eye size={12} /> View Details
            </span>
          </div>

          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">Out of Stock</span>
            </div>
          )}
          {!outOfStock && (isDiscount || product.originalPrice) && (
            <span className="absolute top-3 left-3 bg-[#E53E3E] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">Sale</span>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span className="uppercase tracking-wider font-semibold truncate">{product.category || 'Groceries'}</span>
            <span className="flex items-center text-amber-500 font-bold gap-0.5">
              <Star size={10} className="fill-amber-400" />
              {product.rating || '4.8'}
            </span>
          </div>

          <h3 className="font-bold text-gray-900 text-sm mb-2 truncate group-hover:text-[#1B4D3E] transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">£{product.originalPrice.toFixed(2)}</span>
            )}
            <span className="font-black text-[#1B4D3E] text-lg">£{(product.price || 0).toFixed(2)}</span>
            {product.unit && (
              <span className="text-xs text-gray-400">/{product.unit}</span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pb-4">
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all ${outOfStock
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : added
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 hover:bg-[#1B4D3E] text-gray-800 hover:text-white'
            }`}
        >
          {outOfStock ? 'Unavailable' : added ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>
    </motion.div>
  )
}