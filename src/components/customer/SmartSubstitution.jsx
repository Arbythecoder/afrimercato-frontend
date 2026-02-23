/**
 * =====================================================
 * SMART SUBSTITUTION SYSTEM
 * =====================================================
 *
 * PROBLEM IT SOLVES (UK Market Research):
 * - Major complaint: Poor/random substitutions
 * - Customers receive items they don't want
 * - No control over alternatives
 *
 * OUR SOLUTION:
 * - AI-powered smart alternatives
 * - User approves BEFORE delivery (not after!)
 * - Learn from past preferences
 * - Option to reject substitutions
 *
 * HOW IT WORKS:
 * 1. Item goes out of stock during order prep
 * 2. System suggests 3 smart alternatives
 * 3. Customer gets push notification to approve
 * 4. Customer chooses or rejects
 * 5. Order proceeds with choice
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  XMarkIcon,
  ArrowPathIcon,
  SparklesIcon
} from '@heroicons/react/24/solid'

const SmartSubstitution = ({
  originalProduct,
  suggestedAlternatives = [],
  onApprove,
  onReject
}) => {
  const [selectedAlternative, setSelectedAlternative] = useState(null)
  const [showModal, setShowModal] = useState(true)

  // Handle approval of substitution
  const handleApprove = () => {
    if (selectedAlternative) {
      onApprove(selectedAlternative)
      setShowModal(false)
    }
  }

  // Handle rejection - remove item from order
  const handleReject = () => {
    onReject(originalProduct.id)
    setShowModal(false)
  }

  if (!showModal) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={() => setShowModal(false)}
      >
        {/* Modal Content - Mobile-First (slides up from bottom on mobile) */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 sm:rounded-t-2xl rounded-t-3xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="w-6 h-6" />
                <h2 className="text-xl sm:text-2xl font-bold">Smart Substitution</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <p className="text-white/90 text-sm">
              This item went out of stock. We found great alternatives for you!
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Original Product - What's Out of Stock */}
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 font-semibold text-sm mb-2">❌ Out of Stock</p>
              <div className="flex items-center gap-3">
                <img
                  src={originalProduct.image}
                  alt={originalProduct.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{originalProduct.name}</p>
                  <p className="text-sm text-gray-600">£{originalProduct.price.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* AI-Powered Alternatives */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ArrowPathIcon className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-gray-900 text-lg">AI-Powered Alternatives</h3>
              </div>

              <div className="space-y-3">
                {suggestedAlternatives.map((alternative, index) => (
                  <motion.div
                    key={alternative.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedAlternative(alternative)}
                    className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                      selectedAlternative?.id === alternative.id
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 hover:border-green-300 bg-white'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Selection Indicator */}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                        selectedAlternative?.id === alternative.id
                          ? 'border-green-600 bg-green-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedAlternative?.id === alternative.id && (
                          <CheckCircleIcon className="w-5 h-5 text-white" />
                        )}
                      </div>

                      {/* Product Image */}
                      <img
                        src={alternative.image}
                        alt={alternative.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-gray-900">{alternative.name}</p>
                          {/* AI Match Score */}
                          <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
                            {alternative.matchScore}% match
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">{alternative.description}</p>

                        {/* Price Comparison */}
                        <div className="flex items-center gap-3 text-sm">
                          <span className="font-bold text-gray-900">
                            £{alternative.price.toFixed(2)}
                          </span>
                          {alternative.price < originalProduct.price && (
                            <span className="text-green-600 font-semibold">
                              Save £{(originalProduct.price - alternative.price).toFixed(2)}
                            </span>
                          )}
                          {alternative.price > originalProduct.price && (
                            <span className="text-orange-600 font-semibold">
                              +£{(alternative.price - originalProduct.price).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Why This Match? (AI Reasoning) */}
                        <div className="mt-2 bg-blue-50 border border-blue-200 rounded-lg p-2">
                          <p className="text-xs text-blue-800">
                            <span className="font-semibold">🤖 Why this?</span> {alternative.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Buttons - Mobile-First */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Approve Substitution */}
              <button
                onClick={handleApprove}
                disabled={!selectedAlternative}
                className="flex-1 bg-green-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-base sm:text-lg"
              >
                ✓ Approve Substitution
              </button>

              {/* Reject - Remove from Order */}
              <button
                onClick={handleReject}
                className="flex-1 bg-gray-100 text-gray-900 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all text-base sm:text-lg border-2 border-gray-300"
              >
                ✕ Remove from Order
              </button>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <span className="font-semibold">💡 How it works:</span> Our AI analyzes your past orders, preferences, and product similarities to suggest the best alternatives. You stay in control!
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default SmartSubstitution

// Example usage with sample data:
export const SmartSubstitutionExample = () => {
  const originalProduct = {
    id: 'p1',
    name: 'Organic Tomatoes 1kg',
    price: 2.99,
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'
  }

  const suggestedAlternatives = [
    {
      id: 'a1',
      name: 'Organic Cherry Tomatoes 500g',
      price: 2.49,
      matchScore: 95,
      description: 'Sweet cherry tomatoes, perfect for salads',
      reason: 'Similar organic quality, same farm, smaller size but better price per 100g',
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400'
    },
    {
      id: 'a2',
      name: 'Organic Vine Tomatoes 1kg',
      price: 3.49,
      matchScore: 92,
      description: 'Vine-ripened for maximum flavor',
      reason: 'Based on your previous 5-star review of vine tomatoes',
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'
    },
    {
      id: 'a3',
      name: 'Regular Tomatoes 1kg',
      price: 1.99,
      matchScore: 78,
      description: 'Fresh locally-sourced tomatoes',
      reason: 'Same size, lower price. Great for cooking.',
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'
    }
  ]

  return (
    <SmartSubstitution
      originalProduct={originalProduct}
      suggestedAlternatives={suggestedAlternatives}
      onApprove={(alternative) => console.log('Approved:', alternative)}
      onReject={(productId) => console.log('Rejected:', productId)}
    />
  )
}
