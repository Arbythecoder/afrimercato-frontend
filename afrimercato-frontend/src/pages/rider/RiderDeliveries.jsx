import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function RiderDeliveries() {
  const navigate = useNavigate()
  const [deliveries, setDeliveries] = useState([])
  const [filter, setFilter] = useState('active')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeliveries()
  }, [filter])

  const fetchDeliveries = async () => {
    try {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        if (filter === 'active') {
          setDeliveries([
            {
              id: 'DEL001',
              orderNumber: 'AFM-2024-001',
              customer: { name: 'Sarah Johnson', phone: '+44 7700 900001' },
              address: '42 High Street, London SW1A 1AA',
              distance: 2.3,
              status: 'picking-up',
              estimatedTime: '15 min',
              vendor: { name: 'Fresh Valley Farms', address: '123 Market Lane' },
              items: 5,
              earnings: 4.50,
              createdAt: new Date().toISOString()
            },
            {
              id: 'DEL002',
              orderNumber: 'AFM-2024-002',
              customer: { name: 'James Wilson', phone: '+44 7700 900002' },
              address: '78 Oak Lane, London E1 6AN',
              distance: 3.1,
              status: 'pending-pickup',
              estimatedTime: '25 min',
              vendor: { name: 'Daily Dairy', address: '456 Farm Road' },
              items: 3,
              earnings: 5.20,
              createdAt: new Date().toISOString()
            }
          ])
        } else if (filter === 'completed') {
          setDeliveries([
            {
              id: 'DEL100',
              orderNumber: 'AFM-2024-100',
              customer: { name: 'Emma Brown' },
              address: '15 Park Avenue, London N1 2AB',
              earnings: 4.80,
              status: 'delivered',
              rating: 5,
              completedAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 'DEL099',
              orderNumber: 'AFM-2024-099',
              customer: { name: 'Michael Davis' },
              address: '89 Church Road, London W2 4GH',
              earnings: 6.20,
              status: 'delivered',
              rating: 5,
              completedAt: new Date(Date.now() - 7200000).toISOString()
            }
          ])
        } else {
          setDeliveries([])
        }
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching deliveries:', error)
      setLoading(false)
    }
  }

  const statusColors = {
    'pending-pickup': 'bg-yellow-100 text-yellow-800',
    'picking-up': 'bg-blue-100 text-blue-800',
    'in-transit': 'bg-purple-100 text-purple-800',
    'arriving': 'bg-green-100 text-green-800',
    'delivered': 'bg-gray-100 text-gray-800'
  }

  const statusLabels = {
    'pending-pickup': 'Waiting for Pickup',
    'picking-up': 'Picking Up',
    'in-transit': 'In Transit',
    'arriving': 'Arriving Soon',
    'delivered': 'Delivered'
  }

  const filters = [
    { id: 'active', label: 'Active', icon: '🚚' },
    { id: 'completed', label: 'Completed', icon: '✓' },
    { id: 'cancelled', label: 'Cancelled', icon: '✕' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <button onClick={() => navigate('/rider/dashboard')} className="text-purple-200 hover:text-white mb-2">
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold">My Deliveries</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                filter === f.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Deliveries List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : deliveries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <span className="text-6xl">📦</span>
            <h2 className="text-xl font-bold text-gray-900 mt-4">No {filter} deliveries</h2>
            <p className="text-gray-500 mt-2">
              {filter === 'active' ? 'New orders will appear here when assigned to you' : 'No deliveries in this category'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map(delivery => (
              <div
                key={delivery.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => navigate(`/rider/delivery/${delivery.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">{delivery.orderNumber}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[delivery.status]}`}>
                        {statusLabels[delivery.status]}
                      </span>
                    </div>
                    {delivery.vendor && (
                      <p className="text-sm text-gray-500 mt-1">from {delivery.vendor.name}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600">£{delivery.earnings.toFixed(2)}</p>
                    {delivery.rating && (
                      <div className="flex items-center justify-end gap-1 mt-1">
                        {[...Array(delivery.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400">★</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <span className="text-xl mt-1">📍</span>
                  <div>
                    <p className="font-medium text-gray-900">{delivery.customer.name}</p>
                    <p className="text-sm text-gray-500">{delivery.address}</p>
                    {delivery.customer.phone && (
                      <p className="text-sm text-purple-600">{delivery.customer.phone}</p>
                    )}
                  </div>
                </div>

                {filter === 'active' && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>📦 {delivery.items} items</span>
                      <span>📏 {delivery.distance} km</span>
                      <span>⏱️ {delivery.estimatedTime}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); /* Call customer */ }}
                        className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        📞 Call
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); /* Navigate */ }}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        🗺️ Navigate
                      </button>
                    </div>
                  </div>
                )}

                {filter === 'completed' && (
                  <div className="flex items-center justify-between pt-4 border-t text-sm text-gray-500">
                    <span>Completed {new Date(delivery.completedAt).toLocaleString('en-GB')}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RiderDeliveries
