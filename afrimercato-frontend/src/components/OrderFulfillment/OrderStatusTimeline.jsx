import { useState, useEffect } from 'react'

function OrderStatusTimeline({ order }) {
  const [showAllHistory, setShowAllHistory] = useState(false)
  const [animatedProgress, setAnimatedProgress] = useState(0)

  // Timeline stages in order
  const timelineStages = [
    {
      status: 'pending',
      label: 'Order Placed',
      icon: '📋',
      description: 'Customer placed the order',
    },
    {
      status: 'confirmed',
      label: 'Order Confirmed',
      icon: '✓',
      description: 'Vendor accepted the order',
    },
    {
      status: 'assigned_picker',
      label: 'Picker Assigned',
      icon: '👤',
      description: 'Order assigned to picker',
    },
    {
      status: 'picking',
      label: 'Picking Items',
      icon: '🛒',
      description: 'Picker is collecting items',
    },
    {
      status: 'picked',
      label: 'Items Picked',
      icon: '✓',
      description: 'All items collected',
    },
    {
      status: 'packing',
      label: 'Packing Order',
      icon: '📦',
      description: 'Items being packed',
    },
    {
      status: 'ready_for_pickup',
      label: 'Ready for Pickup',
      icon: '✓',
      description: 'Order ready for rider',
    },
    {
      status: 'out-for-delivery',
      label: 'Out for Delivery',
      icon: '🚚',
      description: 'Rider on the way',
    },
    {
      status: 'delivered',
      label: 'Delivered',
      icon: '✓',
      description: 'Order delivered to customer',
    },
    {
      status: 'completed',
      label: 'Completed',
      icon: '✓',
      description: 'Order completed',
    },
  ]

  // Cancelled status
  const cancelledStage = {
    status: 'cancelled',
    label: 'Order Cancelled',
    icon: '✕',
    description: 'Order was cancelled',
  }

  // Get current stage index
  const getCurrentStageIndex = () => {
    if (order.status === 'cancelled') return -1
    return timelineStages.findIndex(stage => stage.status === order.status)
  }

  const currentStageIndex = getCurrentStageIndex()
  const isCancelled = order.status === 'cancelled'

  // Get stage status (completed, current, upcoming)
  const getStageStatus = (index) => {
    if (isCancelled) return 'cancelled'
    if (index < currentStageIndex) return 'completed'
    if (index === currentStageIndex) return 'current'
    return 'upcoming'
  }

  // Get stage color classes
  const getStageColorClasses = (status) => {
    switch (status) {
      case 'completed':
        return {
          bg: 'bg-[#00897B]',
          text: 'text-[#00897B]',
          border: 'border-[#00897B]',
          line: 'bg-[#00897B]',
        }
      case 'current':
        return {
          bg: 'bg-[#FFB300]',
          text: 'text-[#FFB300]',
          border: 'border-[#FFB300]',
          line: 'bg-gray-300',
        }
      case 'cancelled':
        return {
          bg: 'bg-red-500',
          text: 'text-red-500',
          border: 'border-red-500',
          line: 'bg-gray-300',
        }
      default:
        return {
          bg: 'bg-gray-300',
          text: 'text-gray-400',
          border: 'border-gray-300',
          line: 'bg-gray-300',
        }
    }
  }

  // Status history (mock data - replace with actual from order.statusHistory)
  const statusHistory = order.statusHistory || [
    {
      status: 'pending',
      timestamp: order.createdAt,
      note: 'Order placed by customer',
      user: 'System',
    },
    ...(order.status !== 'pending' ? [{
      status: order.status,
      timestamp: order.updatedAt,
      note: 'Current status',
      user: 'Vendor',
    }] : []),
  ]

  const displayedHistory = showAllHistory ? statusHistory : statusHistory.slice(0, 3)

  // Animate progress bar on mount and when current stage changes
  useEffect(() => {
    const targetProgress = ((currentStageIndex + 1) / timelineStages.length) * 100
    let currentProgress = 0
    const increment = targetProgress / 50

    const timer = setInterval(() => {
      currentProgress += increment
      if (currentProgress >= targetProgress) {
        setAnimatedProgress(targetProgress)
        clearInterval(timer)
      } else {
        setAnimatedProgress(currentProgress)
      }
    }, 20)

    return () => clearInterval(timer)
  }, [currentStageIndex, timelineStages.length])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#FFB300] to-[#FFA726] rounded-xl p-6 text-white shadow-lg animate-slideDown">
        <h3 className="text-2xl font-bold mb-2">Order Timeline</h3>
        <p className="text-gray-900">
          Track the progress of order {order.orderNumber}
        </p>
      </div>

      {/* Animated Progress Bar */}
      {!isCancelled && (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 animate-fadeIn">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900">Overall Progress</h4>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#00897B] to-[#00695C] bg-clip-text text-transparent">
              {Math.round(animatedProgress)}%
            </span>
          </div>
          <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#00897B] via-[#00695C] to-[#00897B] rounded-full transition-all duration-1000 ease-out shadow-lg animate-shimmer"
              style={{ width: `${animatedProgress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
            </div>
            {/* Progress markers */}
            {timelineStages.map((_, index) => {
              const position = ((index + 1) / timelineStages.length) * 100
              return (
                <div
                  key={index}
                  className="absolute top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-md"
                  style={{ left: `${position}%`, marginLeft: '-4px' }}
                />
              )
            })}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Started</span>
            <span className="font-semibold text-[#FFB300]">{timelineStages[currentStageIndex]?.label || 'Unknown'}</span>
            <span>Completed</span>
          </div>
        </div>
      )}

      {/* Visual Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-6">Progress Stages</h4>

        {/* Timeline */}
        <div className="relative">
          {!isCancelled ? (
            // Normal timeline
            timelineStages.map((stage, index) => {
              const stageStatus = getStageStatus(index)
              const colors = getStageColorClasses(stageStatus)
              const isLast = index === timelineStages.length - 1

              return (
                <div
                  key={stage.status}
                  className="relative flex items-start gap-4 pb-8 animate-slideIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Vertical line */}
                  {!isLast && (
                    <div className="absolute left-5 top-12 w-0.5 h-full">
                      <div
                        className={`w-full transition-all duration-500 ${colors.line}`}
                        style={{
                          height: stageStatus === 'completed' ? '100%' : stageStatus === 'current' ? '50%' : '0%'
                        }}
                      />
                    </div>
                  )}

                  {/* Icon circle */}
                  <div className="relative z-10 flex-shrink-0">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        border-4 border-white shadow-lg transform transition-all duration-500
                        ${colors.bg}
                        ${stageStatus === 'current' ? 'animate-pulseGlow scale-110 ring-4 ring-[#FFB300] ring-opacity-50' : ''}
                        ${stageStatus === 'completed' ? 'animate-bounceIn' : ''}
                        ${stageStatus === 'upcoming' ? 'scale-90 opacity-50' : ''}
                      `}
                    >
                      <span className="text-white text-xl">{stage.icon}</span>
                    </div>
                    {stageStatus === 'completed' && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#00897B] rounded-full flex items-center justify-center animate-checkmark">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    {stageStatus === 'current' && (
                      <div className="absolute inset-0 rounded-full bg-[#FFB300] animate-ping opacity-20" />
                    )}
                  </div>

                  {/* Stage info */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className={`font-bold text-lg ${colors.text}`}>
                        {stage.label}
                      </h5>
                      {stageStatus === 'completed' && statusHistory.find(h => h.status === stage.status) && (
                        <span className="text-sm text-gray-500">
                          {new Date(statusHistory.find(h => h.status === stage.status).timestamp).toLocaleString('en-GB', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      )}
                      {stageStatus === 'current' && (
                        <span className="px-3 py-1 bg-[#FFB300] text-gray-900 text-xs font-semibold rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{stage.description}</p>
                    {stageStatus === 'current' && (
                      <div className="mt-2 p-3 bg-yellow-50 border-l-4 border-[#FFB300] rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">In Progress:</span> This stage is currently active
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            // Cancelled timeline
            <div className="relative flex items-start gap-4">
              <div className="relative z-10 flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg bg-red-500">
                  <span className="text-white text-xl">{cancelledStage.icon}</span>
                </div>
              </div>

              <div className="flex-1 pt-1">
                <h5 className="font-bold text-lg text-red-500 mb-1">{cancelledStage.label}</h5>
                <p className="text-sm text-gray-600">{cancelledStage.description}</p>
                {order.cancellationReason && (
                  <div className="mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Reason:</span> {order.cancellationReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed History */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#00897B]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Status History
        </h4>

        <div className="space-y-3">
          {displayedHistory.map((entry, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[#00897B]" />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h5 className="font-semibold text-gray-900 capitalize">
                    {entry.status.replace(/_/g, ' ').replace(/-/g, ' ')}
                  </h5>
                  <span className="text-sm text-gray-500 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleString('en-GB', {
                      dateStyle: 'short',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>
                {entry.note && (
                  <p className="text-sm text-gray-600">{entry.note}</p>
                )}
                {entry.user && (
                  <p className="text-xs text-gray-500 mt-1">By {entry.user}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {statusHistory.length > 3 && (
          <button
            onClick={() => setShowAllHistory(!showAllHistory)}
            className="mt-4 w-full py-2 text-[#00897B] font-medium hover:bg-gray-50 rounded-lg transition-colors"
          >
            {showAllHistory ? '▲ Show Less' : `▼ Show ${statusHistory.length - 3} More`}
          </button>
        )}
      </div>

      {/* Order Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 shadow-md border border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h5 className="font-semibold text-gray-900">Total Time</h5>
          </div>
          <p className="text-2xl font-bold text-blue-700">
            {Math.round((new Date() - new Date(order.createdAt)) / 1000 / 60)} mins
          </p>
          <p className="text-sm text-gray-600 mt-1">Since order placed</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 shadow-md border border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h5 className="font-semibold text-gray-900">Progress</h5>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {Math.round(((currentStageIndex + 1) / timelineStages.length) * 100)}%
          </p>
          <p className="text-sm text-gray-600 mt-1">Order completion</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 shadow-md border border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h5 className="font-semibold text-gray-900">Updates</h5>
          </div>
          <p className="text-2xl font-bold text-purple-700">{statusHistory.length}</p>
          <p className="text-sm text-gray-600 mt-1">Status changes</p>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 179, 0, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(255, 179, 0, 0.8);
          }
        }

        @keyframes bounceIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes checkmark {
          0% {
            transform: scale(0) rotate(-45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(0deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-pulseGlow {
          animation: pulseGlow 2s ease-in-out infinite;
        }

        .animate-bounceIn {
          animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .animate-checkmark {
          animation: checkmark 0.4s ease-out;
        }

        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  )
}

export default OrderStatusTimeline
