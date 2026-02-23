/**
 * =====================================================
 * LIVE DELIVERY TRACKING WITH GPS & ETA
 * =====================================================
 *
 * PROBLEM IT SOLVES (UK Market Research):
 * - 20% of UK shoppers complain about late/failed deliveries
 * - No visibility into where delivery is
 * - Unclear delivery windows
 *
 * OUR SOLUTION:
 * - Real-time GPS tracking of rider
 * - Minute-by-minute ETA updates
 * - Live map with rider location
 * - Push notifications at key milestones
 * - Direct chat with rider
 *
 * FEATURES:
 * - Interactive map showing rider's exact location
 * - Estimated arrival time that updates every minute
 * - Order status timeline
 * - Rider profile & contact
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPinIcon,
  TruckIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  CheckCircleIcon,
  StarIcon
} from '@heroicons/react/24/solid'

const LiveDeliveryTracking = ({ orderId, orderDetails }) => {
  // Real-time tracking state
  const [riderLocation, setRiderLocation] = useState({
    lat: 51.5074,  // Example: London coordinates
    lng: -0.1278
  })
  const [eta, setEta] = useState(15) // Minutes
  const [orderStatus, setOrderStatus] = useState('out-for-delivery')
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Order journey stages
  const journeyStages = [
    {
      id: 'confirmed',
      label: 'Order Confirmed',
      icon: '✓',
      completed: true,
      time: '14:30'
    },
    {
      id: 'preparing',
      label: 'Preparing',
      icon: '👨‍🍳',
      completed: true,
      time: '14:35'
    },
    {
      id: 'ready',
      label: 'Ready for Pickup',
      icon: '📦',
      completed: true,
      time: '14:50'
    },
    {
      id: 'picked-up',
      label: 'Picked Up',
      icon: '🏍️',
      completed: true,
      time: '14:55'
    },
    {
      id: 'out-for-delivery',
      label: 'Out for Delivery',
      icon: '🚚',
      completed: false,
      active: true,
      time: 'Now'
    },
    {
      id: 'delivered',
      label: 'Delivered',
      icon: '🎉',
      completed: false,
      time: `${eta} min`
    }
  ]

  // Rider information
  const riderInfo = {
    name: 'James Okonkwo',
    avatar: '👨🏾',
    rating: 4.9,
    deliveries: 1240,
    phone: '+44 7700 900123',
    vehicle: 'Motorcycle'
  }

  // Simulate real-time location updates (every 10 seconds)
  // In production, this would be WebSocket or polling
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate rider moving (in production, get from API)
      setRiderLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001
      }))

      // Update ETA (decreases over time)
      setEta(prev => Math.max(0, prev - 0.1))

      setLastUpdate(new Date())
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  // Format ETA display
  const formatETA = () => {
    if (eta < 1) return 'Arriving now!'
    if (eta < 60) return `${Math.round(eta)} min away`
    const hours = Math.floor(eta / 60)
    const mins = Math.round(eta % 60)
    return `${hours}h ${mins}m away`
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Live Status Header - Sticky */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <TruckIcon className="w-8 h-8" />
                {/* Pulse animation for live indicator */}
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold">Out for Delivery</h1>
                <p className="text-white/90 text-sm">Order #{orderId}</p>
              </div>
            </div>

            {/* Live ETA Badge */}
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5" />
                <div className="text-right">
                  <p className="text-xs opacity-90">Arriving in</p>
                  <p className="text-lg font-bold">{formatETA()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Live Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <motion.div
              animate={{ width: `${((5 - eta/3) / 5) * 100}%` }}
              className="h-full bg-white rounded-full"
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-white/75 mt-1 text-right">
            Last updated: {lastUpdate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Live Map (Placeholder - In production, use Google Maps/Mapbox) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
        >
          <div className="relative h-80 sm:h-96 bg-gradient-to-br from-blue-100 to-green-100">
            {/* Map Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPinIcon className="w-16 h-16 text-green-600 mx-auto mb-2" />
                <p className="text-gray-600 font-semibold">Live GPS Tracking</p>
                <p className="text-sm text-gray-500">Rider location updates every 10 seconds</p>
              </div>
            </div>

            {/* Rider Marker (Animated) */}
            <motion.div
              animate={{
                x: [0, 10, -5, 15, 0],
                y: [0, -10, 5, -15, 0]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative">
                <div className="w-12 h-12 bg-green-600 rounded-full shadow-lg flex items-center justify-center text-2xl animate-bounce">
                  🏍️
                </div>
                {/* Rider pulse effect */}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                </span>
              </div>
            </motion.div>

            {/* Your Location Marker */}
            <div className="absolute bottom-10 right-10">
              <div className="w-10 h-10 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-xl">
                🏠
              </div>
              <p className="text-xs font-semibold text-gray-700 mt-1 text-center">You</p>
            </div>

            {/* Live Update Banner */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-md">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-900">LIVE TRACKING</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rider Information Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Your Delivery Rider</h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Rider Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-3xl shadow-md">
                {riderInfo.avatar}
              </div>

              {/* Rider Details */}
              <div>
                <p className="font-bold text-gray-900 text-lg">{riderInfo.name}</p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">{riderInfo.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{riderInfo.deliveries} deliveries</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">🏍️ {riderInfo.vehicle}</p>
              </div>
            </div>

            {/* Contact Buttons */}
            <div className="flex gap-2">
              <button className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors">
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
              </button>
              <button className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors">
                <PhoneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Order Journey Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-6">Order Journey</h2>

          <div className="space-y-4">
            {journeyStages.map((stage, index) => (
              <div key={stage.id} className="flex items-start gap-4">
                {/* Stage Icon */}
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                    stage.completed ? 'bg-green-100 text-green-600' :
                    stage.active ? 'bg-blue-100 text-blue-600 animate-pulse' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {stage.completed ? <CheckCircleIcon className="w-6 h-6 text-green-600" /> : stage.icon}
                  </div>

                  {/* Connecting Line */}
                  {index < journeyStages.length - 1 && (
                    <div className={`absolute left-1/2 top-12 w-0.5 h-6 -translate-x-1/2 ${
                      stage.completed ? 'bg-green-400' : 'bg-gray-300'
                    }`} />
                  )}
                </div>

                {/* Stage Info */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${
                        stage.completed ? 'text-gray-900' :
                        stage.active ? 'text-blue-600' :
                        'text-gray-400'
                      }`}>
                        {stage.label}
                      </p>
                      {stage.active && (
                        <p className="text-sm text-blue-600 font-medium">In Progress...</p>
                      )}
                    </div>
                    <span className={`text-sm font-medium ${
                      stage.completed ? 'text-gray-600' :
                      stage.active ? 'text-blue-600' :
                      'text-gray-400'
                    }`}>
                      {stage.time}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Delivery Instructions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-4"
        >
          <p className="text-blue-800 text-sm">
            <span className="font-semibold">📍 Delivery Address:</span><br />
            123 High Street, London, SW1A 1AA<br />
            <span className="text-xs">Apartment 4B, Ring bell #4</span>
          </p>
        </motion.div>
      </div>

      {/* Floating Action Buttons - Mobile Optimized */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-30">
        <div className="max-w-4xl mx-auto flex gap-3">
          <button className="flex-1 bg-white text-gray-900 px-6 py-4 rounded-xl font-bold shadow-xl border-2 border-gray-300 hover:bg-gray-50 transition-all">
            📞 Call Rider
          </button>
          <button className="flex-1 bg-green-600 text-white px-6 py-4 rounded-xl font-bold shadow-xl hover:bg-green-700 transition-all">
            💬 Chat with Rider
          </button>
        </div>
      </div>
    </div>
  )
}

export default LiveDeliveryTracking
