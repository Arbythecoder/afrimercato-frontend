import { useState, useEffect } from 'react'
import { vendorAPI } from '../../services/api'
import OrderDetailsModal from '../../components/OrderFulfillment/OrderDetailsModal'

// Order status badge colors
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
          // Refetch the specific order to get updated data
          const updatedOrderResponse = await vendorAPI.getOrder(orderId)
          if (updatedOrderResponse.success) {
            setSelectedOrder(updatedOrderResponse.data.order)
          }
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert(error.response?.data?.message || 'Failed to update order status')
    }
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
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false)
            setSelectedOrder(null)
          }}
          onStatusUpdate={updateOrderStatus}
          onRefresh={fetchOrders}
        />
      )}
    </div>
  )
}

export default Orders
