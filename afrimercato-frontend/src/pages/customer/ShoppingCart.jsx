import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProductImage } from '../../utils/defaultImages'

function ShoppingCart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCart()
    window.addEventListener('cartUpdated', loadCart)
    return () => window.removeEventListener('cartUpdated', loadCart)
  }, [])

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
    setCart(savedCart)
    setLoading(false)
  }

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItem(productId)
      return
    }

    const updatedCart = cart.map(item =>
      item._id === productId ? { ...item, quantity: newQuantity } : item
    )
    setCart(updatedCart)
    localStorage.setItem('afrimercato_cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (productId) => {
    const updatedCart = cart.filter(item => item._id !== productId)
    setCart(updatedCart)
    localStorage.setItem('afrimercato_cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem('afrimercato_cart')
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = subtotal > 30 ? 0 : 3.99
  const total = subtotal + deliveryFee

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
          <p className="text-afri-green-light mt-1">{cart.length} items in your cart</p>
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
                  onClick={() => navigate('/checkout')}
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
