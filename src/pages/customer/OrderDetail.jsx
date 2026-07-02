// import { useState, useEffect } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { orderAPI } from '../../services/api'
// import { getProductImage } from '../../utils/defaultImages'
// import { IoImageOutline } from 'react-icons/io5'

// const statusSteps = [
//   { key: 'pending', label: 'Order Placed', icon: '📝' },
//   { key: 'confirmed', label: 'Confirmed', icon: '✓' },
//   { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
//   { key: 'out-for-delivery', label: 'Out for Delivery', icon: '🚚' },
//   { key: 'delivered', label: 'Delivered', icon: '📦' }
// ]

// const statusColors = {
//   pending: 'bg-yellow-100 text-yellow-800',
//   confirmed: 'bg-blue-100 text-blue-800',
//   preparing: 'bg-orange-100 text-orange-800',
//   'out-for-delivery': 'bg-[#FDF8F0] text-[#1B4D3E]',
//   delivered: 'bg-green-100 text-green-800',
//   completed: 'bg-gray-100 text-gray-800',
//   cancelled: 'bg-red-100 text-red-800'
// }

// function OrderDetail() {
//   const { orderId } = useParams()
//   const navigate = useNavigate()
//   const [order, setOrder] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [reordered, setReordered] = useState(false)

//   useEffect(() => {
//     fetchOrder()
//   }, [orderId])

//   const fetchOrder = async () => {
//     try {
//       setLoading(true)
//       const response = await orderAPI.getById(orderId)
//       if (response.success) {
//         setOrder(response.data)
//       }
//     } catch (error) {
//       console.error('Error fetching order:', error)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleReorder = () => {
//     if (!order?.items?.length) return

//     const cartItems = order.items.map(item => ({
//       _id: item.product?._id || item.product || item._id,
//       id: item.product?._id || item.product || item._id,
//       name: item.name,
//       price: item.price,
//       quantity: item.quantity,
//       unit: item.unit,
//       images: item.images || [],
//       vendor: {
//         _id: order.vendor?._id,
//         storeName: order.vendor?.storeName || '',
//         businessName: order.vendor?.businessName || order.vendor?.storeName || '',
//         logo: order.vendor?.logo || ''
//       }
//     }))

//     localStorage.setItem('afrimercato_cart', JSON.stringify(cartItems))
//     window.dispatchEvent(new Event('cartUpdated'))
//     setReordered(true)
//     setTimeout(() => navigate('/cart'), 800)
//   }

//   const getCurrentStep = () => {
//     const stepIndex = statusSteps.findIndex(s => s.key === order?.status)
//     return stepIndex >= 0 ? stepIndex : 0
//   }

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-GB', {
//       weekday: 'long',
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     })
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green"></div>
//       </div>
//     )
//   }

//   if (!order) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <span className="text-6xl">🔍</span>
//           <h2 className="text-2xl font-bold text-gray-900 mt-4">Order not found</h2>
//           <button
//             onClick={() => navigate('/orders')}
//             className="mt-4 px-6 py-3 bg-afri-green text-white rounded-xl font-semibold"
//           >
//             View All Orders
//           </button>
//         </div>
//       </div>
//     )
//   }

//   const currentStep = getCurrentStep()

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-8">
//         <div className="max-w-4xl mx-auto px-4">
//           <button onClick={() => navigate('/orders')} className="mb-4 text-white/80 hover:text-white">
//             ← Back to Orders
//           </button>
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
//               <p className="text-afri-green-light mt-1">{formatDate(order.createdAt)}</p>
//             </div>
//             <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[order.status]}`}>
//               {order.status?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
//             </span>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-4xl mx-auto px-4 py-8">
//         {/* Order Progress */}
//         {order.status !== 'cancelled' && (
//           <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
//             <h2 className="text-lg font-bold text-gray-900 mb-6">Order Progress</h2>
//             <div className="relative">
//               {/* Progress Line */}
//               <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
//                 <div
//                   className="h-full bg-afri-green transition-all duration-500"
//                   style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
//                 />
//               </div>

