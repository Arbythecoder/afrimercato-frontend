import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import { Target, Package, Clock, TrendingUp, RefreshCw, Trophy, Zap, Star, Lock } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-4 shadow-sm"
    >
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mb-3`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </motion.div>
  )
}

function AccuracyRing({ accuracy }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const strokeDash = (accuracy / 100) * circumference
  const color = accuracy >= 99 ? '#10B981' : accuracy >= 95 ? '#F59E0B' : '#EF4444'

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="10" />
        <motion.circle
          cx="60" cy="60" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - strokeDash }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-black" style={{ color }}>{accuracy.toFixed(1)}%</p>
        <p className="text-xs text-gray-400 font-medium">Accuracy</p>
      </div>
    </div>
  )
}

const ACHIEVEMENTS = [
  { id: 'first50',   icon: Zap,    label: 'Speed Demon',   desc: '50 orders completed',  threshold: (o) => o >= 50 },
  { id: 'perfect',   icon: Target, label: 'Perfect Record', desc: '100% accuracy',        threshold: (_, a) => a >= 100 },
  { id: 'century',   icon: Star,   label: 'Century Club',  desc: '100 orders picked',    threshold: (o) => o >= 100 },
  { id: 'elite',     icon: Trophy, label: 'Elite Picker',  desc: '500 orders picked',    threshold: (o) => o >= 500 },
]

function PickerPerformance() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchPerformance() }, [])

  const fetchPerformance = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiCall('/pickers/stats')
      if (res?.data) setStats(res.data)
    } catch {
      setError('Failed to load performance data.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 px-5 pt-14 pb-20 rounded-b-[2.5rem]">
          <div className="h-5 bg-white/20 rounded w-32 mb-2 animate-pulse" />
          <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
        </div>
        <div className="px-5 -mt-10 space-y-3">
          {[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4 px-5">
        <p className="text-gray-600 font-medium">{error}</p>
        <button onClick={fetchPerformance} className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-2xl font-semibold">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    )
  }

  const overall = stats?.overall || {}
  const today = stats?.today || {}
  const accuracy = parseFloat(overall.averageAccuracy || 100)
  const avgTime = parseFloat(overall.averageTimePerOrder || 0)
  const totalOrders = overall.totalOrders || 0
  const totalEarnings = parseFloat(overall.totalEarnings || 0)

  const accuracyLabel = accuracy >= 99 ? 'Excellent 🏆' : accuracy >= 97 ? 'Good 👍' : 'Needs Work'

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-orange-800 px-5 pt-14 pb-28 rounded-b-[2.5rem] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/5 rounded-full" />
        <h1 className="relative text-white text-2xl font-bold">My Performance</h1>
        <p className="relative text-orange-200 text-sm mt-0.5">All-time statistics</p>
      </div>

      <div className="px-5 -mt-14 space-y-5 pb-4">
        {/* Accuracy Ring card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Accuracy Score</h2>
            <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">
              {accuracyLabel}
            </span>
          </div>
          <AccuracyRing accuracy={accuracy} />
        </motion.div>

        {/* Today banner */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-4 text-white"
          >
            <p className="text-orange-200 text-xs font-medium mb-1">Today's Orders</p>
            <p className="text-3xl font-black">{today.orders || 0}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white"
          >
            <p className="text-emerald-100 text-xs font-medium mb-1">Today's Earnings</p>
            <p className="text-3xl font-black">£{Number(today.earnings || 0).toFixed(2)}</p>
          </motion.div>
        </div>

        {/* All-time stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Package} label="Total Orders" value={totalOrders} color="bg-violet-500" delay={0.1} />
          <StatCard icon={TrendingUp} label="Total Earned" value={`£${totalEarnings.toFixed(0)}`} color="bg-emerald-500" delay={0.15} />
          <StatCard icon={Clock} label="Avg Order Time" value={avgTime > 0 ? `${Math.round(avgTime)}m` : '—'} color="bg-blue-500" delay={0.2} />
          <StatCard icon={Target} label="Accuracy" value={`${accuracy.toFixed(1)}%`} color="bg-orange-500" delay={0.25} />
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-5 text-white">
          <p className="font-bold mb-3">💡 Pro Tips</p>
          <div className="space-y-3">
            {[
              'Group items by aisle to cut picking time by 30%',
              'Check expiry dates before picking fresh produce',
              'Report issues immediately — it protects your accuracy score',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-white/25 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-orange-100 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <section>
          <h2 className="text-gray-900 font-bold text-lg mb-3">Achievements</h2>
          <div className="grid grid-cols-2 gap-3">
            {ACHIEVEMENTS.map(({ id, icon: Icon, label, desc, threshold }, i) => {
              const unlocked = threshold(totalOrders, accuracy)
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className={`rounded-2xl p-4 text-center ${unlocked ? 'bg-white shadow-sm' : 'bg-gray-100 opacity-50'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-2 ${
                    unlocked ? 'bg-orange-50' : 'bg-gray-200'
                  }`}>
                    {unlocked
                      ? <Icon size={22} className="text-orange-500" />
                      : <Lock size={18} className="text-gray-400" />
                    }
                  </div>
                  <p className="font-bold text-sm text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  {unlocked && (
                    <span className="inline-block mt-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">
                      Unlocked ✓
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

export default PickerPerformance
