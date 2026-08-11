import { useState, useEffect } from 'react'
import PackingChecklist from './PackingChecklist'
import PickerAssignment from './PickerAssignment'
import OrderStatusControls from './OrderStatusControls'
import OrderStatusTimeline from './OrderStatusTimeline'
import RiderRating from './RiderRating'
import DeliveryChat from '../DeliveryChat'
import { Lock, Key, ShieldCheck, UserCheck, Package } from 'lucide-react'

const statusColors = {
  pending: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900',
  confirmed: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  preparing: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  assigned_to_picker: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
  picking: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
  packed: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
  ready_for_delivery: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white',
  assigned_to_rider: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white',
  rider_accepted: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  picked_up_by_rider: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
  out_for_delivery: 'bg-gradient-to-r from-blue-700 to-blue-800 text-white',
  delivered: 'bg-gradient-to-r from-green-600 to-green-700 text-white',
  completed: 'bg-gradient-to-r from-gray-700 to-gray-800 text-white',
  cancelled: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  failed: 'bg-gradient-to-r from-red-700 to-red-800 text-white',
}

const statusNames = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  assigned_to_picker: 'Picker Assigned',
  picking: 'Picking Items',
  packed: 'Items Packed',
  ready_for_delivery: 'Ready for Delivery',
  assigned_to_rider: 'Rider Assigned',
  rider_accepted: 'Rider Accepted',
  picked_up_by_rider: 'Picked Up by Rider',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed'
};

