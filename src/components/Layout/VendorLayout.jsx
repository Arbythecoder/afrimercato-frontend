import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationDropdown from '../Notifications/NotificationDropdown'
import VendorOnboarding from '../VendorOnboarding'
import { getVendorProfile } from '../../services/api'

function VendorLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [hasProfile, setHasProfile] = useState(null) // null = loading, true = has profile, false = no profile
  const [checkingProfile, setCheckingProfile] = useState(true)

  // Check if vendor has a profile
  useEffect(() => {
    const checkVendorProfile = async () => {
      try {
        const response = await getVendorProfile()
        setHasProfile(response.success && response.data)
      } catch (error) {
        // If error code is VENDOR_PROFILE_NOT_FOUND, they need to create a profile
        if (error.response?.data?.errorCode === 'VENDOR_PROFILE_NOT_FOUND') {
          setHasProfile(false)
        } else if (error.message?.includes('Vendor profile not found')) {
          setHasProfile(false)
        } else {
          console.error('Error checking vendor profile:', error)
          setHasProfile(false)
        }
      } finally {
        setCheckingProfile(false)
      }
    }

    if (user?.role === 'vendor') {
      checkVendorProfile()
    } else {
      setCheckingProfile(false)
    }
  }, [user])

  // Loading state
  if (checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-afri-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show onboarding if no profile
  if (hasProfile === false) {
    return <VendorOnboarding onComplete={() => setHasProfile(true)} />
  }

  const navigation = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Products', path: '/products', icon: '📦' },
    { name: 'Orders', path: '/orders', icon: '🛒' },
    { name: 'Reports', path: '/reports', icon: '📈' },
    { name: 'Subscription', path: '/subscription', icon: '💳' },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

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
