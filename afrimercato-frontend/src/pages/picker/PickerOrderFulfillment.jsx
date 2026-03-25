import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react'
import DeliveryChat from '../../components/DeliveryChat'

const ISSUE_OPTIONS = [
  { reason: 'out_of_stock',    label: 'Out of Stock',     desc: 'Item is not available',          icon: '📦' },
  { reason: 'quality_issue',   label: 'Quality Issue',    desc: "Doesn't meet quality standards", icon: '⚠️' },
  { reason: 'wrong_item',      label: 'Wrong Item',       desc: "Can't find the correct item",    icon: '🔍' },
  { reason: 'partial_quantity',label: 'Partial Quantity', desc: 'Less stock than ordered',        icon: '⚖️' },
]

const PICKER_CHAT_STATUSES = ['assigned_to_picker', 'picking', 'packed', 'ready_for_delivery', 'assigned_picker', 'picking', 'picked', 'packing']

function PickerOrderFulfillment() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [completeLoading, setCompleteLoading] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [error, setError] = useState(null)
  const [showChat, setShowChat] = useState(false)

  const fetchOrderItems = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let res = await apiCall(`/pickers/${orderId}/items`)
      if (res?.data) {
        setItems(res.data.items || [])
        const ordersRes = await apiCall('/pickers/my-orders')
        const found = (ordersRes?.data?.orders || []).find(o => (o.id || o._id) === orderId)
        setOrder(found || { id: orderId, orderNumber: orderId })
      }
    } catch (err) {
      if (err?.status === 404 || err?.message?.includes('404') || err?.message?.includes('not found')) {
        try {
          await apiCall(`/pickers/${orderId}/claim`, { method: 'POST' })
          const res2 = await apiCall(`/pickers/${orderId}/items`)
          if (res2?.data) {
            setItems(res2.data.items || [])
            const ordersRes = await apiCall('/pickers/my-orders')
            const found = (ordersRes?.data?.orders || []).find(o => (o.id || o._id) === orderId)
            setOrder(found || { id: orderId, orderNumber: orderId })
          }
        } catch (_e) {
          setError('Could not load this order. It may have already been claimed by someone else.')
        }
      } else {
        setError('Failed to load order items. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => { fetchOrderItems() }, [fetchOrderItems])

  const handlePickItem = async (item) => {
    const itemId = item.id || item._id
    setActionLoading(itemId)
    try {
      await apiCall(`/pickers/${orderId}/items/${itemId}/pick`, {
        method: 'POST',
        body: JSON.stringify({ quantity: item.quantityOrdered })
      })
      setItems(prev => prev.map(i =>
        (i.id || i._id) === itemId
          ? { ...i, status: i.status === 'picked' ? 'pending' : 'picked', quantityPicked: i.quantityOrdered }
          : i
      ))
    } catch (_e) {
      alert('Failed to update item. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReportIssue = async (item, reason) => {
    const itemId = item.id || item._id
    setActionLoading(itemId)
    setShowIssueModal(false)
    setSelectedItem(null)
    try {
      await apiCall(`/pickers/${orderId}/items/${itemId}/issue`, {
        method: 'POST',
        body: JSON.stringify({ reason })
      })
      setItems(prev => prev.map(i =>
        (i.id || i._id) === itemId
          ? { ...i, status: 'unavailable', unavailableReason: reason }
          : i
      ))
    } catch (_e) {
      alert('Failed to report issue. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleComplete = async () => {
    const allHandled = items.every(i => ['picked', 'unavailable', 'substituted'].includes(i.status))
    if (!allHandled) {
      alert('Please pick or report issues for all items before completing.')
      return
    }
    setCompleteLoading(true)
    try {
      await apiCall(`/pickers/${orderId}/complete-packing`, { method: 'POST' })
      navigate('/picker/dashboard')
    } catch (_e) {
      alert('Failed to complete order. Please try again.')
    } finally {
      setCompleteLoading(false)
    }
  }

  const handledCount = items.filter(i => ['picked', 'unavailable', 'substituted'].includes(i.status)).length
  const totalItems = items.length
  const progress = totalItems > 0 ? (handledCount / totalItems) * 100 : 0
  const allDone = handledCount === totalItems && totalItems > 0

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 px-5 pt-14 pb-8">
          <div className="h-5 bg-white/20 rounded w-32 mb-1 animate-pulse" />
          <div className="h-4 bg-white/10 rounded w-20 animate-pulse" />
        </div>
        <div className="px-5 py-5 space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="bg-white rounded-2xl h-20 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-5">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <p className="text-gray-700 font-semibold text-center">{error}</p>
        <button
          onClick={() => navigate('/picker/dashboard')}
          className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-br from-orange-500 to-orange-700">
        <div className="px-5 pt-12 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/picker/dashboard')}
              className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-bold truncate">
                {order?.orderNumber || `Order ${orderId}`}
              </h1>
              <p className="text-orange-200 text-xs">
                {order?.vendor?.storeName || order?.vendor || '—'}
                {order?.customer?.name ? ` · ${order.customer.name}` : ''}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white font-black text-xl">{handledCount}/{totalItems}</p>
              <p className="text-orange-200 text-xs">handled</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-orange-400/50 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-orange-200 text-xs mt-1.5">
            <span>{Math.round(progress)}% complete</span>
            <span>{totalItems - handledCount} remaining</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Special instructions */}
        {order?.specialInstructions && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
            <span className="text-xl flex-shrink-0">📝</span>
            <div>
              <p className="text-amber-800 font-semibold text-sm">Special Instructions</p>
              <p className="text-amber-700 text-sm mt-0.5">{order.specialInstructions}</p>
            </div>
          </div>
        )}

        {/* Items list */}
        {items.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-400">No items found for this order</p>
          </div>
        ) : (
          <AnimatePresence>
            {items.map((item, idx) => {
              const itemId = item.id || item._id
              const isPicked = item.status === 'picked'
              const isUnavailable = item.status === 'unavailable' || item.status === 'substituted'
              const isHandled = isPicked || isUnavailable
              const isLoading = actionLoading === itemId
              const productName = item.product?.name || `Item ${idx + 1}`
              const productImage = item.product?.images?.[0]

              return (
                <motion.div
                  key={itemId}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: isHandled ? 0.6 : 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all ${isHandled ? 'opacity-60' : ''}`}
                >
                  {/* Top accent */}
                  <div className={`h-0.5 w-full ${isPicked ? 'bg-emerald-500' : isUnavailable ? 'bg-red-400' : 'bg-gray-100'}`} />

                  <div className="flex items-stretch">
                    {/* Product image / placeholder */}
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-50 overflow-hidden">
                      {productImage ? (
                        <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 p-3 min-w-0">
                      <p className={`font-semibold text-sm truncate ${isHandled ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {productName}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Qty: {item.quantityOrdered}
                        {item.quantityPicked > 0 && item.quantityPicked !== item.quantityOrdered && ` · picked: ${item.quantityPicked}`}
                      </p>
                      {isUnavailable && item.unavailableReason && (
                        <span className="inline-block mt-1.5 text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">
                          {ISSUE_OPTIONS.find(o => o.reason === item.unavailableReason)?.label || item.unavailableReason}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col items-center justify-center gap-2 px-3 border-l border-gray-50">
                      {/* Pick / un-pick button */}
                      <button
                        onClick={() => handlePickItem(item)}
                        disabled={isLoading || isUnavailable}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                          isPicked
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-100 text-gray-300 hover:bg-emerald-50 hover:text-emerald-400'
                        } disabled:opacity-40`}
                      >
                        {isLoading
                          ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          : <CheckCircle2 size={20} strokeWidth={isPicked ? 2.5 : 1.5} />
                        }
                      </button>

                      {/* Issue button */}
                      {!isHandled && (
                        <button
                          onClick={() => { setSelectedItem(item); setShowIssueModal(true) }}
                          disabled={isLoading}
                          className="w-11 h-11 rounded-2xl bg-gray-50 text-gray-300 hover:bg-red-50 hover:text-red-400 flex items-center justify-center transition-all disabled:opacity-40"
                        >
                          <AlertTriangle size={18} strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Location badge if available */}
                  {item.notes && (
                    <div className="px-3 pb-3 flex items-center gap-1.5">
                      <MapPin size={11} className="text-orange-400" />
                      <span className="text-xs text-orange-600 font-mono font-semibold">{item.notes}</span>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Sticky complete button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-white/95 backdrop-blur-xl border-t border-gray-100">
        <motion.button
          onClick={handleComplete}
          disabled={!allDone || completeLoading}
          whileTap={allDone ? { scale: 0.97 } : {}}
          className={`w-full py-4 rounded-2xl font-bold text-base transition-all ${
            allDone && !completeLoading
              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
              : 'bg-gray-100 text-gray-400'
          }`}
        >
          {completeLoading
            ? <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Completing...
              </span>
            : allDone
              ? '✓ Complete & Ready for Delivery'
              : `${totalItems - handledCount} more item${totalItems - handledCount !== 1 ? 's' : ''} to handle`
          }
        </motion.button>
      </div>

      {/* Floating order chat */}
      {orderId && (
        <>
          <button
            onClick={() => setShowChat(v => !v)}
            className="fixed bottom-24 right-5 z-40 bg-green-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors"
            aria-label="Toggle chat"
          >
            💬
          </button>
          {showChat && (
            <div className="fixed bottom-40 right-5 z-50">
              <DeliveryChat
                orderId={orderId}
                label="Order Chat"
                onClose={() => setShowChat(false)}
              />
            </div>
          )}
        </>
      )}

      {/* Issue Modal */}
      <AnimatePresence>
        {showIssueModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => { setShowIssueModal(false); setSelectedItem(null) }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="bg-white rounded-t-3xl w-full p-6 pb-10"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <h2 className="text-lg font-bold text-gray-900 mb-1">Report an Issue</h2>
              <p className="text-sm text-gray-400 mb-5">
                {selectedItem.product?.name || `Item ${selectedItem.id || selectedItem._id}`}
              </p>
              <div className="space-y-2">
                {ISSUE_OPTIONS.map(({ reason, label, desc, icon }) => (
                  <button
                    key={reason}
                    onClick={() => handleReportIssue(selectedItem, reason)}
                    className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-orange-50 hover:border-orange-200 border border-transparent transition-all text-left active:scale-[0.98]"
                  >
                    <span className="text-2xl w-8 text-center flex-shrink-0">{icon}</span>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => { setShowIssueModal(false); setSelectedItem(null) }}
                className="w-full mt-4 py-3.5 text-gray-400 font-semibold text-sm"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PickerOrderFulfillment