function OrderDetailsModal({ order, onClose, onStatusUpdate, onRefresh }) {
  const [activeTab, setActiveTab] = useState('details')
  const [packingProgress, setPackingProgress] = useState([])
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (order.status === 'picking') {
      const progress = order.items.map((item) => ({
        itemId: item._id || item.productId,
        packed: false,
      }))
      setPackingProgress(progress)
    }
  }, [order])

  const handleStatusUpdate = async (newStatus, note = '') => {
    setIsUpdating(true)
    try {
      await onStatusUpdate(order._id, newStatus, note)
      if (onRefresh) await onRefresh()
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePackingComplete = (packedItems) => {
    setPackingProgress(packedItems)
    const allPacked = packedItems.every((item) => item.packed)
    if (allPacked) {
      handleStatusUpdate('packed', 'All items packed and ready')
    }
  }

  const handlePickerAssigned = async (pickerId) => {
    try {
      if (order.status !== 'assigned_to_picker') {
        await handleStatusUpdate('assigned_to_picker', `Picker ${pickerId} assigned`)
      } else if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      console.error('Error assigning picker:', error)
    }
  }

  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const estimatedPrepTime = Math.ceil(totalItems * 2)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col animate-slideUp">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FFB300] to-[#FFA726] text-gray-900 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold">{order.orderNumber}</h2>
              <p className="text-gray-800 mt-1 text-sm">
                Placed on {new Date(order.createdAt).toLocaleString('en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </p>
              <div className="mt-2 flex items-center gap-3">
                <span className={`px-4 py-1.5 inline-flex text-sm font-semibold rounded-full shadow-lg ${statusColors[order.status]}`}>
                  {statusNames[order.status]}
                </span>
                <span className="text-sm text-gray-800">
                  {totalItems} items • Est. {estimatedPrepTime} mins
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-900 hover:text-gray-700 transition-all hover:rotate-90 duration-300"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex overflow-x-auto">
            {[
              { id: 'details', label: 'Order Details', icon: '📋' },
              { id: 'timeline', label: 'Timeline', icon: '📍' },
              { id: 'packing', label: 'Packing Check', icon: '📦', show: ['packing', 'picking', 'assigned_to_picker'].includes(order.status) },
              { id: 'picker', label: 'Assign Picker', icon: '👤', show: ['pending', 'confirmed'].includes(order.status) },
              { id: 'rating', label: 'Rate Rider', icon: '⭐', show: ['delivered', 'completed'].includes(order.status) },
              { id: 'chat', label: 'Chat Log', icon: '💬', show: !!order.rider },
            ].map((tab) => {
              if (tab.show === false) return null

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-bold transition-all duration-200 border-b-2 whitespace-nowrap ${activeTab === tab.id
                    ? 'border-[#FFB300] text-[#FFB300] bg-white'
                    : 'border-transparent text-gray-600 hover:text-[#FFB300] hover:bg-gray-100'
                    }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">

              {/* CANCELLATION REASON BANNER FOR VENDORS */}
              {(order.status === 'cancelled' || order.cancellationReason || order.cancellation?.reason) && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 shadow-sm mb-6 animate-fadeIn">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600 text-2xl font-bold">
                      🚫
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-bold text-red-900 text-lg">Order Cancelled</h4>
                        <span className="text-xs font-extrabold px-3 py-1 bg-red-200 text-red-900 rounded-full uppercase tracking-wider">
                          Cancelled by {order.cancellation?.cancelledBy || (order.cancellationReason?.toLowerCase().includes('vendor') ? 'Vendor' : 'Customer')}
                        </span>
                      </div>
                      <div className="mt-3 p-3.5 bg-white rounded-lg border border-red-200 shadow-xs">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reason for Cancellation</p>
                        <p className="text-base font-bold text-red-950">
                          "{order.cancellationReason || order.cancellation?.reason || 'No specific reason provided'}"
                        </p>
                      </div>
                      {(order.cancellation?.cancelledAt || order.cancelledAt || order.updatedAt) && (
                        <p className="text-xs text-red-700 mt-2 font-medium">
                          Cancelled on: {new Date(order.cancellation?.cancelledAt || order.cancelledAt || order.updatedAt).toLocaleString('en-GB', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Regular Order Controls */}
              <OrderStatusControls
                order={order}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={isUpdating}
              />

              {/* QUICK ACTION BYPASS FOR SMALL VENDORS */}
              {['pending', 'confirmed', 'preparing', 'assigned_to_picker', 'picking'].includes(order.status) && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mb-6">
                  <div>
                    <h4 className="font-bold text-amber-900 flex items-center gap-2 text-lg">
                      <Package size={20} className="text-amber-600" /> Quick Action: Packed & Ready
                    </h4>
                    <p className="text-sm text-amber-800 mt-1 max-w-xl">
                      Skip the picker assignment and packing checklist entirely. Click here to instantly mark the order as packed so riders can pick it up.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStatusUpdate('packed', 'Vendor bypassed picker and marked as packed directly')}
                    disabled={isUpdating}
                    className="whitespace-nowrap w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : '📦 Mark as Packed'}
                  </button>
                </div>
              )}

              {['packed', 'ready_for_delivery'].includes(order.status) && !order.rider && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mb-6">
                  <div>
                    <h4 className="font-bold text-emerald-900 flex items-center gap-2 text-lg">
                      <UserCheck size={20} className="text-emerald-600" /> Manual Delivery / Pickup
                    </h4>
                    <p className="text-sm text-emerald-800 mt-1 max-w-xl">
                      Don't need a platform rider? Skip the rider assignment phase and instantly mark this order as delivered (useful for in-house deliveries or customer pickups).
                    </p>
                  </div>
                  <button
                    onClick={() => handleStatusUpdate('delivered', 'Vendor bypassed rider and manually completed delivery')}
                    disabled={isUpdating}
                    className="whitespace-nowrap w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : '✅ Mark as Delivered'}
                  </button>
                </div>
              )}

              {/* QUICK ACTION FOR FINAL COMPLETION */}
              {order.status === 'delivered' && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mb-6">
                  <div>
                    <h4 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                      <ShieldCheck size={20} className="text-slate-600" /> Finalize Order
                    </h4>
                    <p className="text-sm text-slate-800 mt-1 max-w-xl">
                      The customer has received their items. Mark this order as completed to finalize the transaction, lock the records, and clear it from your active queue.
                    </p>
                  </div>
                  <button
                    onClick={() => handleStatusUpdate('completed', 'Order finalized and completed')}
                    disabled={isUpdating}
                    className="whitespace-nowrap w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-black rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : '🏁 Mark as Completed'}
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Info Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-200 h-full">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#00897B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-500 mb-1">Name</p>
                      <p className="font-bold text-gray-900">{order.deliveryAddress?.fullName || order.customer?.name || 'N/A'}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-500 mb-1">Phone</p>
                      <p className="font-bold text-gray-900">{order.deliveryAddress?.phone || order.customer?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-2 text-sm uppercase tracking-wider">Delivery Details</h3>
                    <p className="text-gray-700 text-sm">
                      <span className="font-semibold">Email:</span> {order.customer?.email || '—'}
                    </p>
                    <p className="text-gray-700 text-sm mt-1.5">
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
                      <p className="text-gray-700 text-sm mt-1.5 bg-amber-50 text-amber-800 p-2.5 rounded-lg border border-amber-100">
                        <span className="font-bold">Instructions:</span> {order.deliveryAddress.instructions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rider Info Card & UNIFIED SECURITY PIN SECURE VAULT */}
                {order.rider ? (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 shadow-sm border border-indigo-100 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Assigned Rider Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-50">
                          <p className="text-sm text-indigo-500 mb-1 font-semibold">Rider Name</p>
                          <p className="font-bold text-indigo-900">
                            {order.rider?.name || order.rider?.firstName || 'Rider Confirmed'}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-4 shadow-sm border border-indigo-50">
                          <p className="text-sm text-indigo-500 mb-1 font-semibold">Contact Number</p>
                          <p className="font-bold text-indigo-900">
                            {order.rider?.phone || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PIN EXTRACTION CONTAINER */}
                    {(order.security?.pickupPin || order.pickupPin) && (
                      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl p-4 shadow-md mt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Lock size={18} className="text-amber-100" />
                            <div>
                              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-100">Secure Pickup PIN</p>
                              <p className="text-xs text-white/90">Provide this to the rider on handover</p>
                            </div>
                          </div>
                          <div className="bg-white/20 backdrop-blur-md rounded-xl px-4 py-1.5 border border-white/20">
                            <span className="font-mono text-2xl font-black tracking-widest text-white">
                              {order.security?.pickupPin || order.pickupPin}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 bg-white rounded-lg p-4 shadow-sm flex items-center justify-between border border-indigo-50">
                      <span className="text-sm font-bold text-indigo-600">Rider Status:</span>
                      <span className="text-sm font-extrabold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full uppercase tracking-wide text-xs">
                        {statusNames[order.status] || 'Active'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-dashed border-gray-300 h-full flex flex-col items-center justify-center text-center py-12">
                    <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <p className="text-gray-700 font-bold">Awaiting Rider Match</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">
                      Once this order is marked packed and ready, nearby riders will instantly receive a ping on their Live Radar map.
                    </p>

                    {/* Fallback secure preview (shows pin ahead of rider matching if generated early) */}
                    {(order.security?.pickupPin || order.pickupPin) && (
                      <div className="mt-4 px-4 py-2 bg-[#00897B] text-white rounded-xl border border-gray-200 text-sm sm:text-[16.5px] font-mono font-bold  flex items-center gap-1.5">
                        <Key size={12} /> Pickup Code generated: <span className='font-extrabold!'>{order.security?.pickupPin || order.pickupPin}
                        </span></div>
                    )}
                  </div>
                )}
              </div>

              {/* Order Items Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#00897B] to-[#26A69A] text-white px-6 py-4">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Order Manifest ({order.items?.length || 0})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.image && (
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded-lg shadow-sm"
                                />
                              )}
                              <div>
                                <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                {item.notes && (
                                  <div className="text-xs text-gray-500 mt-1">Note: {item.notes}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">£{item.price?.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 font-bold text-xs text-gray-700">
                              {item.quantity} {item.unit || 'piece'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-black">
                            £{item.subtotal?.toFixed(2) || (item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-gray-900 font-bold">£{order.pricing?.subtotal?.toFixed(2)}</span>
                  </div>
                  {order.pricing?.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Delivery Fee</span>
                      <span className="text-gray-900 font-bold">£{order.pricing.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {order.pricing?.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">Tax (VAT)</span>
                      <span className="text-gray-900 font-bold">£{order.pricing.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {order.pricing?.discount > 0 && (
                    <div className="flex justify-between text-sm text-[#00897B] font-bold">
                      <span>Discount</span>
                      <span>-£{order.pricing.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                    <span className="font-black text-lg text-gray-900">Total</span>
                    <span className="font-black text-2xl text-[#00897B]">£{order.pricing?.total?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mt-4 pt-4 border-t border-gray-300 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Payment Method:</span>
                    <span className="font-bold text-gray-900 capitalize px-3 py-1 bg-white rounded-lg shadow-sm text-xs">
                      {order.paymentMethod || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className={`font-bold px-3 py-1 rounded-lg shadow-sm text-xs ${order.payment?.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {order.paymentStatus?.toUpperCase() || 'PENDING'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <OrderStatusTimeline order={order} />
          )}

          {activeTab === 'packing' && (
            <PackingChecklist
              order={order}
              onPackingComplete={handlePackingComplete}
              onStatusUpdate={handleStatusUpdate}
            />
          )}

          {activeTab === 'picker' && (
            <PickerAssignment
              order={order}
              onPickerAssigned={handlePickerAssigned}
            />
          )}

          {activeTab === 'rating' && (
            <RiderRating
              order={order}
              onRatingSubmitted={onRefresh}
            />
          )}

          {activeTab === 'chat' && (
            <div className="flex justify-center">
              <DeliveryChat
                orderId={order._id}
                label="Order Chat"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm font-medium text-gray-500">
            Last updated: {new Date(order.updatedAt || order.createdAt).toLocaleString('en-GB', {
              dateStyle: 'short',
              timeStyle: 'short'
            })}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div >
  )
}

export default OrderDetailsModal