//               {/* Steps */}
//               <div className="relative flex justify-between">
//                 {statusSteps.map((step, index) => (
//                   <div key={step.key} className="flex flex-col items-center">
//                     <div
//                       className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl z-10 transition-all ${index <= currentStep
//                         ? 'bg-afri-green text-white'
//                         : 'bg-gray-200 text-gray-400'
//                         }`}
//                     >
//                       {step.icon}
//                     </div>
//                     <p className={`mt-2 text-sm font-medium text-center ${index <= currentStep ? 'text-afri-green' : 'text-gray-400'
//                       }`}>
//                       {step.label}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Estimated Delivery */}
//             {order.estimatedDelivery && (
//               <div className="mt-6 pt-6 border-t text-center">
//                 <p className="text-gray-500">Estimated Delivery</p>
//                 <p className="text-xl font-bold text-gray-900">
//                   {new Date(order.estimatedDelivery).toLocaleDateString('en-GB', {
//                     weekday: 'short',
//                     day: 'numeric',
//                     month: 'short'
//                   })}
//                 </p>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Cancelled Notice */}
//         {order.status === 'cancelled' && (
//           <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
//             <div className="flex items-center gap-3">
//               <span className="text-3xl"></span>
//               <div>
//                 <h3 className="font-bold text-red-800">Order Cancelled</h3>
//                 <p className="text-red-600">
//                   {order.cancellationReason || 'This order has been cancelled.'}
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Order Items */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h2 className="text-lg font-bold text-gray-900 mb-4">
//                 Order Items ({order.items?.length || 0})
//               </h2>
//               <div className="space-y-4">
//                 {order.items?.map((item, index) => {
//                   const rawImages = item.product?.images || item.images || []
//                   const firstImage = rawImages[0]
//                   const imageUrl = firstImage?.url
//                     || (typeof firstImage === 'string' ? firstImage : null)
//                     || null

//                   return (
//                     <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
//                       <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
//                         {imageUrl ? (
//                           <img
//                             src={imageUrl}
//                             alt={item.name}
//                             className="w-full h-full object-cover"
//                             onError={(e) => {
//                               e.target.style.display = 'none'
//                               e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl"><IoImageOutline /></div>'
//                             }}
//                           />
//                         ) : (
//                           <div className="w-full h-full flex items-center justify-center text-2xl"><IoImageOutline /></div>
//                         )}
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="font-semibold text-gray-900">{item.name}</h3>
//                         <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
//                         {item.unit && (
//                           <p className="text-sm text-gray-500">{item.unit}</p>
//                         )}
//                       </div>
//                       <div className="text-right">
//                         <p className="font-bold text-gray-900">
//                           £{(item.price * item.quantity).toFixed(2)}
//                         </p>
//                         <p className="text-sm text-gray-500">
//                           £{item.price?.toFixed(2)} each
//                         </p>
//                       </div>
//                     </div>
//                   )
//                 })}
//               </div>
//             </div>

//             {/* Vendor Info */}
//             {order.vendor && (
//               <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
//                 <h2 className="text-lg font-bold text-gray-900 mb-4">Sold By</h2>
//                 <div className="flex items-center gap-4">
//                   {order.vendor.logo && (
//                     <img
//                       src={order.vendor.logo}
//                       alt={order.vendor.storeName}
//                       className="w-16 h-16 rounded-full object-cover"
//                     />
//                   )}
//                   <div className="flex-1">
//                     <h3 className="font-semibold text-gray-900">{order.vendor.storeName}</h3>
//                     {order.vendor.phone && (
//                       <p className="text-sm text-gray-500">📞 {order.vendor.phone}</p>
//                     )}
//                   </div>
//                   <button
//                     onClick={() => navigate(`/store/${order.vendor._id}`)}
//                     className="px-4 py-2 border border-afri-green text-afri-green rounded-lg hover:bg-afri-green hover:text-white"
//                   >
//                     Visit Store
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Order Summary & Delivery */}
//           <div className="space-y-6">
//             {/* Order Summary */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
//               <div className="space-y-3 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Subtotal</span>
//                   <span className="font-medium">£{order.subtotal?.toFixed(2) || (order.totalAmount - (order.deliveryFee || 0)).toFixed(2)}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-500">Delivery Fee</span>
//                   <span className="font-medium">
//                     {order.deliveryFee === 0 ? (
//                       <span className="text-green-600">Free</span>
//                     ) : (
//                       `£${order.deliveryFee?.toFixed(2) || '0.00'}`
//                     )}
//                   </span>
//                 </div>
//                 {order.discount > 0 && (
//                   <div className="flex justify-between text-green-600">
//                     <span>Discount</span>
//                     <span>-£{order.discount.toFixed(2)}</span>
//                   </div>
//                 )}
//                 <div className="flex justify-between pt-3 border-t text-lg font-bold">
//                   <span>Total</span>
//                   <span className="text-afri-green">£{order.totalAmount?.toFixed(2)}</span>
//                 </div>
//               </div>

//               {/* Payment Method */}
//               <div className="mt-4 pt-4 border-t">
//                 <p className="text-sm text-gray-500">Payment Method</p>
//                 <p className="font-medium">
//                   {order.paymentMethod === 'card' ? '💳 Card Payment' :
//                     order.paymentMethod === 'paypal' ? '🅿️ PayPal' :
//                       '💵 Cash on Delivery'}
//                 </p>
//                 <p className={`text-sm ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
//                   {order.paymentStatus === 'paid' ? '✓ Paid' : '⏳ Payment Pending'}
//                 </p>
//               </div>
//             </div>

//             {/* Delivery Address */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Address</h2>
//               <p className="text-gray-700 text-sm">
//                 <span className="font-semibold">Name:</span> {order.customer?.name}
//               </p>
//               <p className="text-gray-700 text-sm">
//                 <span className="font-semibold">Email:</span> {order.customer?.email}
//               </p>
//               <p className="text-gray-700 text-sm">
//                 <span className="font-semibold">Phone:</span> {order.deliveryAddress?.phone || 'No number provided'}
//               </p>

//               <p className="text-gray-700 text-sm">
//                 <span className="font-semibold">Address:</span>{' '}
//                 {[
//                   order.deliveryAddress?.street,
//                   order.deliveryAddress?.city,
//                   order.deliveryAddress?.county,
//                   order.deliveryAddress?.postcode,
//                   order.deliveryAddress?.country,
//                 ].filter(Boolean).join(', ')}
//               </p>

//               {order.deliveryAddress?.instructions && (
//                 <p className="text-gray-700 text-sm">
//                   <span className="font-semibold">Instructions:</span> {order.deliveryAddress.instructions}
//                 </p>
//               )}
//             </div>

