import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { vendorAPI } from '../../services/api'
import VendorOnboarding from '../../components/VendorOnboarding'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'

const COLORS = ['#00B207', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6']
const STATUS_COLORS = {
  pending: 'from-yellow-400 to-amber-500',
  confirmed: 'from-blue-400 to-blue-600',
  processing: 'from-purple-400 to-purple-600',
  ready: 'from-cyan-400 to-cyan-600',
  'out-for-delivery': 'from-orange-400 to-orange-600',
  delivered: 'from-green-400 to-green-600',
  cancelled: 'from-red-400 to-red-600',
}

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [animateCards, setAnimateCards] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    setTimeout(() => setAnimateCards(true), 100)

    // Update time every minute
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [timeRange])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsResponse, chartResponse] = await Promise.all([
        vendorAPI.getDashboardStats(),
        vendorAPI.getChartData({ timeRange }),
      ])

      if (statsResponse.success) {
        setStats(statsResponse.data)
        // Show confetti for good performance
        if (statsResponse.data?.revenue?.trend > 10) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 3000)
        }
      }
      if (chartResponse.success) {
        setChartData(chartResponse.data)
      }
      setNeedsOnboarding(false)
    } catch (error) {
      console.error('Dashboard error:', error)
      if (error.message && error.message.includes('Vendor profile not found')) {
        setNeedsOnboarding(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false)
    fetchDashboardData()
  }

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return { text: 'Good Morning', emoji: '🌅' }
    if (hour < 17) return { text: 'Good Afternoon', emoji: '☀️' }
    if (hour < 21) return { text: 'Good Evening', emoji: '🌆' }
    return { text: 'Good Night', emoji: '🌙' }
  }

  // Calculate store performance score
  const getPerformanceScore = () => {
    if (!stats) return 0
    let score = 50 // Base score
    if (stats.revenue?.trend > 0) score += Math.min(stats.revenue.trend, 20)
    if (stats.orders?.total > 0) score += 10
    if (stats.products?.total >= 10) score += 10
    if (stats.orders?.fulfillmentRate > 90) score += 10
    return Math.min(Math.round(score), 100)
  }

  const performanceScore = getPerformanceScore()
  const greeting = getGreeting()

  // Stat Card Component with enhanced animations
  const StatCard = ({ title, value, icon, trend, color, delay, sparkData, pulse }) => (
    <div
      className={`relative bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl overflow-hidden ${
        animateCards ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Background decoration */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-10 blur-xl`}></div>

      {/* Pulse indicator for active items */}
      {pulse && (
        <div className="absolute top-4 right-4">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        </div>
      )}

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{value}</h3>
          {trend !== undefined && trend !== null && (
            <div className={`flex items-center mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              <div className={`p-1 rounded-full ${trend >= 0 ? 'bg-green-100' : 'bg-red-100'} mr-2`}>
                <svg
                  className={`w-3 h-3 ${trend < 0 ? 'rotate-180' : ''}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-semibold">{Math.abs(trend)}%</span>
              <span className="ml-1 text-gray-400 text-xs">vs last period</span>
            </div>
          )}
        </div>
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-2xl shadow-lg transform transition-all duration-300 hover:rotate-12 hover:scale-110`}>
          {icon}
        </div>
      </div>

      {/* Mini sparkline chart */}
      {sparkData && sparkData.length > 0 && (
        <div className="mt-4 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={`spark-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B207" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00B207" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#00B207" fill={`url(#spark-${title})`} strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )

  // Performance Score Ring
  const PerformanceRing = ({ score }) => {
    const circumference = 2 * Math.PI * 45
    const strokeDashoffset = circumference - (score / 100) * circumference
    const getScoreColor = () => {
      if (score >= 80) return '#00B207'
      if (score >= 60) return '#F59E0B'
      return '#EF4444'
    }

    return (
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 transform -rotate-90">
          <circle cx="64" cy="64" r="45" stroke="#E5E7EB" strokeWidth="8" fill="none" />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke={getScoreColor()}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{score}</span>
          <span className="text-xs text-gray-500">Score</span>
        </div>
      </div>
    )
  }

  // Alert Card Component
  const AlertCard = ({ type, title, message, action, actionLink }) => {
    const alertStyles = {
      warning: 'from-amber-50 to-yellow-50 border-amber-200',
      danger: 'from-red-50 to-rose-50 border-red-200',
      success: 'from-green-50 to-emerald-50 border-green-200',
      info: 'from-blue-50 to-cyan-50 border-blue-200',
    }
    const iconStyles = {
      warning: 'text-amber-500',
      danger: 'text-red-500',
      success: 'text-green-500',
      info: 'text-blue-500',
    }

    return (
      <div className={`bg-gradient-to-r ${alertStyles[type]} border-l-4 ${alertStyles[type].split(' ')[2]} rounded-r-xl p-4 flex items-center justify-between`}>
        <div className="flex items-center">
          <div className={`${iconStyles[type]} mr-3`}>
            {type === 'warning' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
            {type === 'danger' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>}
            {type === 'success' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
            {type === 'info' && <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{title}</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
        {action && (
          <Link to={actionLink} className="px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            {action}
          </Link>
        )}
      </div>
    )
  }

  if (needsOnboarding && !loading) {
    return <VendorOnboarding onComplete={handleOnboardingComplete} />
  }

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="relative mb-8">
          <div className="w-24 h-24 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <p className="text-gray-600 font-medium animate-pulse">Loading your dashboard...</p>
      </div>
    )
  }

  // Calculate alerts
  const lowStockProducts = stats?.products?.lowStock || 0
  const pendingOrders = stats?.orders?.pending || 0

  return (
    <div className="space-y-6 pb-8">
      {/* Confetti effect for good performance */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
                width: '10px',
                height: '10px',
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 via-green-500 to-emerald-500 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{greeting.emoji}</span>
              <h1 className="text-3xl lg:text-4xl font-bold">{greeting.text}!</h1>
            </div>
            <p className="text-green-100 text-lg">
              Here's what's happening with your store today, {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-200"></span>
                </span>
                <span className="text-sm font-medium">Store is Live</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                <span className="text-sm font-medium">{stats?.products?.total || 0} Products Active</span>
              </div>
            </div>
          </div>

          {/* Performance Score */}
          <div className="mt-6 lg:mt-0 flex flex-col items-center bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <PerformanceRing score={performanceScore} />
            <p className="text-sm font-medium mt-2 text-green-100">Store Performance</p>
          </div>
        </div>
      </div>

      {/* Quick Action: Add Product Button */}
      <div className="flex justify-between items-center">
        <Link
          to="/products"
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-afri-green to-emerald-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-[1.02] font-bold text-lg group"
        >
          <svg className="w-6 h-6 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add New Product</span>
        </Link>

        {/* Time Range Selector */}
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                timeRange === range
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      {(lowStockProducts > 0 || pendingOrders > 0) && (
        <div className="space-y-3">
          {lowStockProducts > 0 && (
            <AlertCard
              type="warning"
              title="Low Stock Alert"
              message={`${lowStockProducts} product(s) are running low on stock`}
              action="View Products"
              actionLink="/products"
            />
          )}
          {pendingOrders > 0 && (
            <AlertCard
              type="info"
              title="Pending Orders"
              message={`You have ${pendingOrders} order(s) waiting to be processed`}
              action="View Orders"
              actionLink="/orders"
            />
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`£${stats?.revenue?.total?.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`}
          icon="💰"
          trend={stats?.revenue?.trend}
          color="from-green-400 to-emerald-500"
          delay={0}
          pulse={stats?.revenue?.trend > 0}
          sparkData={chartData?.revenueData?.slice(-7).map(d => ({ value: d.revenue }))}
        />
        <StatCard
          title="Total Orders"
          value={stats?.orders?.total?.toLocaleString() || 0}
          icon="📦"
          trend={stats?.orders?.trend}
          color="from-blue-400 to-blue-600"
          delay={100}
          pulse={pendingOrders > 0}
        />
        <StatCard
          title="Active Products"
          value={stats?.products?.total?.toLocaleString() || 0}
          icon="🛍️"
          trend={stats?.products?.trend}
          color="from-purple-400 to-purple-600"
          delay={200}
        />
        <StatCard
          title="Avg. Order Value"
          value={`£${stats?.revenue?.avgOrderValue?.toFixed(2) || '0.00'}`}
          icon="📊"
          trend={stats?.revenue?.avgTrend}
          color="from-amber-400 to-orange-500"
          delay={300}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Revenue Trend</h3>
              <p className="text-sm text-gray-500">Your earnings over time</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-medium text-green-700">Revenue</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData?.revenueData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B207" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00B207" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={(v) => `£${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
                formatter={(value) => [`£${value.toFixed(2)}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#00B207" strokeWidth={3} fill="url(#revenueGradient)" dot={{ fill: '#00B207', r: 4 }} activeDot={{ r: 6, stroke: '#FFD700', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Orders Overview</h3>
              <p className="text-sm text-gray-500">Daily order volume</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span className="text-xs font-medium text-blue-700">Orders</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData?.ordersData || []}>
              <defs>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={1} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="orders" fill="url(#ordersGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Order Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Order Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={chartData?.orderStatusData || []}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {(chartData?.orderStatusData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-4">
            {(chartData?.orderStatusData || []).map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
            <Link to="/products" className="text-sm text-green-600 hover:text-green-700 font-medium">View All</Link>
          </div>
          <div className="space-y-4">
            {(stats?.topProducts || []).slice(0, 5).map((product, index) => (
              <div key={product._id} className="flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                  index === 0 ? 'from-yellow-400 to-amber-500' :
                  index === 1 ? 'from-gray-300 to-gray-400' :
                  index === 2 ? 'from-amber-600 to-amber-700' :
                  'from-gray-100 to-gray-200'
                } flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform`}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.soldQuantity} sold</p>
                </div>
                <span className="font-bold text-green-600">£{product.revenue?.toFixed(2)}</span>
              </div>
            ))}
            {(!stats?.topProducts || stats.topProducts.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No sales yet</p>
                <p className="text-sm">Products will appear here after your first sale</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <Link to="/orders" className="text-sm text-green-600 hover:text-green-700 font-medium">View All</Link>
          </div>
          <div className="space-y-4">
            {(stats?.recentOrders || []).slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">{order.customer?.name || 'Customer'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">£{order.pricing?.total?.toFixed(2) || '0.00'}</p>
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-gradient-to-r ${STATUS_COLORS[order.status] || STATUS_COLORS.pending} text-white`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <p>No orders yet</p>
                <p className="text-sm">Orders will appear here when customers purchase</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/products" className="group relative bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl p-6 overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold mb-2">Manage Products</h4>
              <p className="text-green-100">Add, edit, or remove products</p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link to="/orders" className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl shadow-xl p-6 overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
          {pendingOrders > 0 && (
            <div className="absolute top-4 right-4 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
              {pendingOrders}
            </div>
          )}
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold mb-2">Process Orders</h4>
              <p className="text-blue-100">View and manage orders</p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Link>

        <Link to="/reports" className="group relative bg-gradient-to-br from-purple-500 to-violet-600 text-white rounded-2xl shadow-xl p-6 overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold mb-2">View Reports</h4>
              <p className="text-purple-100">Analytics and insights</p>
            </div>
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* Custom CSS for confetti animation */}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation: confetti 3s ease-in-out forwards;
        }
      `}</style>
    </div>
  )
}

export default Dashboard
