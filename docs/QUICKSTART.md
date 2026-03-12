# ⚡ QUICK START GUIDE

Get your backend running in **5 minutes**!

---

## 🏃‍♂️ STEPS TO RUN LOCALLY

### 1. Install MongoDB

**Option A: MongoDB Compass (GUI)**
- Download: https://www.mongodb.com/try/download/compass
- Install and open
- Connect to: `mongodb://localhost:27017`

**Option B: MongoDB Community Server**
- Download: https://www.mongodb.com/try/download/community
- Install and start mongod service

**Option C: Use MongoDB Atlas (Cloud)**
- Already set up in DEPLOYMENT.md
- Use cloud connection string

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your settings
# Minimum required:
# - MONGODB_URI
# - JWT_SECRET
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# Production mode
npm start
```

### 5. Test It Works

Open browser: http://localhost:5000/api/health

You should see:
```json
{
  "success": true,
  "message": "Afrimercato API is running!"
}
```

---

## 🧪 TEST WITH POSTMAN

### 1. Register a Vendor

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Test123!",
  "confirmPassword": "Test123!",
  "role": "vendor"
}
```

### 2. Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Test123!"
}
```

**Copy the `token` from response!**

### 3. Create Vendor Profile

```
POST http://localhost:5000/api/vendor/profile
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "storeName": "Fresh Farms Market",
  "category": "fresh-produce",
  "description": "Organic fruits and vegetables",
  "address": {
    "street": "123 Market Street",
    "city": "Lagos",
    "state": "Lagos State"
  },
  "phone": "+234123456789"
}
```

### 4. Get Dashboard Stats

```
GET http://localhost:5000/api/vendor/dashboard/stats
Authorization: Bearer YOUR_TOKEN_HERE
```

### 5. Create a Product

```
POST http://localhost:5000/api/vendor/products
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "name": "Fresh Organic Tomatoes",
  "description": "Locally grown organic tomatoes",
  "price": 500,
  "category": "vegetables",
  "unit": "kg",
  "stock": 100
}
```

---

## 📂 PROJECT STRUCTURE

```
afrimercato-backend/
│
├── server.js              # Main entry point (START HERE)
├── .env                   # Your secrets (DO NOT COMMIT)
├── .env.example           # Example env file (SAFE TO SHARE)
│
├── src/
│   ├── config/
│   │   └── database.js    # MongoDB connection
│   │
│   ├── models/            # Database schemas
│   │   ├── User.js
│   │   ├── Vendor.js
│   │   ├── Product.js
│   │   └── Order.js
│   │
│   ├── controllers/       # Business logic
│   │   ├── authController.js
│   │   └── vendorController.js
│   │
│   ├── routes/            # API endpoints
│   │   ├── authRoutes.js
│   │   └── vendorRoutes.js
│   │
│   └── middleware/        # Request interceptors
│       ├── auth.js        # JWT verification
│       ├── errorHandler.js
│       ├── validator.js
│       └── upload.js      # File uploads
│
└── uploads/               # Uploaded files
    ├── products/
    ├── logos/
    ├── avatars/
    └── documents/
```

---

## 🎯 AVAILABLE SCRIPTS

```bash
# Start in development mode (auto-restart)
npm run dev

# Start in production mode
npm start

# Run tests (when added)
npm test
```

---

## 📡 API ENDPOINTS

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request reset
- `POST /api/auth/reset-password/:token` - Reset password
- `POST /api/auth/refresh-token` - Get new token

### Vendor
- `POST /api/vendor/profile` - Create vendor profile
- `GET /api/vendor/profile` - Get vendor profile
- `PUT /api/vendor/profile` - Update profile
- `GET /api/vendor/dashboard/stats` - Dashboard stats
- `GET /api/vendor/products` - List products
- `POST /api/vendor/products` - Create product
- `GET /api/vendor/products/:id` - Get product
- `PUT /api/vendor/products/:id` - Update product
- `DELETE /api/vendor/products/:id` - Delete product
- `PATCH /api/vendor/products/:id/stock` - Update stock
- `GET /api/vendor/orders` - List orders
- `GET /api/vendor/orders/:id` - Get order
- `PUT /api/vendor/orders/:id/status` - Update status
- `GET /api/vendor/analytics/revenue` - Revenue analytics

---

## 🐛 COMMON ISSUES

### "Cannot connect to MongoDB"
- Make sure MongoDB is running
- Check MONGODB_URI in .env

### "Port 5000 already in use"
- Change PORT in .env to 5001
- Or kill process on port 5000

### "JWT Secret not defined"
- Set JWT_SECRET in .env
- Generate random string at: https://randomkeygen.com/

---

## 💡 TIPS FOR BEGINNERS

1. **Always check logs** when something breaks
2. **Read error messages** carefully - they usually tell you what's wrong
3. **Test one endpoint at a time** - don't rush
4. **Use Postman** - makes testing APIs much easier
5. **Check .env file** - most issues are missing environment variables

---

## 🎓 LEARNING RESOURCES

- **Node.js**: https://nodejs.org/docs/
- **Express**: https://expressjs.com/
- **MongoDB**: https://docs.mongodb.com/
- **Mongoose**: https://mongoosejs.com/docs/
- **JWT**: https://jwt.io/introduction

---

## 🚀 READY FOR PRODUCTION?

See **DEPLOYMENT.md** for step-by-step deployment guide!

---

**Happy Coding! 🎉**
