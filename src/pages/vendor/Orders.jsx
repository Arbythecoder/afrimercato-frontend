import { useState, useEffect } from 'react'
import { vendorAPI } from '../../services/api'
import OrderDetailsModal from '../../components/OrderFulfillment/OrderDetailsModal'
import useVendorStore from '../../stores/useVendorStore'

const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  assigned_to_picker: 'bg-teal-100 text-teal-800',
  picking: 'bg-teal-100 text-teal-800',
  packed: 'bg-teal-100 text-teal-800',
  ready_for_delivery: 'bg-cyan-100 text-cyan-800',
  assigned_to_rider: 'bg-purple-100 text-purple-800',
  rider_accepted: 'bg-purple-100 text-purple-800',
  picked_up_by_rider: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-700',
  cancelled: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
}

const statusNames = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  assigned_to_picker: 'Picker Assigned',
  picking: 'Picking',
  packed: 'Packed',
  ready_for_delivery: 'Ready for Delivery',
  assigned_to_rider: 'Rider Assigned',
  rider_accepted: 'Rider Accepted',
  picked_up_by_rider: 'Picked Up',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
}

function Orders() {
  const updateOrderStatusInStore = useVendorStore(s => s.updateOrderStatus)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [updateError, setUpdateError] = useState('')

  const [filters, setFilters] = useState({
    status: '', search: '', page: 1, limit: 20,
  })
  const [pagination, setPagination] = useState({
    total: 0, pages: 0, currentPage: 1,
  })

  useEffect(() => { fetchOrders() }, [filters])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setFetchError('')
      const response = await vendorAPI.getOrders(filters)
      if (response.success) {
        setOrders(response.data.orders)
        setPagination(response.data.pagination)
      } else {
        setFetchError(response.message || 'Failed to load orders')
      }
    } catch (error) {
      setFetchError(error.message || 'Failed to load orders')
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-afri-gray-900">Orders</h1>
        <p className="text-afri-gray-600 mt-1">Manage and track all your orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <input
              type="text"
              placeholder="Search by order number..."
              value={filters.search}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {['pending', 'confirmed', 'preparing', 'packed', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs transition ${filters.status === status
                  ? 'bg-afri-green text-white'
                  : 'bg-afri-gray-50 text-afri-gray-700 hover:bg-afri-gray-100'
                  }`}
              >
                {statusNames[status]}
              </button>
            ))}
            {filters.status && (
              <button
                type="button"
                onClick={() => setFilters({ ...filters, status: '' })}
                className="px-3 py-1.5 rounded-lg font-medium text-xs bg-red-100 text-red-700 hover:bg-red-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {fetchError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700 text-sm">{fetchError}</p>
          <button type="button" onClick={fetchOrders} className="text-red-600 text-sm font-semibold hover:underline ml-4">Retry</button>
        </div>
      )}
      {updateError && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-700 text-sm">{updateError}</p>
          <button type="button" onClick={() => setUpdateError('')} className="text-red-400 hover:text-red-600 ml-4 text-lg leading-none">&times;</button>
        </div>
      )}

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
                {['Order', 'Customer', 'Type', 'Items', 'Total', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-afri-gray-50 transition">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-afri-gray-900">{order.orderNumber}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-afri-gray-900">{order.customer?.name || 'N/A'}</div>
                    <div className="text-xs text-afri-gray-500">{order.customer?.phone || ''}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 py-0.5 inline-flex text-xs font-bold rounded-md ${
                      order.fulfillmentType === 'store_pickup' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.fulfillmentType === 'store_pickup' ? '🏪 Pickup' : '🚚 Rider'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-afri-gray-900">
                    {order.items?.length || 0} items
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-afri-gray-900">
                    £{(order.vendorTotal ?? order.totalAmount ?? 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                      {statusNames[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-afri-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      type="button"
                      onClick={() => viewOrderDetails(order._id)}
                      className="text-afri-green hover:text-afri-green-dark font-medium"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {(pagination.totalPages ?? pagination.pages ?? 0) > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="inline-flex rounded-md shadow-sm -space-x-px">
            {[...Array(pagination.totalPages ?? pagination.pages)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setFilters({ ...filters, page: i + 1 })}
                className={`px-4 py-2 border text-sm font-medium ${pagination.currentPage === i + 1
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

      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => { setShowOrderModal(false); setSelectedOrder(null) }}
          onStatusUpdate={async (orderId, newStatus, note) => {
            setUpdateError('');
            try {
              const response = await vendorAPI.updateOrderStatus(orderId, {
                status: newStatus,
                note: note || `Status updated to ${newStatus} by vendor`,
              });

              if (response.success) {
                await fetchOrders();
                // Refresh the modal data
                const updated = await vendorAPI.getOrder(orderId);
                if (updated.success) setSelectedOrder(updated.data.order);
              } else {
                setUpdateError(response.message || 'Failed to update status');
              }
            } catch (error) {
              setUpdateError(error.message || 'Failed to update status');
            }
          }}
          onRefresh={fetchOrders}
        />
      )}
    </div>
  )
}

export default Orders