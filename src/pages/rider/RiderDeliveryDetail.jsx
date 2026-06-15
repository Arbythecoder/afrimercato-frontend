// import { useState, useEffect, useCallback } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import { apiCall } from '../../services/api'
// import { motion } from 'framer-motion'
// import { ArrowLeft, MapPin, Phone, Package, AlertTriangle, RefreshCw } from 'lucide-react'
// import DeliveryChat from '../../components/DeliveryChat'

// // FIXED: Updated to use new Order schema statuses
// const CHAT_ACTIVE_STATUSES = ['assigned_to_rider', 'picked_up_by_rider', 'out_for_delivery']

// // FIXED: Mapped 'accepted' to 'assigned_to_rider'
// const STATUS_STEPS = [
//   { key: 'assigned_to_rider', label: 'Accepted', icon: '📋' },
//   { key: 'picked_up_by_rider', label: 'Picked Up', icon: '🏪' },
//   { key: 'out_for_delivery', label: 'In Transit', icon: '🚚' },
//   { key: 'delivered', label: 'Delivered', icon: '✓' },
// ]

// const NEXT_ACTION = {
//   pending: { label: 'Accept Delivery', action: 'accept', color: 'bg-blue-600 hover:bg-blue-700' },
//   assigned_to_rider: {
//     label: 'Waiting for Vendor to release...',
//     action: null,
//     color: 'bg-gray-200 text-gray-500 cursor-not-allowed'
//   },

//   picked_up_by_rider: { label: 'Mark as Delivered', action: 'complete', color: 'bg-emerald-600 hover:bg-emerald-700' },
//   out_for_delivery: { label: 'Mark as Delivered', action: 'complete', color: 'bg-emerald-600 hover:bg-emerald-700' },
// }

// function RiderDeliveryDetail() {
//   const { deliveryId } = useParams()
//   const navigate = useNavigate()
//   const [delivery, setDelivery] = useState(null)
//   const [loading, setLoading] = useState(true)
//   const [actionLoading, setActionLoading] = useState(false)
//   const [error, setError] = useState(null)
//   const [showChat, setShowChat] = useState(false)

//   const fetchDelivery = useCallback(async () => {
//     setLoading(true)
//     setError(null)
//     try {
//       const res = await apiCall('/riders/deliveries/active')
//       const deliveries = res?.data?.deliveries || []
//       const found = deliveries.find(d => (d.id || d._id) === deliveryId || String(d.id || d._id) === deliveryId)

//       if (found) {
//         setDelivery(found)
//       } else {
//         try {
//           const trackRes = await apiCall(`/riders/deliveries/${deliveryId}/track`)
//           if (trackRes?.data) {
//             setDelivery(trackRes.data)
//           } else {
//             setError('Delivery not found or already completed.')
//           }
//         } catch (_e) {
//           setError('Delivery not found.')
//         }
//       }
//     } catch (_e) {
//       setError('Failed to load delivery. Please try again.')
//     } finally {
//       setLoading(false)
//     }
//   }, [deliveryId])

//   useEffect(() => { fetchDelivery() }, [fetchDelivery])

//   const handleAction = async (action) => {
//     if (!action) return; // Failsafe
//     setActionLoading(true)
//     try {
//       await apiCall(`/riders/deliveries/${deliveryId}/${action}`, { method: 'POST' })
//       if (action === 'complete') {
//         navigate('/rider/deliveries')
//       } else {
//         await fetchDelivery()
//       }
//     } catch (err) {
//       alert(err?.message || `Failed to update status. Please try again.`)
//     } finally {
//       setActionLoading(false)
//     }
//   }

//   const openNavigation = (address) => {
//     if (!address) return
//     const addr = typeof address === 'string'
//       ? address
//       : [address.street, address.city, address.postcode].filter(Boolean).join(', ')
//     window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`, '_blank')
//   }

//   const callPhone = (phone) => {
//     if (phone) window.open(`tel:${phone}`)
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green" />
//       </div>
//     )
//   }

