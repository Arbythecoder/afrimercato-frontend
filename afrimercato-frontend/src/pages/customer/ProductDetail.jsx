import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productAPI, customerAPI, cartAPI } from '../../services/api'
import { getProductImage } from '../../utils/defaultImages'
import { useAuth } from '../../context/AuthContext'
import { checkVendorLock } from '../../utils/cartVendorLock'
import VendorSwitchModal from '../../components/customer/VendorSwitchModal'

function ProductDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [addingToCart, setAddingToCart] = useState(false)
  const [vendorSwitchModal, setVendorSwitchModal] = useState({
    isOpen: false,
    currentStoreName: '',
    newStoreName: '',
    pendingProduct: null,
    pendingQuantity: 1
  })

  useEffect(() => {
    fetchProduct()
    checkWishlistStatus()
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await productAPI.getById(productId)
      if (response.success) {
        setProduct(response.data)
        // Fetch related products
        const relatedResponse = await productAPI.getProducts({
          category: response.data.category,
          limit: 4
        })
        if (relatedResponse.success) {
          setRelatedProducts(
            (relatedResponse.data.products || relatedResponse.data || [])
              .filter(p => p._id !== productId)
              .slice(0, 4)
          )
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkWishlistStatus = async () => {
    if (!isAuthenticated) return
    
    try {
      const response = await customerAPI.getWishlist()
      if (response.success && response.data) {
        const wishlistIds = response.data.map(item => item.product?._id || item.product)
        setIsWishlisted(wishlistIds.includes(productId))
      }
    } catch (error) {
      // Silent fail - wishlist is optional feature
      console.debug('Failed to load wishlist status:', error)
    }
  }

  const addToCart = async () => {
    setAddingToCart(true)
    try {
      // Get current cart
      const currentCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
      
      // Check vendor lock
      const lockCheck = checkVendorLock(product, currentCart)
      
      if (lockCheck.needsConfirmation) {
        // Show modal
        setVendorSwitchModal({
          isOpen: true,
          currentStoreName: lockCheck.currentVendorName,
          newStoreName: lockCheck.newVendorName,
          pendingProduct: product,
          pendingQuantity: quantity
        })
        setAddingToCart(false)
        return
      }

      // Proceed with adding
      await performAddToCart(product, quantity)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart. Please try again.')
    } finally {
      setAddingToCart(false)
    }
  }

  const performAddToCart = async (prod, qty) => {
    try {
      if (isAuthenticated) {
        // Use backend cart API for authenticated users
        await cartAPI.add(prod._id, qty)
      } else {
        // Use localStorage for guests
        const cart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
        const existingIndex = cart.findIndex(item => item._id === prod._id)

        if (existingIndex >= 0) {
          cart[existingIndex].quantity += qty
        } else {
          cart.push({ ...prod, quantity: qty })
        }

        localStorage.setItem('afrimercato_cart', JSON.stringify(cart))
      }
      window.dispatchEvent(new Event('cartUpdated'))
      alert(`${prod.name} added to cart!`)
    } catch (error) {
      throw error
    }
  }

  const handleVendorSwitch = async () => {
    // Clear cart and vendor lock completely
    localStorage.setItem('afrimercato_cart', JSON.stringify([]))
    localStorage.removeItem('vendor_lock')
    
    if (isAuthenticated) {
      try {
        await cartAPI.clear()
      } catch (error) {
        console.log('Backend cart clear deferred:', error.message)
      }
    }
    
    // Close modal
    setVendorSwitchModal({ isOpen: false, currentStoreName: '', newStoreName: '', pendingProduct: null, pendingQuantity: 1 })
    
    // Add new product from new vendor
    if (vendorSwitchModal.pendingProduct) {
      await performAddToCart(
        vendorSwitchModal.pendingProduct,
        vendorSwitchModal.pendingQuantity
      )
    }
    
    // Notify cart update
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const buyNow = () => {
    addToCart()
    navigate('/cart')
  }

  const toggleWishlist = async () => {
    if (!isAuthenticated) {
      alert('Please log in to add items to your wishlist')
      navigate('/login')
      return
    }

    try {
      if (isWishlisted) {
        await customerAPI.removeFromWishlist(productId)
      } else {
        await customerAPI.addToWishlist(productId)
      }
      setIsWishlisted(!isWishlisted)
    } catch (error) {
      console.error('Error updating wishlist:', error)
      alert('Failed to update wishlist. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-afri-green"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl">🔍</span>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Product not found</h2>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 px-6 py-3 bg-afri-green text-white rounded-xl font-semibold"
          >
            Browse Products
          </button>
        </div>
      </div>
    )
  }

  const images = product.images?.length > 0
    ? product.images.map(img => img.url || img)
    : [getProductImage(product)]

  const averageRating = product.reviews?.length
    ? (product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length).toFixed(1)
    : 4.5

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="text-sm">
            <button onClick={() => navigate('/')} className="text-gray-500 hover:text-afri-green">Home</button>
            <span className="mx-2 text-gray-400">/</span>
            <button onClick={() => navigate('/products')} className="text-gray-500 hover:text-afri-green">Products</button>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-afri-green' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              {/* Vendor Badge */}
              {product.vendor && (
                <button
                  onClick={() => navigate(`/store/${product.vendor._id || product.vendor}`)}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 mb-4"
                >
                  <span>🏪</span>
                  <span>{product.vendor.storeName || 'AfriMercato Vendor'}</span>
                </button>
              )}

              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} className={star <= averageRating ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="font-semibold">{averageRating}</span>
                <button
                  onClick={() => navigate(`/product/${productId}/reviews`)}
                  className="text-afri-green hover:underline"
                >
                  ({product.reviews?.length || 0} reviews)
                </button>
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="text-4xl font-bold text-afri-green">
                  £{product.price?.toFixed(2)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-xl text-gray-400 line-through ml-3">
                      £{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="ml-2 text-sm text-red-500 font-semibold">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                    </span>
                  </>
                )}
                <p className="text-gray-500 mt-1">per {product.unit || 'item'}</p>
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6">{product.description}</p>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock !== false && product.stock > 0 ? (
                  <span className="inline-flex items-center gap-2 text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    In Stock ({product.stock} available)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-red-600">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 font-medium">Quantity:</span>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-xl hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="px-6 py-2 font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                    className="px-4 py-2 text-xl hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={addToCart}
                  disabled={!product.inStock || addingToCart}
                  className="flex-1 py-4 bg-afri-green text-white rounded-xl font-semibold hover:bg-afri-green-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button
                  onClick={buyNow}
                  disabled={!product.inStock}
                  className="flex-1 py-4 bg-afri-gold text-gray-900 rounded-xl font-semibold hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={toggleWishlist}
                  className={`p-4 rounded-xl border-2 transition-colors ${
                    isWishlisted
                      ? 'border-red-500 text-red-500 bg-red-50'
                      : 'border-gray-300 text-gray-500 hover:border-red-500 hover:text-red-500'
                  }`}
                >
                  {isWishlisted ? '❤️' : '🤍'}
                </button>
              </div>

              {/* Product Details */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-900 mb-3">Product Details</h3>
                <div className="space-y-2 text-sm">
                  {product.category && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Category</span>
                      <span className="font-medium">{product.category}</span>
                    </div>
                  )}
                  {product.origin && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Origin</span>
                      <span className="font-medium">{product.origin}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Weight</span>
                      <span className="font-medium">{product.weight}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
              <h3 className="font-bold text-gray-900 mb-4">Delivery Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <p className="font-medium">Standard Delivery</p>
                    <p className="text-gray-500">2-4 business days • £2.99</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-medium">Express Delivery</p>
                    <p className="text-gray-500">Next day • £5.99</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <p className="font-medium">Free Delivery</p>
                    <p className="text-gray-500">On orders over £30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(relProduct => (
                <div
                  key={relProduct._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => {
                    navigate(`/product/${relProduct._id}`)
                    window.scrollTo(0, 0)
                  }}
                >
                  <div className="relative">
                    <img
                      src={getProductImage(relProduct)}
                      alt={relProduct.name}
                      className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{relProduct.name}</h3>
                    <p className="text-lg font-bold text-afri-green">£{relProduct.price?.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Vendor Switch Modal */}
      <VendorSwitchModal
        isOpen={vendorSwitchModal.isOpen}
        onClose={() => setVendorSwitchModal({ ...vendorSwitchModal, isOpen: false })}
        currentStoreName={vendorSwitchModal.currentStoreName}
        newStoreName={vendorSwitchModal.newStoreName}
        onConfirmSwitch={handleVendorSwitch}
      />
    </div>
  )
}

export default ProductDetail
