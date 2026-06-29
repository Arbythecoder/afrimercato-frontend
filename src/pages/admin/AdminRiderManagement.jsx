import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import { Search, ChevronLeft, CheckCircle, XCircle, PauseCircle, RefreshCw, User } from 'lucide-react'
import { MdOutlineFileDownload } from "react-icons/md";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { CiMail } from "react-icons/ci";

const STATUS_MAP = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700' },
  suspended: { label: 'Suspended', color: 'bg-red-100 text-red-600' },
  inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-500' },
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
    } catch (_e) {
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
    } catch (_e) {
      alert(`Failed to ${action} rider.`)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-gray-700 text-sm font-medium">
          <ChevronLeft size={16} /> Dashboard
        </Link>
        <span className="text-gray-200">/</span>
        <span className="text-gray-900 font-semibold text-sm">Rider Management</span>
        <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{pagination.total || 0} riders</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">🚴 Rider Management</h2>
          <p className="text-sm text-gray-500 mt-1">Approve, reject, suspend, or audit platform delivery personnel profiles</p>
        </div>

        {/* Search Input Bar */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search riders by name, email, or credentials..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-afri-green shadow-sm transition"
          />
        </div>

        {/* Error State Banner */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center justify-between animate-fadeIn">
            <p className="text-red-600 text-sm font-medium">{error}</p>
            <button onClick={fetchRiders} className="text-red-500 text-sm font-bold flex items-center gap-1 hover:underline">
              <RefreshCw size={13} /> Retry Connection
            </button>
          </div>
        )}

        {/* Loading Skeleton Cards */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl h-32 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : riders.length === 0 ? (
          /* Empty State Illustration View */
          <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm animate-fadeIn">
            <User size={44} className="mx-auto mb-3 text-gray-300 bg-gray-50 p-2.5 rounded-full" />
            <p className="text-gray-600 font-semibold text-base">No Riders Registered</p>
            <p className="text-gray-400 text-xs mt-1">There are no riders matching your filter parameters right now.</p>
          </div>
        ) : (
          /* ================================================================= */
          /* PREMIUM CARD LIST LAYOUT (MATCHES VENDOR MANAGEMENT STYLE)        */
          /* ================================================================= */
          <div className="space-y-4">
            {riders.map((rider, i) => {
              const st = STATUS_MAP[rider.status] || STATUS_MAP.inactive;
              const id = rider._id;

              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-200/70 rounded-2xl p-5 shadow-sm hover:shadow-md/50 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden"
                >
                  {/* Left Column: Rider Core Profiles & Attached Verification Docs */}
                  <div className="space-y-3.5 flex-1 min-w-0">
                    <div className="flex items-center gap-3.5 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-lg tracking-tight truncate">{rider.name}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${st.color.replace('bg-', 'border-').split(' ')[0]} ${st.color}`}>
                        {st.label.toLowerCase()}
                      </span>
                    </div>

                    {/* Metadata Context Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-500">
                      <p className="flex items-center gap-1.5 truncate"><CiMail className='text-gray-800' size={22} /> {rider.email}</p>
                      {rider.phone && <p className="flex items-center gap-1.5">📞 {rider.phone}</p>}
                      <p className="flex items-center gap-1.5 text-xs text-gray-400 sm:col-span-2 mt-0.5">
                        <IoCalendarNumberOutline className='text-gray-700' size={20} /> Joined: {new Date(rider.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>

                    {/* Sub-Section Row: Cloudinary Uploaded Documents Tags */}
                    <div className="pt-2 flex flex-wrap gap-2 items-center">
                      {rider.documents && rider.documents.length > 0 ? (
                        rider.documents.map((doc, idx) => (
                          <a
                            key={idx}
                            href={doc.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 shadow-sm transition active:scale-95"
                          >
                            <span>{doc.label}</span>
                            <span className="text text-sm font-normal"><MdOutlineFileDownload /></span>
                          </a>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic bg-gray-50 border border-dashed border-gray-200 px-3 py-1 rounded-xl">
                          No document files uploaded yet
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Premium Action Control Callouts */}
                  <div className="w-full md:w-auto flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100 flex justify-end">
                    {rider.status === 'pending' && (
                      <button
                        onClick={() => doAction(id, 'approve')}
                        disabled={!!actionLoading}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 active:scale-95 transition shadow-sm shadow-emerald-600/10 disabled:opacity-50 min-w-[120px]"
                      >
                        {actionLoading === id + 'approve' ? (
                          <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : (
                          '✓ Approve Rider'
                        )}
                      </button>
                    )}

                    {rider.status === 'active' && (
                      <button
                        onClick={() => doAction(id, 'suspend')}
                        disabled={!!actionLoading}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800 text-white font-bold text-sm rounded-xl hover:bg-slate-900 active:scale-95 transition shadow-sm disabled:opacity-50 min-w-[120px]"
                      >
                        {actionLoading === id + 'suspend' ? (
                          <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : (
                          '⚠ Suspend Account'
                        )}
                      </button>
                    )}

                    {rider.status === 'suspended' && (
                      <button
                        onClick={() => doAction(id, 'reactivate')}
                        disabled={!!actionLoading}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 active:scale-95 transition shadow-sm shadow-blue-600/10 disabled:opacity-50 min-w-[120px]"
                      >
                        {actionLoading === id + 'reactivate' ? (
                          <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                        ) : (
                          '⟳ Reactivate Profile'
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