//   if (error || !delivery) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-5">
//         <AlertTriangle size={48} className="text-red-400" />
//         <p className="text-gray-600 font-medium text-center">{error || 'Delivery not found.'}</p>
//         <div className="flex gap-3">
//           <button
//             onClick={fetchDelivery}
//             className="flex items-center gap-2 px-5 py-2.5 bg-afri-green text-white rounded-xl font-semibold"
//           >
//             <RefreshCw size={16} /> Retry
//           </button>
//           <button
//             onClick={() => navigate('/rider/deliveries')}
//             className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold"
//           >
//             Back
//           </button>
//         </div>
//       </div>
//     )
//   }

//   const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === delivery.status)
//   const nextAction = NEXT_ACTION[delivery.status]

//   const actualVendor = delivery.vendor || (delivery.items?.length > 0 ? delivery.items[0].vendor : null);
//   const pickupAddr = delivery.pickupAddress || actualVendor?.address || actualVendor?.location || null;
//   const vendorName = actualVendor?.name || actualVendor?.storeName || '—';
//   const dropoffAddr = delivery.dropoffAddress || delivery.deliveryAddress || null
//   const vendorPhone = actualVendor?.phone || null;
//   const customerName = delivery.customer?.name || delivery.deliveryAddress?.fullName || '—'
//   const customerPhone = delivery.deliveryAddress?.phone || null

//   const orderItems = delivery.items || []
//   const earnings = Number(delivery.riderEarnings || delivery.earnings || delivery.deliveryFee || 0).toFixed(2)

