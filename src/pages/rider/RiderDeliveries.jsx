import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, MapPin, Clock, Ruler, ChevronRight, RefreshCw } from 'lucide-react'

const STATUS_CONFIG = {
  pending:    { label: 'Awaiting Pickup', color: 'bg-amber-100 text-amber-700',  stripe: 'bg-amber-400' },
  accepted:   { label: 'Accepted',         color: 'bg-blue-100 text-blue-700',   stripe: 'bg-blue-400' },
  picked_up:  { label: 'Picked Up',        color: 'bg-blue-100 text-blue-700',   stripe: 'bg-blue-400' },
  in_transit: { label: 'In Transit',       color: 'bg-afri-green-pale text-afri-green-dark', stripe: 'bg-afri-green' },
  delivered:  { label: 'Delivered',        color: 'bg-emerald-100 text-emerald-700', stripe: 'bg-emerald-500' },
}

const FILTERS = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
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

  const handleAction = async (e, deliveryId, action) => {
    e.stopPropagation()
    setActionLoading(deliveryId + action)
    try {
      await apiCall(`/riders/deliveries/${deliveryId}/${action}`, { method: 'POST' })
      fetchDeliveries()
    } catch (_e) {
      alert(`Failed to ${action} delivery. Please try again.`)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-afri-gray-50">
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
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                filter === f.id
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
              {[1,2,3].map(i => <SkeletonDelivery key={i} />)}
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
                          <p className="text-xs text-gray-400">{d.vendor?.storeName || d.vendor || '—'}</p>
                        </div>
                        <span className="text-lg font-black text-emerald-600">
                          £{Number(d.riderEarnings || d.earnings || 0).toFixed(2)}
                        </span>
                      </div>

                      {/* Address */}
                      <div className="flex items-start gap-2 mb-3">
                        <MapPin size={14} className="text-afri-green mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {d.customer?.name || 'Customer'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {d.deliveryAddress?.street || d.deliveryAddress?.address || '—'}
                          </p>
                          {d.customer?.phone && <p className="text-xs text-afri-green mt-0.5">{d.customer.phone}</p>}
                        </div>
                      </div>

                      {/* Bottom row */}
                      {filter === 'active' && (
                        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            {d.order?.items?.length > 0 && <span className="flex items-center gap-1"><Package size={11} />{d.order.items.length} items</span>}
                            {d.distance && <span className="flex items-center gap-1"><Ruler size={11} />{d.distance} km</span>}
                            {d.estimatedDeliveryTime && <span className="flex items-center gap-1"><Clock size={11} />{new Date(d.estimatedDeliveryTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
                          </div>
                          <div className="flex items-center gap-2">
                            {d.status === 'pending' && (
                              <button
                                onClick={e => handleAction(e, id, 'accept')}
                                disabled={actionLoading === id + 'accept'}
                                className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                              >
                                {actionLoading === id + 'accept' ? '...' : 'Accept'}
                              </button>
                            )}
                            {d.status === 'accepted' && (
                              <button
                                onClick={e => handleAction(e, id, 'start')}
                                disabled={actionLoading === id + 'start'}
                                className="px-4 py-1.5 bg-afri-green text-white text-xs font-bold rounded-xl disabled:opacity-50"
                              >
                                {actionLoading === id + 'start' ? '...' : 'Confirm Pickup'}
                              </button>
                            )}
                            {(d.status === 'picked_up' || d.status === 'in_transit') && (
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
                              className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center"
                            >
                              <ChevronRight size={16} className="text-gray-400" />
                            </button>
                          </div>
                        </div>
                      )}

                      {filter === 'completed' && d.deliveredAt && (
                        <div className="pt-3 border-t border-gray-50 text-xs text-gray-400">
                          Delivered {new Date(d.deliveredAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default RiderDeliveries
