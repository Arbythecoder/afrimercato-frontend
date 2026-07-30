import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Tag, Bell, Truck, X, ExternalLink, Calendar, MapPin, CheckCircle } from 'lucide-react'
import { notificationAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { IoMdArrowBack } from "react-icons/io";

const typeIcons = {
  order: Package,
  order_placed: Package,
  order_confirmed: CheckCircle,
  address_updated: MapPin,
  promo: Tag,
  system: Bell,
  delivery: Truck
}

const typeColors = {
  order: 'bg-blue-100 text-blue-600',
  order_placed: 'bg-blue-100 text-blue-600',
  order_confirmed: 'bg-green-100 text-green-600',
  address_updated: 'bg-amber-100 text-amber-600',
  promo: 'bg-yellow-100 text-yellow-600',
  system: 'bg-gray-100 text-gray-600',
  delivery: 'bg-[#FDF8F0] text-[#1B4D3E]'
}

function NotificationsCenter() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [selectedNotification, setSelectedNotification] = useState(null)

  const resolveNotificationUrl = (notification) => {
    if (!notification) return '/orders'
    if (notification.actionUrl) return notification.actionUrl
    if (notification.orderId) {
      if (user?.role === 'vendor' || user?.roles?.includes('vendor')) {
        return '/vendor/orders'
      }
      if (user?.role === 'rider' || user?.roles?.includes('rider')) {
        return '/rider/deliveries'
      }
      if (user?.role === 'picker' || user?.roles?.includes('picker')) {
        return `/picker/order/${notification.orderId}`
      }
      return `/order/${notification.orderId}`
    }
    return '/orders'
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await notificationAPI.getNotifications()
      if (res?.success && res?.data?.notifications) {
        setNotifications(res.data.notifications)
      } else {
        setNotifications([])
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification)
    if (!notification.isRead && !notification.read) {
      try {
        await notificationAPI.markAsRead(notification._id || notification.id)
        setNotifications(prev =>
          prev.map(n => (n._id === notification._id || n.id === notification.id ? { ...n, isRead: true, read: true } : n))
        )
      } catch (err) {
        console.error('Failed to mark notification as read:', err)
      }
    }
  }

  const deleteNotification = async (id, e) => {
    if (e) e.stopPropagation()
    try {
      await notificationAPI.deleteNotification(id)
      setNotifications(prev => prev.filter(n => (n._id || n.id) !== id))
      if (selectedNotification && (selectedNotification._id === id || selectedNotification.id === id)) {
        setSelectedNotification(null)
      }
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.isRead && !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.isRead && !n.read).length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500">Stay updated on your orders, status changes, and activity</p>
            <button
              onClick={() => window.history.back()}
              className="flex items-center mt-2 hover:underline" ><IoMdArrowBack /> Back
            </button>
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
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'all'
              ? 'bg-afri-green text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === 'unread'
              ? 'bg-afri-green text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border'
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
          <div className="text-center py-16 bg-white rounded-xl shadow-md border">
            <Bell className="w-12 h-12 text-gray-400 mx-auto" />
            <h2 className="text-xl font-bold text-gray-900 mt-4">No notifications</h2>
            <p className="text-gray-500 mt-2">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => {
              const isUnread = !notification.isRead && !notification.read
              const notificationType = notification.type || 'order'
              const IconComp = typeIcons[notificationType] || Bell
              const colorClass = typeColors[notificationType] || 'bg-gray-100 text-gray-600'
              const id = notification._id || notification.id

              return (
                <div
                  key={id}
                  className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${isUnread ? 'border-l-4 border-l-afri-green bg-green-50/30' : ''
                    }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-4 items-start">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-semibold text-base ${isUnread ? 'text-gray-900 font-bold' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                        </div>
                        <button
                          onClick={(e) => deleteNotification(id, e)}
                          className="text-gray-400 hover:text-red-500 p-1 shrink-0"
                          title="Delete notification"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400">
                          {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : (notification.timeAgo || notification.time || '')}
                        </span>
                        <span className="text-xs font-semibold text-afri-green hover:underline flex items-center gap-1">
                          View details →
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* FULL NOTIFICATION DETAILS MODAL */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative border animate-scaleUp">
            <button
              onClick={() => setSelectedNotification(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 text-afri-green flex items-center justify-center font-bold">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedNotification.title}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleString() : (selectedNotification.timeAgo || 'Just now')}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-200">
              <p className="text-sm text-gray-800 leading-relaxed font-medium">
                {selectedNotification.message}
              </p>

              {/* Metadata Display (e.g. Updated Address details) */}
              {selectedNotification.meta?.address && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" /> New Delivery Address
                  </p>
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold">{selectedNotification.meta.address.fullName}</span> ({selectedNotification.meta.address.phone})<br />
                    {selectedNotification.meta.address.street}, {selectedNotification.meta.address.city}, {selectedNotification.meta.address.postcode}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setSelectedNotification(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-semibold transition"
              >
                Close
              </button>
              {(selectedNotification.actionUrl || selectedNotification.orderId) && (
                <button
                  onClick={() => {
                    const targetUrl = resolveNotificationUrl(selectedNotification)
                    setSelectedNotification(null)
                    navigate(targetUrl)
                  }}
                  className="px-5 py-2 bg-afri-green text-white hover:bg-afri-green-dark rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" /> View Associated Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationsCenter
