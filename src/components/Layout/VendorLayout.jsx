import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationDropdown from '../Notifications/NotificationDropdown'
import { vendorAPI } from '../../services/api'

function VendorLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [vendorStatus, setVendorStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Products', path: '/products', icon: '📦' },
    { name: 'Orders', path: '/orders', icon: '🛒' },
    { name: 'Reports', path: '/reports', icon: '📈' },
    { name: 'Subscription', path: '/subscription', icon: '💳' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ]

  useEffect(() => {
    fetchVendorStatus()
  }, [])

  const fetchVendorStatus = async () => {
    try {
      const response = await vendorAPI.getProfile()
      if (response.data.success) {
        setVendorStatus(response.data.data)
      }
    } catch (err) {
      console.error('Failed to load vendor status:', err)
      // If vendor profile doesn't exist, they need to create one
      if (err.response?.status === 404 || err.response?.status === 403) {
        setVendorStatus({ approvalStatus: 'no_profile' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  // Check vendor approval status
  const isPending = vendorStatus?.approvalStatus === 'pending'
  const isRejected = vendorStatus?.approvalStatus === 'rejected'
  const isSuspended = vendorStatus?.approvalStatus === 'suspended'
  const isApproved = vendorStatus?.approvalStatus === 'approved'

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-afri-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show verification pending screen (BLOCKS ENTIRE DASHBOARD)
  if (isPending || isRejected || isSuspended) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-afri-green mb-2">Afrimercato</h1>
            <p className="text-gray-600">Vendor Dashboard</p>
          </div>

          {/* Pending Verification Card */}
          {isPending && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-yellow-400">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Verification Pending</h2>
                <p className="text-gray-600">Your application is being reviewed</p>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-yellow-900 mb-3">What's happening?</h3>
                <p className="text-yellow-800 mb-4">
                  Our automated verification system is reviewing your vendor application. This process typically takes <strong>24-48 hours</strong>.
                </p>
                <div className="space-y-2 text-sm text-yellow-700">
                  <p>✓ Your account has been created</p>
                  <p>⏳ Verification in progress</p>
                  <p className="text-xs text-yellow-600 mt-3">
                    Submitted: {vendorStatus?.submittedForReviewAt ? new Date(vendorStatus.submittedForReviewAt).toLocaleString() : new Date(vendorStatus?.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Once approved, you'll be able to:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Add and manage your products</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Receive and fulfill customer orders</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Access analytics and sales reports</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span>Manage your store settings and profile</span>
                  </li>
                </ul>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p className="mb-4">You'll receive an email notification once your account is approved.</p>
                <p>Need help? Contact us at <a href="mailto:vendors@afrimercato.com" className="text-afri-green hover:underline">vendors@afrimercato.com</a></p>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          {/* Rejected Card */}
          {isRejected && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-red-500">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Not Approved</h2>
              </div>

              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-red-900 mb-2">Rejection Reason:</h3>
                <p className="text-red-800">
                  {vendorStatus?.rejectionReason || 'Your vendor application was not approved at this time.'}
                </p>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p className="mb-4">Please contact our support team for more information.</p>
                <p className="mb-6">Email: <a href="mailto:vendors@afrimercato.com" className="text-afri-green hover:underline">vendors@afrimercato.com</a></p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Logout
                </button>
                <a
                  href="mailto:vendors@afrimercato.com"
                  className="px-6 py-2 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark transition"
                >
                  Contact Support
                </a>
              </div>
            </div>
          )}

          {/* Suspended Card */}
          {isSuspended && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border-t-4 border-orange-500">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full mb-4">
                  <svg className="w-10 h-10 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Suspended</h2>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg mb-6">
                <h3 className="font-semibold text-orange-900 mb-2">Suspension Reason:</h3>
                <p className="text-orange-800">
                  {vendorStatus?.approvalNote || 'Your vendor account has been temporarily suspended.'}
                </p>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p className="mb-4">Please contact support to resolve this issue.</p>
                <p className="mb-6">Email: <a href="mailto:vendors@afrimercato.com" className="text-afri-green hover:underline">vendors@afrimercato.com</a></p>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Logout
                </button>
                <a
                  href="mailto:vendors@afrimercato.com"
                  className="px-6 py-2 bg-afri-green text-white rounded-lg hover:bg-afri-green-dark transition"
                >
                  Contact Support
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 bg-gradient-to-r from-afri-green to-afri-green-dark">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-2xl font-bold text-white">Afrimercato</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:text-afri-yellow"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-afri-green text-white flex items-center justify-center font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'V'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Vendor'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-afri-green text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <span className="text-xl">🚪</span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex-1 lg:flex-none"></div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <NotificationDropdown />

              {/* User menu */}
              <div className="hidden lg:flex items-center space-x-2 text-sm">
                <span className="font-medium text-gray-700">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

export default VendorLayout
