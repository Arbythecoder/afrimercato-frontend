import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { lazy, Suspense, useState, useEffect } from 'react'
import CookieConsent from './components/CookieConsent'
import BetaBanner from './components/BetaBanner'
import BetaFeedbackButton from './components/BetaFeedbackButton'
import ComingSoon from './components/ComingSoon'

// Lazy load pages for code splitting - ⚡ Improves initial load time
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'))
const VendorPendingApproval = lazy(() => import('./pages/VendorPendingApproval'))
const Dashboard = lazy(() => import('./pages/vendor/Dashboard'))
const Products = lazy(() => import('./pages/vendor/Products'))
const Earnings = lazy(() => import('./pages/vendor/Earnings'))
const Orders = lazy(() => import('./pages/vendor/Orders'))
const Reports = lazy(() => import('./pages/vendor/Reports'))
const Settings = lazy(() => import('./pages/vendor/Settings'))
const Subscription = lazy(() => import('./pages/vendor/Subscription'))
const Home = lazy(() => import('./pages/Home'))
const ClientLandingPage = lazy(() => import('./pages/customer/ClientLandingPage'))
const PartnerWithUs = lazy(() => import('./pages/PartnerWithUs'))
const ClientStoresPage = lazy(() => import('./pages/ClientStoresPage'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
const Delivery = lazy(() => import('./pages/Delivery'))
const ContactUs = lazy(() => import('./pages/ContactUs'))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'))
const TermsOfService = lazy(() => import('./pages/TermsOfService'))
const ClientVendorStorefront = lazy(() => import('./pages/customer/ClientVendorStorefront'))
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'))
const ProductBrowsing = lazy(() => import('./pages/customer/ProductBrowsing'))
const ShoppingCart = lazy(() => import('./pages/customer/ShoppingCart'))
const OrderHistory = lazy(() => import('./pages/customer/OrderHistory'))
const CustomerProfile = lazy(() => import('./pages/customer/CustomerProfile'))
const Wishlist = lazy(() => import('./pages/customer/Wishlist'))
const Checkout = lazy(() => import('./pages/customer/Checkout'))
const OrderConfirmation = lazy(() => import('./pages/customer/OrderConfirmation'))
const OrderTracking = lazy(() => import('./pages/customer/OrderTracking'))
const ProductReviews = lazy(() => import('./pages/customer/ProductReviews'))
const NotificationsCenter = lazy(() => import('./pages/customer/NotificationsCenter'))
const VendorDiscovery = lazy(() => import('./pages/customer/VendorDiscovery'))
const RecipeRecommendations = lazy(() => import('./pages/customer/RecipeRecommendations'))
const ProductDetail = lazy(() => import('./pages/customer/ProductDetail'))
const OrderDetail = lazy(() => import('./pages/customer/OrderDetail'))
const RiderDashboard = lazy(() => import('./pages/rider/RiderDashboard'))
const RiderDeliveries = lazy(() => import('./pages/rider/RiderDeliveries'))
const RiderDeliveryDetail = lazy(() => import('./pages/rider/RiderDeliveryDetail'))
const RiderEarnings = lazy(() => import('./pages/rider/RiderEarnings'))
const RiderProfile = lazy(() => import('./pages/rider/RiderProfile'))
const PickerDashboard = lazy(() => import('./pages/picker/PickerDashboard'))
const PickerOrderFulfillment = lazy(() => import('./pages/picker/PickerOrderFulfillment'))
const PickerPerformance = lazy(() => import('./pages/picker/PickerPerformance'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const VendorManagement = lazy(() => import('./pages/admin/VendorManagement'))
const VendorOnboarding = lazy(() => import('./components/VendorOnboarding'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))

// Layout & Components
import VendorLayout from './components/Layout/VendorLayout'

// Loading fallback for lazy-loaded pages
function LazyLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-afri-green to-afri-green-dark">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto"></div>
        <p className="text-white mt-4 text-lg font-semibold">
          Loading page...
        </p>
      </div>
    </div>
  )
}

// Helper component to redirect based on user role
function RoleBasedRedirect() {
  const { user } = useAuth()
  const role = user?.role || user?.primaryRole || 'customer'

  switch (role) {
    case 'vendor':
      return <Navigate to="/dashboard" replace />
    case 'rider':
      return <Navigate to="/rider/dashboard" replace />
    case 'picker':
      return <Navigate to="/picker/dashboard" replace />
    case 'customer':
    default:
      return <Navigate to="/" replace />
  }
}

// Protected Route component with role-based access control
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth()
  const role = user?.role || user?.primaryRole
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-afri-green to-afri-green-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto"></div>
          <p className="text-white mt-4 text-lg font-semibold">Loading...</p>
        </div>
      </div>
    )
  }
  
  if (!user) return <Navigate to="/login" replace />
  
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on actual role
    const redirectPath = role === 'vendor' ? '/dashboard' : '/'
    return <Navigate to={redirectPath} replace />
  }
  
  return children
}

