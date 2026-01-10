# AFRIMERCATO - COMPLETE PROJECT OVERVIEW FOR CLIENT

## 📋 TABLE OF CONTENTS
1. [What is Afrimercato?](#what-is-afrimercato)
2. [User Types & Their Journeys](#user-types--their-journeys)
3. [Vendor Registration & Store Setup](#vendor-registration--store-setup)
4. [How Customers Order](#how-customers-order)
5. [Order Fulfillment Flow](#order-fulfillment-flow)
6. [Technical Architecture](#technical-architecture)
7. [Database Models Explained](#database-models-explained)
8. [API Routes & Endpoints](#api-routes--endpoints)

---

## 🎯 WHAT IS AFRIMERCATO?

Afrimercato is a **multi-vendor grocery marketplace** similar to UberEats, Instacart, or DoorDash, but specialized for grocery shopping. It connects:

- **Vendors** (grocery stores, farms, butchers, bakeries)
- **Customers** (people who want to buy groceries)
- **Pickers** (warehouse staff who pick and pack orders)
- **Riders** (delivery drivers who deliver orders to customers)

### Key Features
- 🏪 Multiple vendors can have their own online stores
- 🛒 Customers can browse, add to cart, and checkout
- 📦 Professional pickers help prepare orders
- 🚚 Delivery riders bring orders to customers
- 💰 Integrated payment processing
- 📊 Real-time order tracking
- ⭐ Rating and review system

---

## 👥 USER TYPES & THEIR JOURNEYS

### 1. VENDORS (Store Owners)

**Who are they?**
- Grocery store owners
- Farmers selling fresh produce
- Butchers
- Bakeries
- Any food business wanting to sell online

**What can they do?**

#### A. Registration & Onboarding (vendorAuthRoutes.js)
```
Step 1: Register Account
POST /api/vendor/register
- Provide: storeName, email, password, category, address
- System generates unique storeId (e.g., "FP-0001-A3B4")
- Store name becomes their URL: example.com/abigealstore

Step 2: Email Verification
- Vendor receives email verification link
- Click link to verify email

Step 3: Admin Approval (UberEats-Style)
- Admin reviews vendor application
- Admin approves/rejects vendor
- Status: pending → approved/rejected
- Only approved vendors can access dashboard
```

#### B. Store Setup & Profile (vendorRoutes.js)
```
After Approval:
POST /api/vendor/profile
- Complete store profile
- Upload logo
- Set business hours
- Add bank details for payments
- Configure delivery settings
```

#### C. Managing Products
```
Create Products:
POST /api/vendor/products
{
  "name": "Fresh Organic Tomatoes",
  "category": "vegetables",
  "price": 500,
  "unit": "kg",
  "stock": 100,
  "images": [...]
}

Update Products:
PUT /api/vendor/products/:id

Bulk Operations:
POST /api/vendor/products/bulk-delete
POST /api/vendor/products/bulk-status
POST /api/vendor/products/bulk-price
POST /api/vendor/products/bulk-stock
```

#### D. Managing Orders
```
View All Orders:
GET /api/vendor/orders

Update Order Status:
PUT /api/vendor/orders/:id/status
- confirmed → preparing → ready → out-for-delivery → delivered

Monitor Dashboard:
GET /api/vendor/dashboard/stats
- Total revenue
- Active orders
- Low stock alerts
- Performance metrics
```

#### E. Store Naming Convention
Each vendor gets a unique store identifier:
- **Store ID Format**: `XX- YYYY-ZZZZ`
  - XX = Category code (FP=Fresh Produce, GR=Groceries, MF=Meat/Fish)
  - YYYY = Sequential number (0001, 0002, 0003...)
  - ZZZZ = Random characters

- **Store URL**: Each vendor's storeName becomes their public URL
  - Example: "Abigeal's Fresh Market" → `/stores/abigealsfreshmarket`
  - Displayed as: **abigealstore.afrimercato.com** (or similar)

---

### 2. CUSTOMERS (Shoppers)

**Who are they?**
- Anyone who wants to buy groceries online

**What can they do?**

#### A. Registration (customerRoutes.js)
```
POST /api/customer/register
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+234-800-555-1234"
}

POST /api/customer/login
```

#### B. Shopping Journey

**Step 1: Browse Stores & Products**
```
View All Stores:
GET /api/browse/stores
- See all approved vendors in your area
- Filter by: category, rating, delivery time
- Search by name or products

Search Products:
GET /api/browse/products/search?q=tomatoes
- Search across all stores
- Filter by price, category, vendor
```

**Step 2: Add to Cart**
```
POST /api/cart/add
{
  "productId": "...",
  "vendorId": "...",
  "quantity": 2
}

GET /api/cart
- View cart contents
- See total price
- See delivery estimate
```

**Step 3: Checkout**
```
POST /api/checkout
{
  "cartItems": [...],
  "deliveryAddress": {
    "street": "123 Main St",
    "city": "Lagos",
    "postcode": "100001"
  },
  "paymentMethod": "card"
}

System generates:
- Order number: AFM2026000001
- Payment link
- Estimated delivery time
```

**Step 4: Track Order**
```
GET /api/tracking/:orderNumber
- See order status
- View picker progress
- Track rider location
- Get delivery ETA
```

**Step 5: Receive & Review**
```
After delivery:
POST /api/customer/orders/:orderId/review
{
  "rating": 5,
  "comment": "Great service!"
}
```

#### C. Customer Features
```
Manage Profile:
GET/PUT /api/customer/profile

Saved Addresses:
GET /api/customer/addresses
POST /api/customer/addresses

Order History:
GET /api/customer/orders

Wishlist:
POST /api/customer/wishlist
GET /api/customer/wishlist

Favorite Vendors:
POST /api/customer/favorites/vendors/:vendorId
```

---

### 3. PICKERS (Warehouse Staff)

**Who are they?**
- Store employees who pick items from shelves
- Pack orders for delivery
- Work inside vendor stores
- Can work at multiple stores

**What can they do?**

#### A. Registration (pickerAuthRoutes.js)
```
POST /api/picker/auth/register
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "+234-800-555-5678",
  "equipment": {
    "hasSmartphone": true,
    "hasBarcodeScanner": false
  }
}
```

#### B. Connect to Vendor Stores
```
Request Store Connection:
POST /api/picker/auth/stores/request
{
  "vendorId": "...",
  "storeRole": "picker",
  "sections": ["fresh-produce", "dairy"],
  "schedule": {
    "monday": { "start": "09:00", "end": "17:00", "enabled": true },
    ...
  }
}

Vendor approves/rejects request
```

#### C. Daily Workflow

**Check In to Store**
```
POST /api/picker/auth/checkin
{
  "vendorId": "..."
}
- Marks picker as available
- System can now assign orders
```

**View Assigned Orders**
```
GET /api/picker/orders
- See pending orders
- View items to pick
- Check special instructions
```

**Pick Items**
```
POST /api/picker/orders/:orderId/start-picking
- Mark order as "picking"

For each item:
PUT /api/picker/orders/:orderId/items/:itemId
{
  "quantityPicked": 5,
  "isPicked": true,
  "notes": "Fresh batch, expires in 3 days"
}

Handle Issues:
{
  "issue": "out_of_stock",
  "substitute": {
    "productId": "...",
    "name": "Similar product"
  }
}
```

**Pack Order**
```
POST /api/picker/orders/:orderId/pack
{
  "packingPhotos": ["photo1.jpg"],
  "notes": "Fragile items on top"
}
- Mark as "ready_for_pickup"
- Notify rider
```

**Check Out**
```
POST /api/picker/auth/checkout
- End shift
- System calculates earnings
```

#### D. Performance Tracking
```
GET /api/picker/auth/stats
{
  "totalOrdersPicked": 145,
  "pickingAccuracy": 98.5,
  "averagePickTime": 12.5,
  "rating": 4.8,
  "earningsThisWeek": 450.00
}
```

---

### 4. RIDERS (Delivery Drivers)

**Who are they?**
- Delivery drivers
- Own vehicle (bicycle, motorcycle, car)
- Deliver orders from vendors to customers
- Can also be pickers (dual role)

**What can they do?**

#### A. Registration (riderAuthRoutes.js)
```
POST /api/rider/auth/register
{
  "fullName": "Mike Johnson",
  "email": "mike@example.com",
  "password": "password123",
  "phone": "+234-800-555-9999",
  "vehicle": {
    "type": "motorcycle",
    "plate": "ABC-123",
    "color": "blue",
    "model": "Honda CB125"
  },
  "serviceAreas": {
    "postcodes": ["SW1A", "W1A"],
    "cities": ["London"],
    "maxDistance": 10
  }
}
```

#### B. Upload Documents
```
POST /api/rider/auth/documents
- Driving license
- Insurance certificate
- Background check

Admin verifies documents
```

#### C. Connect to Vendor Stores
```
Similar to pickers:
Riders request to connect with stores in their area
Vendors approve riders they want to work with
```

#### D. Daily Workflow

**Go Online**
```
PUT /api/rider/auth/availability
{
  "isAvailable": true
}
```

**Accept Deliveries**
```
GET /api/rider/deliveries/available
- See available deliveries
- View pickup location
- See delivery address
- Check payout

POST /api/rider/deliveries/:orderId/accept
```

**Pickup Order**
```
Arrive at store:
POST /api/rider/deliveries/:orderId/arrived-pickup

Verify order:
POST /api/rider/deliveries/:orderId/pickup
{
  "verificationCode": "1234",
  "pickupPhoto": "photo.jpg"
}
```

**Deliver Order**
```
Update Location (continuous):
PUT /api/rider/auth/location
{
  "latitude": 51.5074,
  "longitude": -0.1278
}

Arrive at customer:
POST /api/rider/deliveries/:orderId/arrived-delivery

Complete delivery:
POST /api/rider/deliveries/:orderId/deliver
{
  "deliveryPhoto": "photo.jpg",
  "customerSignature": "...",
  "deliveryCode": "5678"
}
```

**Go Offline**
```
PUT /api/rider/auth/availability
{
  "isAvailable": false
}
```

#### E. Dual Role: Picker + Rider
```
POST /api/rider/auth/picker-mode
{
  "enabled": true
}

Now rider can:
- Pick orders when in store
- Deliver orders when on the road
- Earn from both activities
```

---

## 🔄 ORDER FULFILLMENT FLOW

### Complete Order Journey

```
1. CUSTOMER PLACES ORDER
   ↓
   Status: "pending"
   - Order created with unique number (AFM2026000001)
   - Payment initiated

2. VENDOR CONFIRMS ORDER
   ↓
   Status: "confirmed"
   - Vendor reviews order
   - Confirms availability of items

3. PICKER ASSIGNED
   ↓
   Status: "assigned_picker"
   - System assigns best available picker
   - Picker receives notification

4. PICKING STARTS
   ↓
   Status: "picking"
   - Picker scans/picks each item
   - Reports any issues
   - Suggests substitutes if needed

5. PICKING COMPLETE
   ↓
   Status: "picked"
   - All items picked
   - Ready for packing

6. PACKING
   ↓
   Status: "packing"
   - Picker packs items carefully
   - Takes photos
   - Adds ice packs if needed

7. READY FOR PICKUP
   ↓
   Status: "ready_for_pickup"
   - Rider notified
   - Order staged at pickup area

8. RIDER PICKS UP
   ↓
   Status: "out-for-delivery"
   - Rider collects order
   - Verifies items
   - Starts delivery

9. DELIVERY IN PROGRESS
   ↓
   - Customer can track rider location
   - Estimated time updates

10. DELIVERED
    ↓
    Status: "delivered"
    - Rider delivers to customer
    - Customer confirms receipt
    - Photo proof of delivery

11. COMPLETED
    ↓
    Status: "completed"
    - Customer reviews
    - Payments processed
    - Earnings distributed
```

---

## 🏗️ TECHNICAL ARCHITECTURE

### Backend Structure
```
afrimercato-backend/
├── src/
│   ├── models/           # Database schemas
│   │   ├── User.js       # All user accounts
│   │   ├── Vendor.js     # Store profiles
│   │   ├── Product.js    # Products
│   │   ├── Order.js      # Orders
│   │   ├── Rider.js      # Rider profiles
│   │   ├── Picker.js     # Picker profiles
│   │   ├── Customer.js   # Customer profiles
│   │   └── Cart.js       # Shopping carts
│   │
│   ├── controllers/      # Business logic
│   │   ├── vendorAuthController.js
│   │   ├── vendorController.js
│   │   ├── customerController.js
│   │   ├── pickerAuthController.js
│   │   ├── riderAuthController.js
│   │   └── ...
│   │
│   ├── routes/           # API endpoints
│   │   ├── vendorAuthRoutes.js
│   │   ├── vendorRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── pickerAuthRoutes.js
│   │   ├── riderAuthRoutes.js
│   │   └── ...
│   │
│   ├── middleware/       # Security & validation
│   │   ├── auth.js       # JWT authentication
│   │   ├── validator.js  # Input validation
│   │   └── ...
│   │
│   └── utils/            # Helper functions
│       ├── email.js      # Email service
│       ├── otp.js        # OTP generation
│       └── encryption.js # Data encryption
│
└── server.js             # Main application
```

---

## 💾 DATABASE MODELS EXPLAINED

### 1. User Model (User.js)
**Purpose**: Base account for everyone (vendors, customers, riders, pickers, admins)

```javascript
{
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password",
  roles: ["customer"], // Can have multiple: ["picker", "rider"]
  primaryRole: "customer", // Main dashboard to show
  phone: "+234-800-555-1234",
  isEmailVerified: true,
  approvalStatus: "approved", // For vendors only
  createdAt: "2026-01-08T10:00:00Z"
}
```

### 2. Vendor Model (Vendor.js)
**Purpose**: Store profile for vendors

```javascript
{
  user: ObjectId("..."), // Link to User
  storeId: "FP-0001-A3B4", // Unique store ID
  storeName: "Abigeal's Fresh Market",
  description: "Fresh organic produce",
  category: "fresh-produce",
  logo: "logo.jpg",

  address: {
    street: "123 Market St",
    city: "Lagos",
    state: "Lagos",
    postalCode: "100001",
    coordinates: {
      latitude: 6.5244,
      longitude: 3.3792
    }
  },

  phone: "+234-800-555-0001",

  businessHours: {
    monday: { open: "09:00", close: "18:00", isOpen: true },
    ...
  },

  approvalStatus: "approved", // pending, approved, rejected
  isPublic: true, // Show in customer searches
  isVerified: true,

  rating: 4.8,
  reviewCount: 245,

  stats: {
    totalOrders: 1543,
    totalRevenue: 125000,
    totalProducts: 87
  },

  deliverySettings: {
    estimatedPrepTime: 30,
    minimumOrderValue: 1000,
    acceptingOrders: true
  }
}
```

### 3. Product Model (Product.js)
**Purpose**: Items vendors sell

```javascript
{
  vendor: ObjectId("..."),
  name: "Fresh Organic Tomatoes",
  description: "Farm-fresh tomatoes",
  category: "vegetables",
  price: 500,
  unit: "kg",

  images: [
    { url: "image1.jpg", isPrimary: true },
    { url: "image2.jpg", isPrimary: false }
  ],

  stock: 100,
  lowStockThreshold: 10,
  inStock: true,

  isActive: true,

  nutritionInfo: {
    calories: 18,
    protein: 0.9,
    carbs: 3.9
  },

  rating: 4.5,
  reviewCount: 45
}
```

### 4. Order Model (Order.js)
**Purpose**: Customer orders

```javascript
{
  orderNumber: "AFM2026000001",
  customer: ObjectId("..."),
  vendor: ObjectId("..."),

  items: [
    {
      product: ObjectId("..."),
      name: "Fresh Organic Tomatoes",
      price: 500,
      quantity: 2,
      unit: "kg",
      subtotal: 1000
    }
  ],

  pricing: {
    subtotal: 1000,
    deliveryFee: 200,
    tax: 75,
    discount: 0,
    total: 1275
  },

  deliveryAddress: {
    fullName: "John Doe",
    phone: "+234-800-555-1234",
    street: "456 Home St",
    city: "Lagos",
    postalCode: "100001"
  },

  status: "picking", // See status flow above

  // PICKING DETAILS
  picking: {
    status: "picking",
    picker: ObjectId("..."),
    startedAt: "2026-01-08T10:15:00Z",
    itemsPicked: [
      {
        productId: ObjectId("..."),
        quantityPicked: 2,
        quantityRequested: 2,
        isPicked: true,
        pickedAt: "2026-01-08T10:18:00Z"
      }
    ],
    accuracy: 100,
    pickTime: 12
  },

  // DELIVERY DETAILS
  delivery: {
    type: "home-delivery",
    rider: ObjectId("..."),
    estimatedTime: "2026-01-08T11:30:00Z",
    trackingNumber: "TRK-12345"
  },

  payment: {
    method: "card",
    status: "paid",
    paidAt: "2026-01-08T10:00:00Z",
    transactionId: "TXN-98765"
  }
}
```

### 5. Picker Model (Picker.js)
**Purpose**: Picker profiles

```javascript
{
  user: ObjectId("..."),

  connectedStores: [
    {
      vendorId: ObjectId("..."),
      status: "approved",
      storeRole: "picker",
      sections: ["fresh-produce", "dairy"],
      schedule: { ... },
      approvedAt: "2026-01-01T00:00:00Z"
    }
  ],

  availability: {
    isAvailable: true,
    currentStore: ObjectId("..."),
    lastCheckIn: "2026-01-08T09:00:00Z"
  },

  stats: {
    totalOrdersPicked: 245,
    pickingAccuracy: 98.5,
    averagePickTime: 12.5,
    rating: 4.8,
    totalEarnings: 2450.00
  },

  verification: {
    status: "verified",
    idDocument: { ... },
    backgroundCheck: { status: "passed" }
  }
}
```

### 6. Rider Model (Rider.js)
**Purpose**: Rider profiles

```javascript
{
  user: ObjectId("..."),
  riderId: "RD-0001-X7Y9",

  vehicle: {
    type: "motorcycle",
    plate: "ABC-123",
    color: "blue",
    model: "Honda CB125"
  },

  serviceAreas: {
    postcodes: ["SW1A", "W1A"],
    cities: ["London"],
    maxDistance: 10
  },

  connectedStores: [
    {
      vendor: ObjectId("..."),
      status: "approved",
      approvedAt: "2026-01-01T00:00:00Z"
    }
  ],

  isVerified: true,
  isActive: true,
  isAvailable: true,

  performance: {
    totalDeliveries: 543,
    completedDeliveries: 538,
    averageRating: 4.9,
    averageDeliveryTime: 25,
    onTimeDeliveryRate: 98.5
  },

  earnings: {
    totalEarnings: 8650.00,
    pendingEarnings: 350.00,
    paidEarnings: 8300.00
  },

  currentLocation: {
    latitude: 51.5074,
    longitude: -0.1278,
    lastUpdated: "2026-01-08T10:30:00Z"
  },

  isAlsoPicker: true, // Dual role
  pickerStores: [ObjectId("...")]
}
```

---

## 🔌 API ROUTES & ENDPOINTS

### VENDOR ROUTES

#### Authentication (vendorAuthRoutes.js)
```
POST   /api/vendor/register          # Register new vendor
POST   /api/vendor/login             # Login (step 1 - credentials)
POST   /api/vendor/verify-otp        # Login (step 2 - OTP)
GET    /api/vendor/verify-email/:token  # Email verification
```

#### Vendor Operations (vendorRoutes.js)
```
# Profile
POST   /api/vendor/profile           # Create profile
GET    /api/vendor/profile           # Get profile
PUT    /api/vendor/profile           # Update profile

# Dashboard
GET    /api/vendor/dashboard/stats   # Dashboard stats
GET    /api/vendor/dashboard/chart-data  # Analytics charts

# Products
GET    /api/vendor/products          # List all products
POST   /api/vendor/products          # Create product
GET    /api/vendor/products/:id      # Get single product
PUT    /api/vendor/products/:id      # Update product
DELETE /api/vendor/products/:id      # Delete product
PATCH  /api/vendor/products/:id/stock  # Update stock

# Bulk Operations
POST   /api/vendor/products/bulk-delete  # Delete multiple
POST   /api/vendor/products/bulk-status  # Update status
POST   /api/vendor/products/bulk-price   # Update prices
POST   /api/vendor/products/bulk-stock   # Update stock

# Orders
GET    /api/vendor/orders            # List all orders
GET    /api/vendor/orders/:id        # Get order details
PUT    /api/vendor/orders/:id/status # Update order status

# Analytics
GET    /api/vendor/analytics/revenue # Revenue analytics
GET    /api/vendor/reports/sales     # Sales report
GET    /api/vendor/reports/inventory # Inventory report
```

### CUSTOMER ROUTES (customerRoutes.js)
```
# Authentication
POST   /api/customer/register        # Register
POST   /api/customer/login           # Login

# Profile
GET    /api/customer/profile         # Get profile
PUT    /api/customer/profile         # Update profile
GET    /api/customer/stats           # Customer stats

# Dashboard
GET    /api/customer/dashboard/stats # Dashboard
GET    /api/customer/orders/recent   # Recent orders

# Addresses
GET    /api/customer/addresses       # List addresses
POST   /api/customer/addresses       # Add address
PUT    /api/customer/addresses/:id   # Update address
DELETE /api/customer/addresses/:id   # Delete address

# Wishlist
GET    /api/customer/wishlist        # Get wishlist
POST   /api/customer/wishlist        # Add to wishlist
DELETE /api/customer/wishlist/:productId  # Remove

# Favorites
POST   /api/customer/favorites/vendors/:vendorId  # Toggle favorite vendor
POST   /api/customer/favorites/products/:productId # Toggle favorite product
```

### PICKER ROUTES (pickerAuthRoutes.js)
```
# Authentication
POST   /api/picker/auth/register     # Register
POST   /api/picker/auth/login        # Login

# Profile
GET    /api/picker/auth/profile      # Get profile
PUT    /api/picker/auth/profile      # Update profile

# Store Connections
POST   /api/picker/auth/stores/request  # Request store connection
GET    /api/picker/auth/stores       # Get connected stores

# Shift Management
POST   /api/picker/auth/checkin      # Check in
POST   /api/picker/auth/checkout     # Check out

# Stats & Roles
GET    /api/picker/auth/stats        # Performance stats
POST   /api/picker/auth/add-role     # Add role (e.g., rider)
POST   /api/picker/auth/switch-role  # Switch primary role
```

### RIDER ROUTES (riderAuthRoutes.js)
```
# Authentication
POST   /api/rider/auth/register      # Register
POST   /api/rider/auth/login         # Login

# Profile
GET    /api/rider/auth/profile       # Get profile
PUT    /api/rider/auth/profile       # Update profile

# Documents
POST   /api/rider/auth/documents     # Upload documents
GET    /api/rider/auth/verification  # Check verification

# Availability
PUT    /api/rider/auth/availability  # Toggle online/offline
PUT    /api/rider/auth/location      # Update GPS location

# Dual Role
POST   /api/rider/auth/picker-mode   # Enable picker role
```

### BROWSING ROUTES (productBrowsingRoutes.js)
```
# Customers browse products and stores
GET    /api/browse/stores            # List all stores
GET    /api/browse/stores/:id        # Store details
GET    /api/browse/products          # List products
GET    /api/browse/products/search   # Search products
GET    /api/browse/products/:id      # Product details
```

### CART ROUTES (cartRoutes.js)
```
GET    /api/cart                     # Get cart
POST   /api/cart/add                 # Add item
PUT    /api/cart/update/:itemId      # Update quantity
DELETE /api/cart/remove/:itemId      # Remove item
DELETE /api/cart/clear                # Clear cart
```

### CHECKOUT ROUTES (checkoutRoutes.js)
```
POST   /api/checkout                 # Create order
POST   /api/checkout/validate        # Validate cart before checkout
```

### ORDER TRACKING (trackingRoutes.js)
```
GET    /api/tracking/:orderNumber    # Track order
GET    /api/tracking/rider/:riderId  # Rider location
```

### ADMIN ROUTES (adminRoutes.js, adminVendorRoutes.js)
```
# Vendor Management
GET    /api/admin/vendors/pending    # Pending approvals
POST   /api/admin/vendors/:id/approve   # Approve vendor
POST   /api/admin/vendors/:id/reject    # Reject vendor

# User Management
GET    /api/admin/users              # List all users
PUT    /api/admin/users/:id/suspend  # Suspend user

# System Stats
GET    /api/admin/dashboard          # Platform stats
GET    /api/admin/reports            # Generate reports
```

---

## 🔐 AUTHENTICATION & SECURITY

### Multi-Factor Authentication (MFA)
1. User enters email + password
2. System sends OTP to email
3. User enters OTP
4. System issues JWT token

### JWT Tokens
```javascript
{
  "id": "user_id",
  "role": "vendor",
  "roles": ["vendor"],
  "email": "vendor@example.com",
  "exp": 1234567890
}
```

### Authorization Middleware
```javascript
// Protect routes
protect()  // Must be logged in

// Role-based access
authorize('vendor')  // Must be vendor
authorize('customer')  // Must be customer
authorize('picker', 'rider')  // Can be either

// Vendor approval check
checkVendorApproval()  // Vendor must be approved by admin
```

---

## 📊 KEY BUSINESS FLOWS

### 1. VENDOR ONBOARDING
```
Register → Email Verify → Admin Review → Approved → Setup Profile → Add Products → Go Live
```

### 2. ORDER LIFECYCLE
```
Browse → Add to Cart → Checkout → Pay → Confirm → Pick → Pack → Deliver → Complete → Review
```

### 3. EARNINGS DISTRIBUTION
```
Order Completed → Platform Fee → Vendor Payout → Picker Earnings → Rider Earnings
```

---

## 🎨 UNIQUE STORE IDENTITIES

Each vendor gets their own identity:

1. **Unique Store ID**: `FP-0001-A3B4`
2. **Store Name**: "Abigeal's Fresh Market"
3. **Store URL**: `/stores/abigealsfreshmarket`
4. **Subdomain** (optional): `abigealstore.afrimercato.com`
5. **Logo & Branding**: Custom colors, logo, banner
6. **Business Hours**: Custom schedule
7. **Delivery Settings**: Custom prep time, delivery radius

---

## 📱 MULTI-ROLE SUPPORT

Users can have multiple roles:

```javascript
// Example 1: Picker who also delivers
{
  roles: ["picker", "rider"],
  primaryRole: "picker"
}

// Example 2: Customer who also picks
{
  roles: ["customer", "picker"],
  primaryRole: "customer"
}

// Switching roles
POST /api/picker/auth/switch-role
{
  "primaryRole": "rider"
}
```

---

## 🚀 DEPLOYMENT

### Backend
- **Platform**: Railway / Fly.io / Heroku
- **Database**: MongoDB Atlas
- **File Storage**: Cloudinary
- **Email**: SendGrid / Mailgun

### Frontend
- **Platform**: Cloudflare Pages / Netlify / Vercel
- **CDN**: Cloudflare
- **Domain**: Custom domain with SSL

---

## 📞 SUPPORT & CONTACT

For questions about the system:
- Check this documentation
- Review code comments in source files
- Contact development team

---

**Last Updated**: January 8, 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
