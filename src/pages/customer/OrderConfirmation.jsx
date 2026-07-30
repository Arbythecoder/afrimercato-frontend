import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { orderAPI } from '../../services/api'
import { AlertTriangle, Frown, ShoppingCart, Package, CreditCard, Banknote, CheckCircle2 } from 'lucide-react'

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
      } catch (err) {
        setError(err.message || 'Error fetching order details')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
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
          <Frown className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link to="/stores" className="text-green-600 hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const vendorObj = order.vendor || (order.items && order.items[0] && typeof order.items[0].vendor === 'object' ? order.items[0].vendor : null)
  const vendorAddressString = (() => {
    if (!vendorObj) return null
    if (typeof vendorObj.address === 'string' && vendorObj.address.trim()) return vendorObj.address
    if (vendorObj.address && typeof vendorObj.address === 'object') {
      const p = [vendorObj.address.street, vendorObj.address.city, vendorObj.address.county, vendorObj.address.postcode].filter(Boolean)
      if (p.length > 0) return p.join(', ')
    }
    if (vendorObj.location) {
      if (typeof vendorObj.location === 'string' && vendorObj.location.trim()) return vendorObj.location
      if (vendorObj.location.address) return vendorObj.location.address
      const p = [vendorObj.location.street, vendorObj.location.city, vendorObj.location.postcode].filter(Boolean)
      if (p.length > 0) return p.join(', ')
    }
    return null
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-green-600" />
              <span className="text-xl font-bold text-gray-900">Afrimercato</span>
            </div>
            <Link
              to="/stores"
              className="text-green-600 hover:underline text-sm font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Banner */}
          <div className="bg-white rounded-xl shadow-md p-8 text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 mb-4">
              Thank you for your order. We've sent a confirmation email.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 inline-block">
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-lg font-bold text-gray-900">
                {order.orderNumber || order._id}
              </p>
            </div>
          </div>

          {/* Pickup PIN Banner for Store Pickup Orders */}
          {order.fulfillmentType === 'store_pickup' && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl p-5 mb-6 text-center shadow-lg">
              <p className="text-xs uppercase tracking-wider text-amber-100 font-bold mb-1">Your 4-Digit Pickup PIN</p>
              <p className="text-4xl font-black tracking-widest">{order.security?.pickupPin || order.pickupPin || '----'}</p>
              <p className="text-xs text-amber-100 mt-2 font-medium">Please present this PIN to store staff when collecting your items.</p>
            </div>
          )}

          {/* Delivery / Pickup Details */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {order.fulfillmentType === 'store_pickup' ? 'Pickup Details' : 'Delivery Details'}
              </h2>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                order.fulfillmentType === 'store_pickup' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {order.fulfillmentType === 'store_pickup' ? '🏪 Store Pickup' : '🚚 Rider Delivery'}
              </span>
            </div>
            {order.fulfillmentType === 'store_pickup' ? (
              <div className="space-y-2 text-gray-700">
                <p><span className="font-semibold">Customer:</span> {order.deliveryAddress?.fullName || order.customer?.name}</p>
                <p><span className="font-semibold">Contact Phone:</span> {order.deliveryAddress?.phone || order.customer?.phone || 'N/A'}</p>
                <p><span className="font-semibold">Pickup Location:</span> {vendorObj?.storeName || 'Store Location'}</p>
                {vendorAddressString && (
                  <p className="text-sm text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                    <span className="font-semibold text-gray-800">Store Address:</span> {vendorAddressString}
                  </p>
                )}
              </div>
            ) : (
              order.deliveryAddress && (
                <div className="space-y-1 text-gray-700">
                  <p className="font-semibold">
                    {order.deliveryAddress.fullName || order.customer?.name}
                  </p>
                  <p>{order.deliveryAddress.street}</p>
                  <p>
                    {order.deliveryAddress.city},{' '}
                    {order.deliveryAddress.postcode}
                  </p>
                  {order.deliveryAddress.phone && (
                    <p className="text-gray-500 text-sm mt-2">
                      Phone: {order.deliveryAddress.phone}
                    </p>
                  )}
                </div>
              )
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {order.items?.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-md text-sm">
                      {item.quantity}x
                    </span>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">£{item.price?.toFixed(2)} each</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    £{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>£{order.pricing?.subtotal?.toFixed(2) || (order.totalAmount - (order.deliveryFee || 0)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>
                  {order.deliveryFee === 0
                    ? 'FREE'
                    : `£${order.deliveryFee?.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span className="text-green-600">£{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Status Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-yellow-700" />
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
            <div className="sm:flex justify-between items-center">
              <p className="text-gray-700 flex items-center gap-2">
                <span className="font-semibold">Method:</span>{' '}
                {order.paymentMethod === 'card' ? <><CreditCard className="w-4 h-4 text-gray-600 inline" /> Card Payment</> : <><Banknote className="w-4 h-4 text-green-600 inline" /> Cash on Delivery</>}
              </p>
              <div className='flex items-center gap-2'>
                <p className="text-gray-700 font-semibold">Status:</p>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  order.paymentStatus === 'paid'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>            
                  {order.paymentStatus?.toUpperCase()}
                </span>
              </div>
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
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2.5">
              <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5">1</span>
              <span>Your order will be picked and packed by our team</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5">2</span>
              <span>A rider will be assigned to deliver your order</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5">3</span>
              <span>You'll receive real-time updates on delivery status</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5">4</span>
              <span>Estimated delivery time: 20-40 minutes</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
