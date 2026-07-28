import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion';
import { useNoIndex } from '../hooks/useNoIndex';
import { Eye, EyeOff } from 'lucide-react';

function Login() {
  useNoIndex()
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const successMessage = location.state?.message || ''
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // NEW: 2FA States
  const [show2FA, setShow2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState('')

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

    const checkoutRedirect = localStorage.getItem('checkout_redirect') === 'true'
    const redirectAfterLogin = localStorage.getItem('redirect_after_login') || null

    // Pass the twoFactorCode as the 3rd argument (it will be empty on the first attempt)
    const result = await login(formData.email, formData.password, twoFactorCode)

    if (!result.success) {
      // THE FIX: Intercept the 2FA requirement from the backend!
      if (result.requires2FA) {
        setShow2FA(true)
        setLoading(false)
        return
      }

      const msg = result.message || 'Login failed. Please try again.'
      if (msg.includes('timed out') || msg.includes('timeout')) {
        setError('Server is waking up — please try again in a few seconds.')
      } else {
        setError(msg)
      }
      setLoading(false)
      return
    }

    // Check if user is a customer
    const userRole = result.user?.role || result.user?.primaryRole || 'customer'
    const userRoles = result.user?.roles || [userRole]
    const isCustomer = userRole === 'customer' || userRoles.includes('customer')

    // Successful login — handle checkout redirect for customers only
    if (checkoutRedirect && isCustomer) {
      localStorage.removeItem('checkout_redirect')
      if (redirectAfterLogin) localStorage.removeItem('redirect_after_login')
      navigate('/checkout')
      return
    }

    // Handle custom redirect if present
    if (redirectAfterLogin) {
      localStorage.removeItem('redirect_after_login')
      navigate(redirectAfterLogin)
      return
    }

    const approvalStatus = result.user?.approvalStatus

    if (userRole === 'vendor' && approvalStatus === 'rejected') {
      setError('Your vendor account application was rejected. Please contact support.')
      setLoading(false)
      return
    }

    switch (userRole) {
      case 'admin':
        navigate('/admin/dashboard')
        break
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
        navigate('/my-dashboard')
        break
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.1) 0%, transparent 60%)',
          animation: 'pulse 4s ease-in-out infinite',
        }} />
      </div>

      <motion.div
        className="max-w-md w-full relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="text-center mb-8"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/">
            <motion.h1
              className="text-5xl font-bold text-white mb-2 hover:opacity-80 transition-opacity"
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              Afrimercato
            </motion.h1>
          </Link>
          <motion.p
            className="text-afri-yellow text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Fresh African Groceries
          </motion.p>
        </motion.div>

        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-5 sm:p-8 overflow-hidden"
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
            {show2FA ? 'Two-Factor Auth' : 'Welcome Back'}
          </motion.h2>
          <motion.p
            className="text-gray-600 mb-6"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {show2FA
              ? 'Enter the 6-digit code from your authenticator app to secure your admin session.'
              : 'Sign in as Customer, Vendor, Rider, or Picker'}
          </motion.p>

          {successMessage && !show2FA && (
            <motion.div
              className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-green-700 text-sm font-medium">✓ {successMessage}</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-red-700 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* AnimatePresence allows smooth toggling between Email/Password and 2FA input */}
            <AnimatePresence mode="wait">
              {!show2FA ? (
                <motion.div
                  key="standard-login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
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
                  </div>

                  <div>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        className="h-4 w-4 text-afri-green focus:ring-afri-green border-gray-300 rounded"
                      />
                      <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>
                    <Link to="/forgot-password" className="text-sm text-afri-green hover:text-afri-green-dark font-medium transition-transform hover:scale-105">
                      Forgot password?
                    </Link>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="2fa-login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div>
                    <label htmlFor="twoFactorCode" className="block text-sm font-medium text-gray-700 mb-2">
                      Authentication Code
                    </label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      id="twoFactorCode"
                      name="twoFactorCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength="6"
                      required
                      value={twoFactorCode}
                      onChange={(e) => {
                        setTwoFactorCode(e.target.value);
                        setError('');
                      }}
                      className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
                      placeholder="000000"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShow2FA(false);
                      setTwoFactorCode('');
                      setError('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 underline w-full text-center"
                  >
                    Use a different account
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-afri-green to-afri-green-dark hover:from-afri-green-dark hover:to-afri-green focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-afri-green font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {show2FA ? 'Verifying...' : 'Signing in...'}
                </span>
              ) : (
                show2FA ? 'Verify Code' : 'Sign In'
              )}
            </motion.button>
          </form>

          {/* Social Login Buttons - Hidden during 2FA */}
          {!show2FA && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center pointer-events-none">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm pointer-events-none">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => {
                    // Check if we need to redirect to checkout after Google Login
                    const checkoutPending = localStorage.getItem('checkout_redirect') === 'true'
                    const customRedirect = localStorage.getItem('redirect_after_login')

                    let redirectPath = ''
                    if (checkoutPending) {
                      redirectPath = '?redirect=/checkout'
                    } else if (customRedirect) {
                      redirectPath = `?redirect=${customRedirect}`
                    }

                    // Append the redirect path to the backend URL
                    const baseUrl = import.meta.env.VITE_API_URL || 'https://afrimercato-backend.onrender.com'
                    window.location.href = `${baseUrl}/api/auth/google${redirectPath}`
                  }}
                  className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer pointer-events-auto"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </motion.div>
          )}

          {/* Create Account Link - Hidden during 2FA */}
          {!show2FA && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
            >
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">New to Afrimercato?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/register"
                  className="text-afri-green hover:text-afri-green-dark font-semibold text-base inline-flex items-center transition-transform hover:scale-105"
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
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.p
          className="mt-8 text-center text-sm text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          © 2026 Afrimercato. Fresh African Groceries Delivered.
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