//             {/* Actions */}
//             <div className="space-y-3">
//               {order.status === 'delivered' && (
//                 <button
//                   onClick={() => navigate(`/product/${order.items?.[0]?.productId}/reviews`)}
//                   className="w-full py-3 bg-afri-green text-white rounded-xl font-semibold hover:bg-afri-green-dark"
//                 >
//                   ⭐ Write a Review
//                 </button>
//               )}
//               {['pending', 'confirmed'].includes(order.status) && (
//                 <button
//                   className="w-full py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50"
//                   onClick={() => {
//                     if (confirm('Are you sure you want to cancel this order?')) {
//                       // Cancel order logic
//                       alert('Cancellation request submitted')
//                     }
//                   }}
//                 >
//                   Cancel Order
//                 </button>
//               )}
//               <button
//                 onClick={handleReorder}
//                 disabled={reordered}
//                 className={`w-full py-3 border-2 rounded-xl font-semibold transition-all ${reordered
//                   ? 'border-green-500 bg-green-500 text-white'
//                   : 'border-afri-green text-afri-green hover:bg-afri-green hover:text-white'
//                   }`}
//               >
//                 {reordered ? '✓ Added to cart — going there now...' : 'Order Again'}
//               </button>
//               {order.status === 'out-for-delivery' && (
//                 <button
//                   onClick={() => navigate(`/track-order/${orderId}`)}
//                   className="w-full py-3 bg-[#1B4D3E] text-white rounded-xl font-semibold hover:bg-[#0D2B22]"
//                 >
//                   🗺️ Track Delivery Live
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Order Timeline */}
//         <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
//           <h2 className="text-lg font-bold text-gray-900 mb-4">Order Timeline</h2>
//           <div className="space-y-4">
//             {order.timeline?.map((event, index) => (
//               <div key={index} className="flex gap-4">
//                 <div className="flex flex-col items-center">
//                   <div className="w-3 h-3 rounded-full bg-afri-green"></div>
//                   {index < order.timeline.length - 1 && (
//                     <div className="w-0.5 h-12 bg-gray-200"></div>
//                   )}
//                 </div>
//                 <div className="flex-1 pb-4">
//                   <p className="font-semibold text-gray-900">{event.title}</p>
//                   <p className="text-sm text-gray-500">{event.description}</p>
//                   <p className="text-xs text-gray-400 mt-1">
//                     {new Date(event.timestamp).toLocaleString('en-GB')}
//                   </p>
//                 </div>
//               </div>
//             )) || (
//                 <div className="text-center text-gray-500 py-4">
//                   No timeline events available
//                 </div>
//               )}
//           </div>
//         </div>

//         {/* Help Section */}
//         <div className="bg-afri-green/10 rounded-xl p-6 mt-6">
//           <h3 className="font-bold text-gray-900 mb-2">Need Help?</h3>
//           <p className="text-gray-600 mb-4">
//             If you have any questions about your order, we're here to help.
//           </p>
//           <div className="flex gap-3">
//             <button className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
//               📧 Contact Support
//             </button>
//             <button className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100">
//               📞 Call Us
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default OrderDetail


import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderAPI } from '../../services/api'
import { getProductImage } from '../../utils/defaultImages'
import { IoImageOutline } from 'react-icons/io5'

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: '📝' },
  { key: 'confirmed', label: 'Confirmed', icon: '✓' },
  { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '📦' }
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
                      {step.icon}
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
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Name:</span> {order.customer?.name}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Email:</span> {order.customer?.email}
              </p>
              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Phone:</span> {order.deliveryAddress?.phone || 'No number provided'}
              </p>

              <p className="text-gray-700 text-sm">
                <span className="font-semibold">Address:</span>{' '}
                {[
                  order.deliveryAddress?.street,
                  order.deliveryAddress?.city,
                  order.deliveryAddress?.county,
                  order.deliveryAddress?.postcode,
                  order.deliveryAddress?.country,
                ].filter(Boolean).join(', ')}
              </p>

              {order.deliveryAddress?.instructions && (
                <p className="text-gray-700 text-sm mt-2 p-2 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
                  <span className="font-semibold">Instructions:</span> {order.deliveryAddress.instructions}
                </p>
              )}
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
                onClick={handleReorder}
                disabled={reordered}
                className={`w-full py-3 border-2 rounded-xl font-semibold transition-all ${reordered
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-afri-green text-afri-green hover:bg-afri-green hover:text-white'
                  }`}
              >
                {reordered ? '✓ Added to cart — going there now...' : 'Order Again'}
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
            <button className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-200">
              📧 Contact Support
            </button>
            <button className="px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100 shadow-sm border border-gray-200">
              📞 Call Us
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetail