import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import { Search, ChevronLeft, CheckCircle, XCircle, PauseCircle, RefreshCw, User } from 'lucide-react'

const STATUS_MAP = {
  active:    { label: 'Active',    color: 'bg-emerald-100 text-emerald-700' },
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700' },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-600' },
  inactive:  { label: 'Inactive',  color: 'bg-gray-100 text-gray-500' },
}

export default function AdminRiderManagement() {
  const [riders, setRiders] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ total: 0 })

  const fetchRiders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = search ? `?search=${encodeURIComponent(search)}` : ''
      const res = await apiCall(`/admin/riders${qs}`)
      setRiders(res?.data?.riders || [])
      setPagination(res?.data?.pagination || {})
    } catch {
      setError('Failed to load riders.')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    const t = setTimeout(fetchRiders, 300)
    return () => clearTimeout(t)
  }, [fetchRiders])

  const doAction = async (riderId, action) => {
    setActionLoading(riderId + action)
    try {
      await apiCall(`/admin/riders/${riderId}/${action}`, { method: 'POST' })
      fetchRiders()
    } catch {
      alert(`Failed to ${action} rider.`)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-medium">
          <ChevronLeft size={16} /> Dashboard
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-900 font-semibold text-sm">Rider Management</span>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{pagination.total || 0} riders</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Search */}
        <div className="relative mb-5">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-afri-green"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchRiders} className="text-red-500 text-sm font-semibold flex items-center gap-1">
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />)}
          </div>
        ) : riders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <User size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 font-medium">No riders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-semibold">Rider</th>
                  <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Phone</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold hidden lg:table-cell">Joined</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {riders.map((rider, i) => {
                  const st = STATUS_MAP[rider.status] || STATUS_MAP.inactive
                  const id = rider._id
                  return (
                    <motion.tr
                      key={id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-afri-green-pale rounded-full flex items-center justify-center text-afri-green-dark font-bold text-xs flex-shrink-0">
                            {rider.name?.[0]?.toUpperCase() || 'R'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{rider.name || '—'}</p>
                            <p className="text-xs text-gray-400">{rider.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{rider.phone || '—'}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.color}`}>{st.label}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs hidden lg:table-cell">
                        {new Date(rider.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          {rider.status === 'pending' && (
                            <button
                              onClick={() => doAction(id, 'approve')}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50"
                            >
                              {actionLoading === id + 'approve' ? '...' : <><CheckCircle size={13} /> Approve</>}
                            </button>
                          )}
                          {rider.status === 'active' && (
                            <button
                              onClick={() => doAction(id, 'suspend')}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50"
                            >
                              {actionLoading === id + 'suspend' ? '...' : <><PauseCircle size={13} /> Suspend</>}
                            </button>
                          )}
                          {rider.status === 'suspended' && (
                            <button
                              onClick={() => doAction(id, 'reactivate')}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1 px-3 py-1.5 bg-afri-green-pale text-afri-green rounded-lg text-xs font-semibold hover:bg-afri-green-pale/70 disabled:opacity-50"
                            >
                              {actionLoading === id + 'reactivate' ? '...' : <><RefreshCw size={13} /> Reactivate</>}
                            </button>
                          )}
                          {rider.status !== 'pending' && rider.status !== 'active' && rider.status !== 'suspended' && (
                            <button
                              onClick={() => doAction(id, 'approve')}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 disabled:opacity-50"
                            >
                              {actionLoading === id + 'approve' ? '...' : <><CheckCircle size={13} /> Approve</>}
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