//   const formatAddr = (addr) => {
//     if (!addr) return 'Pickup address unavailable'
//     if (typeof addr === 'string') return addr
//     return [addr.street, addr.city, addr.postcode].filter(Boolean).join(', ')
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 pb-24">
//       {/* Header */}
//       <div className="bg-gradient-to-br from-afri-gray-900 via-[#1A1A1A] to-[#2B3632] text-white py-6">
//         <div className="max-w-2xl mx-auto px-4">
//           <button onClick={() => navigate('/rider/deliveries')} className="flex items-center gap-1 text-afri-green-light hover:text-white mb-3 text-sm">
//             <ArrowLeft size={16} /> Back to Deliveries
//           </button>
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-2xl font-bold">{delivery.orderNumber || deliveryId}</h1>
//               <p className="text-afri-green-light text-sm mt-0.5">
//                 {orderItems.length > 0 ? `${orderItems.length} items` : ''}{delivery.distance ? ` • ${delivery.distance} km` : ''}
//               </p>
//             </div>
//             <span className="text-2xl font-bold text-emerald-400">£{earnings}</span>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
//         {/* Progress Tracker */}
//         <div className="bg-white rounded-xl shadow-sm p-5">
//           <h2 className="font-bold text-gray-900 mb-4">Delivery Progress</h2>
//           <div className="relative">
//             <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
//               <div
//                 className="h-full bg-afri-green transition-all"
//                 style={{ width: `${currentStepIdx >= 0 ? (currentStepIdx / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
//               />
//             </div>
//             <div className="relative flex justify-between">
//               {STATUS_STEPS.map((step, idx) => (
//                 <div key={step.key} className="flex flex-col items-center">
//                   <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 ${idx <= currentStepIdx ? 'bg-afri-green text-white' : 'bg-gray-200 text-gray-400'
//                     }`}>
//                     {step.icon}
//                   </div>
//                   <p className={`mt-2 text-xs font-medium text-center ${idx <= currentStepIdx ? 'text-afri-green' : 'text-gray-400'
//                     }`}>{step.label}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Pickup Location */}
//         <div className="bg-white rounded-xl shadow-sm p-5">
//           <div className="flex items-center justify-between mb-3">
//             <h2 className="font-bold text-gray-900 flex items-center gap-2">
//               <MapPin size={16} className="text-afri-green" /> Pickup
//             </h2>
//             {['assigned_to_rider'].includes(delivery.status) && (
//               <span className="px-3 py-1 bg-afri-green-pale text-afri-green-dark rounded-full text-xs font-semibold">Current Stop</span>
//             )}
//           </div>
//           <p className="font-semibold text-gray-900">{vendorName}</p>
//           <p className="text-gray-500 text-sm mt-0.5">{formatAddr(pickupAddr)}</p>
//           {delivery.security?.pickupPin && ['pending', 'assigned_to_rider'].includes(delivery.status) && (
//             <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 flex justify-between items-center">
//               <p className="text-xs font-medium text-amber-800">Pickup PIN</p>
//               <p className="text-lg font-black text-amber-600 tracking-widest">{delivery.security.pickupPin}</p>
//             </div>
//           )}
//           <div className="flex gap-2 mt-3">
//             <button
//               onClick={() => openNavigation(pickupAddr)}
//               className="flex-1 py-2.5 bg-afri-green text-white rounded-lg font-semibold text-sm hover:bg-afri-green-dark"
//             >
//               Navigate
//             </button>
//             {vendorPhone && (
//               <button
//                 onClick={() => callPhone(vendorPhone)}
//                 className="px-4 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200"
//                 aria-label="Call vendor"
//               >
//                 <Phone size={18} className="text-gray-600" />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Delivery Location */}
//         <div className="bg-white rounded-xl shadow-sm p-5">
//           <div className="flex items-center justify-between mb-3">
//             <h2 className="font-bold text-gray-900 flex items-center gap-2">
//               <MapPin size={16} className="text-afri-green" /> Delivery
//             </h2>
//             {['picked_up_by_rider', 'out_for_delivery'].includes(delivery.status) && (
//               <span className="px-3 py-1 bg-afri-green-pale text-afri-green-dark rounded-full text-xs font-semibold">Current Stop</span>
//             )}
//           </div>
//           <p className="font-semibold text-gray-900">{customerName}</p>
//           <p className="text-gray-500 text-sm mt-0.5">{formatAddr(dropoffAddr)}</p>
//           {delivery.deliveryInstructions && (
//             <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
//               <p className="text-xs font-medium text-yellow-800">Instructions</p>
//               <p className="text-xs text-yellow-700 mt-0.5">{delivery.deliveryInstructions}</p>
//             </div>
//           )}
//           {delivery.security?.deliveryPin && ['picked_up_by_rider', 'out_for_delivery'].includes(delivery.status) && (
//             <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mt-3 flex justify-between items-center">
//               <p className="text-xs font-medium text-emerald-800">Delivery PIN</p>
//               <p className="text-lg font-black text-emerald-600 tracking-widest">{delivery.security.deliveryPin}</p>
//             </div>
//           )}
//           <div className="flex gap-2 mt-3">
//             <button
//               onClick={() => openNavigation(dropoffAddr)}
//               className="flex-1 py-2.5 bg-afri-green text-white rounded-lg font-semibold text-sm hover:bg-afri-green-dark"
//             >
//               Navigate
//             </button>
//             {customerPhone && (
//               <button
//                 onClick={() => callPhone(customerPhone)}
//                 className="px-4 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200"
//                 aria-label="Call customer"
//               >
//                 <Phone size={18} className="text-gray-600" />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Order Items */}
//         {orderItems.length > 0 && (
//           <div className="bg-white rounded-xl shadow-sm p-5">
//             <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
//               <Package size={16} className="text-afri-green" /> Items ({orderItems.length})
//             </h2>
//             <div className="space-y-2">
//               {orderItems.map((item, idx) => (
//                 <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
//                   <div className="flex items-center gap-3">
//                     <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-bold">
//                       {item.quantity}
//                     </div>
//                     <span className="text-sm text-gray-900">{item.name || item.product?.name || `Item ${idx + 1}`}</span>
//                   </div>
//                   {item.unit && <span className="text-xs text-gray-400">{item.unit}</span>}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Chat with Customer */}
//         {CHAT_ACTIVE_STATUSES.includes(delivery.status) && (
//           <button
//             onClick={() => setShowChat(v => !v)}
//             className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-green-600 text-green-700 rounded-xl font-semibold hover:bg-green-50 transition"
//           >
//             💬 {showChat ? 'Hide Chat' : 'Chat with Customer'}
//           </button>
//         )}

