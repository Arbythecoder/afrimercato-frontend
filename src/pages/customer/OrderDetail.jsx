import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderAPI, cancelOrder } from '../../services/api'
import { getProductImage } from '../../utils/defaultImages'
import { IoImageOutline } from 'react-icons/io5'
import { Mail, Phone, CreditCard, Banknote, Star, Edit3, CheckCircle, Clock, Truck, Package, ChefHat, FileText, Check } from 'lucide-react'
import EditOrderAddressModal from '../../components/Customer/EditOrderAddressModal'

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: FileText },
  { key: 'confirmed', label: 'Confirmed', icon: Check },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: Package }
]

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  assigned_to_picker: 'bg-purple-100 text-purple-800',
  picking: 'bg-purple-100 text-purple-800',
  packed: 'bg-indigo-100 text-indigo-800',
  ready_for_delivery: 'bg-teal-100 text-teal-800',
  assigned_to_rider: 'bg-blue-100 text-blue-800',
  rider_accepted: 'bg-blue-100 text-blue-800',
  picked_up_by_rider: 'bg-blue-100 text-blue-800',
  out_for_delivery: 'bg-[#FDF8F0] text-[#1B4D3E]',
  'out-for-delivery': 'bg-[#FDF8F0] text-[#1B4D3E]',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800'
}

