import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerAPI, cartAPI } from '../../services/api'
import { getProductImage } from '../../utils/defaultImages'
import { getCartCount } from '../../utils/cartUtils'
import { BsGraphUpArrow } from "react-icons/bs";
import { FaStar } from "react-icons/fa6";
import { LuShoppingBag } from 'react-icons/lu';
import { MdShoppingCart } from 'react-icons/md';
import { MapPin, Package, Heart, Star, BarChart2 } from 'lucide-react'
import { getUserProfile } from '../../services/api';
import { CiLogout } from 'react-icons/ci';
import { useAuth } from '../../context/AuthContext';

function CustomerDashboard() {
  const { logout, isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [firstName, setFirstName] = useState('');
  const [stats, setStats] = useState({
    activeOrders: 0,
    totalOrders: 0,
    wishlistItems: 0,
    rewardPoints: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [recommendedProducts, setRecommendedProducts] = useState([])
  const [cart, setCart] = useState([]);
  const cartCount = getCartCount(cart);

  useEffect(() => {
    fetchDashboardData()
    loadCart()
    window.addEventListener('cartUpdated', loadCart)
    return () => window.removeEventListener('cartUpdated', loadCart)
  }, [])

  useEffect(() => {
    loadCart()
  }, [isAuthenticated])

  const loadCart = async () => {
    try {
      if (isAuthenticated && user?.roles?.includes('customer')) {
        const response = await cartAPI.get();
        if (response.success && response.data && response.data.length > 0) {
          const backendCart = response.data.map(item => ({
            _id: item.productId?.toString() || item.productId,
            name: item.name || 'Product',
            price: item.price,
            quantity: item.quantity,
            unit: item.unit || 'piece',
            images: item.images,
            vendor: item.vendor
          }));
          setCart(backendCart);
        } else {
          const savedCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
          setCart(savedCart);
        }
      } else {
        const savedCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
        setCart(savedCart);
      }
    } catch (error) {
      console.error('Failed to load cart on dashboard:', error);
      const savedCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
      setCart(savedCart);
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to logout?')
    if (confirmed) {
      logout()
      navigate('/#')
    }
  }

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, ordersRes, productsRes, user] = await Promise.all([
        customerAPI.getDashboardStats(),
        customerAPI.getRecentOrders({ limit: 5 }),
        customerAPI.getRecommendedProducts({ limit: 4 })
      ])
      const response = await getUserProfile();
      if (response?.success) {
        // Adjust this path based on your exact backend response structure
        // It's usually response.user, response.data.user, or response.data
        const userData = response.user || response.data?.user || response.data;

        if (userData) {
          const extractedFirstName =
            userData.firstName ||
            (userData.name ? userData.name.split(' ')[0] : 'Customer');

          setFirstName(extractedFirstName);
        }
      }
      console.log('Dashboard stats response:', statsRes)
      console.log('User profile response:', user)

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
      'out-for-delivery': 'bg-[#FDF8F0] text-[#1B4D3E]',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
  const calculateWidth = (value, maxTarget) => {
    if (!value || !maxTarget || maxTarget === 0) return '0%';
    const percentage = (value / maxTarget) * 100;
    return `${Math.min(percentage, 100)}%`;
  };

  const MONTHLY_ORDER_GOAL = 50;
  const WISHLIST_GOAL = 10;
  const REWARD_POINTS_GOAL = 500;

  const activeOrdersWidth = calculateWidth(stats.activeOrders, stats.totalOrders);
  const totalOrdersWidth = calculateWidth(stats.totalOrders, MONTHLY_ORDER_GOAL);
  const wishlistWidth = calculateWidth(stats.wishlistItems, WISHLIST_GOAL);
  const rewardsWidth = calculateWidth(stats.rewardPoints, REWARD_POINTS_GOAL);

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
      color: 'from-[#1B4D3E] to-[#0D2B22]'
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
    },
    {
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
      ),
      title: 'Privacy & Profile',
      description: 'Export data & settings',
      action: () => navigate('/profile?tab=privacy'),
      color: 'from-purple-600 to-indigo-600'
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
        <div className="px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back {firstName || 'there!'}! 👋</h1>
          <p className="text-white">Here's what's happening with your orders</p>
        </div>

        <div className='px-4 sm:px-8 mt-2 flex items-center gap-3'>
          <button
            onClick={() => navigate('/profile?tab=privacy')}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all backdrop-blur-sm border border-white/20 shadow-sm"
          >
            <span>🛡️</span>
            <span>Privacy & Profile</span>
          </button>

          <div className='relative inline-flex items-center cursor-pointer' onClick={() => navigate('/cart')}>
            <MdShoppingCart className='text-3xl sm:text-4xl hover:text-gray-200 transition-colors' />

            {cartCount > 0 && (
              <span className='absolute -top-2 -right-2 bg-red-500 border-2 border-afri-green-dark text-white text-[10px] sm:text-xs font-bold rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shadow-lg'>
                {cartCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">

        <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {/* Active Orders */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                  <Package className='text-white' size={20} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.activeOrders}</p>
                  <p className="text-sm text-gray-500">Active Orders</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: activeOrdersWidth }}
                ></div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                  <BarChart2 className='text-white' size={20} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                  <p className="text-sm text-gray-500">Total Orders</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: totalOrdersWidth }}
                ></div>
              </div>
            </div>

            {/* Wishlist Items */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-red-500 rounded-lg flex items-center justify-center text-2xl shadow-lg">
                  <Heart className='text-white' size={20} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.wishlistItems}</p>
                  <p className="text-sm text-gray-500">Wishlist Items</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-400 to-red-500 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: wishlistWidth }}
                ></div>
              </div>
            </div>

            {/* Reward Points */}
            <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300 animate-fadeIn" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1B4D3E] to-[#0D2B22] rounded-lg flex items-center justify-center text-2xl shadow-lg">
                  <Star className='text-white' size={20} />
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{stats.rewardPoints}</p>
                  <p className="text-sm text-gray-500">Reward Points</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#1B4D3E] to-[#0D2B22] h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: rewardsWidth }}
                ></div>
              </div>
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
                {recentOrders.map((order, index) => {
                  const firstItem = order.items?.[0]
                  const thumbnail = firstItem?.product?.images?.[0]?.url
                    || firstItem?.product?.images?.[0]
                    || null

                  return (
                    <div
                      key={order._id || index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/order/${order._id}`)}
                    >
                      <div className="flex items-center space-x-4">
                        {/* Order number badge */}
                        <div className="w-12 h-12 bg-gradient-to-br from-afri-green to-afri-green-dark rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                          #{order.orderNumber?.slice(-4) || 'N/A'}
                        </div>

                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                          {thumbnail ? (
                            <img
                              src={thumbnail}
                              alt={firstItem?.name || 'Product'}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none' }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              🛍️
                            </div>
                          )}
                        </div>

                        {/* Order meta */}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
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
                  )
                })}
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
                      src={
                        typeof product.images?.[0] === 'string'
                          ? product.images[0]
                          : product.images?.[0]?.url
                          || null
                      }
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200' }}
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

      <div className="fixed bottom-3 ml-4 left-14 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-red-600 transition-all">
        <CiLogout onClick={handleLogout} className='text-2xl cursor-pointer' size={20}
        />
      </div>
    </div>
  )
}

export default CustomerDashboard
