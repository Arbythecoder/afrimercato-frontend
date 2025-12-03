import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function RiderDeliveryDetail() {
  const { deliveryId } = useParams()
  const navigate = useNavigate()
  const [delivery, setDelivery] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDelivery()
  }, [deliveryId])

  const fetchDelivery = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setDelivery({
          id: deliveryId,
          orderNumber: 'AFM-2024-001',
          status: 'picking-up',
          customer: {
            name: 'Sarah Johnson',
            phone: '+44 7700 900001',
            address: '42 High Street, London SW1A 1AA',
            instructions: 'Ring doorbell twice. Leave at door if no answer.'
          },
          vendor: {
            name: 'Fresh Valley Farms',
            phone: '+44 7700 800001',
            address: '123 Market Lane, London EC1A 1BB'
          },
          items: [
            { name: 'Organic Tomatoes', quantity: 2, unit: 'kg' },
            { name: 'Fresh Spinach', quantity: 1, unit: 'bunch' },
            { name: 'Free Range Eggs', quantity: 1, unit: 'dozen' },
            { name: 'Whole Milk', quantity: 2, unit: 'litres' },
            { name: 'Sourdough Bread', quantity: 1, unit: 'loaf' }
          ],
          earnings: 4.50,
          distance: 2.3,
          estimatedTime: '15 min',
          createdAt: new Date().toISOString(),
          timeline: [
            { status: 'assigned', time: '10:30 AM', description: 'Order assigned to you' },
            { status: 'picking-up', time: '10:35 AM', description: 'On your way to pickup' }
          ]
        })
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching delivery:', error)
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus) => {
    try {
      // API call to update status
      setDelivery(prev => ({ ...prev, status: newStatus }))

      if (newStatus === 'delivered') {
        alert('Delivery completed! Great job!')
        navigate('/rider/dashboard')
      }
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const callCustomer = () => {
    window.open(`tel:${delivery?.customer?.phone}`)
  }

  const callVendor = () => {
    window.open(`tel:${delivery?.vendor?.phone}`)
  }

  const openNavigation = (address) => {
    const encodedAddress = encodeURIComponent(address)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank')
  }

  const statusSteps = [
    { key: 'assigned', label: 'Assigned', icon: '📋' },
    { key: 'picking-up', label: 'Picking Up', icon: '🏪' },
    { key: 'picked-up', label: 'Picked Up', icon: '📦' },
    { key: 'in-transit', label: 'In Transit', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✓' }
  ]

  const getCurrentStep = () => {
    const idx = statusSteps.findIndex(s => s.key === delivery?.status)
    return idx >= 0 ? idx : 0
  }

  const getNextAction = () => {
    switch (delivery?.status) {
      case 'assigned':
      case 'picking-up':
        return { label: 'Confirm Pickup', status: 'picked-up', color: 'bg-blue-600 hover:bg-blue-700' }
      case 'picked-up':
        return { label: 'Start Delivery', status: 'in-transit', color: 'bg-purple-600 hover:bg-purple-700' }
      case 'in-transit':
        return { label: 'Mark as Delivered', status: 'delivered', color: 'bg-green-600 hover:bg-green-700' }
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🔍</span>
          <h2 className="text-xl font-bold mt-4">Delivery not found</h2>
          <button
            onClick={() => navigate('/rider/deliveries')}
            className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-xl"
          >
            Back to Deliveries
          </button>
        </div>
      </div>
    )
  }

  const currentStep = getCurrentStep()
  const nextAction = getNextAction()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-6">
        <div className="max-w-2xl mx-auto px-4">
          <button onClick={() => navigate('/rider/deliveries')} className="text-purple-200 hover:text-white mb-2">
            ← Back to Deliveries
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{delivery.orderNumber}</h1>
              <p className="text-purple-200">{delivery.items.length} items • {delivery.distance} km</p>
            </div>
            <span className="text-2xl font-bold">£{delivery.earnings.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Progress Tracker */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">Delivery Progress</h2>
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200">
              <div
                className="h-full bg-purple-600 transition-all"
                style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
              />
            </div>
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 ${
                      index <= currentStep
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <p className={`mt-2 text-xs font-medium text-center ${
                    index <= currentStep ? 'text-purple-600' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pickup Location */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">📍 Pickup</h2>
            {['assigned', 'picking-up'].includes(delivery.status) && (
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                Current Stop
              </span>
            )}
          </div>
          <div className="mb-3">
            <p className="font-semibold text-gray-900">{delivery.vendor.name}</p>
            <p className="text-gray-500">{delivery.vendor.address}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => openNavigation(delivery.vendor.address)}
              className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              🗺️ Navigate
            </button>
            <button
              onClick={callVendor}
              className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              📞
            </button>
          </div>
        </div>

        {/* Delivery Location */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">🏠 Delivery</h2>
            {['picked-up', 'in-transit'].includes(delivery.status) && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                Current Stop
              </span>
            )}
          </div>
          <div className="mb-3">
            <p className="font-semibold text-gray-900">{delivery.customer.name}</p>
            <p className="text-gray-500">{delivery.customer.address}</p>
          </div>
          {delivery.customer.instructions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="text-sm font-medium text-yellow-800">📝 Instructions:</p>
              <p className="text-sm text-yellow-700">{delivery.customer.instructions}</p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => openNavigation(delivery.customer.address)}
              className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700"
            >
              🗺️ Navigate
            </button>
            <button
              onClick={callCustomer}
              className="px-4 py-3 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              📞
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">📦 Order Items ({delivery.items.length})</h2>
          <div className="space-y-3">
            {delivery.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-sm font-semibold">
                    {item.quantity}
                  </div>
                  <span className="text-gray-900">{item.name}</span>
                </div>
                <span className="text-sm text-gray-500">{item.unit}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Action Button */}
        {nextAction && (
          <button
            onClick={() => updateStatus(nextAction.status)}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg ${nextAction.color}`}
          >
            {nextAction.label}
          </button>
        )}

        {/* Issue Reporting */}
        <button className="w-full mt-4 py-3 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50">
          ⚠️ Report an Issue
        </button>
      </div>
    </div>
  )
}

export default RiderDeliveryDetail
