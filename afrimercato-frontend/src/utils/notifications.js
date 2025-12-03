/**
 * Browser Notification Utilities for Vendor Orders
 * Uber Eats/Just Eat style notifications
 */

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

/**
 * Show browser notification for new order
 * @param {object} order - Order object
 */
export const showNewOrderNotification = (order) => {
  if (Notification.permission !== 'granted') {
    return
  }

  const notification = new Notification('🔔 New Order Received!', {
    body: `Order #${order.orderNumber || order._id?.slice(-6)} - £${order.total?.toFixed(2) || '0.00'}\nCustomer: ${order.customer?.name || 'Customer'}\n\nClick to view details`,
    icon: '/logo192.png',
    badge: '/logo192.png',
    tag: `order-${order._id}`,
    requireInteraction: true, // Stay on screen until clicked
    vibrate: [200, 100, 200], // Vibrate pattern for mobile
    silent: false
  })

  notification.onclick = () => {
    window.focus()
    // Navigate to orders page (you can customize this)
    window.location.hash = '#/orders'
    notification.close()
  }

  // Auto-close after 10 seconds
  setTimeout(() => notification.close(), 10000)
}

/**
 * Play notification sound (simple beep)
 */
export const playNotificationSound = () => {
  try {
    // Create AudioContext for better cross-browser support
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()

    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Set frequency (higher = higher pitch)
    oscillator.frequency.value = 800 // 800 Hz - pleasant notification sound

    // Set volume (0 to 1)
    gainNode.gain.value = 0.3 // 30% volume

    // Play for 200ms
    oscillator.start()
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (error) {
    console.log('Could not play notification sound:', error)
  }
}

/**
 * Show visual toast notification
 * @param {string} message - Notification message
 * @param {string} type - 'success', 'warning', 'error', 'info'
 */
export const showToast = (message, type = 'info') => {
  const colors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  }

  const toast = document.createElement('div')
  toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-in flex items-center gap-3 max-w-md`
  toast.innerHTML = `
    <span class="text-2xl">🔔</span>
    <div class="flex-1">
      <div class="font-bold">New Order!</div>
      <div class="text-sm opacity-90">${message}</div>
    </div>
    <button onclick="this.parentElement.remove()" class="text-white hover:opacity-80">✕</button>
  `

  document.body.appendChild(toast)

  // Auto-remove after 5 seconds
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => toast.remove(), 300)
  }, 5000)
}

/**
 * Complete notification (sound + browser notification + toast)
 * @param {object} order - Order object
 */
export const notifyNewOrder = async (order) => {
  // Play sound
  playNotificationSound()

  // Show browser notification if permitted
  if (Notification.permission === 'granted') {
    showNewOrderNotification(order)
  }

  // Show toast notification (always works, no permission needed)
  const orderNumber = order.orderNumber || order._id?.slice(-6)
  const customerName = order.customer?.name || 'Customer'
  const total = order.total?.toFixed(2) || '0.00'

  showToast(`Order #${orderNumber} from ${customerName} - £${total}`, 'success')
}

export default {
  requestNotificationPermission,
  showNewOrderNotification,
  playNotificationSound,
  showToast,
  notifyNewOrder
}
