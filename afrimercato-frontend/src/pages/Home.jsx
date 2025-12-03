import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPinIcon, MagnifyingGlassIcon, StarIcon, ClockIcon } from '@heroicons/react/24/solid'

export default function Home() {
  const navigate = useNavigate()
  const [location, setLocation] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Featured Stores (like Just Eat / Uber Eats)
  const featuredStores = [
    {
      id: 1,
      name: 'Green Valley Farms',
      category: 'Fresh Produce',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600',
      rating: 4.8,
      deliveryTime: '20-30 min',
      minOrder: '£10',
      tags: ['Vegetables', 'Fruits', 'Organic']
    },
    {
      id: 2,
      name: 'African Spice Market',
      category: 'African Groceries',
      image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600',
      rating: 4.9,
      deliveryTime: '25-35 min',
      minOrder: '£15',
      tags: ['Spices', 'Grains', 'Authentic']
    },
    {
      id: 3,
      name: 'Fresh Meat & Fish',
      category: 'Butcher & Seafood',
      image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600',
      rating: 4.7,
      deliveryTime: '30-40 min',
      minOrder: '£20',
      tags: ['Halal', 'Fresh Fish', 'Quality']
    },
    {
      id: 4,
      name: 'Daily Dairy',
      category: 'Dairy & Bakery',
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600',
      rating: 4.6,
      deliveryTime: '15-25 min',
      minOrder: '£8',
      tags: ['Milk', 'Cheese', 'Bread']
    },
    {
      id: 5,
      name: 'Tropical Fruits Hub',
      category: 'Exotic Fruits',
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600',
      rating: 4.8,
      deliveryTime: '20-30 min',
      minOrder: '£12',
      tags: ['Plantain', 'Mango', 'Yam']
    },
    {
      id: 6,
      name: 'Lagos Kitchen Store',
      category: 'Nigerian Foods',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600',
      rating: 4.9,
      deliveryTime: '25-35 min',
      minOrder: '£15',
      tags: ['Nigerian', 'Palm Oil', 'Cassava']
    }
  ]

  const handleLocationSearch = (e) => {
    e.preventDefault()
    if (location.trim()) {
      navigate(`/stores?location=${encodeURIComponent(location)}`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-green-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🛒</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Afri<span className="text-green-600">Mercato</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <a href="#stores" className="text-gray-600 hover:text-green-600">Browse Stores</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-green-600">How It Works</a>
              <Link to="/partner" className="text-gray-600 hover:text-green-600">Partner With Us</Link>
              <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">Sign In</Link>
              <Link to="/register?role=customer" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium">
                Sign Up
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <a href="#stores" className="block py-2 text-gray-600">Browse Stores</a>
              <a href="#how-it-works" className="block py-2 text-gray-600">How It Works</a>
              <Link to="/partner" className="block py-2 text-gray-600">Partner With Us</Link>
              <Link to="/login" className="block py-2 text-green-600 font-medium">Sign In</Link>
              <Link to="/register?role=customer" className="block mt-2 bg-green-600 text-white px-4 py-2 rounded-lg text-center font-medium">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Just Eat / Uber Eats Style */}
      <section className="relative bg-gradient-to-br from-green-600 via-green-700 to-yellow-500 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text & Search */}
            <div className="text-center lg:text-left">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              >
                African Online Store<br />
                <span className="text-yellow-300">In the United Kingdom</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-lg sm:text-xl text-white/95 mb-8 max-w-2xl mx-auto lg:mx-0"
              >
                Use existing infrastructure of African products you depend on delivered to your doorstep. Open stores, fresh products delivered to you whenever convenient.
              </motion.p>

              {/* Location Search Box */}
              <motion.form
                onSubmit={handleLocationSearch}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl p-3 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto lg:mx-0"
              >
                <div className="flex-1 flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                  <MapPinIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your location (e.g., London, Manchester)"
                    className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                  Find Store
                </button>
              </motion.form>

              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 text-white/90 flex items-center justify-center lg:justify-start gap-2"
              >
                <span className="text-2xl">👥</span>
                <span className="font-semibold">Trusted by: <span className="text-yellow-300">4,320+ Vendors</span></span>
              </motion.div>
            </div>

            {/* Right: Hero Image - Lady in Yellow */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block"
            >
              <img
                src="https://images.unsplash.com/photo-1567393537607-1e1a6df6763a?w=800"
                alt="Happy customer with groceries"
                className="rounded-3xl shadow-2xl w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Categories */}
      <section className="py-8 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { icon: '🥬', name: 'Vegetables', color: 'bg-green-100 text-green-700' },
              { icon: '🍌', name: 'Fruits', color: 'bg-yellow-100 text-yellow-700' },
              { icon: '🥩', name: 'Meat & Fish', color: 'bg-red-100 text-red-700' },
              { icon: '🥛', name: 'Dairy', color: 'bg-blue-100 text-blue-700' },
              { icon: '🌶️', name: 'Spices', color: 'bg-orange-100 text-orange-700' },
              { icon: '🌾', name: 'Grains', color: 'bg-amber-100 text-amber-700' }
            ].map((cat, i) => (
              <button
                key={i}
                className={`${cat.color} px-6 py-3 rounded-xl font-semibold whitespace-nowrap flex items-center gap-2 hover:scale-105 transition-transform`}
              >
                <span className="text-2xl">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Browse Nearby / Top Stores */}
      <section id="stores" className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Browse Nearby
              </h2>
              <p className="text-gray-600">
                Popular stores in your area
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold">
                Top Stores
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200">
                Featured Stores
              </button>
            </div>
          </div>

          {/* Store Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStores.map((store) => (
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
                  <p className="text-sm text-gray-600 mb-3">{store.category}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {store.tags.slice(0, 3).map((tag, i) => (
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

          {/* View More */}
          <div className="text-center mt-10">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg">
              View All Stores
            </button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-gradient-to-br from-green-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              How It Works
            </h2>
            <p className="text-lg text-gray-600">
              Get fresh African groceries delivered in 3 simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { num: 1, icon: '🔍', title: 'Find Stores Near You', desc: 'Enter your location and browse stores in your area' },
              { num: 2, icon: '🛒', title: 'Add to Cart', desc: 'Choose products from multiple vendors in one order' },
              { num: 3, icon: '🚚', title: 'Fast Delivery', desc: 'Get your groceries delivered same-day' }
            ].map((step) => (
              <motion.div key={step.num} className="text-center" whileHover={{ y: -5 }}>
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl">{step.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner With Us CTA */}
      <section className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-green-600 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Are You a Food Vendor?
          </h2>
          <p className="text-lg text-gray-800 mb-8">
            Join 4,320+ vendors already selling on AfriMercato. Reach thousands of customers and grow your business online.
          </p>
          <Link
            to="/partner"
            className="inline-block bg-gray-900 text-white hover:bg-gray-800 px-10 py-4 rounded-xl font-bold shadow-2xl text-lg"
          >
            Partner With Us →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-bold mb-4">AfriMercato</h4>
              <p className="text-sm">African groceries delivered to your door across the UK.</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">For Customers</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#stores" className="hover:text-yellow-400">Browse Stores</a></li>
                <li><a href="#how-it-works" className="hover:text-yellow-400">How It Works</a></li>
                <li><Link to="/register?role=customer" className="hover:text-yellow-400">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">For Partners</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/partner" className="hover:text-yellow-400">Become a Vendor</Link></li>
                <li><Link to="/register?role=rider" className="hover:text-yellow-400">Become a Rider</Link></li>
                <li><Link to="/register?role=picker" className="hover:text-yellow-400">Become a Picker</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-yellow-400">About Us</a></li>
                <li><a href="#" className="hover:text-yellow-400">Contact</a></li>
                <li><a href="#" className="hover:text-yellow-400">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2025 AfriMercato. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
