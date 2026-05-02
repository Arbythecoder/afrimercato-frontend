import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerAPI } from '../../services/api'
import { getProductImage } from '../../utils/defaultImages'
import { BsGraphUpArrow } from "react-icons/bs";
import { FaStar } from "react-icons/fa6";
import { LuShoppingBag } from 'react-icons/lu';
import { MdShoppingCart } from 'react-icons/md';

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
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
      title: 'Browse Products',
      description: 'Explore our fresh products',
      action: () => navigate('/products'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
      ),
      title: 'Find Vendors',
      description: 'Discover local stores',
      action: () => navigate('/discover'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.096l-9-5.143-9 5.143m18 0v7.808c0 .545-.316 1.033-.8 1.272l-8.2 4.095m9-13.175l-9 5.143m-9-5.143v7.808c0 .545.316 1.033.8 1.272l8.2 4.095m0 0v-7.808" />
        </svg>
      ),
      title: 'Track Orders',
      description: 'Check delivery status',
      action: () => navigate('/orders'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      ),
      title: 'Wishlist',
      description: 'View saved items',
      action: () => navigate('/wishlist'),
      color: 'from-red-500 to-red-600'
    }
  ];

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
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white flex justify-between py-8 animate-slideDown">
        <div className=" px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back! 👋</h1>
          <p className="text-afri-green-light">Here's what's happening with your orders</p>
        </div>

        <div className='px-3'>
          <MdShoppingCart onClick={() => navigate('/cart')} className='sm:text-4xl cursor-pointer text-4xl' />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
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
                <BsGraphUpArrow className="w-8 h-8 text-white" />
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
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
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
                <FaStar className="w-8 h-8 text-white"  />
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
                  <LuShoppingBag className="mx-auto sm:text-4xl text-gray-500" />
                <div className="text-6xl mb-4">
                </div>
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
                    onClick={() => navigate(`/product/${product._id}`)}
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
