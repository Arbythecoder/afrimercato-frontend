import { useState, useEffect } from 'react'
import { orderAPI } from '../services/api'

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)

  const statusOptions = [
    { value: 'all', label: 'All Orders', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'preparing', label: 'Preparing', color: 'purple' },
    { value: 'ready', label: 'Ready', color: 'indigo' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'orange' },
    { value: 'delivered', label: 'Delivered', color: 'green' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' },
  ]

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll()
      if (response.data.success) {
        setOrders(response.data.data.orders || [])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus)
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
      setShowStatusModal(false)
      setSelectedOrder(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update order status')
    }
  }

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status)
    return statusObj?.color || 'gray'
  }

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter(order => order.status === filterStatus)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-afri-green"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage and track customer orders</p>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status.value
                  ? `bg-${status.color}-100 text-${status.color}-800 border-2 border-${status.color}-300`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status.label}
              {status.value !== 'all' && (
                <span className="ml-2 text-xs bg-white px-2 py-0.5 rounded-full">
                  {orders.filter(o => o.status === status.value).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {filterStatus === 'all'
              ? 'Orders will appear here when customers make purchases'
              : `No ${filterStatus} orders at the moment`}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{order.customer?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.items?.length || 0} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        £{order.pricing?.total?.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowDetailModal(true)
                        }}
                        className="text-afri-green hover:text-afri-green-dark"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowStatusModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <div key={order._id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{order.items?.length || 0} items</p>
                    <p className="text-sm font-semibold text-gray-900">£{order.pricing?.total?.toLocaleString()}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowDetailModal(true)
                      }}
                      className="px-3 py-1 bg-afri-green text-white text-sm rounded-lg hover:bg-afri-green-dark"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setShowStatusModal(true)
                      }}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      Update
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <OrderDetailModal order={selectedOrder} onClose={() => setShowDetailModal(false)} />
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <StatusUpdateModal
          order={selectedOrder}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleStatusUpdate}
          statusOptions={statusOptions}
        />
      )}
    </div>
  )
}

import { generateInvoicePDF, generateShippingLabel, generatePackingSlip } from '../utils/pdfGenerator'

// Order Detail Modal Component
function OrderDetailModal({ order, onClose }) {
  const [loading, setLoading] = useState({
    invoice: false,
    shipping: false,
    packing: false
  })

  const handleGenerateDocument = async (type) => {
    setLoading(prev => ({ ...prev, [type]: true }))
    try {
      let doc
      switch (type) {
        case 'invoice':
          doc = await generateInvoicePDF(order)
          break
        case 'shipping':
          doc = await generateShippingLabel(order)
          break
        case 'packing':
          doc = await generatePackingSlip(order)
          break
        default:
          throw new Error('Invalid document type')
      }
      doc.save(`${type}-${order.orderNumber}.pdf`)
    } catch (error) {
      console.error(`Error generating ${type}:`, error)
      alert(`Failed to generate ${type}. Please try again.`)
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <div className="flex mt-2 space-x-2">
              <button
                onClick={() => handleGenerateDocument('invoice')}
                disabled={loading.invoice}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition disabled:opacity-50"
              >
                {loading.invoice ? 'Generating...' : '📄 Invoice'}
              </button>
              <button
                onClick={() => handleGenerateDocument('shipping')}
                disabled={loading.shipping}
                className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
              >
                {loading.shipping ? 'Generating...' : '🏷️ Shipping Label'}
              </button>
              <button
                onClick={() => handleGenerateDocument('packing')}
                disabled={loading.packing}
                className="px-3 py-1 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition disabled:opacity-50"
              >
                {loading.packing ? 'Generating...' : '📦 Packing Slip'}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-semibold text-gray-900">{order.orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold text-gray-900 capitalize">{order.status.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="font-semibold text-afri-green">£{order.pricing?.total?.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <p className="text-sm"><span className="font-medium">Name:</span> {order.customer?.name || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium">Email:</span> {order.customer?.email || 'N/A'}</p>
              <p className="text-sm"><span className="font-medium">Phone:</span> {order.deliveryAddress?.phone || 'N/A'}</p>
            </div>
          </div>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Delivery Address</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm">{order.deliveryAddress.street}</p>
                <p className="text-sm">{order.deliveryAddress.city}, {order.deliveryAddress.state}</p>
                <p className="text-sm">{order.deliveryAddress.country}</p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-900">£{item.price?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="border-t pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">£{order.pricing?.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="font-medium">£{order.pricing?.deliveryFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span className="text-afri-green">£{order.pricing?.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Status Update Modal Component
function StatusUpdateModal({ order, onClose, onUpdate, statusOptions }) {
  const [newStatus, setNewStatus] = useState(order.status)

  const validStatuses = statusOptions.filter(s => s.value !== 'all')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Update Order Status</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Order: {order.orderNumber}</p>
            <p className="text-sm text-gray-600">Current Status: <span className="font-medium capitalize">{order.status.replace('_', ' ')}</span></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green"
            >
              {validStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              onClick={() => onUpdate(order._id, newStatus)}
              className="flex-1 px-4 py-2 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark transition font-medium"
            >
              Update Status
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orders
