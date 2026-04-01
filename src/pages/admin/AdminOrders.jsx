import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import { Search, RefreshCw, ShoppingBag } from 'lucide-react'

const STATUS_OPTS = ['', 'pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']

const STATUS_COLORS = {
  delivered:        'bg-emerald-100 text-emerald-700',
  pending:          'bg-amber-100 text-amber-700',
  confirmed:        'bg-blue-100 text-blue-700',
  preparing:        'bg-purple-100 text-purple-700',
  ready:            'bg-cyan-100 text-cyan-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  cancelled:        'bg-red-100 text-red-600',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [page, setPage] = useState(1)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      params.set('page', page)
      params.set('limit', 30)
      const res = await apiCall(`/admin/orders?${params.toString()}`)
      setOrders(res?.data?.orders || [])
      setPagination(res?.data?.pagination || { total: 0, page: 1, pages: 1 })
    } catch (_e) {
      setError('Failed to load orders.')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    const t = setTimeout(fetchOrders, 300)
    return () => clearTimeout(t)
  }, [fetchOrders])

  useEffect(() => { setPage(1) }, [search, statusFilter])

  return (
    <div className="bg-slate-50 min-h-full">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div>
            <h1 className="text-gray-900 font-bold text-base">All Orders</h1>
            <p className="text-gray-400 text-xs">{pagination.total || 0} orders across all vendors</p>
          </div>
          <button onClick={fetchOrders} className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200">
            <RefreshCw size={13} className="text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-afri-green focus:bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-afri-green"
          >
            <option value="">All statuses</option>
            {STATUS_OPTS.filter(Boolean).map(s => (
              <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchOrders} className="text-red-500 text-sm font-semibold flex items-center gap-1">
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-14 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <ShoppingBag size={44} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 font-medium">No orders found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-semibold">Order</th>
                    <th className="px-5 py-3 text-left font-semibold">Customer</th>
                    <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Vendor</th>
                    <th className="px-5 py-3 text-left font-semibold">Total</th>
                    <th className="px-5 py-3 text-left font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold hidden lg:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order, i) => {
                    const total = order.pricing?.total ?? order.totalAmount ?? 0
                    const statusColor = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'
                    return (
                      <motion.tr
                        key={order._id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                          #{order.orderNumber || order._id?.toString().slice(-6).toUpperCase()}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="font-medium text-gray-900">{order.customer?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-400">{order.customer?.email || ''}</p>
                        </td>
                        <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">
                          {order.vendor?.storeName || 'N/A'}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-gray-900">
                          £{Number(total).toFixed(2)}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColor}`}>
                            {order.status?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right text-xs text-gray-400 hidden lg:table-cell">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Page {pagination.page} of {pagination.pages} · {pagination.total} total
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page >= pagination.pages}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 disabled:opacity-40"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
