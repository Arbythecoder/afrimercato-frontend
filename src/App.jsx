import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Settings from './pages/Settings'
import Subscription from './pages/Subscription'

// Layout
import VendorLayout from './components/Layout/VendorLayout'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-afri-green to-afri-green-dark">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto"></div>
          <p className="text-white mt-4 text-lg font-semibold">Loading Afrimercato...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
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
    </Router>
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
