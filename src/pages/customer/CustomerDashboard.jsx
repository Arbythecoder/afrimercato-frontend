import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerAPI } from '../../services/api'
import { getProductImage } from '../../utils/defaultImages'

function CustomerDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalOrders: 0,
    wishlistItems: 0,
    rewardPoints: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [recommendedProducts, setRecommendedProducts] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, ordersRes, productsRes] = await Promise.all([
        customerAPI.getDashboardStats(),
        customerAPI.getRecentOrders({ limit: 5 }),
        customerAPI.getRecommendedProducts({ limit: 4 })
      ])

      if (statsRes.success) {
        setStats(statsRes.data)
      }

      if (ordersRes.success) {
        setRecentOrders(ordersRes.data.orders || ordersRes.data || [])
      }

      if (productsRes.success) {
        setRecommendedProducts(productsRes.data.products || productsRes.data || [])
      }
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      'out-for-delivery': 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const quickActions = [
    {
      icon: '🛍️',
      title: 'Browse Products',
      description: 'Explore our fresh products',
      action: () => navigate('/products'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '📍',
      title: 'Find Vendors',
      description: 'Discover local stores',
      action: () => navigate('/vendors'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '📦',
      title: 'Track Orders',
      description: 'Check delivery status',
      action: () => navigate('/orders'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '❤️',
      title: 'Wishlist',
      description: 'View saved items',
      action: () => navigate('/wishlist'),
      color: 'from-red-500 to-red-600'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-afri-green mx-auto mb-4"></div>
          <p className="text-afri-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-8 animate-slideDown">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back! 👋</h1>
          <p className="text-afri-green-light">Here's what's happening with your orders</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                📦
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
                <p className="text-sm text-gray-500">Active Orders</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                📊
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                <p className="text-sm text-gray-500">Total Orders</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                ❤️
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</p>
                <p className="text-sm text-gray-500">Wishlist Items</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                ⭐
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">{stats.rewardPoints}</p>
                <p className="text-sm text-gray-500">Reward Points</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 animate-slideUp">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="flex flex-col items-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${action.color} rounded-full flex items-center justify-center text-3xl mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  {action.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                <p className="text-sm text-gray-500 text-center">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
              <button
                onClick={() => navigate('/orders')}
                className="text-afri-green hover:text-afri-green-dark font-semibold text-sm"
              >
                View All →
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-500 mb-4">No orders yet</p>
                <button
                  onClick={() => navigate('/products')}
                  className="px-6 py-2 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div
                    key={order._id || index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-afri-green to-afri-green-dark rounded-lg flex items-center justify-center text-white font-bold">
                        #{order.orderNumber?.slice(-4) || 'N/A'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {order.items?.length || 0} items
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        £{order.totalAmount?.toFixed(2) || '0.00'}
                      </p>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(order.status)}`}>
                        {order.status?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Products */}
          <div className="bg-white rounded-xl shadow-lg p-6 animate-fadeIn" style={{ animationDelay: '200ms' }}>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended for You</h2>

            {recommendedProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🛍️</div>
                <p className="text-gray-500 text-sm">No recommendations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recommendedProducts.map((product, index) => (
                  <div
                    key={product._id || index}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    {/* Product image with smart fallback to category-specific defaults */}
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.unit || 'per item'}</p>
                      <p className="text-afri-green font-bold mt-1">
                        £{product.price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => navigate('/products')}
              className="w-full mt-4 py-2 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Browse All Products
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
        }
      `}</style>
    </div>
  )
}

export default CustomerDashboard
