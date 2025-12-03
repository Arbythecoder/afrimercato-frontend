/**
 * AFRIMERCATO - Vendor Storefront Page
 * Matches client's design from one.jpg and five.jpg exactly
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getVendorById, getVendorProductsByVendorId } from '../../services/api'

// Sample categories with images - African focused
const CATEGORIES = [
  { name: 'Fresh Produce', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=300', items: 45, price: '£2' },
  { name: 'Spices & Seasonings', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300', items: 60, price: '£3' },
  { name: 'Grains & Flour', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300', items: 35, price: '£4' },
  { name: 'Dried Fish & Meat', image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=300', items: 28, price: '£8' }
]

// Sample products - Authentic African groceries
const SAMPLE_PRODUCTS = [
  { id: 1, name: 'Fresh Plantain (Ripe)', category: 'Fresh Produce', price: 3.99, originalPrice: 4.50, rating: 5, image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=300' },
  { id: 2, name: 'Yam Tuber 2kg', category: 'Fresh Produce', price: 8.99, originalPrice: 10.00, rating: 5, image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300' },
  { id: 3, name: 'Egusi (Ground) 500g', category: 'Spices & Seasonings', price: 7.99, originalPrice: 9.00, rating: 5, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300' },
  { id: 4, name: 'Palm Oil 1L', category: 'Cooking Oils', price: 6.99, originalPrice: 8.00, rating: 4, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300' },
  { id: 5, name: 'Ogbono (Ground) 400g', category: 'Spices & Seasonings', price: 8.99, originalPrice: 10.00, rating: 5, image: 'https://images.unsplash.com/photo-1599909533681-74d488b9dddf?w=300' },
  { id: 6, name: 'Stockfish (Medium)', category: 'Dried Fish & Meat', price: 12.99, originalPrice: 15.00, rating: 4, image: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=300' },
  { id: 7, name: 'Crayfish (Ground) 200g', category: 'Dried Fish & Meat', price: 5.99, originalPrice: 7.00, rating: 5, image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=300' },
  { id: 8, name: 'Garri (White) 2kg', category: 'Grains & Flour', price: 4.99, originalPrice: 6.00, rating: 5, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300' },
  { id: 9, name: 'Scotch Bonnet Peppers', category: 'Fresh Produce', price: 2.99, originalPrice: 3.50, rating: 4, image: 'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=300' },
  { id: 10, name: 'Jollof Rice Spice Mix', category: 'Spices & Seasonings', price: 4.99, originalPrice: 5.50, rating: 5, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300' },
  { id: 11, name: 'Fufu Flour (Pounded Yam)', category: 'Grains & Flour', price: 5.99, originalPrice: 7.00, rating: 5, image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300' },
  { id: 12, name: 'Suya Spice Mix 100g', category: 'Spices & Seasonings', price: 3.99, originalPrice: 4.50, rating: 5, image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300' }
]

export default function ClientVendorStorefront() {
  const { vendorId } = useParams()
  const navigate = useNavigate()

  const [vendor, setVendor] = useState(null)
  const [products, setProducts] = useState(SAMPLE_PRODUCTS)
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [countdown, setCountdown] = useState({ hours: 10, minutes: 56, seconds: 21 })

  // Category tabs - African focused
  const categoryTabs = ['All', 'Fresh Produce', 'Spices & Seasonings', 'Grains & Flour', 'Dried Fish & Meat', 'Cooking Oils']

  useEffect(() => {
    fetchVendorAndProducts()
  }, [vendorId])

  // Countdown timer
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

      // Try to fetch real vendor from API
      const vendorResponse = await getVendorById(vendorId)

      if (vendorResponse.success && vendorResponse.data) {
        setVendor(vendorResponse.data)
      } else if (vendorResponse.storeName) {
        setVendor(vendorResponse)
      } else {
        // Check if we have store data passed via navigation state
        const storedVendor = sessionStorage.getItem(`vendor_${vendorId}`)
        if (storedVendor) {
          setVendor(JSON.parse(storedVendor))
        } else {
          // Show error state - don't hardcode to a specific store
          setVendor({
            storeName: 'Store Not Found',
            businessName: 'Store Not Found',
            phone: 'N/A',
            deliveryTime: '30 mins',
            notFound: true
          })
        }
      }

      // Try to fetch real products
      const productsResponse = await getVendorProductsByVendorId(vendorId)
      if (productsResponse.data?.products?.length > 0) {
        setProducts(productsResponse.data.products)
      } else if (productsResponse.products?.length > 0) {
        setProducts(productsResponse.products)
      }
    } catch (error) {
      console.log('Fetching vendor data:', error.message)
      // Check if we have store data in session storage
      const storedVendor = sessionStorage.getItem(`vendor_${vendorId}`)
      if (storedVendor) {
        setVendor(JSON.parse(storedVendor))
      } else {
        setVendor({
          storeName: 'Store Unavailable',
          businessName: 'Store Unavailable',
          phone: 'Contact support',
          deliveryTime: '30 mins',
          notFound: true
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id || item._id === product._id)
    if (existingItem) {
      setCart(cart.map(item =>
        (item.id === product.id || item._id === product._id)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId && item._id !== productId))
    } else {
      setCart(cart.map(item =>
        (item.id === productId || item._id === productId) ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId && item._id !== productId))
  }

  const cartTotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0)
  const cartItemCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
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
      {/* Header - Exact client design */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side */}
            <div className="flex items-center gap-6">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2">
                <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                  <path d="M8 8L32 32M32 8L8 32" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                <span className="text-lg font-bold text-gray-900">Afrimercato</span>
              </Link>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Account
              </Link>
              <button
                onClick={() => setShowCart(true)}
                className="relative flex items-center gap-2 bg-[#00897B] hover:bg-[#00695C] text-white px-4 py-2 rounded-lg font-semibold transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
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

          {/* Sub Header */}
          <div className="flex items-center justify-between py-2 border-t text-sm">
            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1 text-[#00897B] font-medium hover:underline"
              >
                ← Go Back
              </button>
              <span className="text-gray-600">
                Shopping Method: <span className="text-gray-900 font-medium">In-Shopping, Delivery</span>
              </span>
            </div>
            <div className="flex items-center gap-6 text-gray-600">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Deliveries in {vendor?.deliveryTime || '20 mins'}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                {vendor?.phone || '+44 - 2071 - 234567'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Exact client design */}
      <section className="bg-gradient-to-r from-[#E8F5E9] to-[#FFF8E1] py-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Side */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2"
              >
                {vendor?.storeName || vendor?.businessName || 'African Store'}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl text-[#00897B] font-semibold mb-4"
              >
                Got You.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-gray-600 mb-6"
              >
                Save up to 60% off on your first order
              </motion.p>

              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email Address"
                  className="flex-1 max-w-xs px-4 py-3 rounded-lg border border-gray-300 focus:border-[#00897B] outline-none"
                />
                <button className="bg-[#00897B] hover:bg-[#00695C] text-white px-6 py-3 rounded-lg font-semibold transition-all">
                  Find Store
                </button>
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600"
                alt="Fresh produce"
                className="w-full h-64 object-cover rounded-2xl shadow-xl"
              />
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8F5E9] rounded-full blur-3xl opacity-50"></div>
      </section>

      {/* Category Navigation */}
      <div className="bg-white border-b sticky top-[104px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Category Tabs */}
            <div className="flex gap-6 overflow-x-auto">
              {categoryTabs.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap font-medium pb-2 transition-colors ${
                    selectedCategory === cat
                      ? 'text-[#00897B] border-b-2 border-[#00897B]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 min-w-[200px]">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent outline-none flex-1 text-gray-900"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Featured Categories */}
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, index) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-4 shadow-md hover:shadow-lg cursor-pointer transition-all text-center"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-24 h-24 mx-auto object-cover rounded-xl mb-3"
                />
                <p className="text-xs text-gray-500 mb-1">{cat.items} Items in Store</p>
                <h3 className="font-bold text-gray-900 mb-1">{cat.name}</h3>
                <p className="text-sm text-gray-600">From {cat.price}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Daily Best Sales */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Daily Best Sales</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredProducts.slice(0, 10).map((product, index) => (
              <ProductCard
                key={product.id || product._id || index}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        </div>

        {/* Promotional Banners */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-r from-[#00897B] to-[#00695C] text-white p-6 rounded-2xl relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200"
              alt="Fresh produce"
              className="absolute right-0 bottom-0 w-32 h-32 object-cover opacity-30"
            />
            <h3 className="text-xl font-bold mb-2 relative z-10">Free delivery</h3>
            <p className="mb-4 relative z-10">over £50</p>
            <button className="bg-white text-[#00897B] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition relative z-10">
              Shop Now →
            </button>
          </div>

          <div className="bg-gradient-to-r from-[#F5A623] to-[#FF9800] text-white p-6 rounded-2xl relative overflow-hidden">
            <span className="absolute top-4 right-4 bg-white/20 px-2 py-1 rounded text-sm font-medium">60% off</span>
            <img
              src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=200"
              alt="Organic food"
              className="absolute right-0 bottom-0 w-32 h-32 object-cover opacity-30"
            />
            <h3 className="text-xl font-bold mb-2 relative z-10">Organic Food</h3>
            <p className="mb-4 relative z-10">Save up to 60% off on your first order</p>
            <button className="bg-white text-[#F5A623] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition relative z-10">
              Order Now →
            </button>
          </div>

          <div className="bg-gradient-to-r from-[#00897B] to-[#00695C] text-white p-6 rounded-2xl relative overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=200"
              alt="Free delivery"
              className="absolute right-0 bottom-0 w-32 h-32 object-cover opacity-30"
            />
            <h3 className="text-xl font-bold mb-2 relative z-10">Free delivery</h3>
            <p className="mb-4 relative z-10">Shop £50 get free delivery</p>
            <button className="bg-white text-[#00897B] px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition relative z-10">
              Shop Now →
            </button>
          </div>
        </div>

        {/* Discounts Sales with Countdown */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Discounts Sales</h2>
            <div className="flex items-center gap-2 bg-[#00897B] text-white px-4 py-2 rounded-lg">
              <span className="text-sm">Expires in:</span>
              <span className="font-bold">
                {String(countdown.hours).padStart(2, '0')}:
                {String(countdown.minutes).padStart(2, '0')}:
                {String(countdown.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {filteredProducts.slice(0, 10).map((product, index) => (
              <ProductCard
                key={`discount-${product.id || product._id || index}`}
                product={product}
                onAddToCart={() => addToCart(product)}
                isDiscount
              />
            ))}
          </div>
        </div>
      </div>

      {/* Join Waitlist Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[#F5A623]">
          <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 100" fill="none" preserveAspectRatio="none">
            <path d="M0 50C240 100 480 0 720 50C960 100 1200 0 1440 50V0H0V50Z" fill="#F8F8F8"/>
          </svg>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center py-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Join the waitlist for Our App
          </h2>
          <p className="text-gray-700 mb-6 max-w-xl mx-auto">
            Exciting things are coming your way! Be the first to experience the ultimate shopping
            convenience with our upcoming app.
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter email address"
              className="flex-1 px-5 py-3 rounded-full border-2 border-gray-200 focus:border-[#00897B] outline-none"
            />
            <button
              type="submit"
              className="bg-[#00897B] hover:bg-[#00695C] text-white px-8 py-3 rounded-full font-bold transition-all"
            >
              Join List
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
            <div className="lg:col-span-2">
              <h3 className="text-xl font-bold mb-4">You've Got Questions?<br/>Do Reach Out!</h3>
              <p className="text-gray-400 text-sm mb-2">Email: info@afrimercato.co.uk</p>
              <p className="text-gray-400 text-sm">Location: Washington Ave, Manchester, UK</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/" className="hover:text-yellow-500">Home</Link></li>
                <li><Link to="/stores" className="hover:text-yellow-500">Stores</Link></li>
                <li><Link to="/partner" className="hover:text-yellow-500">Partner</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Cities</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/stores?location=London" className="hover:text-yellow-500">London</Link></li>
                <li><Link to="/stores?location=Manchester" className="hover:text-yellow-500">Manchester</Link></li>
                <li><Link to="/stores?location=Birmingham" className="hover:text-yellow-500">Birmingham</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick stores</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><span className="hover:text-yellow-500 cursor-pointer">Supermart</span></li>
                <li><span className="hover:text-yellow-500 cursor-pointer">Shoprite</span></li>
                <li><span className="hover:text-yellow-500 cursor-pointer">Buka</span></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
            <p>© 2024 Afrimercato</p>
            <p>Designed By thedesignpygi</p>
            <p>All Right Reserved.</p>
          </div>
        </div>
      </footer>

      {/* Shopping Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />

            {/* Cart Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Shopping Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

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
                            src={item.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{item.name}</h3>
                            <p className="text-sm text-gray-600">£{(item.price || 0).toFixed(2)}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <button
                                onClick={() => updateCartQuantity(item.id || item._id, item.quantity - 1)}
                                className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300"
                              >
                                -
                              </button>
                              <span className="font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.id || item._id, item.quantity + 1)}
                                className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300"
                              >
                                +
                              </button>
                              <button
                                onClick={() => removeFromCart(item.id || item._id)}
                                className="ml-auto text-red-500 hover:text-red-700"
                              >
                                🗑️
                              </button>
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
                    </div>

                    <button
                      onClick={() => {
                        localStorage.setItem('cart', JSON.stringify(cart))
                        navigate('/checkout')
                      }}
                      className="w-full bg-[#00897B] hover:bg-[#00695C] text-white py-4 rounded-lg font-bold text-lg transition-all"
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
    </div>
  )
}

// Product Card Component
function ProductCard({ product, onAddToCart, isDiscount }) {
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    onAddToCart()
    setAdded(true)
    setTimeout(() => setAdded(false), 1000)
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all overflow-hidden"
    >
      <div className="relative h-32 bg-gray-100">
        <img
          src={product.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'
          }}
        />
        {isDiscount && (
          <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">
            Sale
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-xs text-gray-500 mb-1">{product.category || 'Vegetables'}</p>
        <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{product.name}</h3>

        {/* Rating */}
        <div className="flex items-center gap-0.5 mb-2">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={`text-xs ${i < (product.rating || 4) ? 'text-yellow-400' : 'text-gray-300'}`}>
              ★
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              £{product.originalPrice.toFixed(2)}
            </span>
          )}
          <span className="font-bold text-[#00B207]">
            £{(product.price || 18.99).toFixed(2)}
          </span>
        </div>

        {/* Add Button */}
        <div className="flex items-center gap-2">
          <button className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded transition">
            <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
          <button
            onClick={handleAdd}
            className={`flex-1 py-1.5 rounded text-sm font-semibold transition ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-[#00897B] hover:bg-[#00695C] text-white'
            }`}
          >
            {added ? '✓ Added' : 'Add'}
          </button>
        </div>
      </div>
    </motion.div>
  )
}
