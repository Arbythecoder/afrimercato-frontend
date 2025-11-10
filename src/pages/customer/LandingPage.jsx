import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { HERO_IMAGES } from '../../utils/defaultImages'

function LandingPage() {
  const navigate = useNavigate()
  const [searchData, setSearchData] = useState({
    location: '',
    priceRange: 'all',
    shoppingMethod: 'all'
  })

  const handleFindStores = () => {
    if (!searchData.location.trim()) {
      alert('Please enter a location (postcode, city, or store name)')
      return
    }

    // Navigate to store marketplace with search params
    navigate(`/stores?location=${encodeURIComponent(searchData.location)}&price=${searchData.priceRange}&method=${searchData.shoppingMethod}`)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleFindStores()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFB300] via-[#FFCA28] to-[#FFA726]">
      {/* Header/Nav */}
      <header className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-4xl">🛒</span>
            <h1 className="text-3xl font-bold text-white">AfriMercato</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-white font-medium">
            <a href="#delivery" className="hover:text-gray-100 transition">Delivery</a>
            <a href="#stores" className="hover:text-gray-100 transition">Stores</a>
            <a href="#about" className="hover:text-gray-100 transition">About us</a>
            <a href="#contact" className="hover:text-gray-100 transition">Contact us</a>
          </nav>

          {/* Sign Up Button */}
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-[#FFB300] px-6 py-2 rounded-lg font-semibold hover:shadow-lg transition flex items-center gap-2"
          >
            <span>👥</span>
            Sign Up
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left Side: Hero Content */}
          <div className="text-white space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              We Help With the Shopping and Bring it to your <span className="text-[#00897B]">"DoorStep"</span>
            </h2>

            <p className="text-lg md:text-xl text-white/90 max-w-xl">
              Experience the convenience of African and international groceries delivered right to your door.
              Browse local stores, shop fresh produce, and enjoy fast delivery across the UK.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                onClick={() => navigate('/partner')}
                className="bg-[#00897B] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#00695C] transition shadow-lg flex items-center gap-2"
              >
                🤝 Partner With Us
              </button>

              <button
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/30 transition flex items-center gap-2"
              >
                <span>▶️</span>
                Learn about us through video
              </button>
            </div>

            {/* Trust Indicator */}
            <div className="flex items-center gap-4 pt-6">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white"></div>
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white"></div>
              </div>
              <p className="text-white font-semibold">
                Trusted by <span className="text-2xl">4,320+</span> Vendors
              </p>
            </div>
          </div>

          {/* Right Side: Hero Image */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00897B]/20 to-transparent rounded-3xl"></div>
              <img
                src={HERO_IMAGES.main}
                alt="AfriMercato - Fresh African Groceries"
                className="rounded-3xl shadow-2xl w-full h-[500px] object-cover"
              />
            </div>
          </div>
        </div>

        {/* Search Bar Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">

            {/* Location Input */}
            <div className="md:col-span-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📍 Location
              </label>
              <input
                type="text"
                placeholder="Postcode, store name, location"
                value={searchData.location}
                onChange={(e) => setSearchData({...searchData, location: e.target.value})}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FFB300] focus:outline-none transition"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💷 Price Range
              </label>
              <select
                value={searchData.priceRange}
                onChange={(e) => setSearchData({...searchData, priceRange: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FFB300] focus:outline-none transition"
              >
                <option value="all">All Prices</option>
                <option value="budget">Budget Friendly (£)</option>
                <option value="mid">Mid Range (££)</option>
                <option value="premium">Premium (£££)</option>
              </select>
            </div>

            {/* Shopping Method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                🛒 Shopping Method
              </label>
              <select
                value={searchData.shoppingMethod}
                onChange={(e) => setSearchData({...searchData, shoppingMethod: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FFB300] focus:outline-none transition"
              >
                <option value="all">All Methods</option>
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
                <option value="in-shopping">In-Store Shopping</option>
              </select>
            </div>

            {/* Find Store Button */}
            <div className="flex items-end">
              <button
                onClick={handleFindStores}
                className="w-full bg-gradient-to-r from-[#FFB300] to-[#FFA726] text-white py-3 px-6 rounded-lg font-bold hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>🔍</span>
                Find Store
              </button>
            </div>
          </div>

          {/* Quick Location Suggestions */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Popular locations:</span>
            {['London', 'Birmingham', 'Manchester', 'Bristol', 'Leeds'].map((city) => (
              <button
                key={city}
                onClick={() => setSearchData({...searchData, location: city})}
                className="text-sm bg-gray-100 hover:bg-[#FFB300] hover:text-white px-3 py-1 rounded-full transition"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/10 backdrop-blur-sm py-16 mt-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-white text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto text-3xl">
                🛍️
              </div>
              <h3 className="text-xl font-bold">Wide Selection</h3>
              <p className="text-white/80">Browse from 4,320+ trusted African and international stores</p>
            </div>

            <div className="space-y-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto text-3xl">
                🇬🇧
              </div>
              <h3 className="text-xl font-bold">UK-Wide Coverage</h3>
              <p className="text-white/80">Available across all major UK cities and regions</p>
            </div>

            <div className="space-y-3">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto text-3xl">
                ⚡
              </div>
              <h3 className="text-xl font-bold">Fast Delivery</h3>
              <p className="text-white/80">Get your groceries delivered in as fast as 30 minutes</p>
            </div>
          </div>
        </div>
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

export default LandingPage