//         {/* Action Button */}
//         {nextAction && delivery.status !== 'delivered' && (
//           <motion.button
//             initial={{ opacity: 0, y: 8 }}
//             animate={{ opacity: 1, y: 0 }}
//             onClick={() => nextAction.action && handleAction(nextAction.action)}
//             disabled={actionLoading || !nextAction.action}
//             className={`w-full py-4 rounded-xl font-bold text-lg ${nextAction.action ? 'text-white' : ''
//               } ${nextAction.color} transition-all`}
//           >
//             {actionLoading ? 'Updating...' : nextAction.label}
//           </motion.button>
//         )}

//         {delivery.status === 'delivered' && (
//           <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
//             <p className="text-emerald-700 font-bold text-lg">Delivery Complete!</p>
//             <p className="text-emerald-600 text-sm mt-1">You earned £{earnings} for this delivery.</p>
//           </div>
//         )}
//       </div>

//       {/* Floating delivery chat panel */}
//       {showChat && CHAT_ACTIVE_STATUSES.includes(delivery.status) && (
//         <div className="fixed bottom-6 right-4 z-50">
//           <DeliveryChat
//             orderId={delivery.order?._id || delivery.order?.id || delivery.orderId}
//             label="Chat with Customer"
//             onClose={() => setShowChat(false)}
//           />
//         </div>
//       )}
//     </div>
//   )
// }

// export default RiderDeliveryDetail


import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MapPin, Phone, Package, AlertTriangle, RefreshCw, Lock } from 'lucide-react'
import DeliveryChat from '../../components/DeliveryChat'

const CHAT_ACTIVE_STATUSES = ['assigned_to_rider', 'picked_up_by_rider', 'out_for_delivery']

const STATUS_STEPS = [
  { key: 'assigned_to_rider', label: 'Accepted', icon: '📋' },
  { key: 'picked_up_by_rider', label: 'Picked Up', icon: '🏪' },
  { key: 'out_for_delivery', label: 'In Transit', icon: '🚚' },
  { key: 'delivered', label: 'Delivered', icon: '✓' },
]

const NEXT_ACTION = {
  pending: { label: 'Accept Delivery', action: 'accept', color: 'bg-blue-600 hover:bg-blue-700' },
  assigned_to_rider: { label: 'Confirm Pickup', action: 'pickup', color: 'bg-afri-green hover:bg-afri-green-dark' },
  picked_up_by_rider: { label: 'Mark as Delivered', action: 'complete', color: 'bg-emerald-600 hover:bg-emerald-700' },
  out_for_delivery: { label: 'Mark as Delivered', action: 'complete', color: 'bg-emerald-600 hover:bg-emerald-700' },
}

