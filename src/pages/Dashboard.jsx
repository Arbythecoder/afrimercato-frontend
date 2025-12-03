import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { vendorAPI } from '../services/api'
import { analyticsAPI } from '../services/analyticsAPI'
import AdvancedAnalytics from '../components/Analytics/AdvancedAnalytics'
import VendorOnboarding from '../components/VendorOnboarding'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [analyticsData, setAnalyticsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [timeRange, setTimeRange] = useState('7d')
  const [chartData, setChartData] = useState([])
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  // Initial state for charts

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError('')
        const [statsResponse, chartResponse] = await Promise.all([
          vendorAPI.getDashboardStats(),
          vendorAPI.getChartData(timeRange)
        ])

        if (statsResponse.success) {
          setStats(statsResponse.data)
        }

        if (chartResponse.success) {
          setChartData(chartResponse.data)
        }

        // Fetch analytics data if on analytics tab
        if (activeTab === 'analytics') {
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - 30)
          const endDate = new Date()

          const analyticsResponse = await analyticsAPI.getDetailedAnalytics(
            startDate.toISOString().split('T')[0],
            endDate.toISOString().split('T')[0]
          )

          if (analyticsResponse.success) {
            setAnalyticsData(analyticsResponse.data)
          }
        }
      } catch (err) {
        console.error('Dashboard error:', err)
        const errorMsg = err.message || 'Failed to load dashboard'

        // Check if vendor profile is missing
        if (errorMsg.includes('Vendor profile not found') || errorMsg.includes('VENDOR_NOT_FOUND')) {
          setNeedsOnboarding(true)
          setLoading(false)
          return
        }

        // Check if it's an auth error
        if (errorMsg.includes('401') || errorMsg.includes('Session expired') || errorMsg.includes('Unauthorized')) {
          setError('Your session has expired. Please log in again.')
          setTimeout(() => {
            window.location.href = '/login'
          }, 2000)
        } else {
          setError(errorMsg)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [timeRange, activeTab])

  const handleOnboardingComplete = () => {
    setNeedsOnboarding(false)
    window.location.reload()
  }

  // Removed unused function as it's now handled in the useEffect

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-afri-green"></div>
      </div>
    )
  }

  if (needsOnboarding) {
    return <VendorOnboarding onComplete={handleOnboardingComplete} />
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700">{error}</p>
      </div>
    )
  }

  const statCards = [
    // Today's Performance
    {
      name: "Today's Sales",
      value: `£${stats?.todayStats?.revenue?.toLocaleString() || 0}`,
      subtext: `${stats?.todayStats?.orders || 0} orders`,
      icon: '💰',
      color: 'from-green-400 to-green-600',
      link: '/orders'
    },
    {
      name: "Week's Sales",
      value: `£${stats?.weekStats?.revenue?.toLocaleString() || 0}`,
      subtext: `${stats?.weekStats?.orders || 0} orders`,
      icon: '📅',
      color: 'from-blue-400 to-blue-600',
      link: '/orders'
    },
    {
      name: "Month's Sales",
      value: `£${stats?.monthlyRevenue?.toLocaleString() || 0}`,
      subtext: `vs last month ${stats?.monthlyGrowth > 0 ? '+' : ''}${stats?.monthlyGrowth || 0}%`,
      icon: '�',
      color: 'from-indigo-400 to-indigo-600',
      link: '/orders'
    },
    {
      name: 'Total Revenue',
      value: `£${stats?.totalRevenue?.toLocaleString() || 0}`,
      subtext: 'YTD',
      icon: '🏆',
      color: 'from-purple-400 to-purple-600',
      link: '/orders'
    },
    // Store Health
    {
      name: 'Pending Orders',
      value: stats?.pendingOrders || 0,
      subtext: 'Need attention',
      icon: '⏳',
      color: 'from-yellow-400 to-yellow-600',
      link: '/orders'
    },
    {
      name: 'Orders to Ship',
      value: stats?.readyToShipOrders || 0,
      subtext: 'Ready for delivery',
      icon: '📦',
      color: 'from-orange-400 to-orange-600',
      link: '/orders'
    },
    {
      name: 'Total Products',
      value: stats?.totalProducts || 0,
      subtext: `${stats?.lowStockProducts?.length || 0} low stock`,
      icon: '🏷️',
      color: 'from-teal-400 to-teal-600',
      link: '/products'
    },
    {
      name: 'Account Health',
      value: `${stats?.accountHealth || 100}/100`,
      subtext: stats?.accountHealth >= 90 ? '✨ Excellent' : stats?.accountHealth >= 70 ? '👍 Good' : '⚠️ Needs Attention',
      icon: '�',
      color: 'from-pink-400 to-pink-600',
      link: '/settings'
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your store overview.</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'overview'
                  ? 'bg-afri-green text-white'
                  : 'text-gray-600 hover:text-afri-green hover:bg-gray-50'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-afri-green text-white'
                  : 'text-gray-600 hover:text-afri-green hover:bg-gray-50'
              }`}
            >
              Advanced Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' ? (
        // Original dashboard content
        <div className="space-y-6">
          {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="group relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden transform hover:scale-102"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  {stat.subtext && (
                    <p className="text-sm text-gray-500 mt-1">{stat.subtext}</p>
                  )}
                </div>
                <div className="text-4xl">{stat.icon}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Sales Snapshot & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sales Graph */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sales Overview</h2>
              <p className="text-sm text-gray-500">Last 7 days performance</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-50 text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-afri-green focus:border-transparent"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <div className="h-[300px] bg-white rounded-lg p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A7C2C" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4A7C2C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                  width={80}
                  tickFormatter={(value) => `£${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelStyle={{ color: '#111827', fontWeight: 600 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4A7C2C"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Order Volume Chart */}
          <div className="h-[120px] bg-white rounded-lg mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  axisLine={{ stroke: '#E5E7EB' }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  cursor={{ fill: 'rgba(74, 124, 44, 0.1)' }}
                />
                <Bar
                  dataKey="orders"
                  fill="#4A7C2C"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Today's Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {[
              { label: "Today's Orders", value: stats?.todayStats?.orders || 0 },
              { label: 'Units Sold', value: stats?.todayStats?.units || 0 },
              { label: 'Revenue', value: `£${stats?.todayStats?.revenue?.toLocaleString() || 0}` },
              { label: 'Avg Order Value', value: `£${stats?.todayStats?.avgOrderValue?.toLocaleString() || 0}` },
            ].map((item) => (
              <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Link to="/orders" className="text-sm text-afri-green hover:text-afri-green-dark font-medium">
              View all →
            </Link>
          </div>

          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {stats.recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="relative pl-6 pb-4 border-l-2 border-gray-200 last:border-l-0">
                  <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-afri-green border-4 border-white"></div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {order.customer?.name} placed an order for £{order.pricing?.total?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleTimeString()} - {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
              <p className="text-sm text-gray-400 mt-1">New orders will appear here</p>
            </div>
          )}
        </div>

      </div>

      {/* Performance Metrics & Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* System Notifications */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">System Notifications</h2>
              <p className="text-sm text-gray-500">Important updates and alerts</p>
            </div>
          </div>
          <div className="space-y-4">
            {/* Low Stock Alert */}
            {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-xl">⚠️</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Low Stock Alert</p>
                    <p className="text-sm text-gray-600">
                      {stats.lowStockProducts.length} products need restocking
                    </p>
                  </div>
                </div>
                <div className="mt-3 pl-13">
                  {stats.lowStockProducts.slice(0, 3).map((product) => (
                    <div key={product._id} className="flex items-center justify-between py-2">
                      <p className="text-sm text-gray-600">
                        {product.name} - Only {product.stock} {product.unit} left
                      </p>
                      <Link
                        to={`/products`}
                        className="text-xs text-afri-green hover:text-afri-green-dark font-medium"
                      >
                        Restock →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Performance Alerts */}
            <div className="space-y-3">
              {[
                {
                  metric: 'Fulfillment Rate',
                  value: stats?.metrics?.fulfillmentRate || 95,
                  target: 90,
                  status: 'success',
                  icon: '📦'
                },
                {
                  metric: 'Response Time',
                  value: stats?.metrics?.responseTime || 2,
                  unit: 'hours',
                  target: 24,
                  status: 'success',
                  icon: '⚡'
                },
                {
                  metric: 'Cancellation Rate',
                  value: stats?.metrics?.cancellationRate || 2,
                  target: 5,
                  status: 'warning',
                  icon: '❌'
                }
              ].map((metric) => (
                <div key={metric.metric} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{metric.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900">{metric.metric}</p>
                      <p className="text-sm text-gray-500">
                        {metric.value}{metric.unit ? metric.unit : '%'} 
                        <span className={`ml-2 ${
                          metric.status === 'success' ? 'text-green-600' : 
                          metric.status === 'warning' ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          ({metric.status === 'success' ? 'Good' : 'Needs Attention'})
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Health Score */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Account Health</h2>
              <p className="text-sm text-gray-500">Based on your store performance</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900">{stats?.accountHealth || 95}/100</p>
              <p className="text-sm text-green-600">Excellent</p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { metric: 'Order Defect Rate', target: '<1%', actual: '0.5%', status: 'success' },
              { metric: 'Late Shipment Rate', target: '<4%', actual: '3.2%', status: 'success' },
              { metric: 'Valid Tracking Rate', target: '>95%', actual: '98%', status: 'success' },
              { metric: 'Customer Response Time', target: '<24h', actual: '4h', status: 'success' }
            ].map((item) => (
              <div key={item.metric} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.metric}</p>
                  <p className="text-xs text-gray-500">Target: {item.target}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${
                    item.status === 'success' ? 'text-green-600' : 
                    item.status === 'warning' ? 'text-yellow-600' : 
                    'text-red-600'
                  }`}>
                    {item.actual}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="font-medium text-gray-900 mb-2">Recent Achievements</h3>
            <div className="flex items-center space-x-2">
              <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                🏆 Perfect Month
              </span>
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                ⭐ Top Rated
              </span>
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                🚀 Fast Shipper
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-afri-green to-afri-green-dark rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Quick Actions</h2>
            <p className="text-sm text-white text-opacity-80 mt-1">Frequently used actions</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <Link
            to="/products/new"
            className="flex flex-col items-center justify-center p-4 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all duration-200 transform hover:scale-105"
          >
            <span className="text-3xl mb-2">➕</span>
            <span className="text-sm font-medium text-center">Add New Product</span>
          </Link>
          <Link
            to="/orders?status=pending"
            className="flex flex-col items-center justify-center p-4 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all duration-200 transform hover:scale-105"
          >
            <span className="text-3xl mb-2">📋</span>
            <span className="text-sm font-medium text-center">View Pending Orders</span>
          </Link>
          <Link
            to="/orders?status=shipping"
            className="flex flex-col items-center justify-center p-4 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all duration-200 transform hover:scale-105"
          >
            <span className="text-3xl mb-2">🚚</span>
            <span className="text-sm font-medium text-center">Process Shipments</span>
          </Link>
          <Link
            to="/products?filter=low-stock"
            className="flex flex-col items-center justify-center p-4 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all duration-200 transform hover:scale-105"
          >
            <span className="text-3xl mb-2">📦</span>
            <span className="text-sm font-medium text-center">Restock Items</span>
          </Link>
          <Link
            to="/subscription"
            className="flex flex-col items-center justify-center p-4 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all duration-200 transform hover:scale-105"
          >
            <span className="text-3xl mb-2">⭐</span>
            <span className="text-sm font-medium text-center">Upgrade Plan</span>
          </Link>
          <Link
            to="/settings"
            className="flex flex-col items-center justify-center p-4 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all duration-200 transform hover:scale-105"
          >
            <span className="text-3xl mb-2">⚙️</span>
            <span className="text-sm font-medium text-center">Settings</span>
          </Link>
        </div>
          </div>
        </div>
      ) : (
        // Advanced Analytics content
        <AdvancedAnalytics stats={stats} analyticsData={analyticsData} />
      )}
    </div>
  )
}

export default Dashboard
