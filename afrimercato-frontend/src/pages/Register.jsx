import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { HERO_IMAGES } from '../utils/defaultImages'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const result = await register(formData)

    if (result.success) {
      // Check if user was redirected from checkout
      const checkoutRedirect = localStorage.getItem('checkout_redirect')

      if (checkoutRedirect === 'true') {
        localStorage.removeItem('checkout_redirect')
        navigate('/checkout')
        return
      }

      // Route based on user role
      switch (formData.role) {
        case 'vendor':
          navigate('/dashboard')
          break
        case 'rider':
          navigate('/rider/dashboard')
          break
        case 'picker':
          navigate('/picker/dashboard')
          break
        case 'customer':
        default:
          navigate('/')
          break
      }
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  const getRoleContent = () => {
    switch(formData.role) {
      case 'vendor':
        return {
          title: 'Start Selling Today',
          subtitle: 'Join thousands of vendors on Afrimercato',
          benefit1: '📊 Real-time sales analytics',
          benefit2: '🚀 Instant order notifications',
          benefit3: '💰 Low commission rates',
          image: HERO_IMAGES.store1
        }
      case 'rider':
        return {
          title: 'Become a Delivery Partner',
          subtitle: 'Deliver groceries and earn on your schedule',
          benefit1: '⏰ Flexible working hours',
          benefit2: '💵 Competitive earnings',
          benefit3: '📱 Easy-to-use rider app',
          image: HERO_IMAGES.hero2
        }
      case 'picker':
        return {
          title: 'Join Our Fulfillment Team',
          subtitle: 'Help fulfill orders from local stores',
          benefit1: '🏪 Work with top vendors',
          benefit2: '📦 Simple picking process',
          benefit3: '💪 Great team environment',
          image: HERO_IMAGES.store2
        }
      default: // customer
        return {
          title: 'Join Our Community',
          subtitle: 'Start shopping for fresh African groceries',
          benefit1: '🥬 Fresh produce daily',
          benefit2: '🚚 Fast delivery',
          benefit3: '🎁 Exclusive deals',
          image: HERO_IMAGES.hero1
        }
    }
  }

  const roleContent = getRoleContent()

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Hero Content */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-afri-green via-afri-green-dark to-green-900 p-12 flex-col justify-between relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-6xl font-bold text-white mb-2">Afrimercato</h1>
            <p className="text-afri-yellow text-xl font-semibold">{roleContent.title}</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 space-y-6"
          >
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <svg className="w-6 h-6 text-afri-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-white text-lg font-medium">{roleContent.benefit1}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <svg className="w-6 h-6 text-afri-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-white text-lg font-medium">{roleContent.benefit2}</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
                <svg className="w-6 h-6 text-afri-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-white text-lg font-medium">{roleContent.benefit3}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Hero Image */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="relative z-10"
        >
          <img
            src={roleContent.image}
            alt={roleContent.title}
            className="rounded-2xl shadow-2xl w-full h-64 object-cover border-4 border-white/20"
          />
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="relative z-10 text-white/70 text-sm"
        >
          © 2025 Afrimercato. Fresh African Groceries Delivered.
        </motion.p>
      </motion.div>

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <motion.div variants={itemVariants} className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold text-afri-green mb-2">Afrimercato</h1>
            <p className="text-gray-600">{roleContent.title}</p>
          </motion.div>

          {/* Register Card */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
          <p className="text-gray-600 mb-6">
            {formData.role === 'vendor' && 'Join thousands of vendors on Afrimercato'}
            {formData.role === 'customer' && 'Start shopping for fresh African groceries'}
            {formData.role === 'rider' && 'Deliver groceries and earn on your schedule'}
            {formData.role === 'picker' && 'Help fulfill orders from local stores'}
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                I want to register as
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition bg-white"
              >
                <option value="customer">Customer - Shop for groceries</option>
                <option value="vendor">Vendor - Sell products</option>
                <option value="rider">Rider - Deliver orders</option>
                <option value="picker">Picker - Fulfill orders</option>
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                placeholder="+44 7700 900000"
              />
              <p className="text-xs text-gray-500 mt-1">Used for OTP verification & order updates</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 mt-1 text-afri-green focus:ring-afri-green border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                I agree to the{' '}
                <Link to="/terms" className="text-afri-green hover:text-afri-green-dark font-medium">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-afri-green hover:text-afri-green-dark font-medium">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-afri-green to-afri-green-dark hover:from-afri-green-dark hover:to-afri-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afri-green font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-afri-green hover:text-afri-green-dark font-semibold text-base"
              >
                Sign in here →
              </Link>
            </div>
          </div>
        </motion.div>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-600 lg:hidden">
            © 2025 Afrimercato. Fresh African Groceries Delivered.
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default Register
