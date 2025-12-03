import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function PickerOrderFulfillment() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  useEffect(() => {
    fetchOrder()
  }, [orderId])

  const fetchOrder = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setOrder({
          id: orderId,
          orderNumber: 'AFM-2024-001',
          customer: 'Sarah Johnson',
          vendor: 'Fresh Valley Farms',
          priority: 'high',
          createdAt: new Date().toISOString(),
          estimatedPickup: '10:45 AM',
          items: [
            { id: 1, name: 'Organic Tomatoes', quantity: 2, unit: 'kg', price: 3.50, location: 'A-3-2', picked: false, image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=100' },
            { id: 2, name: 'Fresh Spinach', quantity: 1, unit: 'bunch', price: 1.99, location: 'A-5-1', picked: false, image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=100' },
            { id: 3, name: 'Free Range Eggs', quantity: 1, unit: 'dozen', price: 4.50, location: 'B-2-4', picked: false, image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=100' },
            { id: 4, name: 'Whole Milk', quantity: 2, unit: 'litres', price: 2.20, location: 'C-1-1', picked: false, image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=100' },
            { id: 5, name: 'Sourdough Bread', quantity: 1, unit: 'loaf', price: 3.00, location: 'D-2-3', picked: false, image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=100' }
          ],
          specialInstructions: 'Please select the ripest tomatoes. Customer prefers whole milk, not skimmed.'
        })
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching order:', error)
      setLoading(false)
    }
  }

  const markItemPicked = (itemId) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === itemId ? { ...item, picked: !item.picked } : item
      )
    }))
  }

  const reportIssue = (item, issueType) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.map(i =>
        i.id === item.id ? { ...i, issue: issueType, picked: true } : i
      )
    }))
    setShowIssueModal(false)
    setSelectedItem(null)
  }

  const completeOrder = () => {
    const allPicked = order.items.every(i => i.picked)
    if (!allPicked) {
      alert('Please pick or report issues for all items before completing')
      return
    }

    // API call to complete order
    alert('Order completed and ready for delivery!')
    navigate('/picker/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🔍</span>
          <h2 className="text-xl font-bold mt-4">Order not found</h2>
          <button
            onClick={() => navigate('/picker/dashboard')}
            className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-xl"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const pickedCount = order.items.filter(i => i.picked).length
  const totalItems = order.items.length
  const progress = (pickedCount / totalItems) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => navigate('/picker/dashboard')} className="text-orange-100 hover:text-white">
              ← Back
            </button>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.priority === 'high' ? 'bg-red-500' : 'bg-orange-400'
            }`}>
              {order.priority.toUpperCase()} PRIORITY
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{order.orderNumber}</h1>
              <p className="text-orange-100 text-sm">{order.vendor}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{pickedCount}/{totalItems}</p>
              <p className="text-orange-100 text-sm">items picked</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-orange-400 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Special Instructions */}
        {order.specialInstructions && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-xl">📝</span>
              <div>
                <p className="font-semibold text-yellow-800">Special Instructions</p>
                <p className="text-sm text-yellow-700">{order.specialInstructions}</p>
              </div>
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all ${
                item.picked ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-stretch">
                {/* Item Image */}
                <div className="w-24 h-24 flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-semibold ${item.picked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">{item.quantity} {item.unit}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-mono">
                      📍 {item.location}
                    </span>
                  </div>

                  {item.issue && (
                    <div className="mt-2 px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                      ⚠️ {item.issue}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center gap-2 p-2 border-l">
                  <button
                    onClick={() => markItemPicked(item.id)}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl transition-all ${
                      item.picked
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-400 hover:bg-green-100 hover:text-green-500'
                    }`}
                  >
                    {item.picked ? '✓' : '○'}
                  </button>
                  {!item.picked && (
                    <button
                      onClick={() => { setSelectedItem(item); setShowIssueModal(true) }}
                      className="w-12 h-12 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 flex items-center justify-center"
                    >
                      ⚠️
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Complete Button */}
        <div className="mt-8 sticky bottom-4">
          <button
            onClick={completeOrder}
            disabled={pickedCount < totalItems}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              pickedCount === totalItems
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {pickedCount === totalItems ? '✓ Complete Order' : `Pick ${totalItems - pickedCount} more items`}
          </button>
        </div>
      </div>

      {/* Issue Modal */}
      {showIssueModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Report Issue</h2>
            <p className="text-gray-500 mb-4">{selectedItem.name}</p>

            <div className="space-y-2">
              <button
                onClick={() => reportIssue(selectedItem, 'Out of Stock')}
                className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <p className="font-semibold">Out of Stock</p>
                <p className="text-sm text-gray-500">Item is not available</p>
              </button>
              <button
                onClick={() => reportIssue(selectedItem, 'Quality Issue')}
                className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <p className="font-semibold">Quality Issue</p>
                <p className="text-sm text-gray-500">Item doesn't meet quality standards</p>
              </button>
              <button
                onClick={() => reportIssue(selectedItem, 'Wrong Item')}
                className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <p className="font-semibold">Wrong Item</p>
                <p className="text-sm text-gray-500">Can't find the correct item</p>
              </button>
              <button
                onClick={() => reportIssue(selectedItem, 'Partial Quantity')}
                className="w-full p-4 text-left bg-gray-50 rounded-lg hover:bg-gray-100"
              >
                <p className="font-semibold">Partial Quantity</p>
                <p className="text-sm text-gray-500">Less stock than ordered</p>
              </button>
            </div>

            <button
              onClick={() => setShowIssueModal(false)}
              className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PickerOrderFulfillment
