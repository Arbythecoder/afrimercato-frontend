import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cartAPI, checkoutAPI, getVendorById, getVendorBySlug } from '../../services/api'
import { getCartVendorInfo, checkMinimumOrder } from '../../utils/cartVendorLock'

// Helper: check if user has customer role (supports both roles array and role string)
const isCustomerRole = (user) => {
  if (!user) return false
  if (Array.isArray(user.roles) && user.roles.includes('customer')) return true
  if (user.role === 'customer') return true
  if (user.primaryRole === 'customer') return true
  return false
}

function Checkout() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  // Stable reference to avoid re-triggering effects when user object ref changes
  const isCustomer = useMemo(() => isCustomerRole(user), [user?.role, user?.roles, user?.primaryRole])

  const [cart, setCart] = useState([])
  const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Confirm
  const [loading, setLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(true)
  const [vendor, setVendor] = useState(null)

  // Repurchase state — non-blocking, optional UX
  const [repurchaseItems, setRepurchaseItems] = useState([])
  const [repurchaseLoading, setRepurchaseLoading] = useState(false)
  const [repurchaseError, setRepurchaseError] = useState(false)
  const [emailVerificationError, setEmailVerificationError] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)

  // Address form
  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    postcode: '',
    instructions: ''
  })

  // Payment form
  const [payment, setPayment] = useState({
    method: 'card',
    saveCard: false
  })

  // Load cart — critical path, has fallback to localStorage
  useEffect(() => {
    const loadCart = async () => {
      setCartLoading(true)

      if (!isAuthenticated) {
        localStorage.setItem('checkout_redirect', 'true')
        navigate('/login')
        return
      }

      if (!isCustomer) {
        setCartLoading(false)
        return
      }

      try {
        const response = await cartAPI.get()
        if (response.success && response.data && response.data.length > 0) {
          const backendCart = response.data.map(item => ({
            _id: item.productId?.toString() || item.productId,
            name: item.name || 'Product',
            price: item.price,
            quantity: item.quantity,
            unit: item.unit || 'piece',
            images: item.images,
            vendor: item.vendor
          }))
          setCart(backendCart)
        } else {
          const savedCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
          if (savedCart.length > 0) {
            setCart(savedCart)
          } else {
            navigate('/stores')
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Cart load failed, using localStorage fallback:', error.message)
        }
        const savedCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
        if (savedCart.length > 0) {
          setCart(savedCart)
        } else {
          navigate('/stores')
        }
      } finally {
        setCartLoading(false)
      }
    }

    loadCart()
  }, [isAuthenticated, isCustomer])

  // Load repurchase items — NON-BLOCKING, never delays checkout
  useEffect(() => {
    if (!isAuthenticated || !isCustomer) return

    const loadRepurchaseItems = async () => {
      setRepurchaseLoading(true)
      setRepurchaseError(false)

      try {
        const response = await checkoutAPI.getRepurchaseItems()
        if (response.success && response.data && response.data.length > 0) {
          // Extract unique items from last 3 orders, limit to 5 items
          const itemMap = new Map()
          for (const order of response.data.slice(0, 3)) {
            for (const item of (order.items || [])) {
              const key = item.product?._id || item.product
              if (!itemMap.has(key) && itemMap.size < 5) {
                itemMap.set(key, {
                  _id: key,
                  name: item.name || item.product?.name || 'Product',
                  price: item.price,
                  quantity: 1,
                  unit: item.unit || 'piece',
                  images: item.product?.images
                })
              }
            }
          }
          const items = Array.from(itemMap.values())
          setRepurchaseItems(items)
          // Cache to localStorage for fallback
          try {
            localStorage.setItem('afrimercato_last_order_items', JSON.stringify(items))
          } catch { /* localStorage full — ignore */ }
        }
      } catch (error) {
        // Backend failed — try localStorage fallback
        setRepurchaseError(true)
        try {
          const cached = JSON.parse(localStorage.getItem('afrimercato_last_order_items') || '[]')
          if (cached.length > 0) {
            setRepurchaseItems(cached.slice(0, 5))
          }
        } catch { /* corrupt cache — ignore */ }

        if (import.meta.env.DEV) {
          console.warn('Repurchase load failed (non-blocking):', error.message)
        }
      } finally {
        setRepurchaseLoading(false)
      }
    }

    loadRepurchaseItems()
  }, [isAuthenticated, isCustomer])

  // Fetch vendor data when cart loads
  useEffect(() => {
    const fetchVendorData = async () => {
      if (cart.length === 0) {
        setVendor(null)
        return
      }

      const vendorInfo = getCartVendorInfo(cart)
      if (!vendorInfo || !vendorInfo.vendorId) return

      try {
        let response;
        const vendorId = vendorInfo.vendorId;

        // Check if vendorId is a MongoDB ObjectId (24 hex characters)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(vendorId);

        if (isObjectId) {
          // Direct ObjectId lookup
          response = await getVendorById(vendorId);
        } else {
          // Try slug resolution first
          try {
            response = await getVendorBySlug(vendorId);
          } catch (slugError) {
            // Fallback to direct lookup for backward compatibility
            response = await getVendorById(vendorId);
          }
        }

        if (response.success && response.data) {
          setVendor(response.data)
        } else if (response.storeName) {
          setVendor(response)
        }
      } catch (error) {
        console.log('Vendor fetch failed:', error.message)
      }
    }

    fetchVendorData()
  }, [cart])

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = cartTotal >= 50 ? 0 : 5
  const total = cartTotal + deliveryFee

  const handleAddressSubmit = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const repeatPurchaseFrequency = localStorage.getItem('repeatPurchaseFrequency')

      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit || 'piece'
        })),
        deliveryAddress: address,
        payment: {
          method: payment.method,
          status: 'pending'
        },
        pricing: {
          subtotal: cartTotal,
          deliveryFee,
          total
        },
        ...(repeatPurchaseFrequency && { repeatPurchaseFrequency })
      }

      // Use centralized API with 8s timeout + token refresh
      const data = await checkoutAPI.initializePayment(orderData)

      if (data.success) {
        // Cache current order items for future repurchase
        try {
          localStorage.setItem('afrimercato_last_order_items', JSON.stringify(
            cart.slice(0, 5).map(item => ({
              _id: item._id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              unit: item.unit,
              images: item.images
            }))
          ))
        } catch { /* localStorage full — ignore */ }

        localStorage.removeItem('afrimercato_cart')
        localStorage.removeItem('repeatPurchaseFrequency')

        if (payment.method === 'card' && data.data.payment?.url) {
          localStorage.setItem('pending_order_id', data.data.order._id)
          window.location.href = data.data.payment.url
        } else {
          navigate(`/order-confirmation/${data.data.order._id}`)
        }
      } else {
        alert('Order failed: ' + (data.message || 'Unknown error'))
      }
    } catch (error) {
      const msg = error.message || 'Failed to place order'
      
      // Check for email verification error (kept for backward compatibility, though middleware removed)
      if (error.response?.data?.errorCode === 'EMAIL_NOT_VERIFIED') {
        setEmailVerificationError(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      // HOTFIX: Better error messages for auth/permission issues
      if (error.status === 401) {
        alert('Your session has expired. Please log in again.')
        localStorage.setItem('checkout_redirect', 'true')
        navigate('/login')
        return
      }

      if (error.status === 403) {
        const errorCode = error.data?.errorCode || error.data?.code
        if (errorCode === 'EMAIL_NOT_VERIFIED') {
          setEmailVerificationError(true)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          alert('Access denied. Please ensure you have a customer account and are logged in correctly.')
        }
        return
      }
      
      if (msg.includes('timed out')) {
        alert('The server is taking longer than expected. Please try again.')
      } else {
        alert('Failed to place order. Please try again.')
      }
      if (import.meta.env.DEV) {
        console.error('Order error:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResendingEmail(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success) {
        alert('Verification email sent! Please check your inbox.')
      } else {
        alert(data.message || 'Failed to send verification email')
      }
    } catch (error) {
      alert('Failed to resend verification email. Please try again.')
    } finally {
      setResendingEmail(false)
    }
  }

  const handleAddRepurchaseItem = (item) => {
    setCart(prev => {
      const exists = prev.find(c => c._id === item._id)
      if (exists) {
        return prev.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  // Role mismatch — vendor/rider/picker trying to shop
  if (isAuthenticated && !isCustomer) {
    const effectiveRole = user?.role || (Array.isArray(user?.roles) && user.roles[0]) || 'unknown'
    const currentRole = effectiveRole === 'vendor' ? 'Vendor'
      : effectiveRole === 'rider' ? 'Rider'
      : effectiveRole === 'picker' ? 'Picker'
      : effectiveRole === 'admin' ? 'Admin'
      : 'Non-Customer'
    const roleIcon = effectiveRole === 'vendor' ? '🏪'
      : effectiveRole === 'rider' ? '🏍️'
      : effectiveRole === 'picker' ? '📦' : '⚠️'

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#E0F2F1] flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">{roleIcon}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Wrong Account Type</h1>
            <p className="text-gray-600 mb-1">You're currently signed in as a</p>
            <p className="text-lg font-bold text-[#00897B] mb-4">{currentRole}</p>
            <p className="text-gray-500 text-sm mb-6">
              Shopping and checkout are only available for <strong>Customer</strong> accounts.
              Please sign in with a Customer account to continue.
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('afrimercato_token')
                navigate('/login')
              }}
              className="w-full bg-[#00897B] hover:bg-[#00695C] text-white py-3 px-6 rounded-xl font-bold text-lg transition-all mb-3"
            >
              Sign in as Customer
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full text-gray-500 hover:text-gray-700 py-2 font-medium transition-colors"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (cart.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🛒</span>
              <span className="text-base sm:text-xl font-bold text-gray-900">Afrimercato Checkout</span>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              ⬅️ <span className="hidden sm:inline ml-1">Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Email Verification Error Banner */}
      {emailVerificationError && (
        <div className="bg-red-50 border-b-4 border-red-500">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-1">Email Verification Required</h3>
                <p className="text-red-800 mb-3">Please verify your email address before placing an order. Check your inbox for the verification link.</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                  >
                    {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                  <button
                    onClick={() => setEmailVerificationError(false)}
                    className="bg-white border border-red-300 hover:bg-red-50 text-red-800 px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left: Checkout Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="hidden sm:flex items-center justify-between mb-8">
              <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className="ml-2 font-semibold">Delivery</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
              <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <span className="ml-2 font-semibold">Payment</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
              <div className={`flex items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="ml-2 font-semibold">Confirm</span>
              </div>
            </div>

            {/* Step 1: Delivery Address */}
            {step === 1 && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Delivery Address</h2>
                <form onSubmit={handleAddressSubmit}>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                        placeholder="+44 7700 900000"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                      placeholder="123 High Street"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="address-level2"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                        placeholder="London"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Postcode *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="postal-code"
                        value={address.postcode}
                        onChange={(e) => setAddress({ ...address, postcode: e.target.value.toUpperCase() })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                        placeholder="SW1A 1AA"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      value={address.instructions}
                      onChange={(e) => setAddress({ ...address, instructions: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                      rows="3"
                      placeholder="e.g., Leave at door, Ring doorbell, etc."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transition min-h-[44px]"
                  >
                    Continue to Payment →
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Method</h2>
                <div className="space-y-4 mb-6">
                  <div
                    className="border-2 border-green-600 bg-green-50 rounded-lg p-4"
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={true}
                        readOnly
                        className="mr-3"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">💳 Card Payment</div>
                        <div className="text-sm text-gray-600">Pay securely with Stripe</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition min-h-[44px]"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold hover:shadow-lg transition min-h-[44px]"
                  >
                    Review Order →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirm Order */}
            {step === 3 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Confirm</h2>

                {/* Delivery Details */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
                  <p className="text-gray-700">
                    {address.fullName}<br />
                    {address.phone}<br />
                    {address.street}<br />
                    {address.city}, {address.postcode}
                  </p>
                  {address.instructions && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Instructions:</strong> {address.instructions}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-green-600 text-sm font-semibold mt-2 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Payment Method */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                  <p className="text-gray-700">
                    💳 Card Payment (Stripe)
                  </p>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-green-600 text-sm font-semibold mt-2 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                  {cart.map((item) => (
                    <div key={item._id} className="flex justify-between py-2">
                      <span className="text-gray-700">{item.name} x {item.quantity}</span>
                      <span className="font-semibold">£{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Repurchase Options Display */}
                {(() => {
                  const savedFrequency = localStorage.getItem('repeatPurchaseFrequency');
                  return savedFrequency ? (
                    <div className="mb-6 pb-6 border-b">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>🔄</span>
                        Auto-Reorder Selected
                      </h3>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
                        <p className="text-gray-700">
                          This order will repeat <span className="font-bold capitalize">{savedFrequency}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          You can cancel anytime from your order history
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('repeatPurchaseFrequency');
                          window.location.reload();
                        }}
                        className="text-green-600 text-sm font-semibold mt-2 hover:underline"
                      >
                        Remove auto-reorder
                      </button>
                    </div>
                  ) : (
                    <div className="mb-6 pb-6 border-b">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>🔄</span>
                        Auto-Reorder
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Want this order to repeat automatically? Go back to cart to set a schedule.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/cart')}
                        className="text-green-600 text-sm font-semibold hover:underline"
                      >
                        ← Back to cart to set up
                      </button>
                    </div>
                  );
                })()}

                {/* Repurchase from previous orders — ALWAYS VISIBLE for better UX */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🛍️</span>
                    Buy Again (Quick Add)
                  </h3>
                  {repurchaseLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      Loading your previous items...
                    </div>
                  ) : repurchaseItems.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 mb-2">
                        Items from your recent orders - click to add to this order:
                      </p>
                      {repurchaseItems.slice(0, 5).map((item) => {
                        const alreadyInCart = cart.some(c => c._id === item._id)
                        return (
                          <div key={item._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">£{item.price?.toFixed(2)} / {item.unit || 'piece'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddRepurchaseItem(item)}
                              disabled={alreadyInCart}
                              className={`text-xs font-semibold px-4 py-2 rounded-lg transition ${
                                alreadyInCart
                                  ? 'bg-gray-200 text-gray-400 cursor-default'
                                  : 'bg-green-600 text-white hover:bg-green-700'
                              }`}
                            >
                              {alreadyInCart ? '✓ In Cart' : '+ Add'}
                            </button>
                          </div>
                        )
                      })}
                      {repurchaseError && (
                        <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                          <span>⚠️</span>
                          Showing cached items (working offline)
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 py-2 bg-gray-50 rounded-lg px-3">
                      💡 No previous orders yet. Items from past orders will appear here for quick reordering.
                    </p>
                  )}
                </div>

                <form onSubmit={handlePlaceOrder}>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition min-h-[44px]"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || (() => {
                        const minimumOrderValue = vendor?.deliverySettings?.minimumOrderValue || 0
                        const minCheck = checkMinimumOrder(cartTotal, minimumOrderValue)
                        return !minCheck.meetsMinimum && minCheck.minimumOrder > 0
                      })()}
                      className={`flex-1 py-3 rounded-lg font-bold transition min-h-[44px] ${
                        (() => {
                          const minimumOrderValue = vendor?.deliverySettings?.minimumOrderValue || 0
                          const minCheck = checkMinimumOrder(cartTotal, minimumOrderValue)
                          if (!minCheck.meetsMinimum && minCheck.minimumOrder > 0) {
                            return 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }
                          return loading 
                            ? 'bg-gradient-to-r from-green-600 to-green-700 text-white opacity-50'
                            : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg'
                        })()
                      }`}
                    >
                      {loading ? 'Placing Order...' : (() => {
                        const minimumOrderValue = vendor?.deliverySettings?.minimumOrderValue || 0
                        const minCheck = checkMinimumOrder(cartTotal, minimumOrderValue)
                        if (!minCheck.meetsMinimum && minCheck.minimumOrder > 0) {
                          return `Add £${minCheck.shortfall.toFixed(2)} more`
                        }
                        return `Place Order (£${total.toFixed(2)})`
                      })()}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => {
                  const imageUrl = item.images?.[0]
                    ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url)
                    : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80';
                  return (
                  <div key={item._id} className="flex gap-3">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      loading="lazy"
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80'
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-green-600">£{item.price.toFixed(2)}</p>
                    </div>
                  </div>
                  )
                })}
              </div>

              {/* Pricing */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>£{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Delivery Fee</span>
                  <span>{deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}</span>
                </div>
                {cartTotal >= 50 && (
                  <p className="text-xs text-green-600">🎉 Free delivery on orders over £50</p>
                )}
                
                {/* Minimum Order Check */}
                {(() => {
                  const minimumOrderValue = vendor?.deliverySettings?.minimumOrderValue || 0
                  const minCheck = checkMinimumOrder(cartTotal, minimumOrderValue)
                  
                  if (!minCheck.meetsMinimum && minCheck.minimumOrder > 0) {
                    return (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
                        <p className="text-sm text-red-800 font-semibold">
                          ⚠️ Minimum order: £{minCheck.minimumOrder.toFixed(2)}
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          Add £{minCheck.shortfall.toFixed(2)} more items to place order
                        </p>
                      </div>
                    )
                  } else if (minCheck.minimumOrder > 0) {
                    return (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                        <p className="text-xs text-green-700">
                          ✓ Minimum order requirement met
                        </p>
                      </div>
                    )
                  }
                  return null
                })()}
                
                <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-green-800">
                  🔒 Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
