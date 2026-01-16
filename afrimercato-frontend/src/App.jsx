import { Routes, Route, Navigate, Suspense } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { lazy } from 'react'

// Lazy load pages for code splitting - ⚡ Improves initial load time
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const OAuthCallback = lazy(() => import('./pages/OAuthCallback'))
const VendorPendingApproval = lazy(() => import('./pages/VendorPendingApproval'))
const Dashboard = lazy(() => import('./pages/vendor/Dashboard'))
const Products = lazy(() => import('./pages/vendor/Products'))
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
const VendorDashboardPage = lazy(() => import('./pages/VendorDashboard/VendorDashboardPage'))
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

// Layout & Components
import VendorLayout from './components/Layout/VendorLayout'
import CookieConsent from './components/CookieConsent'

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

      {/* OAuth Callback Route */}
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      {/* Vendor Pending Approval Route */}
      <Route path="/vendor/pending-approval" element={<VendorPendingApproval />} />

      {/* New Production Vendor Dashboard */}
      <Route
        path="/vendor-dashboard"
        element={
          isAuthenticated ? (
            user?.role === 'vendor' ? (
              <VendorDashboardPage />
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
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <CookieConsent />
    </AuthProvider>
  )
}

export default App
