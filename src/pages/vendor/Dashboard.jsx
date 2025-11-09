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
} from 'recharts'

const COLORS = ['#00B207', '#FFD700', '#FF6B6B', '#4ECDC4', '#95E1D3']

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')
  const [animateCards, setAnimateCards] = useState(false)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    fetchDashboardData()
    // Trigger card animations after component mounts
    setTimeout(() => setAnimateCards(true), 100)
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
      }
      if (chartResponse.success) {
        setChartData(chartResponse.data)
      }
      setNeedsOnboarding(false)
    } catch (error) {
      console.error('Dashboard error:', error)
      // Check if error is due to missing vendor profile
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

  const StatCard = ({ title, value, icon, trend, color, delay }) => (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 transform transition-all duration-700 hover:scale-105 hover:shadow-2xl ${
        animateCards ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-afri-gray-600 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-afri-gray-900">{value}</h3>
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <svg
                className={`w-4 h-4 mr-1 transform ${trend >= 0 ? '' : 'rotate-180'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-semibold">{Math.abs(trend)}%</span>
              <span className="ml-1 text-afri-gray-500">vs last period</span>
            </div>
          )}
        </div>
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-3xl shadow-lg transform transition-transform duration-300 hover:rotate-12`}
        >
          {icon}
        </div>
      </div>
    </div>
  )

  // Show onboarding if vendor profile not found
  if (needsOnboarding && !loading) {
    return <VendorOnboarding onComplete={handleOnboardingComplete} />
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-afri-green border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-12 h-12 border-4 border-afri-yellow border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-afri-green to-afri-green-dark bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-afri-gray-600 mt-2">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-afri-green to-afri-green-dark text-white shadow-md'
                    : 'text-afri-gray-700 hover:bg-afri-gray-50'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`£${stats?.revenue?.total?.toFixed(2) || '0.00'}`}
          icon="💰"
          trend={stats?.revenue?.trend}
          color="from-green-400 to-green-600"
          delay={0}
        />
        <StatCard
          title="Total Orders"
          value={stats?.orders?.total || 0}
          icon="🛒"
          trend={stats?.orders?.trend}
          color="from-blue-400 to-blue-600"
          delay={100}
        />
        <StatCard
          title="Total Products"
          value={stats?.products?.total || 0}
          icon="📦"
          trend={stats?.products?.trend}
          color="from-purple-400 to-purple-600"
          delay={200}
        />
        <StatCard
          title="Average Order Value"
          value={`£${stats?.revenue?.avgOrderValue?.toFixed(2) || '0.00'}`}
          icon="📊"
          trend={stats?.revenue?.avgTrend}
          color="from-yellow-400 to-yellow-600"
          delay={300}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-2xl">
          <h3 className="text-lg font-semibold text-afri-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-gradient-to-r from-afri-green to-afri-green-dark rounded-full mr-2"></span>
            Revenue Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData?.revenueData || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00B207" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00B207" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#00B207"
                strokeWidth={3}
                fill="url(#revenueGradient)"
                dot={{ fill: '#00B207', r: 5 }}
                activeDot={{ r: 8, stroke: '#FFD700', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-2xl">
          <h3 className="text-lg font-semibold text-afri-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full mr-2"></span>
            Orders Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData?.ordersData || []}>
              <defs>
                <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Bar dataKey="orders" fill="url(#ordersGradient)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Status Distribution & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Pie Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-2xl">
          <h3 className="text-lg font-semibold text-afri-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mr-2"></span>
            Order Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData?.orderStatusData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {(chartData?.orderStatusData || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-2xl">
          <h3 className="text-lg font-semibold text-afri-gray-900 mb-4 flex items-center">
            <span className="w-3 h-3 bg-gradient-to-r from-afri-yellow to-afri-yellow-dark rounded-full mr-2"></span>
            Top Selling Products
          </h3>
          <div className="space-y-3">
            {(stats?.topProducts || []).slice(0, 5).map((product, index) => (
              <div
                key={product._id}
                className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-afri-gray-50 to-white hover:from-afri-green hover:to-afri-green-dark hover:text-white transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-afri-green to-afri-green-dark text-white flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium group-hover:text-white">{product.name}</p>
                    <p className="text-sm text-afri-gray-500 group-hover:text-white group-hover:opacity-80">
                      {product.soldQuantity} sold
                    </p>
                  </div>
                </div>
                <span className="font-bold text-afri-green group-hover:text-white">
                  £{product.revenue?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-afri-gray-900 flex items-center">
            <span className="w-3 h-3 bg-gradient-to-r from-afri-green to-afri-green-dark rounded-full mr-2"></span>
            Recent Orders
          </h3>
          <Link
            to="/orders"
            className="text-afri-green hover:text-afri-green-dark font-medium transition-colors duration-200 flex items-center group"
          >
            View All
            <svg
              className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-afri-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-afri-gray-700 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(stats?.recentOrders || []).slice(0, 5).map((order) => (
                <tr
                  key={order._id}
                  className="hover:bg-gradient-to-r hover:from-afri-gray-50 hover:to-white transition-all duration-200 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-afri-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-afri-gray-500">
                    {order.customer?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-afri-green">
                    £{order.pricing?.total?.toFixed(2) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-afri-green to-afri-green-dark text-white">
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-afri-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/products"
          className="bg-gradient-to-br from-afri-green to-afri-green-dark text-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Manage Products</h4>
              <p className="text-sm opacity-90">Add, edit, or remove products</p>
            </div>
            <svg
              className="w-10 h-10 opacity-75 group-hover:scale-110 transition-transform"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
          </div>
        </Link>

        <Link
          to="/orders"
          className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">Process Orders</h4>
              <p className="text-sm opacity-90">View and manage orders</p>
            </div>
            <svg
              className="w-10 h-10 opacity-75 group-hover:scale-110 transition-transform"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path
                fillRule="evenodd"
                d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </Link>

        <Link
          to="/reports"
          className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">View Reports</h4>
              <p className="text-sm opacity-90">Analytics and insights</p>
            </div>
            <svg
              className="w-10 h-10 opacity-75 group-hover:scale-110 transition-transform"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard
