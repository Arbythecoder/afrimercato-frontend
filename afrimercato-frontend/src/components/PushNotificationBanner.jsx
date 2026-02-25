import { useState } from 'react'
import { Bell, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePushNotifications } from '../hooks/usePushNotifications'

export default function PushNotificationBanner() {
  const { permission, isSupported, isSubscribed, loading, subscribe } = usePushNotifications()
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('push-dismissed') === '1'
  )

  const handleAllow = async () => {
    const ok = await subscribe()
    if (ok || Notification.permission === 'granted') {
      handleDismiss()
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('push-dismissed', '1')
  }

  // Hide if: not supported, already dismissed, already granted/denied, or already subscribed
  if (
    !isSupported ||
    dismissed ||
    permission === 'granted' ||
    permission === 'denied' ||
    isSubscribed
  ) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -64, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-[60] bg-afri-green text-white px-4 py-3 flex items-center gap-3 shadow-lg"
      >
        <Bell size={18} className="flex-shrink-0" />
        <p className="flex-1 text-sm font-medium">
          Get real-time order updates and delivery alerts
        </p>
        <button
          onClick={handleAllow}
          disabled={loading}
          className="px-3 py-1.5 bg-white text-afri-green text-sm font-bold rounded-lg flex-shrink-0 hover:bg-emerald-50 disabled:opacity-60 transition"
        >
          {loading ? '...' : 'Allow'}
        </button>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
