import { isFeatureEnabled, FEATURE_INFO } from '../config/features'
import { Link } from 'react-router-dom'

/**
 * FeatureGate - Conditionally render children based on feature flag
 * Shows "Coming Soon" UI for disabled features
 * 
 * Usage:
 * <FeatureGate featureKey="RIDER_DASHBOARD">
 *   <RiderDashboard />
 * </FeatureGate>
 */
export function FeatureGate({ featureKey, children, fallback }) {
  const isEnabled = isFeatureEnabled(featureKey)
  
  if (!isEnabled) {
    return fallback || <ComingSoonCard featureKey={featureKey} />
  }
  
  return children
}

/**
 * ComingSoonCard - Default fallback UI for disabled features
 */
export function ComingSoonCard({ featureKey }) {
  const info = FEATURE_INFO[featureKey] || {
    name: 'Feature',
    description: 'This feature is under development',
    eta: 'Coming soon'
  }
  
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md text-center bg-white rounded-2xl shadow-xl p-8 border-t-4 border-afri-gold">
        <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🚧</span>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {info.name}
        </h2>
        
        <p className="text-gray-600 mb-4">
          {info.description}
        </p>
        
        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <span className="font-semibold">Expected:</span> {info.eta}
          </p>
        </div>
        
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-afri-green text-white rounded-lg font-semibold hover:bg-afri-green-dark transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

/**
 * ComingSoonPage - Full page "Coming Soon" for entire routes
 */
export function ComingSoonPage({ feature, backTo = '/' }) {
  const info = FEATURE_INFO[feature] || {
    name: feature || 'Feature',
    description: 'This section is under construction',
    eta: 'Coming soon'
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border-t-4 border-afri-gold">
          {/* Construction Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
            <span className="text-5xl">🏗️</span>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {info.name}
          </h1>
          
          {/* Description */}
          <p className="text-gray-600 text-lg mb-6">
            {info.description}
          </p>
          
          {/* ETA Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full mb-8">
            <span className="text-lg">⏰</span>
            <span className="font-semibold text-yellow-800">{info.eta}</span>
          </div>
          
          {/* Progress Illustration */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-4 h-4 bg-afri-green rounded-full animate-pulse"></div>
              <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse delay-100"></div>
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
              <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
            </div>
            <p className="text-sm text-gray-500">Development in progress</p>
          </div>
          
          {/* Features Coming */}
          <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">What to expect:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Full feature access</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Real-time updates</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Mobile-friendly design</span>
              </li>
            </ul>
          </div>
          
          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to={backTo}
              className="px-6 py-3 bg-afri-green text-white rounded-lg font-semibold hover:bg-afri-green-dark transition"
            >
              Go Back
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 border-2 border-afri-green text-afri-green rounded-lg font-semibold hover:bg-afri-green hover:text-white transition"
            >
              Get Notified
            </Link>
          </div>
        </div>
        
        {/* Footer */}
        <p className="mt-6 text-sm text-gray-500">
          Questions? Contact us at{' '}
          <a href="mailto:support@afrimercato.com" className="text-afri-green hover:underline">
            support@afrimercato.com
          </a>
        </p>
      </div>
    </div>
  )
}

/**
 * FeatureBadge - Small indicator for features that are in beta/coming soon
 */
export function FeatureBadge({ status = 'coming-soon' }) {
  const styles = {
    'coming-soon': 'bg-yellow-100 text-yellow-800',
    'beta': 'bg-blue-100 text-blue-800',
    'new': 'bg-green-100 text-green-800',
    'deprecated': 'bg-red-100 text-red-800'
  }
  
  const labels = {
    'coming-soon': '🚧 Coming Soon',
    'beta': '🧪 Beta',
    'new': '✨ New',
    'deprecated': '⚠️ Deprecated'
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export default FeatureGate