function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reordered, setReordered] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [showEditAddressModal, setShowEditAddressModal] = useState(false)

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

  const handleReorder = () => {
    if (!order?.items?.length) return

    const cartItems = order.items.map(item => ({
      _id: item.product?._id || item.product || item._id,
      id: item.product?._id || item.product || item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      unit: item.unit,
      images: item.images || [],
      vendor: {
        _id: order.vendor?._id,
        storeName: order.vendor?.storeName || '',
        businessName: order.vendor?.businessName || order.vendor?.storeName || '',
        logo: order.vendor?.logo || ''
      }
    }))

    localStorage.setItem('afrimercato_cart', JSON.stringify(cartItems))
    window.dispatchEvent(new Event('cartUpdated'))
    setReordered(true)
    setTimeout(() => navigate('/cart'), 800)
  }

  const handleCancelOrder = async () => {
    if (!order) return
    if (!confirm('Are you sure you want to cancel this order?')) return

    try {
      setCancelling(true)
      const res = await cancelOrder(order._id || orderId, 'Cancelled by customer')
      if (res.success || res.status === 'success') {
        alert('Order cancelled successfully')
        fetchOrder()
      } else {
        alert(res.message || 'Failed to cancel order')
      }
    } catch (error) {
      console.error('Cancel order error:', error)
      alert(error.message || 'Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  // THE FIX: Smart mapping for the 5-step customer progress bar!
  const getCurrentStep = () => {
    const status = order?.status;
    if (!status) return 0;

    if (['pending'].includes(status)) return 0;
    if (['confirmed'].includes(status)) return 1;
    // Map all prep/picker states to step 2 (Preparing)
    if (['preparing', 'assigned_to_picker', 'picking', 'packed', 'ready_for_delivery', 'assigned_to_rider', 'rider_accepted'].includes(status)) return 2;
    // Map delivery transit states to step 3 (Out for Delivery)
    if (['picked_up_by_rider', 'out_for_delivery', 'out-for-delivery'].includes(status)) return 3;
    // Map completion states to step 4 (Delivered)
    if (['delivered', 'completed'].includes(status)) return 4;

    return 0;
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
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
              {order.status?.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl z-10 transition-all ${index <= currentStep
                        ? 'bg-afri-green text-white'
                        : 'bg-gray-200 text-gray-400'
                        }`}
                    >
                      <step.icon className="w-6 h-6" />
                    </div>
                    <p className={`mt-2 text-sm font-medium text-center ${index <= currentStep ? 'text-afri-green' : 'text-gray-400'
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
              <span className="text-3xl"></span>
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
                {order.items?.map((item, index) => {
                  const rawImages = item.product?.images || item.images || []
                  const firstImage = rawImages[0]
                  const imageUrl = firstImage?.url
                    || (typeof firstImage === 'string' ? firstImage : null)
                    || null

                  return (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl"><IoImageOutline /></div>'
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl"><IoImageOutline /></div>
                        )}
                      </div>
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
                  )
                })}
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
                      <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {order.vendor.phone}</p>
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
                <p className="font-medium flex items-center gap-1.5 mt-0.5">
                  {order.paymentMethod === 'card' ? <><CreditCard className="w-4 h-4 text-gray-600" /> Card Payment</> :
                    order.paymentMethod === 'paypal' ? <><CreditCard className="w-4 h-4 text-blue-600" /> PayPal</> :
                      <><Banknote className="w-4 h-4 text-green-600" /> Cash on Delivery</>}
                </p>
                <p className={`text-sm flex items-center gap-1 mt-1 ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.paymentStatus === 'paid' ? <><CheckCircle className="w-3.5 h-3.5" /> Paid</> : <><Clock className="w-3.5 h-3.5" /> Payment Pending</>}
                </p>
              </div>
            </div>

            {/* Store Pickup PIN Banner */}
            {order.fulfillmentType === 'store_pickup' && (
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl p-5 shadow-lg mb-6 text-center">
                <p className="text-xs uppercase tracking-wider text-amber-100 font-bold mb-1">Your 4-Digit Pickup PIN</p>
                <p className="text-4xl font-black tracking-widest">{order.security?.pickupPin || order.pickupPin || '----'}</p>
                <p className="text-xs text-amber-100 mt-2 font-medium">Show this PIN to store staff when picking up your order.</p>
              </div>
            )}

            {/* Delivery or Pickup Address */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  {order.fulfillmentType === 'store_pickup' ? <><Store className="w-5 h-5 text-afri-green" /> Pickup Information</> : 'Delivery Address'}
                </h2>
                <div className="flex items-center gap-2">
                  {order.fulfillmentType !== 'store_pickup' && ['pending', 'confirmed', 'preparing', 'assigned_to_picker', 'picking'].includes(order.status) && (
                    <button
                      onClick={() => setShowEditAddressModal(true)}
                      className="px-3 py-1.5 bg-green-50 text-afri-green hover:bg-green-100 font-bold text-xs rounded-lg transition-all border border-green-200 flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Address
                    </button>
                  )}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    order.fulfillmentType === 'store_pickup' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {order.fulfillmentType === 'store_pickup' ? '🏪 Self Pickup' : '🚚 Rider Delivery'}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Customer:</span> {order.deliveryAddress?.fullName || order.customer?.name}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Email:</span> {order.customer?.email}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Phone:</span> {order.deliveryAddress?.phone || order.customer?.phone || 'No number provided'}
              </p>

              {order.fulfillmentType === 'store_pickup' ? (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-gray-700 text-sm">
                    <span className="font-semibold">Pickup Location:</span> {vendorObj?.storeName || 'Vendor Store'}
                  </p>
                  {vendorAddressString && (
                    <p className="text-gray-700 text-sm mt-1 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                      <span className="font-semibold text-gray-900">Store Address:</span> {vendorAddressString}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-700 text-sm mt-1">
                  <span className="font-semibold">Address:</span>{' '}
                  {[
                    order.deliveryAddress?.street,
                    order.deliveryAddress?.city,
                    order.deliveryAddress?.county,
                    order.deliveryAddress?.postcode,
                    order.deliveryAddress?.country,
                  ].filter(Boolean).join(', ')}
                </p>
              )}

              {order.deliveryAddress?.instructions && (
                <p className="text-gray-700 text-sm mt-2 p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
                  <span className="font-semibold">{order.fulfillmentType === 'store_pickup' ? 'Pickup Notes:' : 'Instructions:'}</span> {order.deliveryAddress.instructions}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {order.status === 'delivered' && (
                <button
                  onClick={() => navigate(`/product/${order.items?.[0]?.productId}/reviews`)}
                  className="w-full py-3 bg-afri-green text-white rounded-xl font-semibold hover:bg-afri-green-dark flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" /> Write a Review
                </button>
              )}
              {['pending', 'confirmed', 'preparing'].includes(order.status) && (
                <button
                  disabled={cancelling}
                  className="w-full py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 disabled:opacity-50 transition-all cursor-pointer"
                  onClick={handleCancelOrder}
                >
                  {cancelling ? 'Cancelling Order...' : 'Cancel Order'}
                </button>
              )}
              <button
                onClick={handleReorder}
                disabled={reordered}
                className={`w-full py-3 border-2 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${reordered
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-afri-green text-afri-green hover:bg-afri-green hover:text-white'
                  }`}
              >
                {reordered ? <><Check className="w-4 h-4" /> Added to cart — going there now...</> : 'Order Again'}
              </button>

              {/* THE FIX: Re-inserted the Expanded Tracking Visibility Button */}
              {['assigned_to_rider', 'rider_accepted', 'picked_up_by_rider', 'out_for_delivery', 'out-for-delivery'].includes(order.status) && (
                <button
                  onClick={() => navigate(`/track-order/${orderId}`)}
                  className="w-full py-3 bg-[#FFB800] text-[#1B4D3E] rounded-xl font-black shadow-lg hover:shadow-xl hover:bg-[#FF8C00] transition-all flex items-center justify-center gap-2 active:scale-95 border-2 border-transparent mt-2"
                >
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1B4D3E] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1B4D3E]"></span>
                  </span>
                  Track Rider Live
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Timeline</h2>
          <div className="space-y-4">
            {(() => {
              // Grab the backend history, or create a fallback using createdAt/updatedAt
              const events = order.statusHistory?.length > 0
                ? order.statusHistory
                : [
                  { status: 'Order Placed', note: 'We have received your order', timestamp: order.createdAt },
                  ...(order.status !== 'pending' ? [{ status: order.status, note: 'Order status updated', timestamp: order.updatedAt }] : [])
                ];

              return events.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-afri-green"></div>
                    {index < events.length - 1 && (
                      <div className="w-0.5 h-full min-h-[3rem] bg-gray-200"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-gray-900 capitalize">
                      {event.status.replace(/_/g, ' ').replace(/-/g, ' ')}
                    </p>
                    <p className="text-sm text-gray-500">{event.note || 'Status updated'}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(event.timestamp).toLocaleString('en-GB', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-afri-green/10 rounded-xl p-6 mt-6">
          <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about your order, we're here to help.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-200 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-afri-green" /> Contact Support
            </button>
            <button className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-200 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-afri-green" /> Call Us
            </button>
          </div>
        </div>

        {showEditAddressModal && (
          <EditOrderAddressModal
            order={order}
            onClose={() => setShowEditAddressModal(false)}
            onSuccess={(updatedOrder) => {
              if (updatedOrder) setOrder(updatedOrder);
              fetchOrder();
            }}
          />
        )}
      </div>
    </div>
  )
}

export default OrderDetail