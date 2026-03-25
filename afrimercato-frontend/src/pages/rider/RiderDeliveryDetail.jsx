import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Phone, Package, AlertTriangle, RefreshCw } from 'lucide-react'
import DeliveryChat from '../../components/DeliveryChat'

// Statuses where the rider is actively handling the delivery
const CHAT_ACTIVE_STATUSES = ['assigned_to_rider', 'rider_accepted', 'picked_up_by_rider', 'out_for_delivery', 'accepted', 'picked_up', 'in_transit']

// Map backend Delivery statuses to UI steps
const STATUS_STEPS = [
  { key: 'accepted',    label: 'Accepted',   icon: '📋' },
  { key: 'picked_up',  label: 'Picked Up',  icon: '🏪' },
  { key: 'in_transit', label: 'In Transit', icon: '🚚' },
  { key: 'delivered',  label: 'Delivered',  icon: '✓'  },
]

// What action button to show for each current status
// Backend endpoints: POST /start (accepted→picked_up), POST /complete (picked_up|in_transit→delivered)
// There is no explicit /transit endpoint — in_transit is set automatically via /location/update.
const NEXT_ACTION = {
  accepted:    { label: 'Confirm Pickup',    action: 'start',    color: 'bg-afri-green hover:bg-afri-green-dark' },
  picked_up:   { label: 'Mark as Delivered', action: 'complete', color: 'bg-emerald-600 hover:bg-emerald-700' },
  in_transit:  { label: 'Mark as Delivered', action: 'complete', color: 'bg-emerald-600 hover:bg-emerald-700' },
}

function RiderDeliveryDetail() {
  const { deliveryId } = useParams()
  const navigate = useNavigate()
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showChat, setShowChat] = useState(false)

  const fetchDelivery = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Active deliveries endpoint returns all assigned/accepted/picked_up/in_transit
      const res = await apiCall('/riders/deliveries/active')
      const deliveries = res?.data?.deliveries || []
      const found = deliveries.find(d => (d.id || d._id) === deliveryId || String(d.id || d._id) === deliveryId)

      if (found) {
        setDelivery(found)
      } else {
        // May have been completed — try tracking endpoint
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
    setActionLoading(true)
    try {
      await apiCall(`/riders/deliveries/${deliveryId}/${action}`, { method: 'POST' })
      if (action === 'complete') {
        // POST /complete marks delivery as delivered regardless of whether
        // previous status was picked_up or in_transit — always go back to list
        navigate('/rider/deliveries')
      } else {
        await fetchDelivery()
      }
    } catch (err) {
      alert(err?.message || `Failed to update status. Please try again.`)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green" />
      </div>
    )
  }

  if (error || !delivery) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-5">
        <AlertTriangle size={48} className="text-red-400" />
        <p className="text-gray-600 font-medium text-center">{error || 'Delivery not found.'}</p>
        <div className="flex gap-3">
          <button
            onClick={fetchDelivery}
            className="flex items-center gap-2 px-5 py-2.5 bg-afri-green text-white rounded-xl font-semibold"
          >
            <RefreshCw size={16} /> Retry
          </button>
          <button
            onClick={() => navigate('/rider/deliveries')}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-semibold"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === delivery.status)
  const nextAction = NEXT_ACTION[delivery.status]

  // Normalise address fields from backend formatDelivery shape
  const pickupAddr = delivery.pickupAddress
  const dropoffAddr = delivery.dropoffAddress
  const vendorName  = delivery.vendor?.name || delivery.vendor?.storeName || '—'
  const vendorPhone = delivery.vendor?.phone || null
  const customerName  = delivery.customer?.name || '—'
  const customerPhone = delivery.customer?.phone || null
  const orderItems = delivery.order?.items || []
  const earnings   = Number(delivery.riderEarnings || delivery.earnings || 0).toFixed(2)

  const formatAddr = (addr) => {
    if (!addr) return '—'
    if (typeof addr === 'string') return addr
    return [addr.street, addr.city, addr.postcode].filter(Boolean).join(', ')
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
              <div
                className="h-full bg-afri-green transition-all"
                style={{ width: `${currentStepIdx >= 0 ? (currentStepIdx / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
              />
            </div>
            <div className="relative flex justify-between">
              {STATUS_STEPS.map((step, idx) => (
                <div key={step.key} className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 ${
                    idx <= currentStepIdx ? 'bg-afri-green text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.icon}
                  </div>
                  <p className={`mt-2 text-xs font-medium text-center ${
                    idx <= currentStepIdx ? 'text-afri-green' : 'text-gray-400'
                  }`}>{step.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={16} className="text-afri-green" /> Pickup
            </h2>
            {['accepted'].includes(delivery.status) && (
              <span className="px-3 py-1 bg-afri-green-pale text-afri-green-dark rounded-full text-xs font-semibold">Current Stop</span>
            )}
          </div>
          <p className="font-semibold text-gray-900">{vendorName}</p>
          <p className="text-gray-500 text-sm mt-0.5">{formatAddr(pickupAddr)}</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => openNavigation(pickupAddr)}
              className="flex-1 py-2.5 bg-afri-green text-white rounded-lg font-semibold text-sm hover:bg-afri-green-dark"
            >
              Navigate
            </button>
            {vendorPhone && (
              <button
                onClick={() => callPhone(vendorPhone)}
                className="px-4 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200"
                aria-label="Call vendor"
              >
                <Phone size={18} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Delivery Location */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={16} className="text-afri-green" /> Delivery
            </h2>
            {['picked_up', 'in_transit'].includes(delivery.status) && (
              <span className="px-3 py-1 bg-afri-green-pale text-afri-green-dark rounded-full text-xs font-semibold">Current Stop</span>
            )}
          </div>
          <p className="font-semibold text-gray-900">{customerName}</p>
          <p className="text-gray-500 text-sm mt-0.5">{formatAddr(dropoffAddr)}</p>
          {delivery.deliveryInstructions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
              <p className="text-xs font-medium text-yellow-800">Instructions</p>
              <p className="text-xs text-yellow-700 mt-0.5">{delivery.deliveryInstructions}</p>
            </div>
          )}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => openNavigation(dropoffAddr)}
              className="flex-1 py-2.5 bg-afri-green text-white rounded-lg font-semibold text-sm hover:bg-afri-green-dark"
            >
              Navigate
            </button>
            {customerPhone && (
              <button
                onClick={() => callPhone(customerPhone)}
                className="px-4 py-2.5 bg-gray-100 rounded-lg hover:bg-gray-200"
                aria-label="Call customer"
              >
                <Phone size={18} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>

        {/* Order Items */}
        {orderItems.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Package size={16} className="text-afri-green" /> Items ({orderItems.length})
            </h2>
            <div className="space-y-2">
              {orderItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-bold">
                      {item.quantity}
                    </div>
                    <span className="text-sm text-gray-900">{item.name || item.product?.name || `Item ${idx + 1}`}</span>
                  </div>
                  {item.unit && <span className="text-xs text-gray-400">{item.unit}</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat with Customer */}
        {CHAT_ACTIVE_STATUSES.includes(delivery.status) && (
          <button
            onClick={() => setShowChat(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-3 bg-white border-2 border-green-600 text-green-700 rounded-xl font-semibold hover:bg-green-50 transition"
          >
            💬 {showChat ? 'Hide Chat' : 'Chat with Customer'}
          </button>
        )}

        {/* Action Button */}
        {nextAction && delivery.status !== 'delivered' && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => handleAction(nextAction.action)}
            disabled={actionLoading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg ${nextAction.color} disabled:opacity-60 disabled:cursor-not-allowed transition-all`}
          >
            {actionLoading ? 'Updating...' : nextAction.label}
          </motion.button>
        )}

        {delivery.status === 'delivered' && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center">
            <p className="text-emerald-700 font-bold text-lg">Delivery Complete!</p>
            <p className="text-emerald-600 text-sm mt-1">You earned £{earnings} for this delivery.</p>
          </div>
        )}
      </div>

      {/* Floating delivery chat panel */}
      {showChat && CHAT_ACTIVE_STATUSES.includes(delivery.status) && (
        <div className="fixed bottom-6 right-4 z-50">
          <DeliveryChat
            orderId={delivery.order?._id || delivery.order?.id || delivery.orderId}
            label="Chat with Customer"
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </div>
  )
}

export default RiderDeliveryDetail
