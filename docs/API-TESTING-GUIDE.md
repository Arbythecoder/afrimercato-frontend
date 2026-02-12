# API TESTING GUIDE - CUSTOMERS & PICKERS

Quick guide to test all new endpoints using curl or Postman.

---

## 🧪 CUSTOMER SHOPPING FLOW TEST

### **Step 1: Customer Registration**
```bash
curl -X POST http://localhost:5000/api/customers/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "customer@test.com",
    "password": "Password123",
    "phone": "+353-800-555-0001"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Customer registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {...},
    "customer": {...}
  }
}
```

**Save the token for next requests!**

---

### **Step 2: Browse Products**
```bash
# Get all products with filters
curl "http://localhost:5000/api/products?page=1&limit=20&category=vegetables&minPrice=0&maxPrice=100&sort=price_asc"

# Search products
curl "http://localhost:5000/api/products/search?q=tomato&limit=10"

# Get featured products
curl "http://localhost:5000/api/products/featured?limit=12"

# Get deals
curl "http://localhost:5000/api/products/deals?page=1&limit=20"

# Get categories
curl "http://localhost:5000/api/products/categories/all"
```

---

### **Step 3: Add Items to Cart**
```bash
# Replace YOUR_TOKEN with the token from Step 1
# Replace PRODUCT_ID with actual product ID from Step 2

curl -X POST http://localhost:5000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "productId": "PRODUCT_ID",
    "quantity": 2
  }'
```

---

### **Step 4: View Cart**
```bash
curl http://localhost:5000/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "items": [
        {
          "product": {...},
          "vendor": {...},
          "quantity": 2,
          "price": 5.00
        }
      ],
      "pricing": {
        "subtotal": 10.00,
        "deliveryFee": 3.50,
        "serviceFee": 0.25,
        "total": 13.75
      }
    },
    "groupedByVendor": [
      {
        "vendor": "Vendor Name",
        "items": [...],
        "subtotal": 10.00
      }
    ]
  }
}
```

---

### **Step 5: Add Delivery Address**
```bash
curl -X POST http://localhost:5000/api/customers/addresses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "label": "Home",
    "street": "123 Main St",
    "apartment": "Apt 4B",
    "city": "Dublin",
    "state": "Dublin",
    "postcode": "D01 ABC1",
    "country": "Ireland",
    "isDefault": true,
    "deliveryInstructions": "Ring doorbell"
  }'
```

**Save the address ID from response!**

---

### **Step 6: Apply Coupon (Optional)**
```bash
curl -X POST http://localhost:5000/api/cart/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "code": "WELCOME10"
  }'
```

---

### **Step 7: Initialize Checkout**
```bash
curl -X POST http://localhost:5000/api/checkout/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deliveryAddressId": "ADDRESS_ID_FROM_STEP_5",
    "deliveryNotes": "Please call when arriving"
  }'
```

---

### **Step 8: Initialize Payment**
```bash
curl -X POST http://localhost:5000/api/checkout/payment/initialize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "deliveryAddressId": "ADDRESS_ID_FROM_STEP_5"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment initialized",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "abc123xyz",
    "reference": "AFM-1234567890-abc123",
    "amount": 13.75
  }
}
```

**In production, redirect customer to `authorizationUrl`**

---

### **Step 9: Verify Payment (After Paystack Payment)**
```bash
# Replace PAYMENT_REFERENCE with reference from Step 8
curl http://localhost:5000/api/checkout/payment/verify/PAYMENT_REFERENCE \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**This creates the orders and clears the cart**

---

### **Step 10: View Orders**
```bash
# Get all orders
curl http://localhost:5000/api/checkout/orders?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get specific order
curl http://localhost:5000/api/checkout/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🏍️ DELIVERY ASSIGNMENT TEST (Vendor)

### **Step 1: Login as Vendor**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "freshvalley@afrimercato.com",
    "password": "Password123"
  }'
```

**Save vendor token!**

---

### **Step 2: Auto-Assign Rider**
```bash
curl -X POST http://localhost:5000/api/delivery-assignment/auto-assign/ORDER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -d '{
    "vehicleType": "bicycle"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Rider assigned successfully",
  "data": {
    "rider": {
      "id": "...",
      "name": "John Rider",
      "rating": 4.8,
      "vehicleType": "bicycle",
      "distance": "2.3"
    },
    "delivery": {
      "id": "...",
      "estimatedPickupTime": "2025-10-27T12:30:00.000Z",
      "estimatedDeliveryTime": "2025-10-27T13:00:00.000Z"
    }
  }
}
```

---

### **Step 3: Get Available Riders**
```bash
curl "http://localhost:5000/api/delivery-assignment/available-riders/VENDOR_ID?vehicleType=bicycle&radius=10" \
  -H "Authorization: Bearer VENDOR_TOKEN"
