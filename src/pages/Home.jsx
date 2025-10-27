import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Featured products with real Unsplash images
  const featuredProducts = [
    {
      id: 1,
      name: 'Fresh Tomatoes',
      price: '€2.99/kg',
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&h=600&fit=crop',
      category: 'Vegetables'
    },
    {
      id: 2,
      name: 'Organic Bananas',
      price: '€1.49/bunch',
      image: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&h=600&fit=crop',
      category: 'Fruits'
    },
    {
      id: 3,
      name: 'Red Onions',
      price: '€1.99/kg',
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&h=600&fit=crop',
      category: 'Vegetables'
    },
    {
      id: 4,
      name: 'Fresh Peppers',
      price: '€3.49/kg',
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&h=600&fit=crop',
      category: 'Vegetables'
    },
    {
      id: 5,
      name: 'Plantains',
      price: '€2.49/bunch',
      image: 'https://images.unsplash.com/photo-1603052875058-aa35f4c00db4?w=800&h=600&fit=crop',
      category: 'Fruits'
    },
    {
      id: 6,
      name: 'Yams',
      price: '€4.99/kg',
      image: 'https://images.unsplash.com/photo-1629192704398-63ccb7a37f15?w=800&h=600&fit=crop',
      category: 'Vegetables'
    }
  ]

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Hero carousel slides
  const heroSlides = [
    {
      title: 'Fresh African Groceries Delivered',
      subtitle: 'Get your favorite foods delivered in 30 minutes',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&h=600&fit=crop',
      cta: 'Browse Products',
      link: '#products'
    },
    {
      title: 'Quality You Can Trust',
      subtitle: '100% fresh produce from local vendors',
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&h=600&fit=crop',
      cta: 'Shop Now',
      link: '#products'
    },
    {
      title: 'Supporting Dublin Communities',
      subtitle: 'Connecting African vendors with customers',
      image: 'https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=1200&h=600&fit=crop',
      cta: 'Discover More',
      link: '#how-it-works'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile-Optimized Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg sm:text-xl">A</span>
              </div>
              <span className="text-lg sm:text-2xl font-bold text-gray-900">
                Afri<span className="text-green-600">mercato</span>
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#products" className="text-gray-600 hover:text-green-600 transition">
                Products
              </a>
              <a href="#how-it-works" className="text-gray-600 hover:text-green-600 transition">
                How It Works
              </a>
              <a href="#careers" className="text-gray-600 hover:text-green-600 transition">
                Work With Us
              </a>
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <Link
                to="/login"
                className="text-green-600 hover:text-green-700 font-medium transition text-sm lg:text-base"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-4 lg:px-6 py-2 rounded-lg font-medium transition text-sm lg:text-base"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Carousel */}
      <section className="relative h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-r from-green-600 to-green-800">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="absolute inset-0 bg-black/40 z-10"></div>
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="max-w-2xl"
                >
                  <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4 sm:mb-6">
                    {slide.title}
                  </h1>
                  <p className="text-lg sm:text-xl lg:text-2xl text-white/90 mb-6 sm:mb-8">
                    {slide.subtitle}
                  </p>
                  <a
                    href={slide.link}
                    className="inline-block bg-white text-green-700 hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition shadow-lg"
                  >
                    {slide.cta}
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-8 sm:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-4 sm:gap-8">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">500+</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">50+</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Vendors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600">1K+</div>
              <div className="text-xs sm:text-sm text-gray-600 mt-1">Customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - BROWSABLE WITHOUT LOGIN */}
      <section id="products" className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Fresh Products Daily
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Browse our selection of fresh African groceries
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition duration-300"
                  />
                </div>
                <div className="p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">
                    {product.category}
                  </div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-bold text-gray-900">
                      {product.price}
                    </span>
                    <button className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link
              to="/register?role=customer"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition shadow-lg"
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto">
              Get your favorite African groceries in 3 simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Browse Products</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Search from hundreds of fresh African groceries from local vendors
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Place Order</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Add items to cart and checkout securely with card or Paystack
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <span className="text-2xl sm:text-3xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Fast Delivery</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Track your order in real-time and get it delivered in 30-120 minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join As Section - CORRECT BUTTON TEXT */}
      <section id="careers" className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Join Afrimercato
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">
              Multiple ways to be part of our growing community
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Vendors */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Vendors</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Sell your products online and reach thousands of customers
              </p>
              <Link
                to="/register?role=vendor"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center px-4 py-3 rounded-lg font-semibold transition text-sm sm:text-base"
              >
                Start Selling
              </Link>
            </motion.div>

            {/* Customers */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Customers</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Shop fresh African groceries with fast delivery to your door
              </p>
              <Link
                to="/register?role=customer"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-3 rounded-lg font-semibold transition text-sm sm:text-base"
              >
                Start Shopping
              </Link>
            </motion.div>

            {/* Pickers */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Pickers</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Work flexible hours picking and packing orders at stores
              </p>
              <Link
                to="/register?role=picker"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center px-4 py-3 rounded-lg font-semibold transition text-sm sm:text-base"
              >
                Become a Picker
              </Link>
            </motion.div>

            {/* Riders */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg p-6 sm:p-8 hover:shadow-2xl transition"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Riders</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Earn money delivering orders with flexible scheduling
              </p>
              <Link
                to="/register?role=rider"
                className="block w-full bg-orange-600 hover:bg-orange-700 text-white text-center px-4 py-3 rounded-lg font-semibold transition text-sm sm:text-base"
              >
                Become a Rider
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-800 py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-6 sm:mb-8">
            Join thousands of happy customers and vendors on Afrimercato today
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              to="/register?role=customer"
              className="bg-white text-green-700 hover:bg-gray-100 px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition shadow-lg"
            >
              Shop Now
            </Link>
            <Link
              to="/register?role=vendor"
              className="bg-green-900 text-white hover:bg-green-950 px-6 sm:px-10 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg transition shadow-lg"
            >
              Sell on Afrimercato
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Afrimercato</h4>
              <p className="text-xs sm:text-sm">
                Your African marketplace in Dublin and across the UK
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">For Customers</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#products" className="hover:text-white transition">Browse Products</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#" className="hover:text-white transition">Track Orders</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">For Partners</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><Link to="/register?role=vendor" className="hover:text-white transition">Sell on Afrimercato</Link></li>
                <li><Link to="/register?role=picker" className="hover:text-white transition">Become a Picker</Link></li>
                <li><Link to="/register?role=rider" className="hover:text-white transition">Become a Rider</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>&copy; 2025 Afrimercato. All rights reserved. African marketplace for Dublin, Ireland and UK.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
