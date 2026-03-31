import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import { Package, RefreshCw, Plus } from 'lucide-react'

const STATUS_COLORS = {
  assigned_to_picker: { badge: 'bg-amber-100 text-amber-700', stripe: 'bg-amber-400', label: 'Assigned' },
  picking:            { badge: 'bg-blue-100 text-blue-700',   stripe: 'bg-blue-500',  label: 'Picking' },
  packed:             { badge: 'bg-afri-green-pale text-afri-green-dark', stripe: 'bg-afri-green', label: 'Packed' },
  ready_for_delivery: { badge: 'bg-purple-100 text-purple-700', stripe: 'bg-purple-500', label: 'Ready for Rider' },
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-6 bg-gray-200 rounded-xl w-20" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-40 mb-3" />
      <div className="h-1.5 bg-gray-200 rounded-full w-full" />
    </div>
  )
}

function PickerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({ todayOrders: 0, pendingOrders: 0, completedOrders: 0, accuracy: 100, avgPickTime: 0 })
  const [orderQueue, setOrderQueue] = useState([])
  const [activeOrders, setActiveOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [statsRes, myOrdersRes, availableRes] = await Promise.allSettled([
        apiCall('/pickers/stats'),
        apiCall('/pickers/my-orders'),
        apiCall('/pickers/available'),
      ])
      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        const d = statsRes.value.data
        setStats(s => ({
          ...s,
          todayOrders: d.today?.orders || 0,
          completedOrders: d.overall?.totalOrders || 0,
          accuracy: parseFloat(d.overall?.averageAccuracy || 100),
          avgPickTime: parseFloat(d.overall?.averageTimePerOrder || 0)
        }))
      }
      if (myOrdersRes.status === 'fulfilled' && myOrdersRes.value?.data) {
        const orders = myOrdersRes.value.data.orders || []
        setActiveOrders(orders)
        setStats(s => ({ ...s, pendingOrders: orders.length }))
      }
      if (availableRes.status === 'fulfilled' && availableRes.value?.data) {
        setOrderQueue(availableRes.value.data.orders || [])
      }
    } catch (_e) {
      setError('Failed to load. Tap retry.')
    } finally {
      setLoading(false)
    }
  }

  const claimOrder = async (orderId) => {
    try {
      await apiCall(`/pickers/${orderId}/claim`, { method: 'POST' })
      navigate(`/picker/order/${orderId}`)
    } catch (_e) {
      alert('Failed to claim order. It may have already been taken.')
      fetchDashboardData()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-afri-gray-50">
        <div className="bg-gradient-to-br from-afri-yellow-dark via-[#F5A623] to-[#FFB300] px-5 pt-14 pb-20 rounded-b-[2.5rem]">
          <div className="h-5 bg-white/20 rounded w-36 mb-2 animate-pulse" />
          <div className="h-4 bg-white/10 rounded w-24 animate-pulse" />
        </div>
        <div className="px-5 -mt-10 space-y-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-afri-gray-50 flex flex-col items-center justify-center gap-4 px-5">
        <div className="text-5xl">⚠️</div>
        <p className="text-gray-600 font-medium">{error}</p>
        <button onClick={fetchDashboardData} className="flex items-center gap-2 px-6 py-3 bg-afri-yellow-dark text-white rounded-2xl font-semibold">
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-afri-gray-50">
      {/* Hero — warm amber-orange gradient matching brand yellow-dark */}
      <div className="bg-gradient-to-br from-afri-yellow-dark via-[#F5A623] to-[#FFB300] px-5 pt-14 pb-24 rounded-b-[2.5rem] relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/8 rounded-full blur-2xl" />
        <div className="absolute bottom-4 -left-8 w-32 h-32 bg-afri-green/15 rounded-full blur-2xl" />
        <div className="absolute top-8 right-8 w-2 h-2 bg-white rounded-full opacity-50" />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">
              Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}
            </p>
            <h1 className="text-white text-2xl font-bold mt-0.5">{user?.name?.split(' ')[0] || 'Picker'} 👋</h1>
            <p className="text-white/70 text-sm mt-1">{stats.pendingOrders} active · {orderQueue.length} available</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 text-right border border-white/20">
            <p className="text-white text-xl font-black">{stats.accuracy.toFixed(1)}%</p>
            <p className="text-white/70 text-xs">Accuracy</p>
          </div>
        </div>

        <div className="relative mt-5 grid grid-cols-3 gap-2">
          {[
            { label: 'Today', value: stats.todayOrders, unit: 'orders' },
            { label: 'All Time', value: stats.completedOrders, unit: 'done' },
            { label: 'Avg Time', value: stats.avgPickTime > 0 ? `${Math.round(stats.avgPickTime)}m` : '—', unit: 'per order' },
          ].map((s, i) => (
            <div key={i} className="bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl p-3 text-center">
              <p className="text-white text-xl font-black">{s.value}</p>
              <p className="text-white/70 text-[10px] font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 -mt-10 space-y-6 pb-4">
        {/* Active Orders */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-afri-gray-900 font-bold text-lg">My Active Orders</h2>
            <button onClick={fetchDashboardData} className="w-8 h-8 bg-white rounded-xl flex items-center justify-center shadow-sm border border-afri-gray-100">
              <RefreshCw size={15} className="text-gray-400" />
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-afri-gray-100">
              <div className="w-16 h-16 bg-afri-green-pale rounded-full flex items-center justify-center mx-auto mb-3">
                <Package size={28} className="text-afri-green-light" />
              </div>
              <p className="font-semibold text-gray-700">No active orders</p>
              <p className="text-gray-400 text-sm mt-1">Claim an order below to start picking</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order, i) => {
                const id = order.id || order._id
                const st = STATUS_COLORS[order.status] || STATUS_COLORS.assigned_to_picker
                const pickedItems = order.items?.filter(item => item.status === 'picked').length || 0
                const totalItems = order.items?.length || 0
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="bg-white rounded-2xl shadow-sm border border-afri-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => navigate(`/picker/order/${id}`)}
                  >
                    <div className={`h-1 w-full ${st.stripe}`} />
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-bold text-afri-gray-900 text-sm">{order.orderNumber || id}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${st.badge}`}>{st.label}</span>
                          </div>
                          <p className="text-xs text-gray-400">{order.vendor?.storeName || '—'} · {totalItems} items</p>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/picker/order/${id}`) }}
                          className="px-4 py-1.5 bg-afri-yellow-dark text-white text-xs font-bold rounded-xl"
                        >
                          Continue
                        </button>
                      </div>
                      {totalItems > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{pickedItems}/{totalItems}</span>
                          </div>
                          <div className="h-1.5 bg-afri-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-afri-green rounded-full transition-all"
                              style={{ width: `${totalItems > 0 ? (pickedItems / totalItems) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        {/* Available Queue */}
        {orderQueue.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-afri-gray-900 font-bold text-lg">Available to Claim</h2>
              <span className="text-xs bg-afri-green-pale text-afri-green-dark font-bold px-2.5 py-1 rounded-full">
                {orderQueue.length}
              </span>
            </div>
            <div className="space-y-3">
              {orderQueue.map((order, i) => {
                const id = order.id || order._id
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl shadow-sm border border-afri-gray-100 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-afri-gray-900 text-sm">{order.orderNumber || id}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Package size={11} />{order.items?.length || 0} items</span>
                        {order.vendor?.storeName && <span>{order.vendor.storeName}</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => claimOrder(id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-afri-green hover:bg-afri-green-dark text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      <Plus size={13} /> Claim
                    </button>
                  </motion.div>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

export default PickerDashboard
