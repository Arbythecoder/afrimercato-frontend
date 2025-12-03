/**
 * =====================================================
 * PRODUCT QUALITY GUARANTEE SYSTEM
 * =====================================================
 *
 * PROBLEM IT SOLVES (UK Market Research):
 * - Top complaint: Damaged/wilted vegetables
 * - Expired products delivered
 * - Missing items in delivery
 * - No easy way to report issues
 *
 * OUR SOLUTION:
 * - Fresh produce guarantee
 * - Easy photo-based reporting
 * - Instant refunds/replacements
 * - Quality checks before delivery
 * - Expiry date tracking
 *
 * FEATURES:
 * - Report quality issues in 30 seconds
 * - Upload photos of damaged items
 * - Instant refund or replacement
 * - Track all quality reports
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheckIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/solid'

const QualityGuarantee = ({ orderItem, onReportSubmit }) => {
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState(null)
  const [photos, setPhotos] = useState([])
  const [description, setDescription] = useState('')
  const [resolution, setResolution] = useState('refund') // 'refund' or 'replacement'

  // Quality issue types
  const qualityIssues = [
    {
      id: 'wilted',
      label: 'Wilted/Not Fresh',
      icon: '🥬',
      color: 'orange',
      description: 'Product looks old or wilted'
    },
    {
      id: 'damaged',
      label: 'Damaged',
      icon: '📦',
      color: 'red',
      description: 'Product is broken or crushed'
    },
    {
      id: 'expired',
      label: 'Expired/Near Expiry',
      icon: '📅',
      color: 'purple',
      description: 'Product is expired or expires too soon'
    },
    {
      id: 'wrong',
      label: 'Wrong Item',
      icon: '❌',
      color: 'pink',
      description: 'Received different item than ordered'
    },
    {
      id: 'missing',
      label: 'Missing Item',
      icon: '🔍',
      color: 'blue',
      description: 'Item not in delivery'
    },
    {
      id: 'other',
      label: 'Other Issue',
      icon: '⚠️',
      color: 'gray',
      description: 'Different quality concern'
    }
  ]

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    if (photos.length + files.length > 3) {
      alert('Maximum 3 photos allowed')
      return
    }

    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))

    setPhotos([...photos, ...newPhotos])
  }

  // Remove photo
  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  // Submit quality report
  const handleSubmit = () => {
    const report = {
      orderItem,
      issue: selectedIssue,
      photos,
      description,
      resolution,
      timestamp: new Date()
    }

    onReportSubmit(report)
    setShowReportModal(false)

    // Show success message
    alert(`Quality issue reported! Your ${resolution} will be processed within 24 hours.`)
  }

  return (
    <>
      {/* Quality Guarantee Badge - Shows on Product */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-start gap-3">
          <ShieldCheckIcon className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-green-900 text-sm">Fresh Quality Guaranteed</p>
            <p className="text-green-700 text-xs mt-1">
              Not happy? Report within 24hrs for instant refund or replacement
            </p>
          </div>
          <button
            onClick={() => setShowReportModal(true)}
            className="text-green-600 hover:text-green-700 font-semibold text-sm underline"
          >
            Report Issue
          </button>
        </div>
      </div>

      {/* Quality Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setShowReportModal(false)}
          >
            {/* Modal Content - Mobile-First */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 sm:rounded-t-2xl rounded-t-3xl">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-6 h-6" />
                    <h2 className="text-xl sm:text-2xl font-bold">Quality Guarantee</h2>
                  </div>
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XCircleIcon className="w-6 h-6" />
                  </button>
                </div>
                <p className="text-white/90 text-sm">
                  Report any quality issues - we'll make it right instantly
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Product Info */}
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl">
                  <img
                    src={orderItem?.image || 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200'}
                    alt={orderItem?.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">{orderItem?.name || 'Product Name'}</p>
                    <p className="text-sm text-gray-600">Order #12345 • Delivered today</p>
                  </div>
                </div>

                {/* Step 1: Select Issue Type */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">What's the issue?</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {qualityIssues.map((issue) => (
                      <button
                        key={issue.id}
                        onClick={() => setSelectedIssue(issue)}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedIssue?.id === issue.id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 hover:border-green-300 bg-white'
                        }`}
                      >
                        <div className="text-3xl mb-2">{issue.icon}</div>
                        <p className="font-semibold text-sm text-gray-900">{issue.label}</p>
                        <p className="text-xs text-gray-600 mt-1">{issue.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Upload Photos */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Add Photos (Optional but recommended)</h3>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {/* Uploaded Photos */}
                    {photos.map((photo, index) => (
                      <div key={index} className="relative aspect-square">
                        <img
                          src={photo.preview}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removePhoto(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                        >
                          ×
                        </button>
                      </div>
                    ))}

                    {/* Upload Button */}
                    {photos.length < 3 && (
                      <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition-all">
                        <CameraIcon className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-xs text-gray-600 font-medium">Add Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handlePhotoUpload}
                        />
                      </label>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    📸 Photos help us process your claim faster. Max 3 photos.
                  </p>
                </div>

                {/* Step 3: Description */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Additional Details (Optional)</h3>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us more about the issue..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Step 4: Choose Resolution */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">How would you like us to resolve this?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setResolution('refund')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        resolution === 'refund'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">💰</div>
                      <p className="font-semibold text-gray-900">Instant Refund</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Money back to your account within 24hrs
                      </p>
                    </button>

                    <button
                      onClick={() => setResolution('replacement')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        resolution === 'replacement'
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">🔄</div>
                      <p className="font-semibold text-gray-900">Send Replacement</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Fresh replacement in your next delivery
                      </p>
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={!selectedIssue}
                  className="w-full bg-green-600 text-white px-6 py-4 rounded-xl font-bold shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg"
                >
                  Submit Quality Report
                </button>

                {/* Guarantee Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <SparklesIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold">Our Fresh Guarantee Promise:</p>
                      <ul className="mt-2 space-y-1 text-xs">
                        <li>✓ Report within 24 hours of delivery</li>
                        <li>✓ Instant refund or replacement - no questions asked</li>
                        <li>✓ All claims processed within 24 hours</li>
                        <li>✓ No impact on your account standing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default QualityGuarantee

// Example usage
export const QualityGuaranteeExample = () => {
  const sampleItem = {
    id: 'item123',
    name: 'Organic Tomatoes 1kg',
    image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=200',
    price: 2.99
  }

  return (
    <div className="p-4">
      <QualityGuarantee
        orderItem={sampleItem}
        onReportSubmit={(report) => console.log('Quality report:', report)}
      />
    </div>
  )
}
