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

// What actions a vendor can take per status
const VENDOR_ACTIONS = {
  pending: [['Confirm', 'confirmed', 'primary'], ['Cancel', 'cancelled', 'danger']],
  confirmed: [['Start Preparing', 'preparing', 'primary'], ['Cancel', 'cancelled', 'danger']],
  preparing: [['Ready for Delivery', 'ready_for_delivery', 'primary'], ['Cancel', 'cancelled', 'danger']],
  ready_for_delivery: [['Out for Delivery', 'out_for_delivery', 'primary'], ['Cancel', 'cancelled', 'danger']],
  assigned_to_picker: [['Cancel', 'cancelled', 'danger']],
  picking: [['Cancel', 'cancelled', 'danger']],
  packed: [['Cancel', 'cancelled', 'danger']],
  assigned_to_rider: [['Cancel', 'cancelled', 'danger']],
  rider_accepted: [],
  picked_up_by_rider: [],
  out_for_delivery: [['Mark Delivered', 'delivered', 'primary']],
  delivered: [['Complete Order', 'completed', 'primary']],
  completed: [],
  cancelled: [],
  failed: [],
}

// Action button styles
const actionBtnClass = {
  primary: 'bg-green-600 hover:bg-green-700 text-white',
  danger: 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-200',
}

function ConfirmModal({ action, order, onConfirm, onCancel, loading, statusColors, statusNames }) {
  const [pin, setPin] = useState('');

  useEffect(() => {
    setPin('');
  }, [order]);

  if (!action || !order) return null;

  const isCancelling = action[1] === 'cancelled';
  const isHandoff = action[1] === 'out_for_delivery' || (action[1] === 'completed' && order?.status !== 'delivered');

  return (
    <div
      style={{ minHeight: 300, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      className="fixed inset-0 z-50 transition-opacity"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isHandoff ? 'bg-orange-100' : isCancelling ? 'bg-red-100' : 'bg-green-100'}`}>
          <span className="text-2xl">{isHandoff ? '🔒' : isCancelling ? '⚠️' : '✓'}</span>
        </div>

        <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
          {isHandoff ? 'Secure Handoff' : isCancelling ? 'Cancel this order?' : `${action[0]} order?`}
        </h3>

        <p className="text-sm text-gray-500 text-center mb-1">
          Order <span className="font-semibold text-gray-700">{order?.orderNumber}</span>
        </p>

        <p className="text-sm text-gray-500 text-center mb-5">
          Status will change to{' '}
          <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${statusColors?.[action[1]] || 'bg-gray-100 text-gray-700'}`}>
            {statusNames?.[action[1]] || action[1]}
          </span>
        </p>

        {isHandoff && (
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider text-center mb-2">
              Enter 4-Digit Pickup PIN
            </p>
            <input
              type="text"
              maxLength="4"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center text-4xl tracking-[0.5em] font-bold border-2 border-gray-300 rounded-xl p-3 focus:border-[#00897B] focus:ring-0 outline-none transition-colors bg-gray-50"
              placeholder="••••"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(isHandoff ? pin : null)}
            disabled={loading || (isHandoff && pin.length !== 4)}
            className={`flex-1 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition text-sm disabled:opacity-50 disabled:cursor-not-allowed ${isCancelling
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-gradient-to-r from-[#00897B] to-[#26A69A] text-white'
              }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying...
              </span>
            ) : isHandoff ? (
              'Verify & Release'
            ) : isCancelling ? (
              'Yes, Cancel'
            ) : (
              action[0]
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusActions({ order, onAction }) {
  const actions = VENDOR_ACTIONS[order.status] || []
  if (actions.length === 0) return <span className="text-xs text-gray-400">—</span>
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {actions.map(action => (
        <button
          key={action[1]}
          type="button"
          onClick={() => onAction(order, action)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${actionBtnClass[action[2]]}`}
        >
          {action[0]}
        </button>
      ))}
    </div>
  )
}

function Orders() {
  const updateOrderStatusInStore = useVendorStore(s => s.updateOrderStatus)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [updateError, setUpdateError] = useState('')

  // Confirmation modal state
  const [pendingAction, setPendingAction] = useState(null)   // { order, action }
  const [actionLoading, setActionLoading] = useState(false)

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

  const handleActionClick = (order, action) => {
    setUpdateError('')
    setPendingAction({ order, action })
  }

  const handleActionConfirm = async (pinFromModal) => {
    if (!pendingAction) return;

    const { order, action } = pendingAction;
    const newStatus = action[1];

    setActionLoading(true);
    setUpdateError('');

    try {
      let response;

      const isHandoff = newStatus === 'out_for_delivery' || (newStatus === 'completed' && order.status !== 'delivered');

      if (isHandoff) {
        response = await vendorAPI.verifyPickupPin(order._id, pinFromModal);
      } else {
        response = await vendorAPI.updateOrderStatus(order._id, {
          status: newStatus,
          note: `Status updated to ${newStatus} by vendor`,
        });
      }

      if (response.success) {
        setPendingAction(null);
      } else {
        setUpdateError(response.message || 'Failed to update status');
      }
    } catch (error) {
      setUpdateError(error.data?.message || error.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
      await fetchOrders();
      if (selectedOrder) {
        try {
          const updated = await vendorAPI.getOrder(selectedOrder._id);
          if (updated.success) setSelectedOrder(updated.data.order);
        } catch (_e) { }
      }
    }
  }

  return (
    <div className="p-6">
      {/* Confirmation modal */}
      {pendingAction && (
        <ConfirmModal
          action={pendingAction.action}
          order={pendingAction.order}
          onConfirm={handleActionConfirm}
          onCancel={() => !actionLoading && setPendingAction(null)}
          loading={actionLoading}
          statusColors={statusColors}
          statusNames={statusNames}
        />
      )}

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
                {['Order', 'Customer', 'Items', 'Total', 'Status', 'Actions', 'Date', ''].map(h => (
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
                  {/* Inline action buttons */}
                  <td className="px-4 py-4">
                    <StatusActions order={order} onAction={handleActionClick} />
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
            const action = [statusNames[newStatus], newStatus, newStatus === 'cancelled' ? 'danger' : 'primary']
            const order = orders.find(o => o._id === orderId) || selectedOrder
            handleActionClick(order, action)
          }}
          onRefresh={fetchOrders}
        />
      )}
    </div>
  )
}

export default Orders