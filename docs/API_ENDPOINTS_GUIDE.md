# AFRIMERCATO API ENDPOINTS GUIDE

**Base URL**: https://afrimercato-api.fly.dev

## ✅ TESTED & WORKING

### Health Check
```
GET /api/health
Response: {
  "success": true,
  "message": "Afrimercato API is running!",
  "environment": "production",
  "database": { "status": "connected" }
}
```

### Location-Based Vendor Search (Like Uber Eats/Just Eat)
```
GET /api/location/search-vendors?location=London&radius=10
Response: {
  "success": true,
  "vendors": [...],
  "searchLocation": {
    "query": "London",
    "coordinates": { "latitude": 51.5074, "longitude": -0.1278 }
  }
}
```

### Product Browsing
```
GET /api/products?page=1&limit=20&category=vegetables
Response: {
  "success": true,
  "data": {
    "products": [...],
    "pagination": {...}
  }
}
```

---

## 📋 ALL AVAILABLE ENDPOINTS

### 🔐 Authentication (`/api/auth`)
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login
POST   /api/auth/logout            - Logout
POST   /api/auth/refresh-token     - Refresh JWT token
POST   /api/auth/forgot-password   - Request password reset
POST   /api/auth/reset-password    - Reset password with token
GET    /api/auth/me                - Get current user (Protected)
```

### 🏪 Vendor Management (`/api/vendor`)
```
GET    /api/vendor/profile         - Get vendor profile
PUT    /api/vendor/profile         - Update vendor profile
POST   /api/vendor/create-store    - Create vendor store
GET    /api/vendor/dashboard/stats - Get dashboard statistics
GET    /api/vendor/products        - Get vendor products
POST   /api/vendor/products        - Create product
PUT    /api/vendor/products/:id    - Update product
DELETE /api/vendor/products/:id    - Delete product
POST   /api/vendor/products/bulk   - Bulk upload products (CSV)
GET    /api/vendor/orders          - Get vendor orders
PUT    /api/vendor/orders/:id      - Update order status
```

### 📦 Products (`/api/products`)
```
GET    /api/products                          - Get all products
GET    /api/products/search?q=tomato          - Search products
GET    /api/products/category/:category       - Products by category
GET    /api/products/categories/all           - Get all categories
GET    /api/products/price-range              - Get price range
GET    /api/products/featured                 - Featured products
GET    /api/products/deals                    - Deals & discounts
GET    /api/products/new-arrivals             - New arrivals
GET    /api/products/:productId               - Product details
GET    /api/products/vendor/:vendorId         - Vendor products
GET    /api/products/recommendations/for-you  - Personalized (Protected)
```

### 📍 Location Search (`/api/location`)
```
GET    /api/location/search-vendors           - Search vendors by location
       ?location=London&radius=10&category=vegetables
GET    /api/location/vendor/:vendorId         - Get vendor details
GET    /api/location/nearby                   - Get nearby vendors
```

### 👥 Customer (`/api/customers`)
```
POST   /api/customers/register        - Register customer
POST   /api/customers/login           - Login
GET    /api/customers/profile         - Get profile (Protected)
PUT    /api/customers/profile         - Update profile (Protected)
POST   /api/customers/addresses       - Add address (Protected)
GET    /api/customers/addresses       - Get addresses (Protected)
PUT    /api/customers/addresses/:id   - Update address (Protected)
DELETE /api/customers/addresses/:id   - Delete address (Protected)
```

### 🛒 Shopping Cart (`/api/cart`)
```
GET    /api/cart                      - Get cart (Protected)
POST   /api/cart/items                - Add item (Protected)
PUT    /api/cart/items/:itemId        - Update quantity (Protected)
DELETE /api/cart/items/:itemId        - Remove item (Protected)
DELETE /api/cart                      - Clear cart (Protected)
POST   /api/cart/coupons              - Apply coupon (Protected)
DELETE /api/cart/coupons              - Remove coupon (Protected)
```

### 💳 Checkout (`/api/checkout`)
```
POST   /api/checkout/payment/initialize  - Initialize payment (Protected)
GET    /api/checkout/payment/verify/:ref - Verify payment
POST   /api/checkout/orders              - Create order (Protected)
GET    /api/checkout/orders              - Get order history (Protected)
GET    /api/checkout/orders/:id          - Get order details (Protected)
PUT    /api/checkout/orders/:id/cancel   - Cancel order (Protected)
```

### 🚴 Rider Management (`/api/rider`)
```
POST   /api/rider/auth/register       - Register rider
POST   /api/rider/auth/login          - Login rider
GET    /api/rider/stores/nearby       - Find nearby stores
GET    /api/rider/stores/connected    - Connected stores
POST   /api/rider/stores/:id/connect  - Request connection
DELETE /api/rider/stores/:id          - Disconnect from store
```

### 🚚 Delivery (`/api/picker`)
```
GET    /api/picker/deliveries/active          - Active deliveries
GET    /api/picker/deliveries/available       - Available deliveries
POST   /api/picker/deliveries/:id/accept      - Accept delivery
POST   /api/picker/deliveries/:id/pickup      - Mark picked up
POST   /api/picker/deliveries/:id/deliver     - Mark delivered
PUT    /api/picker/deliveries/:id/status      - Update status
```

### 🔔 Notifications (`/api/notifications`)
```
GET    /api/notifications             - Get notifications (Protected)
PUT    /api/notifications/:id/read    - Mark as read (Protected)
PUT    /api/notifications/read-all    - Mark all as read (Protected)
DELETE /api/notifications/:id         - Delete notification (Protected)
```

### 💰 Payments (`/api/payments`)
```
POST   /api/payments/create-intent    - Create Stripe payment intent
POST   /api/payments/confirm           - Confirm payment
POST   /api/payments/webhook           - Stripe webhook (Public)
GET    /api/payments/config            - Get Stripe config
POST   /api/payments/refund            - Process refund (Admin/Vendor)
```

### 👨‍💼 Admin (`/api/admin`)
```
GET    /api/admin/vendors             - Get all vendors
PUT    /api/admin/vendors/:id/verify  - Verify vendor
GET    /api/admin/stats               - Platform statistics
```

### 🌱 Seed Data (`/api/seed`)
```
POST   /api/seed/vendors              - Seed sample vendors
POST   /api/seed/products             - Seed sample products
GET    /api/seed/status               - Get seed status
```

---

## 🧪 TESTING EXAMPLES

### Test Vendor Registration
```bash
curl -X POST https://afrimercato-api.fly.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Vendor",
    "email": "vendor@test.com",
    "password": "Password123",
    "confirmPassword": "Password123",
    "role": "vendor"
  }'
```

### Test Login
```bash
curl -X POST https://afrimercato-api.fly.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "vendor@test.com",
    "password": "Password123"
  }'
```

### Test Product Search
```bash
curl "https://afrimercato-api.fly.dev/api/products/search?q=tomato"
```

### Test Location Search
```bash
curl "https://afrimercato-api.fly.dev/api/location/search-vendors?location=London"
```

---

## 🔑 AUTHENTICATION

Most endpoints require authentication. After login, you'll receive a JWT token:

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Use this token in subsequent requests:

```bash
curl https://afrimercato-api.fly.dev/api/vendor/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🚨 ERROR RESPONSES

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "ERROR_CODE"
}
```

Common error codes:
- `VALIDATION_ERROR` - Invalid input data
- `UNAUTHORIZED` - Not logged in or invalid token
- `FORBIDDEN` - No permission for this action
- `NOT_FOUND` - Resource not found
- `INTERNAL_SERVER_ERROR` - Server error

---

## 📌 NOTES

1. **Base URL**: All endpoints are prefixed with `https://afrimercato-api.fly.dev`
2. **Rate Limiting**: 100 requests per 15 minutes per IP
3. **CORS**: Allowed origins include www.afrimercato.com and localhost
4. **Content-Type**: Always use `application/json` for POST/PUT requests
5. **Pagination**: Most list endpoints support `page` and `limit` query params

---

## ✅ API STATUS

- Backend: ✅ LIVE at https://afrimercato-api.fly.dev
- Database: ✅ Connected to MongoDB
- Health: ✅ All systems operational
- Response Time: < 200ms

Last Updated: 2025-11-28
