import { useState, useEffect } from 'react'
import { vendorAPI } from '../../services/api'

// Order status badge colors
const statusColors = {
  pending: 'bg-afri-yellow text-afri-gray-900',
  confirmed: 'bg-blue-500 text-white',
  assigned_picker: 'bg-purple-500 text-white',
  picking: 'bg-purple-600 text-white',
  picked: 'bg-purple-700 text-white',
  packing: 'bg-indigo-500 text-white',
  ready_for_pickup: 'bg-afri-green-light text-white',
  preparing: 'bg-orange-500 text-white',
  ready: 'bg-afri-green text-white',
  'out-for-delivery': 'bg-blue-600 text-white',
  delivered: 'bg-afri-green-dark text-white',
  completed: 'bg-gray-700 text-white',
  cancelled: 'bg-red-500 text-white',
}

// Status display names
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

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1,
    limit: 20,
  })
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
  })

  useEffect(() => {
    fetchOrders()
  }, [filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await vendorAPI.getOrders(filters)
      if (response.success) {
        setOrders(response.data.orders)
        setPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusFilter = (status) => {
    setFilters({ ...filters, status: status === filters.status ? '' : status, page: 1 })
  }

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value, page: 1 })
  }

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await vendorAPI.getOrder(orderId)
      if (response.success) {
        setSelectedOrder(response.data.order)
        setShowOrderModal(true)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
    }
  }

  const updateOrderStatus = async (orderId, newStatus, note = '') => {
    try {
      const response = await vendorAPI.updateOrderStatus(orderId, { status: newStatus, note })
      if (response.success) {
        // Refresh orders list
        fetchOrders()
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(response.data.order)
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert(error.response?.data?.message || 'Failed to update order status')
    }
  }

  // Get available status transitions for an order
  const getAvailableActions = (order) => {
    const transitions = {
      pending: [
        { status: 'confirmed', label: 'Confirm Order', color: 'afri-green' },
        { status: 'cancelled', label: 'Cancel', color: 'red-500' },
      ],
      confirmed: [
        { status: 'preparing', label: 'Start Preparing', color: 'orange-500' },
        { status: 'cancelled', label: 'Cancel', color: 'red-500' },
      ],
      preparing: [
        { status: 'ready', label: 'Mark Ready', color: 'afri-green' },
      ],
      ready: [
        { status: 'out-for-delivery', label: 'Out for Delivery', color: 'blue-600' },
      ],
      'out-for-delivery': [
        { status: 'delivered', label: 'Mark Delivered', color: 'afri-green-dark' },
      ],
      delivered: [
        { status: 'completed', label: 'Complete Order', color: 'gray-700' },
      ],
    }

    return transitions[order.status] || []
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-afri-gray-900">Orders</h1>
        <p className="text-afri-gray-600 mt-1">Manage and track all your orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Search by order number..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
            />
          </div>

          {/* Status filters */}
          <div className="flex flex-wrap gap-2">
            {['pending', 'confirmed', 'preparing', 'ready', 'out-for-delivery', 'delivered'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filters.status === status
                    ? 'bg-afri-green text-white'
                    : 'bg-afri-gray-50 text-afri-gray-700 hover:bg-afri-gray-100'
                }`}
              >
                {statusNames[status]}
              </button>
            ))}
            {filters.status && (
              <button
                onClick={() => setFilters({ ...filters, status: '' })}
                className="px-4 py-2 rounded-lg font-medium bg-red-100 text-red-700 hover:bg-red-200"
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg className="w-16 h-16 text-afri-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-afri-gray-900 mb-1">No orders found</h3>
          <p className="text-afri-gray-500">
            {filters.status || filters.search ? 'Try adjusting your filters' : 'Orders will appear here'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-afri-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-afri-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-afri-gray-900">{order.orderNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-afri-gray-900">{order.customer?.name || 'N/A'}</div>
                    <div className="text-sm text-afri-gray-500">{order.customer?.phone || ''}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-afri-gray-900">{order.items?.length || 0} items</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-afri-gray-900">
                      £{order.pricing?.total?.toFixed(2) || '0.00'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status]}`}>
                      {statusNames[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-afri-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => viewOrderDetails(order._id)}
                      className="text-afri-green hover:text-afri-green-dark font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setFilters({ ...filters, page: i + 1 })}
                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                  pagination.currentPage === i + 1
                    ? 'z-10 bg-afri-green text-white border-afri-green'
                    : 'bg-white border-gray-300 text-afri-gray-700 hover:bg-afri-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false)
            setSelectedOrder(null)
          }}
          onStatusUpdate={updateOrderStatus}
          availableActions={getAvailableActions(selectedOrder)}
        />
      )}
    </div>
  )
}

