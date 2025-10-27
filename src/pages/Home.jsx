import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [productCount, setProductCount] = useState(0)
  const [vendorCount, setVendorCount] = useState(0)
  const [customerCount, setCustomerCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Countdown animation for stats
  useEffect(() => {
    const productTarget = 523
    const vendorTarget = 54
    const customerTarget = 1247

    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps

      setProductCount(Math.floor(productTarget * progress))
      setVendorCount(Math.floor(vendorTarget * progress))
      setCustomerCount(Math.floor(customerTarget * progress))

      if (currentStep >= steps) {
        clearInterval(timer)
        setProductCount(productTarget)
        setVendorCount(vendorTarget)
        setCustomerCount(customerTarget)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [])

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // 18 Featured products with store names
  const featuredProducts = [
    { id: 1, name: 'Fresh Tomatoes', price: '€2.99/kg', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', category: 'Vegetables', store: 'Green Valley Farms' },
    { id: 2, name: 'Organic Bananas', price: '€1.49/bunch', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400', category: 'Fruits', store: 'Fresh Fruit Hub' },
    { id: 3, name: 'Red Onions', price: '€1.99/kg', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400', category: 'Vegetables', store: 'Dublin Organic' },
    { id: 4, name: 'Fresh Peppers', price: '€3.49/kg', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400', category: 'Vegetables', store: 'Green Valley Farms' },
    { id: 5, name: 'Plantains', price: '€2.49/bunch', image: 'https://images.unsplash.com/photo-1603052875058-aa35f4c00db4?w=400', category: 'Fruits', store: 'African Food Store' },
    { id: 6, name: 'Yams', price: '€4.99/kg', image: 'https://images.unsplash.com/photo-1629192704398-63ccb7a37f15?w=400', category: 'Vegetables', store: 'African Food Store' },
    { id: 7, name: 'Fresh Spinach', price: '€2.29/bunch', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400', category: 'Vegetables', store: 'Dublin Organic' },
    { id: 8, name: 'Oranges', price: '€3.99/kg', image: 'https://images.unsplash.com/photo-1547514701-42782101795e?w=400', category: 'Fruits', store: 'Fresh Fruit Hub' },
    { id: 9, name: 'Cassava', price: '€3.49/kg', image: 'https://images.unsplash.com/photo-1601312073643-7e34d1c04e3b?w=400', category: 'Vegetables', store: 'African Food Store' },
    { id: 10, name: 'Pineapples', price: '€2.99/each', image: 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=400', category: 'Fruits', store: 'Fresh Fruit Hub' },
    { id: 11, name: 'Sweet Potatoes', price: '€2.79/kg', image: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?w=400', category: 'Vegetables', store: 'Green Valley Farms' },
    { id: 12, name: 'Mangoes', price: '€4.99/kg', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400', category: 'Fruits', store: 'Fresh Fruit Hub' },
    { id: 13, name: 'Green Beans', price: '€3.29/kg', image: 'https://images.unsplash.com/photo-1594638618426-33d9000c55e0?w=400', category: 'Vegetables', store: 'Dublin Organic' },
    { id: 14, name: 'Watermelons', price: '€5.99/each', image: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?w=400', category: 'Fruits', store: 'Fresh Fruit Hub' },
    { id: 15, name: 'Carrots', price: '€1.89/kg', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400', category: 'Vegetables', store: 'Green Valley Farms' },
    { id: 16, name: 'Papayas', price: '€3.49/each', image: 'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=400', category: 'Fruits', store: 'African Food Store' },
    { id: 17, name: 'Okra', price: '€2.99/kg', image: 'https://images.unsplash.com/photo-1597840925104-2ac6b1941e3d?w=400', category: 'Vegetables', store: 'African Food Store' },
    { id: 18, name: 'Avocados', price: '€4.49/kg', image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400', category: 'Fruits', store: 'Dublin Organic' }
  ]

  // Hero with people shopping photos
  const heroSlides = [
    {
      title: 'Fresh African Groceries Delivered',
      subtitle: 'Support local vendors, enjoy authentic flavors',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200',
      cta: 'Shop Now',
      link: '#products'
    },
    {
      title: 'Shop From Dublin\'s Best',
      subtitle: 'Quality produce from trusted vendors',
      image: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=1200',
      cta: 'Browse Products',
      link: '#products'
    },
    {
      title: 'Join Our Community',
      subtitle: 'Over 1000 happy customers served',
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200',
      cta: 'Get Started',
      link: '#products'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-First Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Afri<span className="text-green-600">mercato</span>
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#products" className="text-gray-600 hover:text-green-600">Products</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-green-600">How It Works</a>
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">Sign In</Link>
              <Link to="/register" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium">
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <a href="#products" className="block py-2 text-gray-600">Products</a>
              <a href="#how-it-works" className="block py-2 text-gray-600">How It Works</a>
              <Link to="/login" className="block py-2 text-green-600 font-medium">Sign In</Link>
              <Link to="/register" className="block mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-center font-medium">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Carousel - Mobile Optimized */}
      <section className="relative h-[350px] sm:h-[450px] lg:h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10"></div>
            <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-4 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-xl"
                >
                  <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-base sm:text-xl text-white/95 mb-4 sm:mb-6">
                    {slide.subtitle}
                  </p>
                  <a
                    href={slide.link}
                    className="inline-block bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-6 sm:px-8 py-3 rounded-lg font-bold text-sm sm:text-base shadow-xl"
                  >
                    {slide.cta}
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full ${index === currentSlide ? 'bg-yellow-400 w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      </section>

      {/* Animated Stats - Countdown */}
      <section className="py-8 sm:py-10 bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600">
                {productCount}+
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Products</div>
            </motion.div>
            <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600">
                {vendorCount}+
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Vendors</div>
            </motion.div>
            <motion.div className="text-center" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600">
                {customerCount}+
              </div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Customers</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products - 18 Products with Store Names */}
      <section id="products" className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
              Fresh Products Daily
            </h2>
            <p className="text-sm sm:text-lg text-gray-600">
              Browse from {productCount}+ fresh products
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden"
              >
                <div className="aspect-square relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <div className="absolute top-1 left-1 bg-yellow-400 text-gray-900 px-2 py-0.5 rounded text-xs font-bold">
                    {product.category}
                  </div>
                </div>
                <div className="p-2 sm:p-3">
                  <div className="text-xs text-green-600 font-semibold mb-1 flex items-center truncate">
                    <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span className="truncate">{product.store}</span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-bold text-green-600">
                      {product.price}
                    </span>
                    <button className="bg-green-600 hover:bg-green-700 text-white p-1.5 rounded-lg">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="#products"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
            >
              View All {productCount}+ Products
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-10 sm:py-16 bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
              How It Works
            </h2>
            <p className="text-sm sm:text-lg text-gray-600">
              Get groceries in 3 simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { num: 1, title: 'Browse', desc: 'Search from 500+ products', color: 'from-green-500 to-green-600' },
              { num: 2, title: 'Order', desc: 'Secure checkout with card', color: 'from-yellow-400 to-yellow-500' },
              { num: 3, title: 'Delivered', desc: 'Track in real-time', color: 'from-green-600 to-green-700' }
            ].map((step) => (
              <motion.div key={step.num} className="text-center" whileHover={{ y: -5 }}>
                <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <span className="text-3xl font-bold text-white">{step.num}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Join Section - Yellow & Green Only */}
      <section id="careers" className="py-10 sm:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
              Join Afrimercato
            </h2>
            <p className="text-sm sm:text-lg text-gray-600">
              Multiple ways to join us
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Vendor - Green */}
            <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl shadow-xl p-6 text-white">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">For Vendors</h3>
              <p className="text-sm text-white/90 mb-4">Sell products online</p>
              <Link to="/login" className="block w-full bg-white text-green-700 text-center px-4 py-2.5 rounded-xl font-bold">
                Start Selling →
              </Link>
            </motion.div>

            {/* Customer - Yellow */}
            <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl shadow-xl p-6">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">For Customers</h3>
              <p className="text-sm text-gray-900 mb-4">Shop fresh groceries</p>
              <a href="#products" className="block w-full bg-gray-900 text-white text-center px-4 py-2.5 rounded-xl font-bold">
                Start Shopping →
              </a>
            </motion.div>

            {/* Picker - Green */}
            <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-green-600 to-green-800 rounded-2xl shadow-xl p-6 text-white">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">For Pickers</h3>
              <p className="text-sm text-white/90 mb-4">Work flexible hours</p>
              <Link to="/register?role=picker" className="block w-full bg-yellow-400 text-gray-900 text-center px-4 py-2.5 rounded-xl font-bold">
                Become Picker →
              </Link>
            </motion.div>

            {/* Rider - Yellow */}
            <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-2xl shadow-xl p-6">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">For Riders</h3>
              <p className="text-sm text-white/90 mb-4">Earn by delivering</p>
              <Link to="/register?role=rider" className="block w-full bg-white text-yellow-700 text-center px-4 py-2.5 rounded-xl font-bold">
                Become Rider →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA - Yellow & Green */}
      <section className="bg-gradient-to-r from-green-600 via-green-700 to-yellow-500 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-lg text-white/95 mb-6">
            Join {customerCount}+ happy customers today
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#products" className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-10 py-3 rounded-xl font-bold shadow-2xl">
              Shop Now
            </a>
            <Link to="/login" className="bg-white text-green-700 hover:bg-gray-100 px-10 py-3 rounded-xl font-bold shadow-2xl">
              Sell on Afrimercato
            </Link>
          </div>
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Afrimercato</h4>
              <p className="text-xs">Your African marketplace in Dublin</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Customers</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#products" className="hover:text-yellow-400">Products</a></li>
                <li><a href="#how-it-works" className="hover:text-yellow-400">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Partners</h4>
              <ul className="space-y-2 text-xs">
                <li><Link to="/login" className="hover:text-yellow-400">Sell</Link></li>
                <li><Link to="/register?role=picker" className="hover:text-yellow-400">Picker</Link></li>
                <li><Link to="/register?role=rider" className="hover:text-yellow-400">Rider</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 text-sm">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-yellow-400">About</a></li>
                <li><a href="#" className="hover:text-yellow-400">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 pt-6 text-center text-xs">
            <p>&copy; 2025 Afrimercato. Dublin, Ireland.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
