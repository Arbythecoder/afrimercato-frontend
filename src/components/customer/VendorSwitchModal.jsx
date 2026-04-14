import { motion, AnimatePresence } from 'framer-motion'

/**
 * Vendor Switch Confirmation Modal
 * Shown when user tries to add item from a different store
 */
export default function VendorSwitchModal({ 
  isOpen, 
  onClose, 
  currentStoreName, 
  newStoreName,
  onConfirmSwitch 
}) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10"
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">🛒</span>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Start Fresh Cart?
          </h2>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-gray-700 mb-2">
              You have items from <strong className="text-gray-900">{currentStoreName}</strong> in your cart.
            </p>
            <p className="text-gray-600 text-sm">
              You can keep them and also add from <strong className="text-gray-900">{newStoreName}</strong>, or start a fresh cart.
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-800 flex items-start gap-2">
              <span className="text-lg">ℹ️</span>
              <span>Multi-store shopping is supported — your cart will show items grouped by store at checkout.</span>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Keep Both
            </button>
            <button
              onClick={() => {
                onConfirmSwitch()
                onClose()
              }}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Clear &amp; Start Fresh
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
