import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { orderAPI } from '../../services/api'

function OrderTracking() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrderAndDelivery = async () => {
      try {
        setError(null)
        const response = await orderAPI.getById(orderId)
        if (response.success) {
          setOrder(response.data)
          // TODO: Fetch delivery data when available
          // setDelivery(response.data.delivery)
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

    fetchOrderAndDelivery()
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchOrderAndDelivery, 10000)
    return () => clearInterval(interval)
  }, [orderId, navigate])

  const getStatusStep = (status) => {
    const steps = {
      'pending': 1,
      'confirmed': 2,
      'picking': 3,
      'ready_for_pickup': 4,
      'out-for-delivery': 5,
      'delivered': 6
    }
    return steps[status] || 1
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading tracking info...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <p className="text-4xl mb-4">⚠️</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Tracking</h2>
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

  const currentStep = getStatusStep(order.status)

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
            <Link to="/my-dashboard" className="text-gray-600 hover:text-gray-900">
              My Orders
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Order Header */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Track Your Order
                </h1>
                <p className="text-gray-600">
                  Order #{order.orderNumber}
                </p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                order.status === 'delivered'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {order.status?.replace('-', ' ').toUpperCase()}
              </div>
            </div>

            {/* ETA */}
            {order.status !== 'delivered' && (
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🚚</span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Estimated Delivery Time
                    </p>
                    <p className="text-sm text-gray-600">
                      20-40 minutes from now
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Progress Timeline */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Progress</h2>

            <div className="space-y-6">
              {/* Step 1: Order Placed */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > 1 ? '✓' : '1'}
                  </div>
                  {currentStep > 1 && <div className="w-1 h-16 bg-green-600 mt-2"></div>}
                  {currentStep === 1 && <div className="w-1 h-16 bg-gray-200 mt-2"></div>}
                </div>
                <div className="flex-1 pb-6">
                  <h3 className="font-semibold text-gray-900">Order Placed</h3>
                  <p className="text-sm text-gray-600">Your order has been received</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Step 2: Confirmed */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > 2 ? '✓' : '2'}
                  </div>
                  {currentStep > 2 && <div className="w-1 h-16 bg-green-600 mt-2"></div>}
                  {currentStep <= 2 && <div className="w-1 h-16 bg-gray-200 mt-2"></div>}
                </div>
                <div className="flex-1 pb-6">
                  <h3 className="font-semibold text-gray-900">Order Confirmed</h3>
                  <p className="text-sm text-gray-600">Store is preparing your order</p>
                </div>
              </div>

              {/* Step 3: Picking */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > 3 ? '✓' : '3'}
                  </div>
                  {currentStep > 3 && <div className="w-1 h-16 bg-green-600 mt-2"></div>}
                  {currentStep <= 3 && <div className="w-1 h-16 bg-gray-200 mt-2"></div>}
                </div>
                <div className="flex-1 pb-6">
                  <h3 className="font-semibold text-gray-900">Picking Items</h3>
                  <p className="text-sm text-gray-600">Items are being picked from shelves</p>
                </div>
              </div>

              {/* Step 4: Ready for Pickup */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 4 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > 4 ? '✓' : '4'}
                  </div>
                  {currentStep > 4 && <div className="w-1 h-16 bg-green-600 mt-2"></div>}
                  {currentStep <= 4 && <div className="w-1 h-16 bg-gray-200 mt-2"></div>}
                </div>
                <div className="flex-1 pb-6">
                  <h3 className="font-semibold text-gray-900">Ready for Pickup</h3>
                  <p className="text-sm text-gray-600">Packed and waiting for rider</p>
                </div>
              </div>

              {/* Step 5: Out for Delivery */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 5 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > 5 ? '✓' : '5'}
                  </div>
                  {currentStep > 5 && <div className="w-1 h-16 bg-green-600 mt-2"></div>}
                  {currentStep <= 5 && <div className="w-1 h-16 bg-gray-200 mt-2"></div>}
                </div>
                <div className="flex-1 pb-6">
                  <h3 className="font-semibold text-gray-900">Out for Delivery</h3>
                  <p className="text-sm text-gray-600">Rider is on the way</p>
                  {delivery && (
                    <div className="mt-2 bg-blue-50 rounded p-2">
                      <p className="text-xs text-blue-700">
                        📍 Rider location updating in real-time
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 6: Delivered */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    currentStep >= 6 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep >= 6 ? '✓' : '6'}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Delivered</h3>
                  <p className="text-sm text-gray-600">Order delivered successfully</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">
                    £{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 border-t mt-4 pt-4">
              <span>Total</span>
              <span>£{order.pricing?.total?.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
            <p className="text-gray-700">
              {order.deliveryAddress?.fullName}<br />
              {order.deliveryAddress?.phone}<br />
              {order.deliveryAddress?.street}<br />
              {order.deliveryAddress?.city}, {order.deliveryAddress?.postalCode}
            </p>
            {order.deliveryAddress?.instructions && (
              <div className="mt-3 bg-yellow-50 rounded p-3">
                <p className="text-sm text-gray-700">
                  <strong>Instructions:</strong> {order.deliveryAddress.instructions}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          {order.status === 'delivered' && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Rate Your Experience</h2>
              <p className="text-gray-600 mb-4">
                How was your delivery experience?
              </p>
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                Leave a Review
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
