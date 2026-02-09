import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function RiderDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    todayDeliveries: 0,
    todayEarnings: 0,
    weeklyDeliveries: 0,
    weeklyEarnings: 0,
    rating: 4.8,
    completionRate: 98
  })
  const [activeDeliveries, setActiveDeliveries] = useState([])
  const [recentDeliveries, setRecentDeliveries] = useState([])
  const [isOnline, setIsOnline] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setStats({
          todayDeliveries: 8,
          todayEarnings: 64.50,
          weeklyDeliveries: 42,
          weeklyEarnings: 336.00,
          rating: 4.8,
          completionRate: 98
        })
        setActiveDeliveries([
          {
            id: 'DEL001',
            orderNumber: 'AFM-2024-001',
            customer: 'Sarah Johnson',
            address: '42 High Street, London SW1A 1AA',
            distance: 2.3,
            status: 'picking-up',
            estimatedTime: '15 min',
            vendor: 'Fresh Valley Farms',
            items: 5,
            earnings: 4.50
          },
          {
            id: 'DEL002',
            orderNumber: 'AFM-2024-002',
            customer: 'James Wilson',
            address: '78 Oak Lane, London E1 6AN',
            distance: 3.1,
            status: 'pending-pickup',
            estimatedTime: '25 min',
            vendor: 'Daily Dairy',
            items: 3,
            earnings: 5.20
          }
        ])
        setRecentDeliveries([
          { id: 'DEL100', customer: 'Emma Brown', earnings: 4.80, time: '1 hour ago', rating: 5 },
          { id: 'DEL099', customer: 'Michael Davis', earnings: 6.20, time: '2 hours ago', rating: 5 },
          { id: 'DEL098', customer: 'Lisa Chen', earnings: 3.90, time: '3 hours ago', rating: 4 }
        ])
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      setLoading(false)
    }
  }

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline)
  }

  const statusColors = {
    'pending-pickup': 'bg-yellow-100 text-yellow-800',
    'picking-up': 'bg-blue-100 text-blue-800',
    'in-transit': 'bg-purple-100 text-purple-800',
    'arriving': 'bg-green-100 text-green-800'
  }

  const statusLabels = {
    'pending-pickup': 'Waiting for Pickup',
    'picking-up': 'Picking Up',
    'in-transit': 'In Transit',
    'arriving': 'Arriving Soon'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Hello, {user?.name?.split(' ')[0] || 'Rider'}!</h1>
              <p className="text-purple-200">Ready for deliveries?</p>
            </div>
            <button
              onClick={toggleOnlineStatus}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                isOnline
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {isOnline ? '🟢 Online' : '⚪ Offline'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Today's Deliveries</span>
              <span className="text-2xl">🚚</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.todayDeliveries}</p>
            <p className="text-sm text-green-600">+3 from yesterday</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Today's Earnings</span>
              <span className="text-2xl">💷</span>
            </div>
            <p className="text-3xl font-bold text-green-600">£{stats.todayEarnings.toFixed(2)}</p>
            <p className="text-sm text-gray-500">+£12.50 from yesterday</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Your Rating</span>
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-3xl font-bold text-yellow-500">{stats.rating}</p>
            <p className="text-sm text-gray-500">Excellent!</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Completion Rate</span>
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.completionRate}%</p>
            <p className="text-sm text-gray-500">Top performer!</p>
          </div>
        </div>

        {/* Active Deliveries */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Active Deliveries</h2>
            <button
              onClick={() => navigate('/rider/deliveries')}
              className="text-purple-600 hover:underline font-semibold"
            >
              View All →
            </button>
          </div>

          {activeDeliveries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <span className="text-6xl">📦</span>
              <h3 className="text-xl font-bold text-gray-900 mt-4">No active deliveries</h3>
              <p className="text-gray-500 mt-2">New orders will appear here when assigned</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeDeliveries.map(delivery => (
                <div
                  key={delivery.id}
                  className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow cursor-pointer"
                  onClick={() => navigate(`/rider/delivery/${delivery.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{delivery.orderNumber}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[delivery.status]}`}>
                          {statusLabels[delivery.status]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">from {delivery.vendor}</p>
                    </div>
                    <span className="text-lg font-bold text-green-600">£{delivery.earnings.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📍</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{delivery.customer}</p>
                      <p className="text-sm text-gray-500">{delivery.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t text-sm">
                    <div className="flex items-center gap-4 text-gray-500">
                      <span>📦 {delivery.items} items</span>
                      <span>📏 {delivery.distance} km</span>
                      <span>⏱️ {delivery.estimatedTime}</span>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700">
                      Navigate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate('/rider/deliveries')}
            className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow"
          >
            <span className="text-3xl">📦</span>
            <p className="font-semibold text-gray-900 mt-2">All Deliveries</p>
          </button>
          <button
            onClick={() => navigate('/rider/earnings')}
            className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow"
          >
            <span className="text-3xl">💰</span>
            <p className="font-semibold text-gray-900 mt-2">Earnings</p>
          </button>
          <button
            onClick={() => navigate('/rider/profile')}
            className="bg-white rounded-xl shadow-lg p-4 text-center hover:shadow-xl transition-shadow"
          >
            <span className="text-3xl">👤</span>
            <p className="font-semibold text-gray-900 mt-2">Profile</p>
          </button>
          <button
            disabled
            title="Support feature coming soon"
            className="bg-gray-100 rounded-xl shadow-lg p-4 text-center cursor-not-allowed opacity-60"
          >
            <span className="text-3xl">🆘</span>
            <p className="font-semibold text-gray-600 mt-2">Support (Coming Soon)</p>
          </button>
        </div>

        {/* Recent Deliveries */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Deliveries</h2>
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {recentDeliveries.map((delivery, index) => (
              <div
                key={delivery.id}
                className={`flex items-center justify-between p-4 ${
                  index < recentDeliveries.length - 1 ? 'border-b' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    ✓
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{delivery.customer}</p>
                    <p className="text-sm text-gray-500">{delivery.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">£{delivery.earnings.toFixed(2)}</p>
                  <div className="flex items-center gap-1">
                    {[...Array(delivery.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">★</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-6 text-white">
          <h3 className="text-lg font-bold mb-4">This Week's Summary</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-purple-200">Total Deliveries</p>
              <p className="text-3xl font-bold">{stats.weeklyDeliveries}</p>
            </div>
            <div>
              <p className="text-purple-200">Total Earnings</p>
              <p className="text-3xl font-bold">£{stats.weeklyEarnings.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/rider/earnings')}
            className="mt-4 w-full py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100"
          >
            View Detailed Report →
          </button>
        </div>
      </div>
    </div>
  )
}

export default RiderDashboard
