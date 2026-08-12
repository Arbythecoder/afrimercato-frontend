import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cartAPI, checkoutAPI, getVendorById, getVendorBySlug, userAPI, apiCall, getUserOrders, createPaymentIntent, calculateDeliveryFee } from '../../services/api'
import { getCartVendorInfo, checkMinimumOrder } from '../../utils/cartVendorLock'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js'
import { useNoIndex } from '../../hooks/useNoIndex'
import { ShoppingCart, ArrowLeft, AlertCircle, AlertTriangle, CreditCard, ShoppingBag, Info, Sparkles, Lock, Store, Bike, Package, Eye, EyeOff } from 'lucide-react'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#374151',
      fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
      '::placeholder': { color: '#9CA3AF' }
    },
    invalid: { color: '#DC2626' }
  }
}

const getStripeErrorMessage = (error) => {
  switch (error.code) {
    case 'card_declined': return 'Your card was declined. Please try a different card.'
    case 'insufficient_funds': return 'Your card has insufficient funds.'
    case 'incorrect_cvc': return 'The security code (CVC) is incorrect. Please check and try again.'
    case 'expired_card': return 'Your card has expired. Please use a different card.'
    case 'incorrect_number': return 'Your card number is incorrect.'
    case 'processing_error': return 'A processing error occurred. Please try again in a moment.'
    default: return error.message || 'Payment failed. Please try again.'
  }
}

const isValidMongoId = (id) => {
  if (!id) return false
  const stringId = String(id)
  return /^[0-9a-fA-F]{24}$/.test(stringId)
}

// Helper to group cart items by vendor (mirrors ShoppingCart logic)
const groupCartByVendor = (cartItems) => {
  const groups = {}
  for (const item of cartItems) {
    const vendorId = item.vendor?._id || item.vendor?.id || item.vendorId || 'unknown'
    const vendorName = item.vendor?.storeName || item.vendor?.businessName || item.storeName || 'Unknown Store'
    if (!groups[vendorId]) groups[vendorId] = { vendorId, vendorName, items: [] }
    groups[vendorId].items.push(item)
  }
  return Object.values(groups)
}

// Helper: check if user has customer role (supports both roles array and role string)
const isCustomerRole = (user) => {
  if (!user) return false
  if (Array.isArray(user.roles) && user.roles.includes('customer')) return true
  if (user.role === 'customer') return true
  if (user.primaryRole === 'customer') return true
  return false
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useElements()
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, login, loading: authChecking } = useAuth()

  // Stable reference to avoid re-triggering effects when user object ref changes
  const isCustomer = useMemo(() => isCustomerRole(user), [user?.role, user?.roles, user?.primaryRole])

  const [cart, setCart] = useState([])
  const [step, setStep] = useState(1) // 1: Address, 2: Payment, 3: Confirm
  const [loading, setLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(true)
  const [vendor, setVendor] = useState(null)

  // Derived state from cart (must be declared before useEffect hooks)
  const vendorInfo = useMemo(() => getCartVendorInfo(cart), [cart])
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart])

  // Auth modal state — shown when user reaches checkout without being logged in
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [showAuthPassword, setShowAuthPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  // Repurchase state — non-blocking, optional UX
  const [repurchaseItems, setRepurchaseItems] = useState([])
  const [repurchaseLoading, setRepurchaseLoading] = useState(false)
  const [repurchaseError, setRepurchaseError] = useState(false)
  const [emailVerificationError, setEmailVerificationError] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [resendMessage, setResendMessage] = useState('')
  const [orderError, setOrderError] = useState('')
  const [lookingUpPostcode, setLookingUpPostcode] = useState(false)

  // Stripe card state
  const [cardholderName, setCardholderName] = useState(() => {
    try {
      return sessionStorage.getItem('afrimercato_checkout_cardholder') || ''
    } catch (_e) {
      return ''
    }
  })
  const [cardError, setCardError] = useState('')
  const [cardComplete, setCardComplete] = useState({ number: false, expiry: false, cvc: false })
  const [paymentMethodId, setPaymentMethodId] = useState(null)

  const validateUKPostcode = (postcode) => {
    // Official UK postcode regex
    const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i
    return ukPostcodeRegex.test(postcode.trim())
  }

  const lookupPostcode = async () => {
    const postcode = address.postcode.trim().replace(/\s+/g, '')
    if (!postcode) return

    if (!validateUKPostcode(postcode)) {
      setPostcodeError('Please enter a valid UK postcode (e.g. SW1A 1AA)')
      return
    }

    setLookingUpPostcode(true)
    setPostcodeError('')

    try {
      const res = await fetch(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`)
      const data = await res.json()

      if (data.status === 200 && data.result) {
        setAddress(prev => ({
          ...prev,
          city: data.result.admin_district || data.result.parish || prev.city,
          county: data.result.admin_county || data.result.region || '',
          country: 'United Kingdom',
        }))
        setPostcodeError('')
      } else {
        setPostcodeError('Postcode not found. Please check and try again.')
      }
    } catch {
      setPostcodeError('Could not verify postcode. Please check your connection.')
    } finally {
      setLookingUpPostcode(false)
    }
  }

  // Address form draft initialization from storage
  const getInitialAddress = () => {
    try {
      const savedDraft = sessionStorage.getItem('afrimercato_checkout_draft_address') || localStorage.getItem('checkout_address_backup')
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft)
        if (parsed && typeof parsed === 'object') {
          return {
            fullName: parsed.fullName || '',
            phone: parsed.phone || '',
            street: parsed.street || '',
            city: parsed.city || '',
            county: parsed.county || '',
            postcode: parsed.postcode || '',
            country: 'United Kingdom',
            instructions: parsed.instructions || ''
          }
        }
      }
    } catch (_e) { }
    return {
      fullName: '',
      phone: '',
      street: '',
      city: '',
      county: '',
      postcode: '',
      country: 'United Kingdom',
      instructions: ''
    }
  }

  const [postcodeError, setPostcodeError] = useState('')
  const [address, setAddress] = useState(getInitialAddress)

  // Fulfillment option: 'delivery' (Rider Delivery) or 'store_pickup' (Self Pickup)
  const [fulfillmentType, setFulfillmentType] = useState(() => {
    try {
      return sessionStorage.getItem('afrimercato_checkout_fulfillment') || 'delivery'
    } catch (_e) {
      return 'delivery'
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem('afrimercato_checkout_fulfillment', fulfillmentType)
    } catch (_e) { }
  }, [fulfillmentType])

  // Auto-persist address draft whenever input changes
  useEffect(() => {
    try {
      if (address && (address.fullName || address.street || address.postcode || address.phone || address.city || address.instructions)) {
        sessionStorage.setItem('afrimercato_checkout_draft_address', JSON.stringify(address))
        localStorage.setItem('checkout_address_backup', JSON.stringify(address))
      }
    } catch (_e) { }
  }, [address])

  // Auto-persist cardholder name draft
  useEffect(() => {
    try {
      if (cardholderName) {
        sessionStorage.setItem('afrimercato_checkout_cardholder', cardholderName)
      }
    } catch (_e) { }
  }, [cardholderName])

  // Payment form
  const [payment, setPayment] = useState({
    method: 'card',
    saveCard: false
  })

  useEffect(() => {
    const loadCart = async () => {
      setCartLoading(true)

      if (!isAuthenticated) {
        // Don't navigate while auth is still being checked — cart might be on the backend
        if (authChecking) {
          setCartLoading(false)
          return
        }
        const savedCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
        if (savedCart.length > 0) {
          setCart(savedCart)
        } else {
          navigate('/stores')
        }
        setCartLoading(false)
        return
      }

      if (!isCustomer) {
        setCartLoading(false)
        return
      }

      try {
        const response = await cartAPI.get()
        if (response.success && response.data && response.data.length > 0) {
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
        } else {
          // After login, prefer the checkout cart backup so the cart survives the auth flow
          const backupCart = localStorage.getItem('checkout_cart_backup')
          if (backupCart) {
            localStorage.removeItem('checkout_cart_backup')
            setCart(JSON.parse(backupCart))
          } else {
            const savedCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
            if (savedCart.length > 0) {
              setCart(savedCart)
            } else {
              navigate('/stores')
            }
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Cart load failed, using localStorage fallback:', error.message)
        }
        const backupCart = localStorage.getItem('checkout_cart_backup')
        if (backupCart) {
          localStorage.removeItem('checkout_cart_backup')
          setCart(JSON.parse(backupCart))
        } else {
          const savedCart = JSON.parse(localStorage.getItem('afrimercato_cart') || '[]')
          if (savedCart.length > 0) {
            setCart(savedCart)
          } else {
            navigate('/stores')
          }
        }
      } finally {
        setCartLoading(false)
      }
    }

    loadCart()
  }, [isAuthenticated, isCustomer, authChecking])

  // Load repurchase items — NON-BLOCKING, never delays checkout
  useEffect(() => {
    if (!isAuthenticated || !isCustomer) return

    const loadRepurchaseItems = async () => {
      setRepurchaseLoading(true)
      setRepurchaseError(false)

      try {
        const response = await checkoutAPI.getRepurchaseItems()
        if (response.success && response.data && response.data.length > 0) {
          // Extract unique items from last 3 orders, limit to 5 items
          const itemMap = new Map()
          for (const order of response.data.slice(0, 3)) {
            for (const item of (order.items || [])) {
              const key = item.product?._id || item.product
              if (!itemMap.has(key) && itemMap.size < 5) {
                itemMap.set(key, {
                  _id: key,
                  name: item.name || item.product?.name || 'Product',
                  price: item.price,
                  quantity: 1,
                  unit: item.unit || 'piece',
                  images: item.product?.images
                })
              }
            }
          }
          const items = Array.from(itemMap.values())
          setRepurchaseItems(items)
          // Cache to localStorage for fallback
          try {
            localStorage.setItem('afrimercato_last_order_items', JSON.stringify(items))
          } catch (_e) { /* localStorage full — ignore */ }
        }
      } catch (error) {
        // Backend failed — try localStorage fallback
        setRepurchaseError(true)
        try {
          const cached = JSON.parse(localStorage.getItem('afrimercato_last_order_items') || '[]')
          if (cached.length > 0) {
            setRepurchaseItems(cached.slice(0, 5))
          }
        } catch (_e) { /* corrupt cache — ignore */ }

        if (import.meta.env.DEV) {
          console.warn('Repurchase load failed (non-blocking):', error.message)
        }
      } finally {
        setRepurchaseLoading(false)
      }
    }

    loadRepurchaseItems()
  }, [isAuthenticated, isCustomer])

  useEffect(() => {
    if (isAuthenticated && isCustomer && !authChecking) {
      const savedAddress = localStorage.getItem('checkout_address_backup')
      if (savedAddress) {
        try {
          const parsedAddress = JSON.parse(savedAddress)
          setAddress(prev => ({ ...prev, ...parsedAddress }))
          setStep(2) // skip straight to payment — address was already collected pre-login
        } catch (_e) {

        }
        localStorage.removeItem('checkout_address_backup')
      }

      const checkoutPending = localStorage.getItem('checkout_redirect') === 'true'
      if (checkoutPending) {
        localStorage.removeItem('checkout_redirect')
        setCartLoading(true)
      }
    }
  }, [isAuthenticated, isCustomer, authChecking])

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) return
    const prefillAddress = async () => {
      try {
        const res = await userAPI.getProfile()
        const profile = res?.data || res
        if (!profile) return

        // ── 1. Try saved addresses first ─────────────────────────────
        const savedAddr = profile.addresses?.find(a => a.isDefault)
          || profile.addresses?.[0]

        if (savedAddr?.street) {
          setAddress(prev => ({
            fullName: prev.fullName || profile.name || '',
            phone: prev.phone || profile.phone || savedAddr.phone || '',
            street: prev.street || savedAddr.street,
            city: prev.city || savedAddr.city,
            county: prev.county || savedAddr.county || '',
            postcode: prev.postcode || savedAddr.postcode,
            country: 'United Kingdom',
            instructions: prev.instructions || ''
          }))
          return // done, no need to fetch orders
        }

        // ── 2. Fallback: pull address from last order ─────────────────
        // profile.addresses is empty but the address exists on past orders
        console.log('[Prefill] No saved address — checking last order')
        try {
          const ordersRes = await getUserOrders()
          const lastOrder = ordersRes?.data?.[0] || ordersRes?.orders?.[0]
          // const lastOrder = ordersRes?.data?.orders?.[0] || ordersRes?.data?.[0]
          const orderAddr = lastOrder?.deliveryAddress

          console.log('[Prefill] Last order address:', orderAddr)

          if (orderAddr?.street) {
            setAddress(prev => ({
              fullName: prev.fullName || orderAddr.fullName || profile.name || '',
              phone: prev.phone || orderAddr.phone || profile.phone || '',
              street: prev.street || orderAddr.street,
              city: prev.city || orderAddr.city,
              county: prev.county || orderAddr.county || '',
              postcode: prev.postcode || orderAddr.postcode,
              country: 'United Kingdom',
              instructions: prev.instructions || ''
            }))

            // addresses array won't be empty again after this
            userAPI.saveDefaultAddress({
              street: orderAddr.street,
              city: orderAddr.city,
              county: orderAddr.county || '',
              postcode: orderAddr.postcode,
              country: 'United Kingdom',
              fullName: orderAddr.fullName,
              phone: orderAddr.phone,
              label: 'Home',
              isDefault: true
            })
              .then(() => console.log('[Prefill] ✓ Backfilled address from last order'))
              .catch(err => console.error('[Prefill] Backfill failed:', err.message))
          }
        } catch (orderErr) {
          console.warn('[Prefill] Could not fetch last order:', orderErr.message)
        }

      } catch (_e) { }
    }
    prefillAddress()
  }, [isAuthenticated, isCustomer])

  // After successful login during checkout, auto-advance to payment step
  useEffect(() => {
    if (isAuthenticated && showAuthModal) {
      setShowAuthModal(false)
      setStep(2)
    }
  }, [isAuthenticated])

  // Fetch vendor data when cart loads
  useEffect(() => {
    const fetchVendorData = async () => {
      if (cart.length === 0) {
        setVendor(null)
        return
      }

      if (!vendorInfo || !vendorInfo.vendorId) return

      try {
        let response;
        const vendorId = vendorInfo.vendorId;

        // Check if vendorId is a MongoDB ObjectId (24 hex characters)
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(vendorId);

        if (isObjectId) {
          // Direct ObjectId lookup
          response = await getVendorById(vendorId);
        } else {
          // Try slug resolution first
          try {
            response = await getVendorBySlug(vendorId);
          } catch (slugError) {
            // Fallback to direct lookup for backward compatibility
            response = await getVendorById(vendorId);
          }
        }

        if (response.success && response.data) {
          setVendor(response.data)
        } else if (response.storeName) {
          setVendor(response)
        }
      } catch (error) {
        console.log('Vendor fetch failed:', error.message)
      }
    }

    fetchVendorData()
  }, [cart, vendorInfo])

  // Coupon state
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')

  const removeItem = async (productId) => {
    const previousCart = [...cart]
    const updatedCart = cart.filter(item => item._id !== productId)
    setCart(updatedCart)

    if (isAuthenticated && isValidMongoId(productId)) {
      try {
        const response = await cartAPI.remove(productId)
        if (!response.success) {
          setCart(previousCart)
        }
      } catch (error) {
        setCart(previousCart)
      }
    } else if (!isAuthenticated) {
      localStorage.setItem('afrimercato_cart', JSON.stringify(updatedCart))
    }

    window.dispatchEvent(new Event('cartUpdated'))

    if (updatedCart.length === 0) {
      navigate('/stores')
    }
  }

  const applyCoupon = async () => {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')
    try {
      const res = await checkoutAPI.validateCoupon?.(couponCode.trim().toUpperCase())
      if (res?.success && res?.data) {
        setCoupon({ code: couponCode.trim().toUpperCase(), ...res.data })
      } else {
        setCouponError(res?.message || 'Invalid coupon code')
      }
    } catch (err) {
      if (err?.status === 501 || err?.message?.includes('501')) {
        setCouponError('Coupon feature coming soon')
      } else {
        setCouponError(err?.message || 'Invalid or expired coupon')
      }
    } finally {
      setCouponLoading(false)
    }
  }

  const [distanceFeeInfo, setDistanceFeeInfo] = useState(null)

  useEffect(() => {
    if (fulfillmentType === 'store_pickup') return
    if (!address.postcode || address.postcode.trim().length < 3) return

    const timer = setTimeout(async () => {
      try {
        const vendorId = vendorInfo?.vendorId || cart[0]?.vendor?._id || cart[0]?.vendor
        const res = await calculateDeliveryFee({
          deliveryAddress: address,
          vendorId,
          subtotal: cartTotal,
          fulfillmentType
        })
        if (res?.success && res?.data) {
          setDistanceFeeInfo(res.data)
        }
      } catch (e) {
        console.warn('Checkout fee calc notice:', e)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [address.postcode, address.street, cartTotal, vendorInfo, cart, fulfillmentType])

  const deliveryFee = fulfillmentType === 'store_pickup'
    ? 0
    : (distanceFeeInfo ? distanceFeeInfo.deliveryFee : (cartTotal >= 50 ? 0 : 3.99))
  // For multi-vendor carts, each vendor has their own minimum — don't block on a single vendor's value
  const isMultiVendorCart = groupCartByVendor(cart).length > 1
  const couponDiscount = coupon
    ? coupon.type === 'percent'
      ? parseFloat(((cartTotal * coupon.discount) / 100).toFixed(2))
      : parseFloat(coupon.discount || 0)
    : 0
  const total = cartTotal + deliveryFee - couponDiscount

  const handleAddressSubmit = (e) => {
    e.preventDefault()

    // Block if rider delivery and postcode is invalid
    if (fulfillmentType === 'delivery' && !validateUKPostcode(address.postcode)) {
      setPostcodeError('Please enter a valid UK postcode')
      return
    }

    if (!isAuthenticated) {
      localStorage.setItem('post_login_redirect', '/checkout')
      localStorage.setItem('checkout_redirect', 'true')
      localStorage.setItem('checkout_cart_backup', JSON.stringify(cart))
      localStorage.setItem('checkout_address_backup', JSON.stringify(address))
      setShowAuthModal(true)
      return
    }
    setStep(2)
  }

  const handleCardReview = async () => {
    if (!stripe || !elements) return
    if (!cardholderName.trim()) {
      setCardError('Please enter the name on your card')
      return
    }
    if (!cardComplete.number || !cardComplete.expiry || !cardComplete.cvc) {
      setCardError('Please complete all card fields')
      return
    }
    setLoading(true)
    setCardError('')
    const cardElement = elements.getElement(CardNumberElement)
    const { paymentMethod, error } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { name: cardholderName.trim() }
    })
    setLoading(false)
    if (error) {
      setCardError(getStripeErrorMessage(error))
      return
    }
    setPaymentMethodId(paymentMethod.id)
    setStep(3)
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()

    if (!stripe || !paymentMethodId) {
      setOrderError('Card details are missing. Please go back and enter your card details.')
      setStep(2)
      return
    }

    setLoading(true)

    try {
      const repeatPurchaseFrequency = localStorage.getItem('repeatPurchaseFrequency')

      const orderData = {
        fulfillmentType,
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unit: item.unit || 'piece',
          vendor: item.vendor?._id || item.vendor?.id || item.vendorId || null
        })),
        deliveryAddress: fulfillmentType === 'store_pickup' ? {
          fullName: address.fullName || 'Customer',
          phone: address.phone || '',
          street: address.street || 'Store Pickup',
          city: address.city || 'Local Store',
          postcode: address.postcode || 'PICKUP',
          country: 'United Kingdom',
          instructions: address.instructions || ''
        } : address,
        payment: {
          method: payment.method,
          status: 'pending'
        },
        pricing: {
          subtotal: cartTotal,
          deliveryFee,
          discount: couponDiscount,
          total
        },
        ...(coupon && { couponCode: coupon.code }),
        ...(repeatPurchaseFrequency && { repeatPurchaseFrequency })
      }

      if (import.meta.env.DEV) console.log('[Checkout] Calling initializePayment — items:', orderData.items.length, 'total:', total)
      const data = await checkoutAPI.initializePayment(orderData)
      if (import.meta.env.DEV) console.log('[Checkout] initializePayment response — success:', data?.success, 'clientSecret:', !!data?.data?.payment?.clientSecret)

      if (data.success) {
        const orderId = data.data.order._id

        let clientSecret = data.data.payment?.clientSecret

        if (!clientSecret) {
          if (import.meta.env.DEV) console.log('[Checkout] No clientSecret in response — calling /payments/create-intent')
          try {
            const intentRes = await createPaymentIntent({
              orderId,
              amount: Math.round(total * 100),
              currency: 'gbp'
            })
            clientSecret = intentRes?.data?.clientSecret
          } catch (intentErr) {
            if (import.meta.env.DEV) console.warn('[Checkout] create-intent failed:', intentErr.message)
            throw new Error('Unable to initialize payment. Please try again.')
          }
        }

        if (!clientSecret) {
          setOrderError('Payment system error. Please contact support.')
          setLoading(false)
          return
        }

        if (import.meta.env.DEV) console.log('[Checkout] Confirming payment with Stripe Elements')
        const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: paymentMethodId }
        )

        if (stripeError) {
          if (import.meta.env.DEV) console.error('[Checkout] Stripe confirm error:', stripeError.code, stripeError.message)
          const errorMsg = getStripeErrorMessage(stripeError)
          setOrderError(`Payment Failed: ${errorMsg}. Order could not be placed.`)

          if (orderId) {
            try {
              await apiCall('/payments/stripe/report-failure', {
                method: 'POST',
                body: JSON.stringify({ orderId, reason: errorMsg })
              })
            } catch (_err) { /* silent catch */ }
          }

          setLoading(false)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }

        if (paymentIntent?.status !== 'succeeded') {
          const failMsg = `Payment status: ${paymentIntent?.status || 'failed'}. Order could not be placed.`
          setOrderError(failMsg)

          if (orderId) {
            try {
              await apiCall('/payments/stripe/report-failure', {
                method: 'POST',
                body: JSON.stringify({ orderId, reason: failMsg })
              })
            } catch (_err) { /* silent catch */ }
          }

          setLoading(false)
          window.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }

        if (paymentIntent?.status === 'succeeded') {
          if (import.meta.env.DEV) console.log('[Checkout] ✓ Payment confirmed:', paymentIntent.id)

          try {
            localStorage.setItem('afrimercato_last_order_items', JSON.stringify(
              cart.slice(0, 5).map(item => ({
                _id: item._id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                unit: item.unit,
                images: item.images
              }))
            ))
          } catch (_e) { /* localStorage full — ignore */ }

          // Clear Local Storage & Draft Storage
          localStorage.removeItem('afrimercato_cart')
          localStorage.removeItem('repeatPurchaseFrequency')
          sessionStorage.removeItem('afrimercato_checkout_draft_address')
          sessionStorage.removeItem('afrimercato_checkout_cardholder')
          localStorage.removeItem('checkout_address_backup')

          //  Clear Backend Cart!
          if (isAuthenticated && isCustomer) {
            try {
              await cartAPI.clear()
            } catch (clearErr) {
              console.error('[Checkout] Failed to clear backend cart:', clearErr.message)
            }
          }

          // 3. Clear React State and notify the header icon
          setCart([])
          window.dispatchEvent(new Event('cartUpdated'))

          // Save Address
          if (isAuthenticated && address.street) {
            userAPI.saveDefaultAddress({
              street: address.street,
              city: address.city,
              county: address.county || '',
              postcode: address.postcode,
              country: 'United Kingdom',
              fullName: address.fullName,
              phone: address.phone,
              label: 'Home',
              isDefault: true
            })
              .then(() => console.log('[Checkout] ✓ Address saved to profile'))
              .catch((err) => console.error('[Checkout] saveDefaultAddress failed:', err.message))
          }

          navigate(`/payment/verify?payment_intent_id=${paymentIntent.id}&order_id=${orderId}`)
        }
        else {
          setOrderError('Payment was not completed. Please try again.')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } else {
        if (import.meta.env.DEV) console.error('[Checkout] Order failed:', data?.message)
        setOrderError(data.message || 'Order failed. Please try again.')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (error) {
      const msg = error.message || 'Failed to place order'

      if (error.response?.data?.errorCode === 'EMAIL_NOT_VERIFIED') {
        setEmailVerificationError(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      if (error.status === 401 || error.code === 'AUTH_EXPIRED') {
        setOrderError('Your session has expired. Please log in again.')
        localStorage.setItem('checkout_redirect', 'true')
        setTimeout(() => navigate('/login'), 1500)
        return
      }

      if (error.status === 403) {
        const errorCode = error.data?.errorCode || error.data?.code
        if (errorCode === 'EMAIL_NOT_VERIFIED') {
          setEmailVerificationError(true)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        } else {
          setOrderError('Access denied. Please ensure you have a customer account and are logged in correctly.')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
        return
      }

      if (msg.includes('timed out')) {
        setOrderError('The server is taking longer than expected. Please try again.')
      } else {
        setOrderError(msg || 'Failed to place order. Please try again.')
      }
      window.scrollTo({ top: 0, behavior: 'smooth' })
      if (import.meta.env.DEV) console.error('Order error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    setResendingEmail(true)
    setResendMessage('')
    try {
      const data = await apiCall('/auth/resend-verification', { method: 'POST' })
      if (data.success) {
        setResendMessage('Verification email sent! Please check your inbox.')
      } else {
        setResendMessage(data.message || 'Failed to send verification email')
      }
    } catch (_error) {
      setResendMessage('Failed to resend verification email. Please try again.')
    } finally {
      setResendingEmail(false)
    }
  }

  const handleAddRepurchaseItem = (item) => {
    setCart(prev => {
      const exists = prev.find(c => c._id === item._id)
      if (exists) {
        return prev.map(c => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  // Role mismatch — vendor/rider/picker trying to shop
  if (isAuthenticated && !isCustomer) {
    const effectiveRole = user?.role || (Array.isArray(user?.roles) && user.roles[0]) || 'unknown'
    const currentRole = effectiveRole === 'vendor' ? 'Vendor'
      : effectiveRole === 'rider' ? 'Rider'
        : effectiveRole === 'picker' ? 'Picker'
          : effectiveRole === 'admin' ? 'Admin'
            : 'Non-Customer'
    const roleIcon = effectiveRole === 'vendor' ? <Store className="w-8 h-8 text-afri-green" />
      : effectiveRole === 'rider' ? <Bike className="w-8 h-8 text-afri-green" />
        : effectiveRole === 'picker' ? <Package className="w-8 h-8 text-afri-green" /> : <AlertTriangle className="w-8 h-8 text-amber-500" />

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-[#E0F2F1] flex items-center justify-center mx-auto mb-6">
              {roleIcon}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Wrong Account Type</h1>
            <p className="text-gray-600 mb-1">You're currently signed in as a</p>
            <p className="text-lg font-bold text-[#00897B] mb-4">{currentRole}</p>
            <p className="text-gray-500 text-sm mb-6">
              Shopping and checkout are only available for <strong>Customer</strong> accounts.
              Please sign in with a Customer account to continue.
            </p>
            <button
              type="button"
              onClick={() => {
                // Full logout first (clears cookies + auth state)
                logout()
                // Set redirect AFTER logout so hardLogout doesn't wipe it
                localStorage.setItem('checkout_redirect', 'true')
                navigate('/login')
              }}
              className="w-full bg-[#00897B] hover:bg-[#00695C] text-white py-3 px-6 rounded-xl font-bold text-lg transition-all mb-3"
            >
              Sign in as Customer
            </button>
            <button
              type="button"
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

  // Sign-in gate — shown when user hits checkout without being logged in
  if (showAuthModal && !isAuthenticated) {
    // Tell the backend where to send the user after Google OAuth completes.
    // Without this, the backend falls back to its default redirect (dashboard)
    // instead of bringing the user back to finish checkout.
    const GOOGLE_URL = `${import.meta.env.VITE_API_URL || 'https://afrimercato-backend.onrender.com'}/api/auth/google?redirect=/checkout`

    const handleAuthLogin = async (e) => {
      e.preventDefault()
      setAuthError('')
      setAuthLoading(true)
      try {
        const result = await login(authEmail, authPassword, { requiredRole: 'customer' })
        if (result.success) {
          // Pre-set cart from backup immediately so the UI shows items without flicker.
          // Do NOT remove the backup here — the loadCart effect (triggered by isAuthenticated
          // changing) also needs it as a fallback to avoid navigating away to /stores.
          const backupCart = localStorage.getItem('checkout_cart_backup')
          if (backupCart) {
            try {
              const parsed = JSON.parse(backupCart)
              if (parsed.length > 0) {
                setCart(parsed)
              }
            } catch (_e) { }
          }
          // Address never left memory in this in-page flow, so the backup is unused —
          // clear it so a stale copy can't leak into a future checkout session.
          localStorage.removeItem('checkout_address_backup')
          window._loginRedirect = null
          setShowAuthModal(false)
          setStep(2)
        } else if (result.roleBlocked) {
          const roleLabel = result.actualRole === 'vendor' ? 'Vendor'
            : result.actualRole === 'rider' ? 'Rider'
              : result.actualRole === 'picker' ? 'Picker'
                : result.actualRole === 'admin' ? 'Admin'
                  : 'Non-Customer'
          setAuthError(`This account is registered as a ${roleLabel}. Please use a customer account.`)
        } else {
          setAuthError(result.message || 'Incorrect email or password.')
        }
        // On success isAuthenticated flips → loadCart effect re-runs automatically
      } catch (_e) {
        setAuthError('Something went wrong. Please try again.')
      } finally {
        setAuthLoading(false)
      }
    }

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Cart reminder */}
          <div className="text-center mb-6">
            <span className="text-5xl">🛒</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-1">Almost there!</h1>
            <p className="text-gray-500 text-sm">Sign in to complete your order</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {/* Google */}
            <a
              href={GOOGLE_URL}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition mb-5"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </a>

            <div className="relative mb-5">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
              <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-gray-400">or sign in with email</span></div>
            </div>

            {authError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded mb-4">
                <p className="text-red-700 text-sm">{authError}</p>
              </div>
            )}

            <form onSubmit={handleAuthLogin} className="space-y-4">
              <input
                type="email"
                required
                placeholder="Email address"
                value={authEmail}
                onChange={e => { setAuthEmail(e.target.value); setAuthError('') }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
              <div className="relative">
                <input
                  type={showAuthPassword ? "text" : "password"}
                  required
                  placeholder="Password"
                  value={authPassword}
                  onChange={e => { setAuthPassword(e.target.value); setAuthError('') }}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowAuthPassword(!showAuthPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
                  aria-label={showAuthPassword ? "Hide password" : "Show password"}
                >
                  {showAuthPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <svg className="animate-spin h-5 w-5 mx-auto text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-5">
              No account?{' '}
              <a
                onClick={() => { localStorage.setItem('checkout_redirect', 'true'); navigate('/register') }}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Create one free →
              </a>
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 w-full text-gray-400 hover:text-gray-600 text-sm py-2 transition"
          >
            ← Back to cart
          </button>
        </div>
      </div>
    )
  }

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (cart.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-afri-green" />
              <span className="text-base sm:text-xl font-bold text-gray-900">Afrimercato Checkout</span>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900 min-h-[44px] min-w-[44px] flex items-center justify-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
            </button>
          </div>
        </div>
      </header>

      {/* Email Verification Error Banner */}
      {emailVerificationError && (
        <div className="bg-red-50 border-b-4 border-red-500">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-1">Email Verification Required</h3>
                <p className="text-red-800 mb-3">Please verify your email address before placing an order. Check your inbox for the verification link.</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleResendVerification}
                    disabled={resendingEmail}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                  >
                    {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                  <button
                    onClick={() => setEmailVerificationError(false)}
                    className="bg-white border border-red-300 hover:bg-red-50 text-red-800 px-4 py-2 rounded-lg font-semibold text-sm transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
                {resendMessage && (
                  <p className={`mt-2 text-sm font-medium ${resendMessage.includes('sent') ? 'text-green-700' : 'text-red-700'}`}>
                    {resendMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left: Checkout Form */}
          <div className="lg:col-span-2">
            {/* Progress Steps */}
            <div className="hidden sm:flex items-center justify-between mb-8">
              <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  {step > 1 ? '✓' : '1'}
                </div>
                <span className="ml-2 font-semibold">Delivery</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
              <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  {step > 2 ? '✓' : '2'}
                </div>
                <span className="ml-2 font-semibold">Payment</span>
              </div>
              <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
              <div className={`flex items-center ${step >= 3 ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="ml-2 font-semibold">Confirm</span>
              </div>
            </div>

            {/* Step 1: Delivery Address & Fulfillment */}
            {step === 1 && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Fulfillment & Address</h2>

                {/* Fulfillment Method Toggle */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-800 mb-3">
                    Choose Pickup or Delivery Option
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Rider Delivery Option */}
                    <div
                      onClick={() => setFulfillmentType('delivery')}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${fulfillmentType === 'delivery'
                        ? 'border-green-600 bg-green-50/50 shadow-sm ring-1 ring-green-600'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                      <div className={`p-2.5 rounded-lg shrink-0 ${fulfillmentType === 'delivery' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Bike className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-gray-900 text-base">Rider Delivery</span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-gray-100 text-gray-700 whitespace-nowrap">
                            {distanceFeeInfo ? `£${distanceFeeInfo.deliveryFee.toFixed(2)}` : (cartTotal >= 50 ? 'FREE' : '£3.99')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Delivered directly to your door by a local rider</p>
                      </div>
                    </div>

                    {/* Self Pickup Option */}
                    <div
                      onClick={() => setFulfillmentType('store_pickup')}
                      className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 ${fulfillmentType === 'store_pickup'
                        ? 'border-green-600 bg-green-50/50 shadow-sm ring-1 ring-green-600'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                    >
                      <div className={`p-2.5 rounded-lg shrink-0 ${fulfillmentType === 'store_pickup' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Store className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-gray-900 text-base">Self Pickup</span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-green-100 text-green-800 border border-green-200 whitespace-nowrap">
                            FREE (£0.00)
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">Pick up directly from store location</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pickup Store Location Info Banner */}
                {fulfillmentType === 'store_pickup' && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Store className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-amber-900 text-sm">Store Pickup Location</h4>
                        <p className="text-sm text-amber-800 mt-0.5 font-semibold">
                          {vendor?.storeName || groupCartByVendor(cart)[0]?.vendorName || 'Vendor Store'}
                        </p>
                        <p className="text-xs text-amber-800 font-medium mt-0.5">
                          {(() => {
                            if (!vendor) return 'Address details will be attached to your order receipt.'
                            if (typeof vendor.address === 'string' && vendor.address.trim()) return vendor.address
                            if (vendor.address && typeof vendor.address === 'object') {
                              const p = [vendor.address.street, vendor.address.city, vendor.address.county, vendor.address.postcode].filter(Boolean)
                              if (p.length > 0) return p.join(', ')
                            }
                            if (vendor.location) {
                              if (typeof vendor.location === 'string' && vendor.location.trim()) return vendor.location
                              if (vendor.location.address) return vendor.location.address
                              const p = [vendor.location.street, vendor.location.city, vendor.location.postcode].filter(Boolean)
                              if (p.length > 0) return p.join(', ')
                            }
                            return 'Address details will be attached to your order receipt.'
                          })()}
                        </p>
                        <p className="text-xs text-amber-800 mt-2 font-medium bg-amber-100/70 p-2 rounded-lg border border-amber-200">
                          🔒 You will receive a 4-digit Pickup PIN after order placement. Show this PIN to store staff when collecting your order.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleAddressSubmit}>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        autoComplete="name"
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        autoComplete="tel"
                        inputMode="tel"
                        value={address.phone}
                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                        placeholder="+44 7700 900000"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {fulfillmentType === 'store_pickup' ? 'Street Address (Optional)' : 'Street Address *'}
                    </label>
                    <input
                      type="text"
                      required={fulfillmentType === 'delivery'}
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                      placeholder={fulfillmentType === 'store_pickup' ? 'Home address (optional for pickup)' : '123 High Street'}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {fulfillmentType === 'store_pickup' ? 'City (Optional)' : 'City *'}
                      </label>
                      <input
                        type="text"
                        required={fulfillmentType === 'delivery'}
                        autoComplete="address-level2"
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                        placeholder="London"
                      />
                    </div>
                    {/* Postcode field */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {fulfillmentType === 'store_pickup' ? 'Postcode (Optional)' : 'Postcode *'}
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required={fulfillmentType === 'delivery'}
                          autoComplete="postal-code"
                          value={address.postcode}
                          onChange={(e) => {
                            setAddress({ ...address, postcode: e.target.value.toUpperCase() })
                            setPostcodeError('') // clear error on edit
                          }}
                          onBlur={() => {
                            if (fulfillmentType === 'delivery' && address.postcode && !validateUKPostcode(address.postcode)) {
                              setPostcodeError('Please enter a valid UK postcode (e.g. SW1A 1AA)')
                            }
                          }}
                          className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 
                            focus:border-transparent min-h-[44px] ${postcodeError ? 'border-red-400 bg-red-50' : 'border-gray-300'
                            }`}
                          placeholder="SW1A 1AA"
                        />
                        <button
                          type="button"
                          onClick={lookupPostcode}
                          disabled={lookingUpPostcode || !address.postcode.trim()}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium 
                            hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition 
                            whitespace-nowrap min-h-[44px]"
                        >
                          {lookingUpPostcode ? '…' : 'Find'}
                        </button>
                      </div>
                      {postcodeError && <span className="text-red-600 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        {postcodeError}
                      </span>
                      }
                    </div>

                    {/* Locked country field */}
                    <div className="mb-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                      <div className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg 
                        text-gray-500 text-sm flex items-center gap-2 min-h-[44px]">
                        🇬🇧 United Kingdom (only)
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {fulfillmentType === 'store_pickup' ? 'Pickup Notes (Optional)' : 'Delivery Instructions (Optional)'}
                    </label>
                    <textarea
                      value={address.instructions}
                      onChange={(e) => setAddress({ ...address, instructions: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px]"
                      rows="3"
                      placeholder={fulfillmentType === 'store_pickup' ? 'e.g., Will pick up around 4 PM' : 'e.g., Leave at door, Ring doorbell, etc.'}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold text-lg hover:shadow-lg transition min-h-[44px]"
                  >
                    Continue to Payment →
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Card Details */}
            {step === 2 && (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">Card Details</h2>
                <p className="text-sm text-gray-500 mb-5 flex items-center gap-1">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Encrypted and secured by Stripe — we never store your card details
                </p>

                {/* Stripe not loaded — show spinner or error */}
                {!stripe && (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
                    <p className="text-sm text-gray-500">Loading secure payment form...</p>
                    <p className="text-xs text-gray-400">
                      If this takes more than 10 seconds,{' '}
                      <button type="button" onClick={() => window.location.reload()} className="text-green-600 underline">
                        refresh the page
                      </button>
                    </p>
                  </div>
                )}

                {stripe && (<>

                  {cardError && (
                    <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium">{cardError}</p>
                    </div>
                  )}

                  {/* Cardholder Name */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cardholder Name *
                    </label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={e => { setCardholderName(e.target.value); setCardError('') }}
                      placeholder="Name exactly as it appears on card"
                      autoComplete="cc-name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[44px] text-gray-900"
                    />
                  </div>

                  {/* Card Number */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <div className="px-4 py-3.5 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent bg-white">
                      <CardNumberElement
                        options={{ ...CARD_ELEMENT_OPTIONS, showIcon: true }}
                        onChange={e => {
                          setCardComplete(prev => ({ ...prev, number: e.complete }))
                          if (e.error) setCardError(e.error.message)
                          else setCardError('')
                        }}
                      />
                    </div>
                  </div>

                  {/* Expiry + CVC */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <div className="px-4 py-3.5 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent bg-white">
                        <CardExpiryElement
                          options={CARD_ELEMENT_OPTIONS}
                          onChange={e => {
                            setCardComplete(prev => ({ ...prev, expiry: e.complete }))
                            if (e.error) setCardError(e.error.message)
                            else setCardError('')
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVC *
                      </label>
                      <div className="px-4 py-3.5 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent bg-white">
                        <CardCvcElement
                          options={CARD_ELEMENT_OPTIONS}
                          onChange={e => {
                            setCardComplete(prev => ({ ...prev, cvc: e.complete }))
                            if (e.error) setCardError(e.error.message)
                            else setCardError('')
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Accepted cards */}
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <span className="text-xs text-gray-400 font-medium">Accepted:</span>
                    {['Visa', 'Mastercard', 'Amex', 'Discover'].map(brand => (
                      <span key={brand} className="text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 rounded font-medium text-gray-600">{brand}</span>
                    ))}
                  </div>

                  {/* Test card hint (dev only) */}
                  {import.meta.env.DEV && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700">
                      <strong>Test card:</strong> 4242 4242 4242 4242 · Any future date · Any CVC
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => { setStep(1); setCardError('') }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition min-h-[44px]"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleCardReview}
                      disabled={
                        loading ||
                        !stripe ||
                        !cardholderName.trim() ||
                        !cardComplete.number ||
                        !cardComplete.expiry ||
                        !cardComplete.cvc
                      }
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-lg font-bold hover:shadow-lg transition min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Verifying...
                        </span>
                      ) : 'Review Order →'}
                    </button>
                  </div>
                </>)}
              </div>
            )}

            {/* Step 3: Confirm Order */}
            {step === 3 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Confirm</h2>

                {/* Fulfillment & Address Details */}
                <div className="mb-6 pb-6 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {fulfillmentType === 'store_pickup' ? 'Fulfillment: Store Pickup' : 'Delivery Address'}
                    </h3>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${fulfillmentType === 'store_pickup' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                      {fulfillmentType === 'store_pickup' ? '🏪 Self Pickup (FREE)' : '🚚 Rider Delivery'}
                    </span>
                  </div>
                  {fulfillmentType === 'store_pickup' ? (
                    <div className="text-gray-700 space-y-1">
                      <p><span className="font-semibold">Customer:</span> {address.fullName} ({address.phone})</p>
                      <p><span className="font-semibold">Pickup Store:</span> {vendor?.storeName || groupCartByVendor(cart)[0]?.vendorName || 'Vendor Store'}</p>
                      <p className="text-xs text-gray-500">You will present your 4-digit Pickup PIN upon collection.</p>
                    </div>
                  ) : (
                    <p className="text-gray-700">
                      {address.fullName}<br />
                      {address.phone}<br />
                      {address.street}<br />
                      {address.city}, {address.postcode}
                    </p>
                  )}
                  {address.instructions && (
                    <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-50 rounded-lg">
                      <strong>{fulfillmentType === 'store_pickup' ? 'Pickup Notes:' : 'Instructions:'}</strong> {address.instructions}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-green-600 text-sm font-semibold mt-2 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Payment Method */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3">Payment Method</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-700 flex items-center gap-1.5 font-medium"><CreditCard className="w-4 h-4 text-gray-600" /> Card Payment</span>
                    {paymentMethodId && (
                      <span className="text-xs text-green-700 font-semibold bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                        Card verified ✓
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => { setStep(2); setPaymentMethodId(null) }}
                    className="text-green-600 text-sm font-semibold mt-2 hover:underline"
                  >
                    Edit
                  </button>
                </div>

                {/* Order Items — grouped by vendor */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Order Items</h3>
                  {groupCartByVendor(cart).map((group) => {
                    const groupSubtotal = group.items.reduce((s, i) => s + i.price * i.quantity, 0)
                    return (
                      <div key={group.vendorId} className="mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                          <span>🏪</span> {group.vendorName}
                        </p>
                        {group.items.map((item) => (
                          <div key={item._id} className="flex justify-between py-1.5 pl-2">
                            <img src={item.images} className='w-12 h-12 block' alt="" />
                            <span className="text-gray-700">{item.name} x {item.quantity}</span>
                            <span className="font-semibold">£{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm text-gray-500 pl-2 pt-1 border-t border-gray-100">
                          <span>{group.vendorName} subtotal</span>
                          <span>£{groupSubtotal.toFixed(2)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Repurchase Options Display */}
                {(() => {
                  const savedFrequency = localStorage.getItem('repeatPurchaseFrequency');
                  return savedFrequency ? (
                    <div className="mb-6 pb-6 border-b">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>🔄</span>
                        Auto-Reorder Selected
                      </h3>
                      <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
                        <p className="text-gray-700">
                          This order will repeat <span className="font-bold capitalize">{savedFrequency}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          You can cancel anytime from your order history
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          localStorage.removeItem('repeatPurchaseFrequency');
                          window.location.reload();
                        }}
                        className="text-green-600 text-sm font-semibold mt-2 hover:underline"
                      >
                        Remove auto-reorder
                      </button>
                    </div>
                  ) : (
                    <div className="mb-6 pb-6 border-b">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span>🔄</span>
                        Auto-Reorder
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Want this order to repeat automatically? Go back to cart to set a schedule.
                      </p>
                      <button
                        type="button"
                        onClick={() => navigate('/cart')}
                        className="text-green-600 text-sm font-semibold hover:underline"
                      >
                        ← Back to cart to set up
                      </button>
                    </div>
                  );
                })()}

                {/* Repurchase from previous orders — ALWAYS VISIBLE for better UX */}
                <div className="mb-6 pb-6 border-b">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center text-afri-green"><ShoppingBag className="w-4 h-4" /></span>
                    Buy Again (Quick Add)
                  </h3>
                  {repurchaseLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      Loading your previous items...
                    </div>
                  ) : repurchaseItems.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 mb-2">
                        Items from your recent orders - click to add to this order:
                      </p>
                      {repurchaseItems.slice(0, 5).map((item) => {
                        const alreadyInCart = cart.some(c => c._id === item._id)
                        return (
                          <div key={item._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
                            <div>
                              <img src={item.images} className='w-12 h-12 block' alt="" />
                              <p className="text-sm font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">£{item.price?.toFixed(2)} / {item.unit || 'piece'}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleAddRepurchaseItem(item)}
                              disabled={alreadyInCart}
                              className={`text-xs font-semibold px-4 py-2 rounded-lg transition ${alreadyInCart
                                ? 'bg-gray-200 text-gray-400 cursor-default'
                                : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                              {alreadyInCart ? '✓ In Cart' : '+ Add'}
                            </button>
                          </div>
                        )
                      })}
                      {repurchaseError && (
                        <div className="flex items-center gap-2 text-amber-600 text-xs mt-1">
                          <span><AlertTriangle className="w-4 h-4 text-amber-500" /></span>
                          <span>We could not load your quick reorder items</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl text-center border border-gray-100 flex items-center justify-center gap-1.5">
                      <Info className="w-4 h-4 text-blue-500 shrink-0" /> No previous orders yet. Items from past orders will appear here for quick reordering.
                    </div>
                  )}
                </div>

                {orderError && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-red-700 text-sm font-medium">{orderError}</p>
                    </div>
                    <button onClick={() => setOrderError('')} className="text-red-400 hover:text-red-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}

                <form onSubmit={handlePlaceOrder}>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => { setStep(2); setOrderError('') }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-300 transition min-h-[44px]"
                    >
                      ← Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !stripe || !paymentMethodId || (() => {
                        const minimumOrderValue = isMultiVendorCart ? 0 : (vendor?.deliverySettings?.minimumOrderValue || 0)
                        const minCheck = checkMinimumOrder(cartTotal, minimumOrderValue)
                        return !minCheck.meetsMinimum && minCheck.minimumOrder > 0
                      })()}
                      className={`flex-1 py-3 rounded-lg font-bold transition min-h-[44px] ${(() => {
                        const minimumOrderValue = isMultiVendorCart ? 0 : (vendor?.deliverySettings?.minimumOrderValue || 0)
                        const minCheck = checkMinimumOrder(cartTotal, minimumOrderValue)
                        if (!minCheck.meetsMinimum && minCheck.minimumOrder > 0) {
                          return 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                        if (!paymentMethodId) return 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        return loading
                          ? 'bg-gradient-to-r from-green-600 to-green-700 text-white opacity-50'
                          : 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:shadow-lg'
                      })()
                        }`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing Payment...
                        </span>
                      ) : (() => {
                        const minimumOrderValue = isMultiVendorCart ? 0 : (vendor?.deliverySettings?.minimumOrderValue || 0)
                        const minCheck = checkMinimumOrder(cartTotal, minimumOrderValue)
                        if (!minCheck.meetsMinimum && minCheck.minimumOrder > 0) {
                          return `Add £${minCheck.shortfall.toFixed(2)} more`
                        }
                        if (!paymentMethodId) return 'Enter Card Details First'
                        return `Pay £${total.toFixed(2)}`
                      })()}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>

              {/* Items — grouped by vendor */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {groupCartByVendor(cart).map((group) => (
                  <div key={group.vendorId}>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                      🏪 {group.vendorName}
                    </p>
                    {group.items.map((item) => {
                      const imageUrl = item.images?.[0]
                        ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0]?.url)
                        : 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80'
                      return (
                        <div key={item._id} className="flex gap-3 mb-2">
                          <img
                            src={imageUrl}
                            alt={item.name}
                            loading="lazy"
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&q=80'
                            }}
                          />
                          <div className="flex-1 flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              <p className="text-sm font-bold text-green-600">£{item.price.toFixed(2)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item._id)}
                              className="text-gray-400 hover:text-red-500 transition-colors px-1"
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Coupon input */}
              <div className="border-t pt-4 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Promo Code</p>
                {coupon ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-bold text-green-700">{coupon.code}</p>
                      <p className="text-xs text-green-600">
                        {coupon.type === 'percent' ? `${coupon.discount}% off` : `£${coupon.discount} off`}
                      </p>
                    </div>
                    <button onClick={() => { setCoupon(null); setCouponCode('') }} className="text-green-600 hover:text-red-500 text-xs font-semibold">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError('') }}
                      onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
                    >
                      {couponLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-600 mt-1">{couponError}</p>}
              </div>

              {/* Pricing */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Fulfillment</span>
                  <span className="font-semibold text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-800">
                    {fulfillmentType === 'store_pickup' ? '🏪 Self Pickup' : '🚚 Rider Delivery'}
                  </span>
                </div>
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Subtotal</span>
                  <span>£{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-700 text-sm">
                  <span>Delivery Fee</span>
                  <span className={deliveryFee === 0 ? 'text-green-600 font-bold' : ''}>
                    {deliveryFee === 0 ? 'FREE' : `£${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                {fulfillmentType === 'store_pickup' ? (
                  <p className="text-xs text-green-700 font-medium text-center bg-green-50 p-1.5 rounded border border-green-200">
                    🎉 £0.00 delivery fee applied for self pickup
                  </p>
                ) : cartTotal >= 50 ? (
                  <p className="text-xs text-green-600 flex items-center justify-center gap-1"><Sparkles className="w-3.5 h-3.5 text-green-600" /> Free delivery on orders over £50</p>
                ) : (
                  <p className="text-xs text-gray-500 text-center">Standard UK Delivery Fee applied</p>
                )}
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Discount ({coupon.code})</span>
                    <span>-£{couponDiscount.toFixed(2)}</span>
                  </div>
                )}

                {/* Minimum Order Check */}
                {(() => {
                  const minimumOrderValue = isMultiVendorCart ? 0 : (vendor?.deliverySettings?.minimumOrderValue || 0)
                  const minCheck = checkMinimumOrder(cartTotal, minimumOrderValue)
                  if (minCheck.meetsMinimum && minCheck.minimumOrder > 0) {
                    return (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-2">
                        <p className="text-xs text-green-700">
                          ✓ Minimum order requirement met
                        </p>
                      </div>
                    )
                  }
                  return null
                })()}

                <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-2">
                  <span>Total</span>
                  <span>£{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-6 bg-green-50 rounded-lg p-3 text-center">
                <p className="text-xs text-green-800">
                  🔒 Secure checkout powered by Stripe
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Checkout() {
  useNoIndex()

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  )
}

export default Checkout