function AppContent() {
  const { isAuthenticated, user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-afri-green to-afri-green-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto"></div>
          <p className="text-white mt-4 text-lg font-semibold">
            Loading Afrimercato...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <BetaBanner />
      <VendorBanner />
      <Suspense fallback={<LazyLoadingFallback />}>
      <Routes>
      {/* Public Routes - Customer Marketplace */}
      {/* CLIENT-EXACT Landing Page - Just Eats / Uber Eats style with location-first approach */}
      <Route path="/" element={<ClientLandingPage />} />
      <Route path="/old-home" element={<Home />} /> {/* Keep old version for reference */}
      <Route path="/partner" element={<PartnerWithUs />} />
      <Route path="/stores" element={<ClientStoresPage />} />
      <Route path="/store/:vendorId" element={<ClientVendorStorefront />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/delivery" element={<Delivery />} />
      <Route path="/contact" element={<ContactUs />} />

      {/* GDPR Compliance Pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />

      <Route path="/products" element={<ProductBrowsing />} />
      <Route path="/cart" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <ShoppingCart />
        </ProtectedRoute>
      } />
      <Route path="/orders" element={<OrderHistory />} />
      <Route path="/profile" element={<CustomerProfile />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/product/:productId/reviews" element={<ProductReviews />} />
      <Route path="/notifications" element={<NotificationsCenter />} />
      <Route path="/discover" element={<VendorDiscovery />} />
      <Route path="/recipes" element={<RecipeRecommendations />} />
      <Route path="/product/:productId" element={<ProductDetail />} />
      <Route path="/order/:orderId" element={<OrderDetail />} />

      {/* Customer Dashboard */}
      <Route
        path="/my-dashboard"
        element={
          isAuthenticated ? (
            <CustomerDashboard />
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Checkout & Order Routes */}
      <Route path="/checkout" element={
        <ProtectedRoute allowedRoles={['customer']}>
          <Checkout />
        </ProtectedRoute>
      } />
      <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
      <Route path="/track-order/:orderId" element={<OrderTracking />} />

      {/* Rider Routes */}
      <Route path="/rider/dashboard" element={isAuthenticated ? <RiderDashboard /> : <Navigate to="/login" />} />
      <Route path="/rider/deliveries" element={isAuthenticated ? <RiderDeliveries /> : <Navigate to="/login" />} />
      <Route path="/rider/delivery/:deliveryId" element={isAuthenticated ? <RiderDeliveryDetail /> : <Navigate to="/login" />} />
      <Route path="/rider/earnings" element={isAuthenticated ? <RiderEarnings /> : <Navigate to="/login" />} />
      <Route path="/rider/profile" element={isAuthenticated ? <RiderProfile /> : <Navigate to="/login" />} />

      {/* Picker Routes */}
      <Route path="/picker/dashboard" element={isAuthenticated ? <PickerDashboard /> : <Navigate to="/login" />} />
      <Route path="/picker/order/:orderId" element={isAuthenticated ? <PickerOrderFulfillment /> : <Navigate to="/login" />} />
      <Route path="/picker/performance" element={isAuthenticated ? <PickerPerformance /> : <Navigate to="/login" />} />

      <Route
        path="/login"
        element={isAuthenticated ? <RoleBasedRedirect /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <RoleBasedRedirect /> : <Register />}
      />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* OAuth Callback Route */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      {/* Vendor Pending Approval Route */}
      <Route path="/vendor/pending-approval" element={<VendorPendingApproval />} />

      {/* Vendor Onboarding */}
      <Route path="/vendor/onboarding" element={<VendorOnboarding />} />

      {/* New Production Vendor Dashboard */}
      <Route
        path="/vendor-dashboard"
        element={
          isAuthenticated ? (
            user?.role === 'vendor' ? (
              <Dashboard />
            ) : (
              <RoleBasedRedirect />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Protected Routes - Vendor Only */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            user?.role === 'vendor' ? (
              <VendorLayout>
                <Dashboard />
              </VendorLayout>
            ) : (
              <RoleBasedRedirect />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/vendor/products"
        element={
          isAuthenticated ? (
            user?.role === 'vendor' ? (
              <VendorLayout>
                <Products />
              </VendorLayout>
            ) : (
              <RoleBasedRedirect />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/vendor/earnings"
        element={
          isAuthenticated ? (
            user?.role === 'vendor' ? (
              <VendorLayout>
                <Earnings />
              </VendorLayout>
            ) : (
              <RoleBasedRedirect />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/orders"
        element={
          isAuthenticated ? (
            user?.role === 'vendor' ? (
              <VendorLayout>
                <Orders />
              </VendorLayout>
            ) : (
              <RoleBasedRedirect />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/reports"
        element={
          isAuthenticated ? (
            user?.role === 'vendor' ? (
              <VendorLayout>
                <Reports />
              </VendorLayout>
            ) : (
              <RoleBasedRedirect />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/subscription"
        element={
          isAuthenticated ? (
            user?.role === 'vendor' ? (
              <VendorLayout>
                <Subscription />
              </VendorLayout>
            ) : (
              <RoleBasedRedirect />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            user?.role === 'vendor' ? (
              <VendorLayout>
                <Settings />
              </VendorLayout>
            ) : (
              <RoleBasedRedirect />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          isAuthenticated ? (
            user?.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/admin/vendors"
        element={
          isAuthenticated ? (
            user?.role === 'admin' ? (
              <VendorManagement />
            ) : (
              <Navigate to="/" />
            )
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
    </Suspense>
    </>
  )
}

// Small floating banner to surface vendor onboarding
function VendorBanner() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // Don't show the banner to authenticated users or on admin/vendor/rider/picker pages
  if (isAuthenticated) return null
  const path = location.pathname || ''
  if (path.startsWith('/vendor') || path.startsWith('/rider') || path.startsWith('/picker') || path.startsWith('/admin') || path.startsWith('/login') || path.startsWith('/register')) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Link
        to="/register?role=vendor"
        className="bg-afri-green text-white px-4 py-2 rounded-lg shadow-lg hover:opacity-95"
      >
        Become a vendor
      </Link>
    </div>
  )
}

// Persistent dark/light mode toggle
function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    if (dark) {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
      localStorage.setItem('theme', 'light')
    }
  }, [dark])

  return (
    <button
      onClick={() => setDark(d => !d)}
      className="fixed bottom-4 left-4 z-50 w-10 h-10 rounded-full bg-gray-800 dark:bg-yellow-400 text-white dark:text-gray-900 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Toggle dark mode"
      title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {dark ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/></svg>
      ) : (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/></svg>
      )}
    </button>
  )
}

// Live Chat floating button — WhatsApp direct link
function LiveChatButton() {
  const phone = '447778285855' // +44 7778 285855
  const message = encodeURIComponent('Hi Afrimercato, I need help with my order.')
  return (
    <a
      href={`https://wa.me/${phone}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-36 right-4 sm:right-6 z-50 flex items-center gap-2 bg-[#25D366] hover:bg-[#1ebe57] text-white px-4 py-3 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 font-semibold text-sm"
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      Live Chat
    </a>
  )
}

function App() {
  return (
    <AuthProvider>
      <ComingSoon>
        <AppContent />
        <ThemeToggle />
        <LiveChatButton />
        <BetaFeedbackButton />
        <CookieConsent />
      </ComingSoon>
    </AuthProvider>
  )
}

export default App
