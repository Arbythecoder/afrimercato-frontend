import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io } from 'socket.io-client'
import api from '../services/api'

/**
 * Real-Time Order Tracking Component
 * Live order status updates and rider GPS tracking
 * Like UberEats, Chowdeck, JustEat, Deliveroo
 */
function RealTimeOrderTracking({ orderId, onClose }) {
  const [tracking, setTracking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [riderLocation, setRiderLocation] = useState(null)
  const socketRef = useRef(null)
  const mapRef = useRef(null)

  // Order status flow
  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: '📝' },
    { key: 'confirmed', label: 'Confirmed', icon: '✅' },
    { key: 'preparing', label: 'Preparing', icon: '👨‍🍳' },
    { key: 'ready_for_pickup', label: 'Ready', icon: '📦' },
    { key: 'out_for_delivery', label: 'On the Way', icon: '🚗' },
    { key: 'delivered', label: 'Delivered', icon: '🎉' }
  ]

  useEffect(() => {
    // Fetch initial tracking data
    fetchTrackingData()

    // Connect to Socket.IO for real-time updates
    connectSocket()

    return () => {
      // Cleanup socket connection
      if (socketRef.current) {
        socketRef.current.disconnect()
      }
    }
  }, [orderId])

  /**
   * Fetch tracking data from API
   */
  const fetchTrackingData = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/tracking/${orderId}`)

      if (response.data.success) {
        setTracking(response.data.tracking)

        // Initialize rider location if available
        if (response.data.tracking.rider?.currentLocation) {
          setRiderLocation(response.data.tracking.rider.currentLocation)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tracking data')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Connect to Socket.IO for real-time updates
   */
  const connectSocket = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'https://afrimercato-backend.fly.dev'
    const token = localStorage.getItem('afrimercato_token')

    socketRef.current = io(API_URL, {
      auth: { token }
    })

    // Join order room
    socketRef.current.emit('joinOrderRoom', orderId)

    // Listen for order status updates
    socketRef.current.on('orderStatusUpdate', (data) => {
      console.log('📢 Order status update:', data)

      setTracking(prev => ({
        ...prev,
        status: data.status,
        statusTimeline: [...(prev.statusTimeline || []), {
          status: data.status,
          timestamp: data.timestamp,
          notes: data.notes
        }],
        lastUpdated: data.timestamp
      }))
    })

    // Listen for rider location updates
    socketRef.current.on('riderLocationUpdate', (data) => {
      console.log('📍 Rider location update:', data)

      setRiderLocation(data.riderLocation)

      // Update tracking data
      setTracking(prev => ({
        ...prev,
        rider: {
          ...prev.rider,
          currentLocation: data.riderLocation
        }
      }))
    })

    // Handle connection errors
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })
  }

  /**
   * Get current status step index
   */
  const getCurrentStepIndex = () => {
    if (!tracking) return 0
    return statusSteps.findIndex(step => step.key === tracking.status)
  }

  /**
   * Render map with rider location
   */
  const renderMap = () => {
    if (!tracking?.deliveryAddress || !riderLocation) {
      return (
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-500">Map will appear when rider is on the way</p>
        </div>
      )
    }

    // In a real implementation, you would use Google Maps, Mapbox, or Leaflet here
    return (
      <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg p-4 relative overflow-hidden" style={{ height: '300px' }}>
        {/* Mock Map */}
        <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-lg border-2 border-white/50"></div>

        {/* Rider Pin */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
        >
          <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg animate-pulse">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z"/>
            </svg>
          </div>
          <div className="bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded mt-1 text-center">
            {tracking.rider?.name}
          </div>
        </motion.div>

        {/* Delivery Address Pin */}
        <div className="absolute bottom-1/4 right-1/4 z-10">
          <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded mt-1 text-center whitespace-nowrap">
            Your Location
          </div>
        </div>

        {/* Map Attribution */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
          📍 Live GPS Tracking
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-afri-green mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-700 mb-4">{error}</p>
        {onClose && (
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">
            Close
          </button>
        )}
      </div>
    )
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-2xl w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold mb-1">Order Tracking</h2>
            <p className="text-sm opacity-90">Order #{tracking?.orderNumber}</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white hover:bg-white/20 rounded-lg p-2 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ETA */}
        {tracking?.estimatedTimeRemaining !== null && tracking?.estimatedTimeRemaining !== undefined && (
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm opacity-90 mb-1">Estimated Arrival</p>
            <p className="text-2xl font-bold">
              {tracking.estimatedTimeRemaining < 60 ? (
                `${tracking.estimatedTimeRemaining} minutes`
              ) : (
                `${Math.floor(tracking.estimatedTimeRemaining / 60)}h ${tracking.estimatedTimeRemaining % 60}m`
              )}
            </p>
          </div>
        )}
      </div>

      {/* Status Timeline */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          {statusSteps.map((step, index) => (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 ${
                  index <= currentStepIndex
                    ? 'bg-afri-green text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step.icon}
              </motion.div>
              <p className={`text-xs text-center font-medium ${
                index <= currentStepIndex ? 'text-afri-green' : 'text-gray-400'
              }`}>
                {step.label}
              </p>
              {index < statusSteps.length - 1 && (
                <div className={`h-1 w-full mt-2 ${
                  index < currentStepIndex ? 'bg-afri-green' : 'bg-gray-200'
                }`} style={{ marginLeft: '50%', marginRight: '-50%' }}></div>
              )}
            </div>
          ))}
        </div>

        {/* Live Map */}
        {(tracking?.status === 'out_for_delivery' || tracking?.rider) && (
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Live Tracking
            </h3>
            {renderMap()}
          </div>
        )}

        {/* Order Details */}
        <div className="space-y-4">
          {/* Vendor */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Store</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="font-medium">{tracking?.vendor?.name}</p>
              <p className="text-sm text-gray-600">{tracking?.vendor?.address?.street}</p>
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm">{tracking?.deliveryAddress?.street}</p>
              <p className="text-sm text-gray-600">
                {tracking?.deliveryAddress?.city}, {tracking?.deliveryAddress?.postcode}
              </p>
            </div>
          </div>

          {/* Rider Info */}
          {tracking?.rider && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Your Rider</h3>
              <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{tracking.rider.name}</p>
                  <p className="text-sm text-gray-600">{tracking.rider.vehicle?.type}</p>
                </div>
                <a
                  href={`tel:${tracking.rider.phone}`}
                  className="bg-afri-green text-white p-2 rounded-lg hover:bg-afri-green-dark transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </a>
              </div>
            </div>
          )}

          {/* Items Summary */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Order Items</h3>
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {tracking?.items?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.product}</span>
                  <span className="font-medium">£{item.price?.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>£{tracking?.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealTimeOrderTracking
