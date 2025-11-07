import { useState } from 'react'

function OrderStatusControls({ order, onStatusUpdate, isUpdating }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [selectedAction, setSelectedAction] = useState(null)
  const [cancellationNote, setCancellationNote] = useState('')

  // Define available status transitions based on current status
  const getAvailableActions = () => {
    const actions = {
      pending: [
        {
          status: 'confirmed',
          label: 'Accept Order',
          icon: '✓',
          color: 'green',
          description: 'Confirm and start preparing this order',
        },
        {
          status: 'cancelled',
          label: 'Reject Order',
          icon: '✕',
          color: 'red',
          description: 'Cancel this order (requires reason)',
          requiresNote: true,
        },
      ],
      confirmed: [
        {
          status: 'preparing',
          label: 'Start Preparing',
          icon: '👨‍🍳',
          color: 'orange',
          description: 'Begin preparing the order',
        },
        {
          status: 'cancelled',
          label: 'Cancel Order',
          icon: '✕',
          color: 'red',
          description: 'Cancel this order',
          requiresNote: true,
        },
      ],
      preparing: [
        {
          status: 'ready',
          label: 'Mark as Ready',
          icon: '✓',
          color: 'green',
          description: 'Order is ready for pickup',
        },
      ],
      ready: [
        {
          status: 'out-for-delivery',
          label: 'Out for Delivery',
          icon: '🚚',
          color: 'blue',
          description: 'Rider has picked up the order',
        },
      ],
      'out-for-delivery': [
        {
          status: 'delivered',
          label: 'Mark as Delivered',
          icon: '✓',
          color: 'green',
          description: 'Order has been delivered to customer',
        },
      ],
      delivered: [
        {
          status: 'completed',
          label: 'Complete Order',
          icon: '✓',
          color: 'gray',
          description: 'Finalize and archive this order',
        },
      ],
      assigned_picker: [
        {
          status: 'picking',
          label: 'Start Picking',
          icon: '📦',
          color: 'purple',
          description: 'Picker starts collecting items',
        },
      ],
      picking: [
        {
          status: 'picked',
          label: 'Items Picked',
          icon: '✓',
          color: 'purple',
          description: 'All items have been picked',
        },
      ],
      picked: [
        {
          status: 'packing',
          label: 'Start Packing',
          icon: '📦',
          color: 'indigo',
          description: 'Begin packing the items',
        },
      ],
      packing: [
        {
          status: 'ready_for_pickup',
          label: 'Ready for Pickup',
          icon: '✓',
          color: 'teal',
          description: 'Order is packed and ready',
        },
      ],
    }

    return actions[order.status] || []
  }

  const handleActionClick = (action) => {
    setSelectedAction(action)
    setShowConfirmDialog(true)
  }

  const handleConfirm = async () => {
    if (!selectedAction) return

    const note = selectedAction.requiresNote ? cancellationNote : ''

    if (selectedAction.requiresNote && !note.trim()) {
      alert('Please provide a reason for cancellation')
      return
    }

    try {
      await onStatusUpdate(selectedAction.status, note)
      setShowConfirmDialog(false)
      setSelectedAction(null)
      setCancellationNote('')
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update order status. Please try again.')
    }
  }

  const handleCancel = () => {
    setShowConfirmDialog(false)
    setSelectedAction(null)
    setCancellationNote('')
  }

  const availableActions = getAvailableActions()

  if (availableActions.length === 0) {
    return null
  }

  const colorClasses = {
    green: {
      bg: 'bg-gradient-to-r from-green-600 to-green-700',
      hover: 'hover:from-green-700 hover:to-green-800',
      border: 'border-green-600',
      text: 'text-green-700',
    },
    red: {
      bg: 'bg-gradient-to-r from-red-600 to-red-700',
      hover: 'hover:from-red-700 hover:to-red-800',
      border: 'border-red-600',
      text: 'text-red-700',
    },
    orange: {
      bg: 'bg-gradient-to-r from-orange-600 to-orange-700',
      hover: 'hover:from-orange-700 hover:to-orange-800',
      border: 'border-orange-600',
      text: 'text-orange-700',
    },
    blue: {
      bg: 'bg-gradient-to-r from-blue-600 to-blue-700',
      hover: 'hover:from-blue-700 hover:to-blue-800',
      border: 'border-blue-600',
      text: 'text-blue-700',
    },
    purple: {
      bg: 'bg-gradient-to-r from-purple-600 to-purple-700',
      hover: 'hover:from-purple-700 hover:to-purple-800',
      border: 'border-purple-600',
      text: 'text-purple-700',
    },
    indigo: {
      bg: 'bg-gradient-to-r from-indigo-600 to-indigo-700',
      hover: 'hover:from-indigo-700 hover:to-indigo-800',
      border: 'border-indigo-600',
      text: 'text-indigo-700',
    },
    teal: {
      bg: 'bg-gradient-to-r from-[#00897B] to-[#00695C]',
      hover: 'hover:from-[#00695C] hover:to-[#004D40]',
      border: 'border-[#00897B]',
      text: 'text-[#00897B]',
    },
    gray: {
      bg: 'bg-gradient-to-r from-gray-600 to-gray-700',
      hover: 'hover:from-gray-700 hover:to-gray-800',
      border: 'border-gray-600',
      text: 'text-gray-700',
    },
  }

  return (
    <>
      {/* Action Buttons */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-[#FFB300]">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#FFB300]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {availableActions.map((action) => {
            const colors = colorClasses[action.color] || colorClasses.gray
            return (
              <button
                key={action.status}
                onClick={() => handleActionClick(action)}
                disabled={isUpdating}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white
                  ${colors.bg} ${colors.hover}
                  shadow-md hover:shadow-lg
                  transition-all duration-200 transform hover:-translate-y-0.5
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                `}
              >
                <span className="text-xl">{action.icon}</span>
                <span>{action.label}</span>
                {isUpdating && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideUp">
            {/* Icon */}
            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
              selectedAction.color === 'red' ? 'bg-red-100' : 'bg-green-100'
            }`}>
              <span className="text-3xl">{selectedAction.icon}</span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              {selectedAction.label}
            </h3>

            {/* Description */}
            <p className="text-gray-600 text-center mb-4">
              {selectedAction.description}
            </p>

            {/* Cancellation Note Input */}
            {selectedAction.requiresNote && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation *
                </label>
                <textarea
                  value={cancellationNote}
                  onChange={(e) => setCancellationNote(e.target.value)}
                  placeholder="Please provide a reason..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFB300] focus:border-transparent resize-none"
                  required
                />
              </div>
            )}

            {/* Order Info */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-600">Order Number</div>
              <div className="font-semibold text-gray-900">{order.orderNumber}</div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={selectedAction.requiresNote && !cancellationNote.trim()}
                className={`
                  flex-1 px-4 py-2 text-white font-medium rounded-lg transition-all
                  ${colorClasses[selectedAction.color].bg} ${colorClasses[selectedAction.color].hover}
                  shadow-md hover:shadow-lg
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default OrderStatusControls