// Order Detail Modal Component
function OrderDetailModal({ order, onClose, onStatusUpdate, availableActions }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-afri-green text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{order.orderNumber}</h2>
              <p className="text-afri-green-pale mt-1">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-afri-gray-200 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Status and Actions */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-afri-gray-500 mb-1">Current Status</h3>
              <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-lg ${statusColors[order.status]}`}>
                {statusNames[order.status]}
              </span>
            </div>
            {availableActions.length > 0 && (
              <div className="flex gap-2">
                {availableActions.map((action) => (
                  <button
                    key={action.status}
                    onClick={() => {
                      if (confirm(`Are you sure you want to ${action.label.toLowerCase()}?`)) {
                        onStatusUpdate(order._id, action.status)
                      }
                    }}
                    className={`px-4 py-2 bg-${action.color} text-white rounded-lg font-medium hover:opacity-90 transition`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customer Info */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-afri-gray-900 mb-3">Customer Information</h3>
            <div className="bg-afri-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-afri-gray-500">Name</p>
                  <p className="font-medium text-afri-gray-900">{order.deliveryAddress.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-afri-gray-500">Phone</p>
                  <p className="font-medium text-afri-gray-900">{order.deliveryAddress.phone}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-afri-gray-500">Delivery Address</p>
                  <p className="font-medium text-afri-gray-900">
                    {order.deliveryAddress.street}, {order.deliveryAddress.city}, {order.deliveryAddress.state}
                  </p>
                  {order.deliveryAddress.instructions && (
                    <p className="text-sm text-afri-gray-600 mt-1">
                      Note: {order.deliveryAddress.instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-afri-gray-900 mb-3">Order Items</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-afri-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-afri-gray-700 uppercase">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-afri-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-afri-gray-900">£{item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-afri-gray-900">{item.quantity} {item.unit}</td>
                      <td className="px-4 py-3 text-sm text-afri-gray-900 text-right font-medium">
                        £{item.subtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-afri-gray-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-afri-gray-600">Subtotal</span>
                <span className="text-afri-gray-900">£{order.pricing.subtotal.toFixed(2)}</span>
              </div>
              {order.pricing.deliveryFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-afri-gray-600">Delivery Fee</span>
                  <span className="text-afri-gray-900">£{order.pricing.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              {order.pricing.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-afri-gray-600">Tax</span>
                  <span className="text-afri-gray-900">£{order.pricing.tax.toFixed(2)}</span>
                </div>
              )}
              {order.pricing.discount > 0 && (
                <div className="flex justify-between text-sm text-afri-green">
                  <span>Discount</span>
                  <span>-£{order.pricing.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-300 pt-2 flex justify-between">
                <span className="font-semibold text-afri-gray-900">Total</span>
                <span className="font-bold text-lg text-afri-green">£{order.pricing.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mt-4 flex items-center justify-between text-sm">
            <div>
              <span className="text-afri-gray-500">Payment Method: </span>
              <span className="font-medium text-afri-gray-900 capitalize">{order.payment.method}</span>
            </div>
            <div>
              <span className="text-afri-gray-500">Payment Status: </span>
              <span className={`font-medium ${order.payment.status === 'paid' ? 'text-afri-green' : 'text-afri-yellow-dark'}`}>
                {order.payment.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Orders
