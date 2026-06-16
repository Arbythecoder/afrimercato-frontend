import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, MapPin, Clock, Ruler, ChevronRight, RefreshCw, Lock, XCircle } from 'lucide-react'

const STATUS_CONFIG = {
  pending: { label: 'Awaiting Pickup', color: 'bg-amber-100 text-amber-700', stripe: 'bg-amber-400' },
  assigned_to_rider: { label: 'Accepted', color: 'bg-blue-100 text-blue-700', stripe: 'bg-blue-400' },
  picked_up_by_rider: { label: 'Picked Up', color: 'bg-indigo-100 text-indigo-700', stripe: 'bg-indigo-400' },
  out_for_delivery: { label: 'In Transit', color: 'bg-afri-green-pale text-afri-green-dark', stripe: 'bg-afri-green' },
  delivered: { label: 'Delivered', color: 'bg-emerald-100 text-emerald-700', stripe: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', stripe: 'bg-red-500' },
}

const FILTERS = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  // { id: 'cancelled', label: 'Cancelled' },
]
function SkeletonDelivery() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="h-1 bg-gray-200 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded w-28" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-3 bg-gray-200 rounded w-44" />
        <div className="h-3 bg-gray-200 rounded w-36" />
      </div>
    </div>
  )
}

function RiderDeliveries() {
  const navigate = useNavigate()
  const [deliveries, setDeliveries] = useState([])
  const [filter, setFilter] = useState('active')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)

  const [activeDeliveryId, setActiveDeliveryId] = useState(null)
  const [pinModalType, setPinModalType] = useState(null)
  const [pin, setPin] = useState('')

  const fetchDeliveries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (filter === 'active') {
        const res = await apiCall('/riders/deliveries/active')
        setDeliveries(res?.data?.deliveries || [])
      } else if (filter === 'completed') {
        const res = await apiCall('/riders/earnings')
        setDeliveries(res?.data?.deliveries || [])
      } else if (filter === 'cancelled') {
        const res = await apiCall('/riders/deliveries/cancelled')
        setDeliveries(res?.data?.deliveries || [])
      } else {
        setDeliveries([])
      }
    } catch (_e) {
      setError('Failed to load deliveries.')
      setDeliveries([])
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchDeliveries() }, [fetchDeliveries])

  const handleAction = async (e, id, action) => {
    e.stopPropagation();
    if (!action) return;

    if (action === 'pickup') {
      setActiveDeliveryId(id)
      setPinModalType('pickup')
      return;
    }
    if (action === 'complete') {
      setActiveDeliveryId(id)
      setPinModalType('delivery')
      return;
    }

    if (action === 'unassign') {
      const confirmDrop = window.confirm("Are you sure you want to drop this gig? It will affect your completion rate.");
      if (!confirmDrop) return;
      await apiCall(`/riders/deliveries/${id}/unassign`, { method: 'POST' });
      return;
    }

    setActionLoading(id + action)
    try {
      await apiCall(`/riders/deliveries/${id}/${action}`, { method: 'POST' })
      await fetchDeliveries()
    } catch (err) {
      alert(err?.message || `Failed to update status. Please try again.`)
    } finally {
      setActionLoading(null)
    }
  }

  const handlePinSubmit = async () => {
    if (pin.length !== 4) return alert('Please enter a 4-digit PIN');
    if (!activeDeliveryId) return;

    setActionLoading('pin_submit')
    try {
      if (pinModalType === 'pickup') {
        await apiCall(`/riders/deliveries/${activeDeliveryId}/pickup`, {
          method: 'POST',
          body: JSON.stringify({ pickupPin: pin })
        })
      } else if (pinModalType === 'delivery') {
        await apiCall(`/riders/deliveries/${activeDeliveryId}/complete`, {
          method: 'POST',
          body: JSON.stringify({ deliveryPin: pin })
        })
      }

      setPinModalType(null)
      setPin('')
      setActiveDeliveryId(null)
      await fetchDeliveries()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Invalid PIN. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-afri-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-afri-gray-900 via-[#1A1A1A] to-[#2B3632] px-5 pt-14 pb-6 rounded-b-[2rem]">
        <h1 className="text-white text-2xl font-bold">My Deliveries</h1>
        <p className="text-afri-green-light text-sm mt-0.5">{deliveries.length} {filter} {deliveries.length === 1 ? 'delivery' : 'deliveries'}</p>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Filter Tabs */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${filter === f.id
                ? 'bg-afri-green text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchDeliveries} className="flex items-center gap-1 text-red-500 text-sm font-semibold">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {[1, 2, 3].map(i => <SkeletonDelivery key={i} />)}
            </motion.div>
          ) : deliveries.length === 0 ? (
            <motion.div key="empty" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-afri-green-pale rounded-full flex items-center justify-center mx-auto mb-4">
                <Package size={32} className="text-afri-green-light" />
              </div>
              <p className="font-bold text-gray-700 text-lg">No {filter} deliveries</p>
              <p className="text-gray-400 text-sm mt-1">
                {filter === 'active' ? 'New orders will appear here when assigned to you' : `Nothing here yet`}
              </p>
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {deliveries.map((d, i) => {
                const id = d.id || d._id
                const defaultStatus = filter === 'completed' ? 'delivered' : 'pending'
                const st = STATUS_CONFIG[d.status] || STATUS_CONFIG[defaultStatus]
                const actualVendor = d.vendor || (d.items?.length > 0 ? d.items[0].vendor : null);
                const vendorName = actualVendor?.storeName || actualVendor?.name || 'Partner Store';
                const orderItems = d.items || d.order?.items || [];
                const earnings = Number(d.riderEarnings || d.earnings || d.deliveryFee || 0).toFixed(2);

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => navigate(`/rider/delivery/${id}`)}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    <div className={`h-1 w-full ${st.stripe}`} />
                    <div className="p-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-gray-900 text-sm">
                              {d.order?.orderNumber || d.orderNumber || id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.color}`}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-medium">From: <span className="text-gray-800">{vendorName}</span></p>
                        </div>
                        <span className="text-lg font-black text-emerald-600">
                          £{earnings}
                        </span>
                      </div>

                      {/* Items Preview (NEW) */}
                      {orderItems.length > 0 && (
                        <div className="mb-4 bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <Package size={10} /> Order Items ({orderItems.length})
                          </p>
                          <div className="space-y-1">
                            {orderItems.slice(0, 2).map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs">
                                <span className="text-gray-700 font-medium truncate pr-2">
                                  <span className="text-gray-400 mr-1">{item.quantity}x</span>
                                  {item.name || item.product?.name || `Product`}
                                </span>
                              </div>
                            ))}
                            {orderItems.length > 2 && (
                              <p className="text-xs text-afri-green font-semibold pt-1">
                                + {orderItems.length - 2} more item(s)
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Address */}
                      <div className="flex items-start gap-2 mb-3">
                        <MapPin size={14} className="text-afri-green mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            Deliver to: {d.deliveryAddress?.fullName || d.customer?.name || 'Customer'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {d.deliveryAddress ? [d.deliveryAddress.street, d.deliveryAddress.city, d.deliveryAddress.postcode].filter(Boolean).join(', ') : d.deliveryAddress?.address || '—'}
                          </p>
                        </div>
                      </div>

                      {/* Bottom row / Actions */}
                      {filter === 'active' && (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {d.distance && <span className="flex items-center gap-1"><Ruler size={11} />{d.distance} km</span>}
                            {d.estimatedDeliveryTime && <span className="flex items-center gap-1"><Clock size={11} />{new Date(d.estimatedDeliveryTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {/* NEW: Drop Gig Button (Only visible before pickup) */}
                            {d.status === 'assigned_to_rider' && (
                              <button
                                onClick={e => handleAction(e, id, 'unassign')}
                                className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition-colors"
                              >
                                Drop
                              </button>
                            )}

                            {d.status === 'assigned_to_rider' && (
                              <button
                                onClick={e => handleAction(e, id, 'pickup')}
                                disabled={actionLoading === id + 'pickup'}
                                className="px-4 py-1.5 bg-afri-green text-white text-xs font-bold rounded-xl disabled:opacity-50"
                              >
                                {actionLoading === id + 'pickup' ? '...' : 'Confirm Pickup'}
                              </button>
                            )}
                            {(d.status === 'picked_up_by_rider' || d.status === 'out_for_delivery') && (
                              <button
                                onClick={e => handleAction(e, id, 'complete')}
                                disabled={actionLoading === id + 'complete'}
                                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                              >
                                {actionLoading === id + 'complete' ? '...' : '✓ Delivered'}
                              </button>
                            )}
                            <button
                              onClick={e => { e.stopPropagation(); navigate(`/rider/delivery/${id}`) }}
                              className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                            >
                              <ChevronRight size={16} className="text-gray-400" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* UNIFIED PIN Verification Modal */}
        <AnimatePresence>
          {pinModalType && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                onClick={() => { setPinModalType(null); setPin(''); setActiveDeliveryId(null); }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white rounded-2xl p-6 z-50 shadow-2xl"
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
                    onClick={() => { setPinModalType(null); setPin(''); setActiveDeliveryId(null); }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePinSubmit}
                    disabled={pin.length !== 4 || actionLoading === 'pin_submit'}
                    className={`flex-1 py-3 text-white font-bold rounded-xl disabled:opacity-50 transition-colors ${pinModalType === 'pickup' ? 'bg-[#FF8F00] hover:bg-[#E68100]' : 'bg-emerald-600 hover:bg-emerald-700'
                      }`}
                  >
                    {actionLoading === 'pin_submit' ? 'Verifying...' : 'Verify & Finish'}
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default RiderDeliveries