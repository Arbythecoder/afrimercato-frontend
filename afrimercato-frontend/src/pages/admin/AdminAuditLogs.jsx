import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import { ChevronLeft, RefreshCw, ShieldCheck, Search, Filter } from 'lucide-react'

const ACTION_COLORS = {
  create:   'bg-emerald-100 text-emerald-700',
  update:   'bg-blue-100 text-blue-600',
  delete:   'bg-red-100 text-red-600',
  login:    'bg-purple-100 text-purple-600',
  logout:   'bg-gray-100 text-gray-500',
  approve:  'bg-teal-100 text-teal-700',
  suspend:  'bg-orange-100 text-orange-600',
  reactivate: 'bg-cyan-100 text-cyan-700',
}

const ACTION_ICONS = {
  create: '✚',
  update: '✎',
  delete: '✕',
  login:  '→',
  logout: '←',
  approve: '✓',
  suspend: '⏸',
  reactivate: '↺',
}

function getActionColor(action = '') {
  const key = Object.keys(ACTION_COLORS).find(k => action.toLowerCase().includes(k))
  return key ? ACTION_COLORS[key] : 'bg-gray-100 text-gray-500'
}

function getActionIcon(action = '') {
  const key = Object.keys(ACTION_ICONS).find(k => action.toLowerCase().includes(k))
  return key ? ACTION_ICONS[key] : '•'
}

const ROLE_FILTERS = [
  { id: '', label: 'All' },
  { id: 'admin', label: 'Admin' },
  { id: 'vendor', label: 'Vendor' },
  { id: 'customer', label: 'Customer' },
  { id: 'rider', label: 'Rider' },
  { id: 'picker', label: 'Picker' },
]

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
  const [page, setPage] = useState(1)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (roleFilter) params.set('role', roleFilter)
      params.set('page', page)
      params.set('limit', 50)
      const res = await apiCall(`/admin/audit-logs?${params.toString()}`)
      setLogs(res?.data?.logs || res?.data?.auditLogs || [])
      setPagination(res?.data?.pagination || { total: 0, page: 1, pages: 1 })
    } catch {
      setError('Failed to load audit logs.')
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, page])

  useEffect(() => {
    const t = setTimeout(fetchLogs, 300)
    return () => clearTimeout(t)
  }, [fetchLogs])

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1) }, [search, roleFilter])

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center gap-3 mb-3">
          <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-medium">
            <ChevronLeft size={16} /> Dashboard
          </Link>
          <span className="text-gray-200">/</span>
          <span className="text-gray-900 font-semibold text-sm">Audit Logs</span>
          <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
            {pagination.total || 0} entries
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search action, user, resource…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1">
            <Filter size={13} className="text-gray-400 ml-1.5" />
            {ROLE_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setRoleFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  roleFilter === f.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchLogs} className="text-red-500 text-sm font-semibold flex items-center gap-1">
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
        ) : logs.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm">
            <ShieldCheck size={44} className="mx-auto mb-3 text-gray-200" />
            <p className="text-gray-500 font-medium">No audit logs found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-semibold">Action</th>
                  <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Actor</th>
                  <th className="px-5 py-3 text-left font-semibold hidden lg:table-cell">Resource</th>
                  <th className="px-5 py-3 text-left font-semibold hidden xl:table-cell">Details</th>
                  <th className="px-5 py-3 text-right font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {logs.map((log, i) => {
                  const actionColor = getActionColor(log.action)
                  const actionIcon = getActionIcon(log.action)
                  const actorName = log.actor?.name || log.performedBy?.name || log.user?.name || '—'
                  const actorRole = log.actor?.role || log.performedBy?.role || log.userRole || ''
                  const resource = log.resource || log.entity || log.targetType || '—'
                  const resourceId = log.resourceId || log.targetId || ''
                  const details = log.details || log.description || log.metadata?.summary || ''
                  const timestamp = log.createdAt || log.timestamp || log.performedAt

                  return (
                    <motion.tr
                      key={log._id || i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Action */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${actionColor}`}>
                            {actionIcon}
                          </span>
                          <span className="font-medium text-gray-800 capitalize">
                            {log.action?.replace(/_/g, ' ') || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Actor */}
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                            {actorName[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-xs">{actorName}</p>
                            {actorRole && (
                              <p className="text-gray-400 text-[10px] capitalize">{actorRole}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Resource */}
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <p className="text-gray-600 font-medium capitalize">{resource}</p>
                        {resourceId && (
                          <p className="text-gray-400 text-xs font-mono">
                            {String(resourceId).slice(-8)}
                          </p>
                        )}
                      </td>

                      {/* Details */}
                      <td className="px-5 py-3.5 hidden xl:table-cell max-w-xs">
                        <p className="text-gray-500 text-xs truncate">{details || '—'}</p>
                      </td>

                      {/* Time */}
                      <td className="px-5 py-3.5 text-right">
                        {timestamp ? (
                          <div>
                            <p className="text-gray-700 text-xs font-medium">
                              {new Date(timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            <p className="text-gray-400 text-[10px]">
                              {new Date(timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        ) : '—'}
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>

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
