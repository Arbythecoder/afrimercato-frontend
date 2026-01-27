import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Get API Base URL
const API_BASE_URL = (() => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  return isLocalhost ? 'http://localhost:5000' : 'https://afrimercato-backend.fly.dev'
})()

function Checkout() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [cart, setCart] = useState([])
  const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Confirm
  const [loading, setLoading] = useState(false)

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

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
    setCart(savedCart)

    if (savedCart.length === 0) {
      navigate('/stores')
    }

    // If not logged in, redirect to login
    if (!isAuthenticated) {
      localStorage.setItem('checkout_redirect', 'true')
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

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
      // Get repeat purchase frequency from localStorage
      const repeatPurchaseFrequency = localStorage.getItem('repeatPurchaseFrequency')

      // Prepare order data
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
        // Include repeat purchase frequency if selected
        ...(repeatPurchaseFrequency && { repeatPurchaseFrequency })
      }

      // Call checkout API
      const response = await fetch(`${API_BASE_URL}/api/checkout/payment/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('afrimercato_token')}`
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()

      if (data.success) {
        // Clear cart and repeat purchase preference
        localStorage.removeItem('afrimercato_cart')
        localStorage.removeItem('repeatPurchaseFrequency')

        // If card payment, redirect to Stripe Checkout
        if (payment.method === 'card' && data.data.payment?.url) {
          // Store order ID for verification callback
          localStorage.setItem('pending_order_id', data.data.order._id)
          // Redirect to Stripe Checkout page
          window.location.href = data.data.payment.url
        } else {
          // For cash on delivery, redirect to order confirmation
          navigate(`/order-confirmation/${data.data.order._id}`)
        }
      } else {
        alert('Order failed: ' + data.message)
      }
    } catch (error) {
      console.error('Order error:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
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
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              ⬅️ <span className="hidden sm:inline ml-1">Back</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left: Checkout Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps - Hidden on mobile for single-page experience */}
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
                <form onSubmit={() => setStep(3)}>
                  <div className="space-y-4 mb-6">
                    <div
                      onClick={() => setPayment({ ...payment, method: 'card' })}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        payment.method === 'card' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={payment.method === 'card'}
                          onChange={() => setPayment({ ...payment, method: 'card' })}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">💳 Card Payment</div>
                          <div className="text-sm text-gray-600">Pay securely with Paystack</div>
                        </div>
                      </div>
                    </div>

                    <div
                      onClick={() => setPayment({ ...payment, method: 'cash' })}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                        payment.method === 'cash' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          checked={payment.method === 'cash'}
                          onChange={() => setPayment({ ...payment, method: 'cash' })}
                          className="mr-3"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">💵 Cash on Delivery</div>
                          <div className="text-sm text-gray-600">Pay when you receive your order</div>
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
                </form>
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
                    {payment.method === 'card' ? '💳 Card Payment (Paystack)' : '💵 Cash on Delivery'}
                  </p>
                  <button
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
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold hover:shadow-lg transition disabled:opacity-50 min-h-[44px]"
                    >
                      {loading ? 'Placing Order...' : `Place Order (£${total.toFixed(2)})`}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-3">
                    <img
                      src={item.images?.[0]?.url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80'}
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
                ))}
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
                <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-green-800">
                  🔒 Secure checkout powered by Paystack
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
