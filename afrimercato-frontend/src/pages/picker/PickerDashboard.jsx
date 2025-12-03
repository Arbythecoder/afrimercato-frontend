import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function PickerDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    accuracy: 0,
    avgPickTime: 0
  })
  const [orderQueue, setOrderQueue] = useState([])
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setStats({
          todayOrders: 24,
          pendingOrders: 5,
          completedOrders: 19,
          accuracy: 99.2,
          avgPickTime: 8.5
        })

        setCurrentOrder({
          id: 'ORD001',
          orderNumber: 'AFM-2024-001',
          customer: 'Sarah Johnson',
          items: [
            { id: 1, name: 'Organic Tomatoes', quantity: 2, unit: 'kg', location: 'A-3-2', picked: true },
            { id: 2, name: 'Fresh Spinach', quantity: 1, unit: 'bunch', location: 'A-5-1', picked: true },
            { id: 3, name: 'Free Range Eggs', quantity: 1, unit: 'dozen', location: 'B-2-4', picked: false },
            { id: 4, name: 'Whole Milk', quantity: 2, unit: 'litres', location: 'C-1-1', picked: false }
          ],
          priority: 'high',
          timeRemaining: 12
        })

        setOrderQueue([
          { id: 'ORD002', orderNumber: 'AFM-2024-002', items: 6, priority: 'normal', eta: '15 min' },
          { id: 'ORD003', orderNumber: 'AFM-2024-003', items: 3, priority: 'high', eta: '10 min' },
          { id: 'ORD004', orderNumber: 'AFM-2024-004', items: 8, priority: 'normal', eta: '20 min' },
          { id: 'ORD005', orderNumber: 'AFM-2024-005', items: 4, priority: 'low', eta: '30 min' }
        ])

        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching dashboard:', error)
      setLoading(false)
    }
  }

  const markItemPicked = (itemId) => {
    if (!currentOrder) return

    setCurrentOrder(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, picked: !item.picked } : item
      )
    }))
  }

  const completeOrder = () => {
    alert('Order completed! Starting next order...')
    // Move to next order in queue
    if (orderQueue.length > 0) {
      const nextOrder = orderQueue[0]
      navigate(`/picker/order/${nextOrder.id}`)
    } else {
      setCurrentOrder(null)
    }
  }

  const priorityColors = {
    high: 'bg-red-100 text-red-700',
    normal: 'bg-blue-100 text-blue-700',
    low: 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  const pickedCount = currentOrder?.items.filter(i => i.picked).length || 0
  const totalItems = currentOrder?.items.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Hello, {user?.name?.split(' ')[0] || 'Picker'}!</h1>
              <p className="text-orange-100">{stats.pendingOrders} orders waiting to be picked</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">{stats.accuracy}%</p>
              <p className="text-orange-100 text-sm">Accuracy Rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Today's Orders</span>
              <span className="text-2xl">📦</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.todayOrders}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Pending</span>
              <span className="text-2xl">⏳</span>
            </div>
            <p className="text-3xl font-bold text-orange-500">{stats.pendingOrders}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Completed</span>
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">Avg Pick Time</span>
              <span className="text-2xl">⏱️</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.avgPickTime}m</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Order - Main Focus */}
          <div className="lg:col-span-2">
            {currentOrder ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">Current Order</h2>
                      <p className="text-orange-100">{currentOrder.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        currentOrder.priority === 'high' ? 'bg-red-500' : 'bg-orange-400'
                      }`}>
                        {currentOrder.priority.toUpperCase()}
                      </span>
                      <p className="text-orange-100 mt-1">{currentOrder.timeRemaining} min left</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>{pickedCount}/{totalItems} items</span>
                    </div>
                    <div className="h-3 bg-orange-400 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-white transition-all"
                        style={{ width: `${(pickedCount / totalItems) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Items to Pick</h3>
                  <div className="space-y-3">
                    {currentOrder.items.map(item => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          item.picked
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-gray-200 hover:border-orange-300'
                        }`}
                        onClick={() => markItemPicked(item.id)}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.picked
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {item.picked ? '✓' : '○'}
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold ${item.picked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} {item.unit}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-mono">
                            {item.location}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Complete Button */}
                  {pickedCount === totalItems && (
                    <button
                      onClick={completeOrder}
                      className="w-full mt-6 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700"
                    >
                      ✓ Complete & Ready for Delivery
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <span className="text-8xl">📦</span>
                <h2 className="text-2xl font-bold text-gray-900 mt-6">No active order</h2>
                <p className="text-gray-500 mt-2">Pick an order from the queue to start</p>
              </div>
            )}
          </div>

          {/* Order Queue */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-gray-900">Order Queue ({orderQueue.length})</h2>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {orderQueue.map((order, index) => (
                  <div
                    key={order.id}
                    className="p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/picker/order/${order.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[order.priority]}`}>
                        {order.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>📦 {order.items} items</span>
                      <span>⏱️ {order.eta}</span>
                    </div>
                  </div>
                ))}
              </div>

              {orderQueue.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <span className="text-4xl">✓</span>
                  <p className="mt-2">All caught up!</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 space-y-3">
              <button
                onClick={() => navigate('/picker/performance')}
                className="w-full bg-white rounded-xl shadow-lg p-4 text-left hover:shadow-xl transition-shadow flex items-center gap-3"
              >
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-semibold text-gray-900">View Performance</p>
                  <p className="text-sm text-gray-500">See your stats and metrics</p>
                </div>
              </button>

              <button
                onClick={() => navigate('/picker/history')}
                className="w-full bg-white rounded-xl shadow-lg p-4 text-left hover:shadow-xl transition-shadow flex items-center gap-3"
              >
                <span className="text-2xl">📋</span>
                <div>
                  <p className="font-semibold text-gray-900">Order History</p>
                  <p className="text-sm text-gray-500">View completed orders</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PickerDashboard
