import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProductImage } from '../../utils/defaultImages'
import { useAuth } from '../../context/AuthContext'
import { cartAPI } from '../../services/api'

// Helper to check if an ID is a valid MongoDB ObjectId (24 hex characters)
const isValidMongoId = (id) => {
  if (!id) return false
  const stringId = String(id)
  return /^[0-9a-fA-F]{24}$/.test(stringId)
}

function ShoppingCart() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [repeatPurchaseFrequency, setRepeatPurchaseFrequency] = useState(null)

  useEffect(() => {
    loadCart()
    window.addEventListener('cartUpdated', loadCart)
    return () => window.removeEventListener('cartUpdated', loadCart)
  }, [isAuthenticated])

  // Sync localStorage cart to backend when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      syncLocalCartToBackend()
    }
  }, [isAuthenticated])

  const syncLocalCartToBackend = async () => {
    if (!user?.roles?.includes('customer')) return
    const localCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
    if (localCart.length === 0) return

    try {
      setSyncing(true)
      // Add each local item to backend cart (only if valid MongoDB ObjectId)
      for (const item of localCart) {
        const itemId = item._id || item.id
        if (isValidMongoId(itemId)) {
          await cartAPI.add(itemId, item.quantity)
        }
      }
      // Clear localStorage after sync attempt
      localStorage.removeItem('afrimercato_cart')
      // Reload cart from backend
      await loadCart()
    } catch (error) {
      console.error('Failed to sync cart:', error)
    } finally {
      setSyncing(false)
    }
  }

  const loadCart = async () => {
    try {
      setLoading(true)

      if (isAuthenticated && !user?.roles?.includes('customer')) {
        setLoading(false)
        return
      }

      if (isAuthenticated) {
        // Load from backend
        const response = await cartAPI.get()
        if (response.success) {
          // Transform backend cart format to frontend format
          const backendCart = response.data.map(item => ({
            _id: item.productId?.toString() || item.productId,
            name: item.name || 'Product',
            price: item.price,
            quantity: item.quantity,
            unit: item.unit || 'piece',
            images: item.images,
            vendor: item.vendor
          }))
          setCart(backendCart)
        }
      } else {
        // Load from localStorage for guests
        const savedCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
        setCart(savedCart)
      }
    } catch (error) {
      console.error('Failed to load cart:', error)
      // Fallback to localStorage
      const savedCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
      setCart(savedCart)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId)
      return
    }

    // Store previous cart for rollback
    const previousCart = [...cart]

    // Optimistic update
    const updatedCart = cart.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    )
    setCart(updatedCart)

    if (isAuthenticated && isValidMongoId(productId)) {
      try {
        const response = await cartAPI.update(productId, newQuantity)
        if (!response.success) {
          // Rollback on failure
          console.error('Cart update failed:', response.message)
          setCart(previousCart)
        }
      } catch (error) {
        console.error('Failed to update cart:', error)
        // Rollback on error
        setCart(previousCart)
        // Reload to ensure sync with backend
        loadCart()
      }
    } else if (!isAuthenticated) {
      localStorage.setItem('afrimercato_cart', JSON.stringify(updatedCart))
    }

    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = async (productId) => {
    // Store previous cart for rollback
    const previousCart = [...cart]

    // Optimistic update
    const updatedCart = cart.filter(item => item._id !== productId)
    setCart(updatedCart)

    if (isAuthenticated && isValidMongoId(productId)) {
      try {
        const response = await cartAPI.remove(productId)
        if (!response.success) {
          console.error('Failed to remove item:', response.message)
          setCart(previousCart)
        }
      } catch (error) {
        console.error('Failed to remove item:', error)
        setCart(previousCart)
        loadCart()
      }
    } else if (!isAuthenticated) {
      localStorage.setItem('afrimercato_cart', JSON.stringify(updatedCart))
    }

    window.dispatchEvent(new Event('cartUpdated'))
  }

  const clearCart = async () => {
    setCart([])

    if (isAuthenticated) {
      try {
        await cartAPI.clear()
      } catch (error) {
        console.error('Failed to clear cart:', error)
      }
    } else {
      localStorage.removeItem('afrimercato_cart')
    }

    window.dispatchEvent(new Event('cartUpdated'))
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = subtotal > 30 ? 0 : 3.99
  const total = subtotal + deliveryFee

  // Role mismatch — vendor/rider/picker trying to shop
  if (isAuthenticated && !user?.roles?.includes('customer')) {
    const currentRole = user?.roles?.includes('vendor') ? 'Vendor'
      : user?.roles?.includes('rider') ? 'Rider'
      : user?.roles?.includes('picker') ? 'Picker'
      : user?.roles?.includes('admin') ? 'Admin'
      : 'Non-Customer'
    const roleIcon = user?.roles?.includes('vendor') ? '🏪'
      : user?.roles?.includes('rider') ? '🏍️'
      : user?.roles?.includes('picker') ? '📦' : '⚠️'

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#E0F2F1] flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">{roleIcon}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Wrong Account Type</h1>
            <p className="text-gray-600 mb-1">You're currently signed in as a</p>
            <p className="text-lg font-bold text-[#00897B] mb-4">{currentRole}</p>
            <p className="text-gray-500 text-sm mb-6">
              Shopping and checkout are only available for <strong>Customer</strong> accounts.
              Please sign in with a Customer account to continue.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('afrimercato_token')
                navigate('/login')
              }}
              className="w-full bg-[#00897B] hover:bg-[#00695C] text-white py-3 px-6 rounded-xl font-bold text-lg transition-all mb-3"
            >
              Sign in as Customer
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full text-gray-500 hover:text-gray-700 py-2 font-medium transition-colors"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-afri-green-light mt-1">
            {cart.length} items in your cart
            {syncing && <span className="ml-2 text-sm">(Syncing...)</span>}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {cart.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <span className="text-8xl">🛒</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-6">Your cart is empty</h2>
            <p className="text-gray-500 mt-2">Add some delicious products to get started!</p>
            <button
              onClick={() => navigate('/products')}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Cart Items</h2>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-600 text-sm font-semibold"
                >
                  Clear All
                </button>
              </div>

              {cart.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-lg p-4 flex gap-4 hover:shadow-xl transition-shadow"
                >
                  <img
                    src={getProductImage(item)}
                    alt={item.name}
                    className="w-24 h-24 rounded-lg object-cover cursor-pointer"
                    onClick={() => navigate(`/product/${item._id}`)}
                  />

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3
                          className="font-semibold text-gray-900 hover:text-afri-green cursor-pointer"
                          onClick={() => navigate(`/product/${item._id}`)}
                        >
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-500">{item.unit || 'per item'}</p>
                        <p className="text-sm text-afri-green">{item.vendor?.storeName || 'AfriMercato'}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors h-fit"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-bold"
                        >
                          −
                        </button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-afri-green text-white hover:bg-afri-green-dark flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-afri-green">
                          £{(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">£{item.price.toFixed(2)} each</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Repeat Purchase Section */}
              <div className="bg-gradient-to-br from-afri-green-light/10 to-afri-green/10 rounded-xl p-6 border border-afri-green-light">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🔄 Set item(s) for repurchase</h3>
                <p className="text-sm text-gray-600 mb-4">Never run out of your favorites! Select how often you'd like this order to repeat automatically.</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'].map((frequency) => (
                    <button
                      key={frequency}
                      onClick={() => setRepeatPurchaseFrequency(
                        repeatPurchaseFrequency === frequency.toLowerCase().replace('-', '-') ? null : frequency.toLowerCase().replace('-', '-')
                      )}
                      className={`py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                        repeatPurchaseFrequency === frequency.toLowerCase().replace('-', '-')
                          ? 'bg-afri-green text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-afri-green-light hover:border-afri-green hover:bg-afri-green-light/5'
                      }`}
                    >
                      <span className="block text-sm">{frequency}</span>
                    </button>
                  ))}
                </div>

                {repeatPurchaseFrequency && (
                  <div className="mt-4 p-3 bg-afri-green-light/10 rounded-lg border-l-4 border-afri-green">
                    <p className="text-sm text-gray-700">
                      ✓ This order will repeat <span className="font-bold capitalize">{repeatPurchaseFrequency}</span> until you cancel.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                <div className="space-y-3 pb-4 border-b">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                    <span>£{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery</span>
                    <span className={deliveryFee === 0 ? 'text-green-600 font-semibold' : ''}>
                      {deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal < 30 && (
                    <p className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded-lg">
                      Add £{(30 - subtotal).toFixed(2)} more for FREE delivery!
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center py-4 text-lg font-bold">
                  <span>Total</span>
                  <span className="text-afri-green text-2xl">£{total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => {
                    // Store repeat purchase preference before checkout
                    if (repeatPurchaseFrequency) {
                      localStorage.setItem('repeatPurchaseFrequency', repeatPurchaseFrequency)
                    } else {
                      localStorage.removeItem('repeatPurchaseFrequency')
                    }
                    navigate('/checkout')
                  }}
                  className="w-full py-4 bg-gradient-to-r from-afri-green to-afri-green-dark text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:scale-105"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full py-3 mt-3 border-2 border-afri-green text-afri-green rounded-xl font-semibold hover:bg-afri-green hover:text-white transition-all"
                >
                  Continue Shopping
                </button>

                {/* Trust Badges */}
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span>🔒</span> Secure Payment
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span>🚚</span> Fast Delivery
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>↩️</span> Easy Returns
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingCart
