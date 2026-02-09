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
      <Route path="/cart" element={<ShoppingCart />} />
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
      <Route path="/checkout" element={<Checkout />} />
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
        to="/vendor/onboarding"
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
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
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

function App() {
  return (
    <AuthProvider>
      <ComingSoon>
        <AppContent />
        <ThemeToggle />
        <BetaFeedbackButton />
        <CookieConsent />
      </ComingSoon>
    </AuthProvider>
  )
}

export default App
