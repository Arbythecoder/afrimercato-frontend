import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    setLoading(true)

    const result = await login(formData.email, formData.password)

    if (result.success) {
      // Check if user was redirected from checkout
      const checkoutRedirect = localStorage.getItem('checkout_redirect')

      if (checkoutRedirect === 'true') {
        localStorage.removeItem('checkout_redirect')
        navigate('/checkout')
        return
      }

      // Route based on user role
      const userRole = result.user?.role || result.user?.primaryRole || 'customer'

      switch (userRole) {
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
      setError(result.message || 'Login failed. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden relative bg-gradient-to-br from-afri-green to-afri-green-dark"
      style={{
        backgroundSize: '400% 400%',
        animation: 'gradient 15s ease infinite',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{ 
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 60%)',
          animation: 'pulse 4s ease-in-out infinite',
         }} />
      </div>

      <motion.div 
        className="max-w-md w-full relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo/Brand */}
        <motion.div 
          className="text-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1 
            className="text-5xl font-bold text-white mb-2"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            Afrimercato
          </motion.h1>
          <motion.p
            className="text-afri-yellow text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Fresh African Groceries
          </motion.p>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-2"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            Welcome Back
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-6"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            Sign in as Customer, Vendor, Rider, or Picker
          </motion.p>

          {error && (
            <motion.div 
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                placeholder="your.email@example.com"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="flex items-center">
                <motion.input
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 text-afri-green focus:ring-afri-green border-gray-300 rounded"
                />
                <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>

              <motion.div whileHover={{ scale: 1.05 }}>
                <Link to="/forgot-password" className="text-sm text-afri-green hover:text-afri-green-dark font-medium">
                  Forgot password?
                </Link>
              </motion.div>
            </motion.div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-afri-green to-afri-green-dark hover:from-afri-green-dark hover:to-afri-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afri-green font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Sign In'
              )}
            </motion.button>
          </form>

          <motion.div 
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">New to Afrimercato?</span>
              </div>
            </div>

            <motion.div 
              className="mt-6 text-center"
              whileHover={{ scale: 1.05 }}
            >
              <Link
                to="/register"
                className="text-afri-green hover:text-afri-green-dark font-semibold text-base inline-flex items-center"
              >
                Create an account
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="ml-2"
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="mt-8 text-center text-sm text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          © 2025 Afrimercato. Fresh African Groceries Delivered.
        </motion.p>
      </motion.div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
          100% { background-position: 0% 50% }
        }
        @keyframes pulse {
          0% { opacity: 0.4 }
          50% { opacity: 0.6 }
          100% { opacity: 0.4 }
        }
      `}</style>
    </div>
  )
}

export default Login
