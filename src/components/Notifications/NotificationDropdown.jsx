import { useState, useEffect, useRef } from 'react'
import { notificationAPI } from '../../services/api'

function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    fetchUnreadCount()

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount()
      if (response.success) {
        setUnreadCount(response.data.count)
      }
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationAPI.getNotifications({ limit: 10 })
      if (response.success) {
        setNotifications(response.data.notifications)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await notificationAPI.markAsRead(notification._id)
        setUnreadCount(prev => Math.max(0, prev - 1))
        setNotifications(prev =>
          prev.map(n =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        )
      }

      // Navigate to action URL if available
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead()
      setUnreadCount(0)
      setNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true }))
      )
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      order_placed: '🛒',
      order_confirmed: '✅',
      order_shipped: '📦',
      order_delivered: '🎉',
      order_cancelled: '❌',
      payment_received: '💰',
      low_stock: '⚠️',
      product_review: '⭐',
      rider_assigned: '🚴',
      system_alert: '🔔',
      promotion: '🎁'
    }
    return icons[type] || '🔔'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      normal: 'text-blue-600 bg-blue-50',
      low: 'text-gray-600 bg-gray-50'
    }
    return colors[priority] || colors.normal
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 transform transition-all duration-200 ease-out animate-slideDown">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-afri-green hover:text-afri-green-dark font-medium transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-afri-green"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-2">🔔</div>
                <p className="text-gray-500">No notifications yet</p>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors ${
                      notification.isRead
                        ? 'bg-white hover:bg-gray-50'
                        : 'bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${getPriorityColor(notification.priority)}`}>
                        {notification.icon || getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {notification.timeAgo}
                        </p>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="flex-shrink-0 w-2 h-2 bg-afri-green rounded-full"></div>
                      )}
                    </div>

                    {/* Priority Badge */}
                    {notification.priority === 'urgent' && (
                      <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        🚨 Urgent
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setIsOpen(false)
                  window.location.href = '/notifications'
                }}
                className="w-full text-center text-sm text-afri-green hover:text-afri-green-dark font-medium transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
