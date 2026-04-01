import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiCall } from '../../services/api'
import { motion } from 'framer-motion'
import {
  Users, Store, ShoppingBag, DollarSign, TrendingUp,
  Clock, CheckCircle, XCircle, Package, ArrowUpRight,
  RefreshCw, Bell, Bike, ShieldCheck
} from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, subType = 'neutral', color, delay = 0 }) {
  const subColor = subType === 'increase' ? 'text-afri-green-dark bg-afri-green-pale' : subType === 'decrease' ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-gray-100'
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-afri-gray-100"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${color} rounded-2xl flex items-center justify-center`}>
          <Icon size={20} className="text-white" />
        </div>
        {sub && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${subColor}`}>{sub}</span>
        )}
      </div>
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
      <p className="text-3xl font-black text-afri-gray-900">{value}</p>
    </motion.div>
  )
}

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchAdminStats() }, [])

  const fetchAdminStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiCall('/admin/stats')
      setStats(res?.data || res)
    } catch (err) {
      setError(err?.message || 'Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Top bar */}
      <header className="bg-white border-b border-afri-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-afri-gray-900 font-bold text-lg">Dashboard</h1>
          <p className="text-gray-400 text-xs">
            Platform overview · {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAdminStats}
            className="w-9 h-9 bg-afri-gray-50 rounded-xl flex items-center justify-center hover:bg-afri-gray-100 transition-colors"
          >
            <RefreshCw size={15} className="text-gray-500" />
          </button>
          <button className="w-9 h-9 bg-afri-gray-50 rounded-xl flex items-center justify-center relative">
            <Bell size={15} className="text-gray-500" />
            {stats?.vendors?.pending > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-6 flex items-center justify-between">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={fetchAdminStats} className="text-red-500 text-sm font-semibold flex items-center gap-1">
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl h-32 animate-pulse border border-afri-gray-100" />
            ))}
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={Users}       label="Total Users"    value={stats?.users || 0}                          color="bg-afri-green"        delay={0}    sub="+12%" subType="increase" />
              <StatCard icon={Store}       label="Active Vendors" value={stats?.vendors?.approved || 0}              color="bg-afri-green-dark"   delay={0.05} sub={`${stats?.vendors?.pending || 0} pending`} />
              <StatCard icon={ShoppingBag} label="Total Orders"   value={stats?.orders || 0}                         color="bg-afri-yellow-dark"  delay={0.1}  sub="+8%"  subType="increase" />
              <StatCard icon={DollarSign}  label="Revenue"        value={`£${(stats?.revenue || 0).toFixed(0)}`}     color="bg-[#FFB300]"         delay={0.15} sub="+15%" subType="increase" />
            </div>

            {/* Two-column section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
              {/* Vendor status */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-5 shadow-sm border border-afri-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-afri-gray-900 flex items-center gap-2">
                    <Store size={17} className="text-afri-green" /> Vendor Status
                  </h2>
                  <Link to="/admin/vendors" className="text-xs text-afri-green font-semibold flex items-center gap-0.5">
                    Manage <ArrowUpRight size={13} />
                  </Link>
                </div>
                <div className="space-y-2.5">
                  {[
                    { label: 'Approved', value: stats?.vendors?.approved || 0, icon: CheckCircle, color: 'text-afri-green',      bg: 'bg-afri-green-pale' },
                    { label: 'Pending',  value: stats?.vendors?.pending  || 0, icon: Clock,       color: 'text-afri-yellow-dark', bg: 'bg-afri-yellow-light' },
                    { label: 'Rejected', value: stats?.vendors?.rejected || 0, icon: XCircle,     color: 'text-red-500',          bg: 'bg-red-50' },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className={`flex items-center justify-between p-3 ${bg} rounded-xl`}>
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={color} />
                        <span className="text-sm font-semibold text-afri-gray-900">{label}</span>
                      </div>
                      <span className={`text-xl font-black ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Platform health */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl p-5 shadow-sm border border-afri-gray-100">
                <h2 className="font-bold text-afri-gray-900 flex items-center gap-2 mb-4">
                  <TrendingUp size={17} className="text-afri-yellow-dark" /> Platform Health
                </h2>
                <div className="space-y-2.5">
                  {[
                    { label: 'Total Products',   value: stats?.products || 0,                               icon: Package,     color: 'text-afri-green',      bg: 'bg-afri-green-pale' },
                    { label: 'Total Orders',      value: stats?.orders   || 0,                               icon: ShoppingBag, color: 'text-afri-yellow-dark', bg: 'bg-afri-yellow-light' },
                    { label: 'Platform Revenue',  value: `£${(stats?.revenue || 0).toFixed(2)}`,            icon: DollarSign,  color: 'text-afri-green-dark',  bg: 'bg-afri-green-pale' },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className={`flex items-center justify-between p-3 ${bg} rounded-xl`}>
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={color} />
                        <span className="text-sm font-semibold text-afri-gray-900">{label}</span>
                      </div>
                      <span className={`text-xl font-black ${color}`}>{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Recent Orders */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-afri-gray-100 overflow-hidden mb-5">
              <div className="px-5 py-4 border-b border-afri-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-afri-gray-900 flex items-center gap-2">
                  <ShoppingBag size={17} className="text-afri-yellow-dark" /> Recent Orders
                </h2>
                <Link to="/admin/orders" className="text-xs text-afri-green font-semibold flex items-center gap-0.5">
                  View all <ArrowUpRight size={13} />
                </Link>
              </div>
              {stats?.recentOrders?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-afri-gray-50 text-xs text-gray-400 uppercase tracking-wide">
                        <th className="px-5 py-3 text-left font-semibold">Order</th>
                        <th className="px-5 py-3 text-left font-semibold">Customer</th>
                        <th className="px-5 py-3 text-left font-semibold hidden md:table-cell">Vendor</th>
                        <th className="px-5 py-3 text-left font-semibold">Total</th>
                        <th className="px-5 py-3 text-left font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-afri-gray-50">
                      {stats.recentOrders.map(order => {
                        const statusMap = {
                          delivered: 'bg-afri-green-pale text-afri-green-dark',
                          pending:   'bg-afri-yellow-light text-afri-yellow-dark',
                          confirmed: 'bg-blue-100 text-blue-700',
                          cancelled: 'bg-red-100 text-red-600',
                        }
                        const total = order.pricing?.total ?? order.totalAmount ?? 0
                        return (
                          <tr key={order._id} className="hover:bg-afri-gray-50 transition-colors">
                            <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                              #{order.orderNumber || order._id?.toString().slice(-6).toUpperCase()}
                            </td>
                            <td className="px-5 py-3.5 font-medium text-afri-gray-900">{order.customer?.name || 'N/A'}</td>
                            <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">{order.vendor?.storeName || 'N/A'}</td>
                            <td className="px-5 py-3.5 font-bold text-afri-gray-900">£{Number(total).toFixed(2)}</td>
                            <td className="px-5 py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusMap[order.status] || 'bg-gray-100 text-gray-600'}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-400">
                  <ShoppingBag size={32} className="mx-auto mb-2 text-gray-200" />
                  <p>No recent orders</p>
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Manage Vendors',   desc: 'Approve, reject, suspend',  path: '/admin/vendors',    icon: Store,       gradient: 'from-afri-green to-afri-green-dark' },
                { label: 'Manage Riders',    desc: 'Approve & monitor riders',  path: '/admin/riders',     icon: Bike,        gradient: 'from-afri-gray-900 to-[#1A1A1A]' },
                { label: 'Manage Customers', desc: 'View, suspend, delete',     path: '/admin/customers',  icon: Users,       gradient: 'from-afri-yellow-dark to-[#E07000]' },
                { label: 'Audit Logs',       desc: 'Full activity trail',       path: '/admin/audit-logs', icon: ShieldCheck, gradient: 'from-[#2B3632] to-afri-gray-900' },
              ].map(({ label, desc, path, icon: Icon, gradient }, i) => (
                <motion.div
                  key={path}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                >
                  <Link
                    to={path}
                    className={`bg-gradient-to-br ${gradient} text-white p-5 rounded-2xl shadow-sm hover:shadow-lg transition-all flex items-center justify-between group block`}
                  >
                    <div>
                      <h3 className="font-bold mb-0.5">{label}</h3>
                      <p className="text-white/70 text-xs">{desc}</p>
                    </div>
                    <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
                      <Icon size={20} className="text-white" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default AdminDashboard