```

---

### **Step 4: Manual Assignment (Optional)**
```bash
curl -X POST http://localhost:5000/api/delivery-assignment/manual-assign/ORDER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -d '{
    "riderId": "RIDER_ID"
  }'
```

---

## 🚴 PICKER/RIDER DELIVERY TEST

### **Step 1: Login as Rider**
```bash
curl -X POST http://localhost:5000/api/rider/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "rider@test.com",
    "password": "Password123"
  }'
```

**Save rider token!**

---

### **Step 2: View Active Deliveries**
```bash
curl http://localhost:5000/api/picker/deliveries/active \
  -H "Authorization: Bearer RIDER_TOKEN"
```

---

### **Step 3: Accept Delivery**
```bash
curl -X POST http://localhost:5000/api/picker/deliveries/DELIVERY_ID/accept \
  -H "Authorization: Bearer RIDER_TOKEN"
```

---

### **Step 4: Mark Picked Up**
```bash
curl -X POST http://localhost:5000/api/picker/deliveries/DELIVERY_ID/pickup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer RIDER_TOKEN" \
  -d '{
    "latitude": 53.3498,
    "longitude": -6.2603,
    "note": "Picked up from vendor",
    "photos": ["https://example.com/photo1.jpg"]
  }'
```

---

### **Step 5: Mark In Transit**
```bash
curl -X POST http://localhost:5000/api/picker/deliveries/DELIVERY_ID/in-transit \
  -H "Authorization: Bearer RIDER_TOKEN"
```

---

### **Step 6: Complete Delivery**
```bash
curl -X POST http://localhost:5000/api/picker/deliveries/DELIVERY_ID/complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer RIDER_TOKEN" \
  -d '{
    "latitude": 53.3450,
    "longitude": -6.2550,
    "photos": [
      "https://example.com/delivery-proof1.jpg",
      "https://example.com/delivery-proof2.jpg"
    ],
    "signature": "data:image/png;base64,iVBOR...",
    "customerName": "John Doe",
    "note": "Delivered to customer at door"
  }'
```

---

### **Step 7: View Earnings**
```bash
# Today's earnings
curl "http://localhost:5000/api/picker/earnings?period=today" \
  -H "Authorization: Bearer RIDER_TOKEN"

# This week
curl "http://localhost:5000/api/picker/earnings?period=week" \
  -H "Authorization: Bearer RIDER_TOKEN"

# This month
curl "http://localhost:5000/api/picker/earnings?period=month" \
  -H "Authorization: Bearer RIDER_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "period": "today",
    "earnings": {
      "total": 24.50,
      "average": 8.17,
      "deliveries": 3
    },
    "lifetime": {
      "total": 245.00,
      "deliveries": 32
    }
  }
}
```

---

### **Step 8: Get Rider Stats**
```bash
curl http://localhost:5000/api/picker/stats \
  -H "Authorization: Bearer RIDER_TOKEN"
```

---

## 🧪 POSTMAN COLLECTION

Create a Postman collection with the following structure:

```
Afrimercato API
├── Customer
│   ├── Register
│   ├── Login
│   ├── Get Profile
│   ├── Add Address
│   └── Manage Favorites
├── Products
│   ├── Browse Products
│   ├── Search Products
│   ├── Get Categories
│   └── Get Featured
├── Cart
│   ├── Add to Cart
│   ├── View Cart
│   ├── Update Quantity
│   └── Apply Coupon
├── Checkout
│   ├── Initialize Checkout
│   ├── Initialize Payment
│   ├── Verify Payment
│   └── View Orders
├── Delivery Assignment (Vendor)
│   ├── Auto Assign Rider
│   ├── Manual Assign
│   └── Get Available Riders
└── Picker/Rider
    ├── Get Active Deliveries
    ├── Accept Delivery
    ├── Mark Picked Up
    ├── Mark In Transit
    ├── Complete Delivery
    └── View Earnings
```

---

## 📝 NOTES

1. **Authentication:** All protected endpoints require `Authorization: Bearer TOKEN` header
2. **IDs:** Replace placeholder IDs (ORDER_ID, PRODUCT_ID, etc.) with actual IDs from responses
3. **Paystack Testing:** Use Paystack test cards in development:
   - Card: 4084084084084081
   - CVV: Any 3 digits
   - Expiry: Any future date
   - PIN: 0000
4. **CORS:** Frontend must be in CORS allowlist or use development mode

---

## ✅ EXPECTED RESULTS

After running all tests successfully:
- ✅ Customer registered and logged in
- ✅ Products browsed and filtered
- ✅ Items added to cart
- ✅ Cart grouped by vendor
- ✅ Coupon applied (if valid)
- ✅ Checkout initialized
- ✅ Payment initialized with Paystack
- ✅ Payment verified
- ✅ Multi-vendor orders created
- ✅ Rider auto-assigned
- ✅ Delivery accepted by rider
- ✅ Delivery marked picked up
- ✅ Delivery completed with proof
- ✅ Earnings calculated correctly

**All systems operational! 🚀**
