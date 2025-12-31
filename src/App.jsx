import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import OAuthCallback from './pages/OAuthCallback'
import Dashboard from './pages/vendor/Dashboard'
import Products from './pages/vendor/Products'
import Orders from './pages/vendor/Orders'
import Reports from './pages/vendor/Reports'
import Settings from './pages/vendor/Settings'
import Subscription from './pages/vendor/Subscription'
import Home from './pages/Home'
import ClientLandingPage from './pages/customer/ClientLandingPage' // Client-exact design matching Just Eats
import PartnerWithUs from './pages/PartnerWithUs'
import ClientStoresPage from './pages/ClientStoresPage' // Client-exact stores page
import AboutUs from './pages/AboutUs'
import Delivery from './pages/Delivery'
import ContactUs from './pages/ContactUs'

// Customer Pages
import ClientVendorStorefront from './pages/customer/ClientVendorStorefront' // Client-exact vendor storefront
import CustomerDashboard from './pages/customer/CustomerDashboard'
import ProductBrowsing from './pages/customer/ProductBrowsing'
import ShoppingCart from './pages/customer/ShoppingCart'
import OrderHistory from './pages/customer/OrderHistory'
import CustomerProfile from './pages/customer/CustomerProfile'
import Wishlist from './pages/customer/Wishlist'
import Checkout from './pages/customer/Checkout'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import OrderTracking from './pages/customer/OrderTracking'
import ProductReviews from './pages/customer/ProductReviews'
import NotificationsCenter from './pages/customer/NotificationsCenter'
import VendorDiscovery from './pages/customer/VendorDiscovery'
import RecipeRecommendations from './pages/customer/RecipeRecommendations'
import ProductDetail from './pages/customer/ProductDetail'
import OrderDetail from './pages/customer/OrderDetail'

// Rider Pages
import RiderDashboard from './pages/rider/RiderDashboard'
import RiderDeliveries from './pages/rider/RiderDeliveries'
import RiderDeliveryDetail from './pages/rider/RiderDeliveryDetail'
import RiderEarnings from './pages/rider/RiderEarnings'
import RiderProfile from './pages/rider/RiderProfile'

// Picker Pages
import PickerDashboard from './pages/picker/PickerDashboard'
import PickerOrderFulfillment from './pages/picker/PickerOrderFulfillment'
import PickerPerformance from './pages/picker/PickerPerformance'

// Layout
import VendorLayout from './components/Layout/VendorLayout'

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
        path="/products"
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
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
