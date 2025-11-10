import { useState, useEffect } from 'react'
import PackingChecklist from './PackingChecklist'
import PickerAssignment from './PickerAssignment'
import OrderStatusControls from './OrderStatusControls'
import OrderStatusTimeline from './OrderStatusTimeline'
import RiderRating from './RiderRating'

// Order status badge colors using client theme
const statusColors = {
  pending: 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900',
  confirmed: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  assigned_picker: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
  picking: 'bg-gradient-to-r from-purple-600 to-purple-700 text-white',
  picked: 'bg-gradient-to-r from-purple-700 to-purple-800 text-white',
  packing: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
  ready_for_pickup: 'bg-gradient-to-r from-teal-500 to-teal-600 text-white',
  preparing: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  ready: 'bg-gradient-to-r from-green-600 to-green-700 text-white',
  'out-for-delivery': 'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
  delivered: 'bg-gradient-to-r from-green-700 to-green-800 text-white',
  completed: 'bg-gradient-to-r from-gray-700 to-gray-800 text-white',
  cancelled: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
}

const statusNames = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  assigned_picker: 'Picker Assigned',
  picking: 'Picking Items',
  picked: 'Items Picked',
  packing: 'Packing',
  ready_for_pickup: 'Ready for Pickup',
  preparing: 'Preparing',
  ready: 'Ready',
  'out-for-delivery': 'Out for Delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function OrderDetailsModal({ order, onClose, onStatusUpdate, onRefresh }) {
  const [activeTab, setActiveTab] = useState('details')
  const [packingProgress, setPackingProgress] = useState([])
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Initialize packing progress if in packing status
    if (order.status === 'packing' || order.status === 'picking') {
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
      // Auto-transition to ready_for_pickup when all items packed
      handleStatusUpdate('ready_for_pickup', 'All items packed and ready')
    }
  }

  const handlePickerAssigned = async (pickerId) => {
    try {
      await handleStatusUpdate('assigned_picker', `Picker ${pickerId} assigned`)
    } catch (error) {
      console.error('Error assigning picker:', error)
    }
  }

  // Calculate order metrics
  const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
  const estimatedPrepTime = Math.ceil(totalItems * 2) // 2 mins per item

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
              { id: 'packing', label: 'Packing', icon: '📦', show: ['packing', 'picking', 'assigned_picker'].includes(order.status) },
              { id: 'picker', label: 'Picker', icon: '👤', show: ['pending', 'confirmed'].includes(order.status) },
              { id: 'rating', label: 'Rate Rider', icon: '⭐', show: ['delivered', 'completed'].includes(order.status) },
            ].map((tab) => {
              if (tab.show === false || (tab.show && !tab.show)) return null

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${
                    activeTab === tab.id
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
              {/* Action Buttons */}
              <OrderStatusControls
                order={order}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={isUpdating}
              />

              {/* Customer Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#00897B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Name</p>
                    <p className="font-semibold text-gray-900">{order.deliveryAddress?.fullName || order.customer?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Phone</p>
                    <p className="font-semibold text-gray-900">{order.deliveryAddress?.phone || order.customer?.phone || 'N/A'}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2 bg-white rounded-lg p-4 shadow-sm">
                    <p className="text-sm text-gray-500 mb-1">Delivery Address</p>
                    <p className="font-semibold text-gray-900">
                      {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.postalCode}
                    </p>
                    {order.deliveryAddress?.instructions && (
                      <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-[#FFB300] rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Delivery Note:</span> {order.deliveryAddress.instructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items Card */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-[#00897B] to-[#26A69A] text-white px-6 py-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Order Items ({order.items?.length || 0})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items?.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
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
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                {item.notes && (
                                  <div className="text-xs text-gray-500 mt-1">Note: {item.notes}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">£{item.price?.toFixed(2)}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 font-medium">
                              {item.quantity} {item.unit}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-semibold">
                            £{item.subtotal?.toFixed(2)}
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
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">£{order.pricing?.subtotal?.toFixed(2)}</span>
                  </div>
                  {order.pricing?.deliveryFee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery Fee</span>
                      <span className="text-gray-900 font-medium">£{order.pricing.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  {order.pricing?.tax > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax (VAT)</span>
                      <span className="text-gray-900 font-medium">£{order.pricing.tax.toFixed(2)}</span>
                    </div>
                  )}
                  {order.pricing?.discount > 0 && (
                    <div className="flex justify-between text-sm text-[#00897B]">
                      <span>Discount</span>
                      <span className="font-medium">-£{order.pricing.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                    <span className="font-bold text-lg text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-[#00897B]">£{order.pricing?.total?.toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mt-4 pt-4 border-t border-gray-300 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Payment Method:</span>
                    <span className="font-semibold text-gray-900 capitalize px-3 py-1 bg-white rounded-lg shadow-sm">
                      {order.payment?.method || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className={`font-semibold px-3 py-1 rounded-lg shadow-sm ${
                      order.payment?.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.payment?.status?.toUpperCase() || 'PENDING'}
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
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Last updated: {new Date(order.updatedAt || order.createdAt).toLocaleString('en-GB', {
              dateStyle: 'short',
              timeStyle: 'short'
            })}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsModal
