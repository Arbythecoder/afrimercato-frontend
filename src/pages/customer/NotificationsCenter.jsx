import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Tag, Bell, Truck, X } from 'lucide-react'

const mockNotifications = [
  { id: 1, type: 'order', title: 'Order Delivered', message: 'Your order #AFM123 has been delivered', time: '2 mins ago', read: false },
  { id: 2, type: 'promo', title: '20% Off Fresh Produce', message: 'Limited time offer on all vegetables', time: '1 hour ago', read: false },
  { id: 3, type: 'order', title: 'Order Confirmed', message: 'Your order #AFM122 is being prepared', time: '3 hours ago', read: true },
  { id: 4, type: 'system', title: 'Welcome to AfriMercato!', message: 'Thanks for joining. Explore fresh African groceries.', time: '1 day ago', read: true }
]

const typeIcons = {
  order: Package,
  promo: Tag,
  system: Bell,
  delivery: Truck
}

const typeColors = {
  order: 'bg-blue-100 text-blue-600',
  promo: 'bg-yellow-100 text-yellow-600',
  system: 'bg-gray-100 text-gray-600',
  delivery: 'bg-[#FDF8F0] text-[#1B4D3E]'
}

function NotificationsCenter() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setNotifications(mockNotifications)
      setLoading(false)
    }, 500)
  }, [])

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
  }

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">Stay updated on your orders and promotions</p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-sm text-afri-green hover:underline font-medium"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-afri-green text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'unread'
                ? 'bg-afri-green text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <Bell className="w-12 h-12 text-gray-400 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 mt-4">No notifications</h2>
            <p className="text-gray-500 mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => {
              const IconComp = typeIcons[notification.type] || Bell
              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
                    !notification.read ? 'border-l-4 border-afri-green' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${typeColors[notification.type]}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id) }}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsCenter
