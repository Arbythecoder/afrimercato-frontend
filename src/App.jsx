import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/vendor/Dashboard'
import Products from './pages/vendor/Products'
import Orders from './pages/vendor/Orders'
import Reports from './pages/vendor/Reports'
import Settings from './pages/vendor/Settings'
import Subscription from './pages/vendor/Subscription'
import Home from './pages/Home'
import BetterLandingPage from './pages/customer/BetterLandingPage' // New revolutionary landing page
import PartnerWithUs from './pages/PartnerWithUs'
import StoresPage from './pages/StoresPage'

// Customer Pages
import VendorStorefront from './pages/customer/VendorStorefront'
import CustomerDashboard from './pages/customer/CustomerDashboard'
import Checkout from './pages/customer/Checkout'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import OrderTracking from './pages/customer/OrderTracking'

// Layout
import VendorLayout from './components/Layout/VendorLayout'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

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
      {/* REVOLUTIONARY Mobile-First Landing Page with 4 game-changing features */}
      <Route path="/" element={<BetterLandingPage />} />
      <Route path="/old-home" element={<Home />} /> {/* Keep old version for reference */}
      <Route path="/partner" element={<PartnerWithUs />} />
      <Route path="/stores" element={<StoresPage />} />
      <Route path="/store/:vendorId" element={<VendorStorefront />} />

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

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />}
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          isAuthenticated ? (
            <VendorLayout>
              <Dashboard />
            </VendorLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/products"
        element={
          isAuthenticated ? (
            <VendorLayout>
              <Products />
            </VendorLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/orders"
        element={
          isAuthenticated ? (
            <VendorLayout>
              <Orders />
            </VendorLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/reports"
        element={
          isAuthenticated ? (
            <VendorLayout>
              <Reports />
            </VendorLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/subscription"
        element={
          isAuthenticated ? (
            <VendorLayout>
              <Subscription />
            </VendorLayout>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/settings"
        element={
          isAuthenticated ? (
            <VendorLayout>
              <Settings />
            </VendorLayout>
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
