import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { customerAPI } from '../../services/api'
import { getProductImage } from '../../utils/defaultImages'

function Wishlist() {
  const navigate = useNavigate()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWishlist()
  }, [])

  const fetchWishlist = async () => {
    try {
      setLoading(true)
      const response = await customerAPI.getWishlist()
      if (response.success) {
        setWishlist(response.data || [])
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      await customerAPI.removeFromWishlist(productId)
      setWishlist(prev => prev.filter(item => (item._id || item.productId) !== productId))
    } catch (error) {
      console.error('Error removing from wishlist:', error)
    }
  }

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
    const existingIndex = cart.findIndex(item => item._id === product._id)

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }

    localStorage.setItem('afrimercato_cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    alert(`${product.name} added to cart!`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-afri-green to-afri-green-dark text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold">My Wishlist</h1>
          <p className="text-afri-green-light mt-1">{wishlist.length} saved items</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="bg-gray-200 h-40 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 w-2/3 rounded"></div>
              </div>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <span className="text-8xl">❤️</span>
            <h2 className="text-2xl font-bold text-gray-900 mt-6">Your wishlist is empty</h2>
            <p className="text-gray-500 mt-2">Save items you love for later!</p>
            <button
              onClick={() => navigate('/products')}
              className="mt-6 px-8 py-3 bg-afri-green text-white rounded-xl font-semibold"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const product = item.product || item
              return (
                <div
                  key={item._id || product._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all group"
                >
                  <div className="relative">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-48 object-cover cursor-pointer group-hover:scale-105 transition-transform"
                      onClick={() => navigate(`/product/${product._id}`)}
                    />
                    <button
                      onClick={() => removeFromWishlist(product._id)}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50"
                    >
                      ❌
                    </button>
                  </div>

                  <div className="p-4">
                    <h3
                      className="font-semibold text-gray-900 mb-1 line-clamp-2 cursor-pointer hover:text-afri-green"
                      onClick={() => navigate(`/product/${product._id}`)}
                    >
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">{product.unit || 'per item'}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-afri-green">
                        £{product.price?.toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-afri-green text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-afri-green-dark"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
