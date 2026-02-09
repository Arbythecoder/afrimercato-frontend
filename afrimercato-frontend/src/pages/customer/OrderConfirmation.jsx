import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { orderAPI } from '../../services/api'

function OrderConfirmation() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setError(null)
        const response = await orderAPI.getById(orderId)
        if (response.success) {
          setOrder(response.data)
        } else {
          setError(response.message || 'Failed to load order')
        }
      } catch (error) {
        console.error('Error fetching order:', error)
        // Check for timeout error
        if (error.message === 'Request timed out') {
          setError('Request timed out. Please check your connection and try again.')
        } else if (error.code === 'AUTH_EXPIRED') {
          setError('Session expired. Please log in again.')
          setTimeout(() => navigate('/login'), 2000)
        } else {
          setError(error.message || 'Failed to load order. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading order...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Order</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Try Again
            </button>
            <Link
              to="/my-dashboard"
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              My Orders
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-4">😔</p>
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link to="/stores" className="text-green-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛒</span>
              <span className="text-xl font-bold text-gray-900">Afrimercato</span>
            </div>
            <Link to="/stores" className="text-gray-600 hover:text-gray-900">
              Continue Shopping
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        {/* Success Message */}
        <div className="max-w-2xl mx-auto text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We've received your order and will start preparing it shortly.
          </p>
          <p className="text-sm text-gray-500">
            Order Number: <span className="font-bold text-gray-900">{order.orderNumber}</span>
          </p>
        </div>

        {/* Order Details */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Details</h2>

            {/* Delivery Address */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-gray-700 mb-2">Delivery Address</h3>
              <p className="text-gray-600">
                {order.deliveryAddress?.fullName}<br />
                {order.deliveryAddress?.phone}<br />
                {order.deliveryAddress?.street}<br />
                {order.deliveryAddress?.city}, {order.deliveryAddress?.postalCode}
              </p>
            </div>

            {/* Items */}
            <div className="mb-6 pb-6 border-b">
              <h3 className="font-semibold text-gray-700 mb-3">Order Items</h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p className="text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">
                      £{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal</span>
                <span>£{order.pricing?.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Delivery Fee</span>
                <span>£{order.pricing?.deliveryFee?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
                <span>Total</span>
                <span>£{order.pricing?.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900 capitalize">
                  {order.status?.replace('-', ' ')}
                </p>
                <p className="text-sm text-gray-600">
                  Your order is being prepared
                </p>
              </div>
            </div>
            <Link
              to={`/track-order/${order._id}`}
              className="mt-4 block w-full text-center bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Track Your Order
            </Link>
          </div>

          {/* Payment Info */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment</h2>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">
                {order.payment?.method === 'card' ? '💳 Card Payment' : '💵 Cash on Delivery'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                order.payment?.status === 'paid'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {order.payment?.status?.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/stores"
              className="bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold text-center hover:bg-gray-300 transition"
            >
              Continue Shopping
            </Link>
            <Link
              to="/my-dashboard"
              className="bg-green-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-green-700 transition"
            >
              View All Orders
            </Link>
          </div>
        </div>

        {/* What's Next */}
        <div className="max-w-2xl mx-auto mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-3">What happens next?</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span>1️⃣</span>
              <span>Your order will be picked and packed by our team</span>
            </li>
            <li className="flex items-start gap-2">
              <span>2️⃣</span>
              <span>A rider will be assigned to deliver your order</span>
            </li>
            <li className="flex items-start gap-2">
              <span>3️⃣</span>
              <span>You'll receive real-time updates on delivery status</span>
            </li>
            <li className="flex items-start gap-2">
              <span>4️⃣</span>
              <span>Estimated delivery time: 20-40 minutes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
