import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Package, RefreshCw, ChevronRight } from 'lucide-react'

const PERIODS = [
  { id: 'week',  label: '7 Days',  days: 7 },
  { id: 'month', label: '30 Days', days: 30 },
  { id: 'year',  label: '1 Year',  days: 365 },
]

function RiderEarnings() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState('week')
  const [summary, setSummary] = useState({ totalEarnings: 0, totalDeliveries: 0 })
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEarnings = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const days = PERIODS.find(p => p.id === period)?.days || 7
      const end = new Date()
      const start = new Date()
      start.setDate(end.getDate() - days)
      const startDate = start.toISOString().split('T')[0]
      const endDate = end.toISOString().split('T')[0]
      const res = await apiCall(`/riders/earnings?startDate=${startDate}&endDate=${endDate}`)
      const d = res?.data
      if (d) {
        setSummary({ totalEarnings: parseFloat(d.summary?.totalEarnings || 0), totalDeliveries: d.summary?.totalDeliveries || 0 })
        setHistory(d.deliveries || [])
      }
    } catch (_e) {
      setError('Failed to load earnings.')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchEarnings() }, [fetchEarnings])

  const avgPerDelivery = summary.totalDeliveries > 0 ? summary.totalEarnings / summary.totalDeliveries : 0

  return (
    <div className="min-h-screen bg-afri-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-afri-gray-900 via-[#1A1A1A] to-[#2B3632] px-5 pt-14 pb-28 rounded-b-[2.5rem] relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-afri-green/10 rounded-full blur-2xl" />
        <div className="absolute top-6 right-6 w-2 h-2 bg-afri-green rounded-full opacity-60" />
        <div className="relative">
          <p className="text-afri-green-light text-sm font-medium">My Earnings</p>
          <p className="text-white text-5xl font-black mt-1">
            {loading ? '—' : `£${summary.totalEarnings.toFixed(2)}`}
          </p>
          <p className="text-afri-green-light text-sm mt-1">
            {loading ? '...' : `${summary.totalDeliveries} deliveries`}
          </p>
        </div>
      </div>

      <div className="px-5 -mt-16 space-y-5 pb-4">
        {/* Period pill selector */}
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                period === p.id ? 'bg-afri-green text-white shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchEarnings} className="flex items-center gap-1 text-red-500 text-sm font-semibold">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Stat cards */}
        <AnimatePresence mode="wait">
          {!loading && (
            <motion.div key={period} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center mb-2">
                  <TrendingUp size={18} className="text-emerald-600" />
                </div>
                <p className="text-2xl font-black text-gray-900">£{avgPerDelivery.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Avg per delivery</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="w-9 h-9 bg-afri-green-pale rounded-xl flex items-center justify-center mb-2">
                  <Package size={18} className="text-afri-green-dark" />
                </div>
                <p className="text-2xl font-black text-gray-900">{summary.totalDeliveries}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total deliveries</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payout info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl flex-shrink-0">🏦</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800">Auto-Payout Active</p>
              <p className="text-xs text-gray-400">Paid every Friday via bank transfer</p>
            </div>
            <button onClick={() => navigate('/rider/profile')} className="text-afri-green">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* History list */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-gray-900 font-bold text-lg">Delivery History</h2>
            <span className="text-xs text-gray-400">{history.length} records</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse flex justify-between">
                  <div className="space-y-1.5">
                    <div className="h-4 bg-gray-200 rounded w-28" />
                    <div className="h-3 bg-gray-200 rounded w-20" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-14" />
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-afri-green-pale rounded-full flex items-center justify-center mx-auto mb-3">
                <Package size={28} className="text-afri-green-light" />
              </div>
              <p className="font-semibold text-gray-600">No deliveries in this period</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-50">
              {history.map((item, i) => (
                <div key={item.id || i} className="flex items-center justify-between px-4 py-3.5 hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package size={14} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{item.orderNumber || `Delivery #${i + 1}`}</p>
                      <p className="text-xs text-gray-400">
                        {item.vendor || '—'}
                        {item.deliveredAt && ` · ${new Date(item.deliveredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                      </p>
                      {item.distance && <p className="text-xs text-gray-300">{item.distance} km</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">£{Number(item.earnings || 0).toFixed(2)}</p>
                    <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">Paid</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default RiderEarnings
