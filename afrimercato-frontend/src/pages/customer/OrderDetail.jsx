import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderAPI } from '../../services/api'
import { getProductImage } from '../../utils/defaultImages'

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: '📝' },
  { key: 'confirmed', label: 'Confirmed', icon: '✓' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'out-for-delivery', label: 'Out for Delivery', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '📦' }
]

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  'out-for-delivery': 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
}

function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await orderAPI.getById(orderId)
      if (response.success) {
        setOrder(response.data)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentStep = () => {
    const stepIndex = statusSteps.findIndex(s => s.key === order?.status)
    return stepIndex >= 0 ? stepIndex : 0
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🔍</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Order not found</h2>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 px-6 py-3 bg-afri-green text-white rounded-xl font-semibold"
          >
            View All Orders
          </button>
        </div>
      </div>
    )
  }

  const currentStep = getCurrentStep()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <button onClick={() => navigate('/orders')} className="mb-4 text-white/80 hover:text-white">
            ← Back to Orders
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
              <p className="text-afri-green-light mt-1">{formatDate(order.createdAt)}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
              {order.status?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Order Progress */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Progress</h2>
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
                <div
                  className="h-full bg-afri-green transition-all duration-500"
                  style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl z-10 transition-all ${
                        index <= currentStep
                          ? 'bg-afri-green text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {step.icon}
                    </div>
                    <p className={`mt-2 text-sm font-medium text-center ${
                      index <= currentStep ? 'text-afri-green' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Estimated Delivery */}
            {order.estimatedDelivery && (
              <div className="mt-6 pt-6 border-t text-center">
                <p className="text-gray-500">Estimated Delivery</p>
                <p className="text-xl font-bold text-gray-900">
                  {new Date(order.estimatedDelivery).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Cancelled Notice */}
        {order.status === 'cancelled' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">❌</span>
              <div>
                <h3 className="font-bold text-red-800">Order Cancelled</h3>
                <p className="text-red-600">
                  {order.cancellationReason || 'This order has been cancelled.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Order Items ({order.items?.length || 0})
              </h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                    <img
                      src={getProductImage(item)}
                      alt={item.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                      {item.unit && (
                        <p className="text-sm text-gray-500">{item.unit}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        £{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">
                        £{item.price?.toFixed(2)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vendor Info */}
            {order.vendor && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Sold By</h2>
                <div className="flex items-center gap-4">
                  {order.vendor.logo && (
                    <img
                      src={order.vendor.logo}
                      alt={order.vendor.storeName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{order.vendor.storeName}</h3>
                    {order.vendor.phone && (
                      <p className="text-sm text-gray-500">📞 {order.vendor.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/store/${order.vendor._id}`)}
                    className="px-4 py-2 border border-afri-green text-afri-green rounded-lg hover:bg-afri-green hover:text-white"
                  >
                    Visit Store
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary & Delivery */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">£{order.subtotal?.toFixed(2) || (order.totalAmount - (order.deliveryFee || 0)).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-medium">
                    {order.deliveryFee === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `£${order.deliveryFee?.toFixed(2) || '0.00'}`
                    )}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-£{order.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t text-lg font-bold">
                  <span>Total</span>
                  <span className="text-afri-green">£{order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="font-medium">
                  {order.paymentMethod === 'card' ? '💳 Card Payment' :
                   order.paymentMethod === 'paypal' ? '🅿️ PayPal' :
                   '💵 Cash on Delivery'}
                </p>
                <p className={`text-sm ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Payment Pending'}
                </p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h2>
              <div className="text-sm">
                <p className="font-semibold">{order.deliveryAddress?.name || order.customerName}</p>
                <p className="text-gray-600">{order.deliveryAddress?.street}</p>
                <p className="text-gray-600">
                  {order.deliveryAddress?.city}, {order.deliveryAddress?.postcode}
                </p>
                {order.deliveryAddress?.phone && (
                  <p className="text-gray-600 mt-2">📞 {order.deliveryAddress.phone}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {order.status === 'delivered' && (
                <button
                  onClick={() => navigate(`/product/${order.items?.[0]?.productId}/reviews`)}
                  className="w-full py-3 bg-afri-green text-white rounded-xl font-semibold hover:bg-afri-green-dark"
                >
                  ⭐ Write a Review
                </button>
              )}
              {['pending', 'confirmed'].includes(order.status) && (
                <button
                  className="w-full py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50"
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this order?')) {
                      // Cancel order logic
                      alert('Cancellation request submitted')
                    }
                  }}
                >
                  Cancel Order
                </button>
              )}
              <button
                onClick={() => navigate('/products')}
                className="w-full py-3 border-2 border-afri-green text-afri-green rounded-xl font-semibold hover:bg-afri-green hover:text-white"
              >
                Order Again
              </button>
              {order.status === 'out-for-delivery' && (
                <button
                  onClick={() => navigate(`/track-order/${orderId}`)}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700"
                >
                  🗺️ Track Delivery Live
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Timeline</h2>
          <div className="space-y-4">
            {order.timeline?.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-afri-green"></div>
                  {index < order.timeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-gray-200"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-semibold text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500">{event.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(event.timestamp).toLocaleString('en-GB')}
                  </p>
                </div>
              </div>
            )) || (
              <div className="text-center text-gray-500 py-4">
                No timeline events available
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-afri-green/10 rounded-xl p-6 mt-6">
          <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about your order, we're here to help.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
              📧 Contact Support
            </button>
            <button className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
              📞 Call Us
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail
