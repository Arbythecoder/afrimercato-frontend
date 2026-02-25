import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import {
  Star,
  Package,
  ChevronRight,
  MapPin,
  Clock,
  Ruler,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react'

const STATUS_CONFIG = {
  pending:    { label: 'Awaiting Pickup', color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' },
  accepted:   { label: 'Accepted',         color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400' },
  picked_up:  { label: 'Picked Up',        color: 'bg-blue-100 text-blue-700',   dot: 'bg-blue-400' },
  in_transit: { label: 'In Transit',       color: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  delivered:  { label: 'Delivered',        color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-40 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-32" />
    </div>
  )
}

function RiderDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({ todayDeliveries: 0, todayEarnings: 0, rating: 0, weeklyDeliveries: 0, weeklyEarnings: 0 })
  const [activeDeliveries, setActiveDeliveries] = useState([])
  const [recentDeliveries, setRecentDeliveries] = useState([])
  const [isOnline, setIsOnline] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [profileRes, activeRes, earningsRes] = await Promise.allSettled([
        apiCall('/rider-auth/profile'),
        apiCall('/riders/deliveries/active'),
        apiCall('/riders/earnings'),
      ])
      if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
        const s = profileRes.value.data.stats || {}
        setStats(prev => ({ ...prev, rating: parseFloat(s.averageRating) || 0, weeklyDeliveries: s.totalDeliveries || 0, weeklyEarnings: parseFloat(s.totalEarnings) || 0 }))
      }
      if (activeRes.status === 'fulfilled' && activeRes.value?.data) {
        setActiveDeliveries(activeRes.value.data.deliveries || [])
      }
      if (earningsRes.status === 'fulfilled' && earningsRes.value?.data) {
        const d = earningsRes.value.data
        setRecentDeliveries((d.deliveries || []).slice(0, 4))
        const todayKey = new Date().toISOString().split('T')[0]
        const todayEntry = (d.earningsByDate || []).find(e => e.date === todayKey)
        if (todayEntry) {
          setStats(prev => ({ ...prev, todayDeliveries: todayEntry.deliveries || 0, todayEarnings: parseFloat(todayEntry.earnings) || 0 }))
        }
      }
    } catch {
      setError('Failed to load. Tap retry.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-br from-violet-600 to-violet-800 px-5 pt-14 pb-20 rounded-b-[2.5rem]">
          <div className="h-6 bg-white/20 rounded w-40 mb-2 animate-pulse" />
          <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
        </div>
        <div className="px-5 -mt-12 space-y-3">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-5">
        <div className="text-5xl">⚠️</div>
        <p className="text-gray-600 font-medium">{error}</p>
        <button onClick={fetchDashboardData} className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-2xl font-semibold">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-violet-900 px-5 pt-14 pb-24 rounded-b-[2.5rem] relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative flex items-start justify-between mb-6">
          <div>
            <p className="text-violet-200 text-sm font-medium">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}</p>
            <h1 className="text-white text-2xl font-bold mt-0.5">{user?.name?.split(' ')[0] || 'Rider'} 👋</h1>
            {stats.rating > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                <span className="text-amber-300 text-sm font-semibold">{stats.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          {/* Online toggle */}
          <button
            onClick={() => setIsOnline(o => !o)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
              isOnline ? 'bg-emerald-500 text-white' : 'bg-white/20 text-white/70'
            }`}
          >
            {isOnline ? <Wifi size={15} /> : <WifiOff size={15} />}
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>

        {/* Today stats row */}
        <div className="relative grid grid-cols-2 gap-3">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-violet-200 text-xs font-medium mb-1">Today's Earnings</p>
            <p className="text-white text-2xl font-black">£{stats.todayEarnings.toFixed(2)}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-violet-200 text-xs font-medium mb-1">Deliveries Today</p>
            <p className="text-white text-2xl font-black">{stats.todayDeliveries}</p>
          </div>
        </div>
      </div>

      <div className="px-5 -mt-10 space-y-6 pb-4">
        {/* Active Deliveries */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900 font-bold text-lg">Active Deliveries</h2>
            <button onClick={() => navigate('/rider/deliveries')} className="text-violet-600 text-sm font-semibold flex items-center gap-0.5">
              See all <ChevronRight size={15} />
            </button>
          </div>

          {activeDeliveries.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package size={28} className="text-violet-300" />
              </div>
              <p className="font-semibold text-gray-700">No active deliveries</p>
              <p className="text-gray-400 text-sm mt-1">New orders will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDeliveries.map((d, i) => {
                const id = d.id || d._id
                const st = STATUS_CONFIG[d.status] || STATUS_CONFIG.pending
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => navigate(`/rider/delivery/${id}`)}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                  >
                    {/* Status stripe */}
                    <div className={`h-1 w-full ${st.dot}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-gray-900 text-sm">
                              {d.order?.orderNumber || d.orderNumber || id}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.color}`}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{d.vendor?.storeName || d.vendor || '—'}</p>
                        </div>
                        <span className="text-lg font-black text-emerald-600">
                          £{Number(d.riderEarnings || d.earnings || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <MapPin size={14} className="text-violet-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {d.customer?.name || 'Customer'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {d.deliveryAddress?.street || d.deliveryAddress?.address || '—'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          {d.distance && <span className="flex items-center gap-1"><Ruler size={12} />{d.distance} km</span>}
                          {d.estimatedDeliveryTime && <span className="flex items-center gap-1"><Clock size={12} />{new Date(d.estimatedDeliveryTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>}
                        </div>
                        <button className="px-4 py-1.5 bg-violet-600 text-white text-xs font-bold rounded-xl">
                          Open →
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        {/* All-time summary */}
        <section className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-5 text-white">
          <p className="text-violet-200 text-xs font-semibold uppercase tracking-wide mb-3">All Time</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-violet-200 text-xs mb-0.5">Total Deliveries</p>
              <p className="text-3xl font-black">{stats.weeklyDeliveries}</p>
            </div>
            <div>
              <p className="text-violet-200 text-xs mb-0.5">Total Earned</p>
              <p className="text-3xl font-black">£{Number(stats.weeklyEarnings).toFixed(0)}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/rider/earnings')}
            className="mt-4 w-full py-2.5 bg-white/20 rounded-xl text-sm font-semibold text-center"
          >
            View Full Earnings Report →
          </button>
        </section>

        {/* Recent Deliveries */}
        {recentDeliveries.length > 0 && (
          <section>
            <h2 className="text-gray-900 font-bold text-lg mb-3">Recent</h2>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
              {recentDeliveries.map((d, i) => (
                <div key={d.id || i} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                      <Package size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{d.orderNumber || `Delivery #${i+1}`}</p>
                      <p className="text-xs text-gray-400">{d.vendor || '—'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">£{Number(d.earnings || 0).toFixed(2)}</p>
                    {d.deliveredAt && <p className="text-xs text-gray-400">{new Date(d.deliveredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default RiderDashboard
