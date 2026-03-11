import { useState, useEffect, useCallback } from 'react'
import { apiCall } from '../services/api'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)))
}

export function usePushNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  )
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator &&
      'PushManager' in window
    setIsSupported(supported)

    // Check if already subscribed
    if (supported) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.pushManager.getSubscription().then((sub) => {
          setIsSubscribed(!!sub)
        })
      })
    }
  }, [])

  const subscribe = useCallback(async () => {
    if (!isSupported) return false

    if (!VAPID_PUBLIC_KEY) {
      if (import.meta.env.DEV) {
        console.warn('[Push] VITE_VAPID_PUBLIC_KEY is not set — push disabled')
      }
      return false
    }

    setLoading(true)
    try {
      const perm = await Notification.requestPermission()
      setPermission(perm)
      if (perm !== 'granted') return false

      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })

      // Send subscription to backend
      await apiCall('/notifications/push/subscribe', {
        method: 'POST',
        body: JSON.stringify(sub.toJSON()),
      })

      setIsSubscribed(true)
      return true
    } catch (err) {
      if (import.meta.env.DEV) console.error('[Push] Subscribe failed:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [isSupported])

  const unsubscribe = useCallback(async () => {
    setLoading(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        await sub.unsubscribe()
        await apiCall('/notifications/push/unsubscribe', {
          method: 'POST',
          body: JSON.stringify({ endpoint: sub.endpoint }),
        })
      }
      setIsSubscribed(false)
      setPermission('default')
    } catch (err) {
      if (import.meta.env.DEV) console.error('[Push] Unsubscribe failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  return { permission, isSupported, isSubscribed, loading, subscribe, unsubscribe }
}
