import { useState, useEffect } from 'react'

function PackingChecklist({ order, onPackingComplete, onStatusUpdate }) {
  const [packedItems, setPackedItems] = useState([])
  const [notes, setNotes] = useState({})

  useEffect(() => {
    // Initialize packing checklist
    const initialItems = order.items.map((item) => ({
      itemId: item._id || item.productId || item.name,
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      packed: false,
      pickedQuantity: 0,
    }))
    setPackedItems(initialItems)
  }, [order.items])

  const handleItemCheck = (itemId) => {
    setPackedItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId
          ? { ...item, packed: !item.packed, pickedQuantity: !item.packed ? item.quantity : 0 }
          : item
      )
    )
  }

  const handleQuantityChange = (itemId, quantity) => {
    setPackedItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId
          ? { ...item, pickedQuantity: Math.max(0, Math.min(quantity, item.quantity)) }
          : item
      )
    )
  }

  const handleNoteChange = (itemId, note) => {
    setNotes((prev) => ({
      ...prev,
      [itemId]: note,
    }))
  }

  const handleCompleteAll = () => {
    setPackedItems((prev) =>
      prev.map((item) => ({
        ...item,
        packed: true,
        pickedQuantity: item.quantity,
      }))
    )
  }

  const handleMarkReady = async () => {
    const allPacked = packedItems.every((item) => item.packed)

    if (!allPacked) {
      const confirm = window.confirm(
        'Not all items are marked as packed. Are you sure you want to mark this order as ready?'
      )
      if (!confirm) return
    }

    // Call parent handler
    if (onPackingComplete) {
      onPackingComplete(packedItems)
    }

    // Update status to ready_for_pickup
    if (onStatusUpdate) {
      await onStatusUpdate('ready_for_pickup', 'All items packed and ready for pickup')
    }
  }

  const packedCount = packedItems.filter((item) => item.packed).length
  const totalCount = packedItems.length
  const progress = totalCount > 0 ? (packedCount / totalCount) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="bg-gradient-to-br from-[#FFB300] to-[#FFA726] rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">Packing Checklist</h3>
            <p className="text-gray-900 mt-1">
              {packedCount} of {totalCount} items packed
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">{Math.round(progress)}%</div>
            <div className="text-sm text-gray-900">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-900/20 rounded-full h-4 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-[#00897B] to-[#26A69A] h-full rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleCompleteAll}
            className="flex-1 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            ✓ Mark All Packed
          </button>
          <button
            onClick={handleMarkReady}
            disabled={packedCount === 0}
            className="flex-1 bg-[#00897B] text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg hover:bg-[#00695C] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            📦 Ready for Pickup
          </button>
        </div>
      </div>

      {/* Packing Instructions */}
      {order.deliveryAddress?.instructions && (
        <div className="bg-yellow-50 border-l-4 border-[#FFB300] rounded-lg p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-[#FFB300] mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Special Instructions</h4>
              <p className="text-gray-700 text-sm">{order.deliveryAddress.instructions}</p>
            </div>
          </div>
        </div>
      )}

      {/* Items Checklist */}
      <div className="space-y-3">
        {packedItems.map((item, index) => {
          const originalItem = order.items[index]
          return (
            <div
              key={item.itemId}
              className={`
                bg-white rounded-xl p-5 shadow-md border-2 transition-all duration-300
                ${item.packed ? 'border-[#00897B] bg-green-50/50' : 'border-gray-200 hover:border-[#FFB300]'}
              `}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className="flex-shrink-0 pt-1">
                  <button
                    onClick={() => handleItemCheck(item.itemId)}
                    className={`
                      w-8 h-8 rounded-lg border-2 flex items-center justify-center
                      transition-all duration-200 transform hover:scale-110
                      ${
                        item.packed
                          ? 'bg-[#00897B] border-[#00897B] shadow-lg'
                          : 'bg-white border-gray-300 hover:border-[#FFB300]'
                      }
                    `}
                  >
                    {item.packed && (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Item Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h4 className={`text-lg font-semibold ${item.packed ? 'text-[#00897B] line-through' : 'text-gray-900'}`}>
                        {item.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1">
                        <span className="text-sm text-gray-600">
                          Ordered: <span className="font-semibold">{item.quantity} {item.unit}</span>
                        </span>
                        {originalItem.price && (
                          <span className="text-sm text-gray-600">
                            Price: <span className="font-semibold">£{originalItem.price.toFixed(2)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Item Image */}
                    {originalItem.image && (
                      <img
                        src={originalItem.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg shadow-md"
                      />
                    )}
                  </div>

                  {/* Quantity Picker */}
                  <div className="flex items-center gap-4 mb-3">
                    <label className="text-sm font-medium text-gray-700">Picked Quantity:</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.itemId, item.pickedQuantity - 1)}
                        disabled={item.pickedQuantity <= 0}
                        className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.pickedQuantity}
                        onChange={(e) => handleQuantityChange(item.itemId, parseInt(e.target.value) || 0)}
                        className="w-20 text-center px-2 py-1 border-2 border-gray-300 rounded-lg font-semibold focus:border-[#FFB300] focus:ring-2 focus:ring-[#FFB300]/20"
                        min="0"
                        max={item.quantity}
                      />
                      <button
                        onClick={() => handleQuantityChange(item.itemId, item.pickedQuantity + 1)}
                        disabled={item.pickedQuantity >= item.quantity}
                        className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-600">/ {item.quantity} {item.unit}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                    <input
                      type="text"
                      value={notes[item.itemId] || ''}
                      onChange={(e) => handleNoteChange(item.itemId, e.target.value)}
                      placeholder="E.g., substitution, quality issue..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FFB300] focus:border-transparent"
                    />
                  </div>

                  {/* Short Quantity Warning */}
                  {item.pickedQuantity > 0 && item.pickedQuantity < item.quantity && (
                    <div className="mt-2 p-2 bg-orange-50 border-l-4 border-orange-400 rounded">
                      <p className="text-xs text-orange-700">
                        ⚠️ Short by {item.quantity - item.pickedQuantity} {item.unit}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 shadow-lg border border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Packing Summary</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
            <div className="text-xs text-gray-600 mt-1">Total Items</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-[#00897B]">{packedCount}</div>
            <div className="text-xs text-gray-600 mt-1">Packed</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{totalCount - packedCount}</div>
            <div className="text-xs text-gray-600 mt-1">Remaining</div>
          </div>
        </div>
      </div>

      {/* Complete Button (Bottom) */}
      <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-4 -mx-6 -mb-6 rounded-b-xl shadow-lg">
        <button
          onClick={handleMarkReady}
          disabled={packedCount === 0}
          className={`
            w-full py-4 rounded-xl font-bold text-lg text-white shadow-lg
            transition-all duration-200 transform hover:-translate-y-1 hover:shadow-xl
            ${
              packedCount === totalCount
                ? 'bg-gradient-to-r from-[#00897B] to-[#26A69A]'
                : 'bg-gradient-to-r from-gray-500 to-gray-600'
            }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          `}
        >
          {packedCount === totalCount ? (
            <>✓ Mark Order as Ready for Pickup</>
          ) : (
            <>Pack {totalCount - packedCount} More Items</>
          )}
        </button>
      </div>
    </div>
  )
}

export default PackingChecklist