function RiderDeliveryDetail() {
  const { deliveryId } = useParams()
  const navigate = useNavigate()
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showChat, setShowChat] = useState(false)

  const [pinModalType, setPinModalType] = useState(null)
  const [pin, setPin] = useState('')

  const fetchDelivery = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiCall('/riders/deliveries/active')
      const deliveries = res?.data?.deliveries || []
      const found = deliveries.find(d => (d.id || d._id) === deliveryId || String(d.id || d._id) === deliveryId)

      if (found) {
        setDelivery(found)
      } else {
        try {
          const trackRes = await apiCall(`/riders/deliveries/${deliveryId}/track`)
          if (trackRes?.data) {
            setDelivery(trackRes.data)
          } else {
            setError('Delivery not found or already completed.')
          }
        } catch (_e) {
          setError('Delivery not found.')
        }
      }
    } catch (_e) {
      setError('Failed to load delivery. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [deliveryId])

  useEffect(() => { fetchDelivery() }, [fetchDelivery])

  const handleAction = async (action) => {
    if (!action) return;

    // Open PIN modal for PICKUP
    if (action === 'pickup') {
      setPinModalType('pickup')
      return;
    }

    // Open PIN modal for DELIVERY
    if (action === 'complete') {
      setPinModalType('delivery')
      return;
    }

    setActionLoading(true)
    try {
      await apiCall(`/riders/deliveries/${deliveryId}/${action}`, { method: 'POST' })
      await fetchDelivery()
    } catch (err) {
      alert(err?.message || `Failed to update status. Please try again.`)
    } finally {
      setActionLoading(false)
    }
  }

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return alert('Please enter a 4-digit PIN');

    setActionLoading(true)
    try {
      if (pinModalType === 'pickup') {
        await apiCall(`/riders/deliveries/${deliveryId}/pickup`, {
          method: 'POST',
          body: JSON.stringify({ pickupPin: pin })
        })
      } else if (pinModalType === 'delivery') {
        await apiCall(`/riders/deliveries/${deliveryId}/complete`, {
          method: 'POST',
          body: JSON.stringify({ deliveryPin: pin })
        })
        navigate('/rider/deliveries')
        return;
      }

      setPinModalType(null)
      setPin('')
      await fetchDelivery()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Invalid PIN. Please try again.')
    } finally {
      setActionLoading(false)
    }
  }


  const openNavigation = (address) => {
    if (!address) return
    const addr = typeof address === 'string'
      ? address
      : [address.street, address.city, address.postcode].filter(Boolean).join(', ')
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addr)}`, '_blank')
  }

  const callPhone = (phone) => {
    if (phone) window.open(`tel:${phone}`)
  }

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green" /></div>

  if (error || !delivery) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-5">
      <AlertTriangle size={48} className="text-red-400" />
      <p className="text-gray-600 font-medium text-center">{error || 'Delivery not found.'}</p>
      <div className="flex gap-3">
        <button onClick={fetchDelivery} className="flex items-center gap-2 px-5 py-2.5 bg-afri-green text-white rounded-xl font-semibold"><RefreshCw size={16} /> Retry</button>
        <button onClick={() => navigate('/rider/deliveries')} className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold">Back</button>
      </div>
    </div>
  )

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === delivery.status)
  const nextAction = NEXT_ACTION[delivery.status]

  const actualVendor = delivery.vendor || (delivery.items?.length > 0 ? delivery.items[0].vendor : null);
  const pickupAddr = delivery.pickupAddress || actualVendor?.address || actualVendor?.location || null;
  const vendorName = actualVendor?.name || actualVendor?.storeName || '—';
  const dropoffAddr = delivery.dropoffAddress || delivery.deliveryAddress || null
  const vendorPhone = actualVendor?.phone || null;
  const customerName = delivery.customer?.name || delivery.deliveryAddress?.fullName || '—'
  const customerPhone = delivery.deliveryAddress?.phone || null

  const orderItems = delivery.items || []
  const earnings = Number(delivery.riderEarnings || delivery.earnings || delivery.deliveryFee || 0).toFixed(2)

  const formatAddr = (addr) => {
    if (!addr) return '—'
    if (typeof addr === 'string') return addr
    return [addr.street, addr.city, addr.postcode].filter(Boolean).join(', ')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      {/* Header */}
      <div className="bg-gradient-to-br from-afri-gray-900 via-[#1A1A1A] to-[#2B3632] text-white py-6">
        <div className="max-w-2xl mx-auto px-4">
          <button onClick={() => navigate('/rider/deliveries')} className="flex items-center gap-1 text-afri-green-light hover:text-white mb-3 text-sm">
            <ArrowLeft size={16} /> Back to Deliveries
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{delivery.orderNumber || deliveryId}</h1>
              <p className="text-afri-green-light text-sm mt-0.5">
                {orderItems.length > 0 ? `${orderItems.length} items` : ''}{delivery.distance ? ` • ${delivery.distance} km` : ''}
              </p>
            </div>
            <span className="text-2xl font-bold text-emerald-400">£{earnings}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Progress Tracker */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Delivery Progress</h2>
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
              <div className="h-full bg-afri-green transition-all" style={{ width: `${currentStepIdx >= 0 ? (currentStepIdx / (STATUS_STEPS.length - 1)) * 100 : 0}%` }} />
            </div>
            <div className="relative flex justify-between">
              {STATUS_STEPS.map((step, idx) => (
                <div key={step.key} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 ${idx <= currentStepIdx ? 'bg-afri-green text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {step.icon}
                  </div>
                  <p className={`mt-2 text-xs font-medium text-center ${idx <= currentStepIdx ? 'text-afri-green' : 'text-gray-400'}`}>{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><MapPin size={16} className="text-afri-green" /> Pickup</h2>
            {['assigned_to_rider'].includes(delivery.status) && <span className="px-3 py-1 bg-afri-green-pale text-afri-green-dark rounded-full text-xs font-semibold">Current Stop</span>}
          </div>
          <p className="font-semibold text-gray-900">{vendorName}</p>
          <p className="text-gray-500 text-sm mt-0.5">{formatAddr(pickupAddr)}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => openNavigation(pickupAddr)} className="flex-1 py-2.5 bg-afri-green text-white rounded-lg font-semibold text-sm hover:bg-afri-green-dark">Navigate</button>
            {vendorPhone && <button onClick={() => callPhone(vendorPhone)} className="px-4 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200"><Phone size={18} className="text-gray-600" /></button>}
          </div>
        </div>

        {/* Delivery Location */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><MapPin size={16} className="text-afri-green" /> Delivery</h2>
            {['picked_up_by_rider', 'out_for_delivery'].includes(delivery.status) && <span className="px-3 py-1 bg-afri-green-pale text-afri-green-dark rounded-full text-xs font-semibold">Current Stop</span>}
          </div>
          <p className="font-semibold text-gray-900">{customerName}</p>
          <p className="text-gray-500 text-sm mt-0.5">{formatAddr(dropoffAddr)}</p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => openNavigation(dropoffAddr)} className="flex-1 py-2.5 bg-afri-green text-white rounded-lg font-semibold text-sm hover:bg-afri-green-dark">Navigate</button>
            {customerPhone && <button onClick={() => callPhone(customerPhone)} className="px-4 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200"><Phone size={18} className="text-gray-600" /></button>}
          </div>
        </div>

        {/* Action Button */}
        {nextAction && delivery.status !== 'delivered' && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => nextAction.action && handleAction(nextAction.action)}
            disabled={actionLoading || !nextAction.action}
            className={`w-full py-4 rounded-xl font-bold text-lg ${nextAction.action ? 'text-white' : ''} ${nextAction.color} transition-all`}
          >
            {actionLoading ? 'Updating...' : nextAction.label}
          </motion.button>
        )}
      </div>

      {/* PIN Modal */}
      {/* UNIFIED PIN Verification Modal */}
      <AnimatePresence>
        {pinModalType && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => { setPinModalType(null); setPin(''); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/4 left-16 sm:left-1/3 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-2xl p-6 z-50 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${pinModalType === 'pickup' ? 'bg-orange-100' : 'bg-emerald-100'}`}>
                  <Lock size={28} className={pinModalType === 'pickup' ? 'text-orange-500' : 'text-emerald-500'} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {pinModalType === 'pickup' ? 'Secure Pickup' : 'Complete Delivery'}
                </h3>
                <p className="text-sm text-gray-500 mt-2">
                  {pinModalType === 'pickup'
                    ? 'Enter the 4-digit PIN provided by the vendor.'
                    : 'Enter the 4-digit PIN provided by the customer.'}
                </p>
              </div>

              <input
                type="text"
                maxLength="4"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center text-4xl font-black tracking-[0.5em] text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl py-4 mb-6 focus:border-afri-green focus:outline-none transition-colors"
                placeholder="••••"
                autoFocus
              />

              <div className="flex gap-3">
                <button
                  onClick={() => { setPinModalType(null); setPin(''); }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePinSubmit}
                  disabled={pin.length !== 4 || actionLoading}
                  className={`flex-1 py-3 text-white font-bold rounded-xl disabled:opacity-50 transition-colors ${pinModalType === 'pickup' ? 'bg-[#FF8F00] hover:bg-[#E68100]' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                >
                  {actionLoading ? 'Verifying...' : 'Verify & Finish'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default RiderDeliveryDetail