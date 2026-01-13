# 🛒 AFRIMERCATO BACKEND API

**Production-Ready Node.js Backend with JWT Authentication**

This is the secure backend API for the Afrimercato marketplace platform. Built with industry-standard security practices and comprehensive documentation for easy understanding and maintenance.

---

## 📚 TABLE OF CONTENTS

1. [What We've Built](#what-weve-built)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Installation & Setup](#installation--setup)
5. [Environment Variables Explained](#environment-variables-explained)
6. [Database Models Explained](#database-models-explained)
7. [API Endpoints](#api-endpoints)
8. [Security Features](#security-features)
9. [How Everything Works](#how-everything-works)
10. [Testing the API](#testing-the-api)
11. [Common Issues & Solutions](#common-issues--solutions)

---

## 🎯 WHAT WE'VE BUILT

### ✅ Completed Components:

| Component | Description | Status |
|-----------|-------------|--------|
| **Database Models** | User, Vendor, Product, Order schemas | ✅ Complete |
| **Authentication** | Registration, Login, JWT tokens, Password reset | ✅ Complete |
| **Security Middleware** | JWT verification, Role authorization | ✅ Complete |
| **Input Validation** | All user input validated before processing | ✅ Complete |
| **Error Handling** | Comprehensive error catching and friendly messages | ✅ Complete |
| **Controllers** | Auth controller with all user operations | ✅ Complete |
| **Routes** | API endpoints structure | 🔄 In Progress |
| **Server Setup** | Main server file with all configurations | 🔄 In Progress |

---

## 🛠 TECHNOLOGY STACK

### Core Dependencies

| Package | Version | Purpose | Layman's Explanation |
|---------|---------|---------|---------------------|
| **express** | ^5.1.0 | Web framework | The foundation - handles all HTTP requests |
| **mongoose** | ^8.19.1 | MongoDB ODM | Translator between JavaScript and MongoDB |
| **dotenv** | ^17.2.3 | Environment variables | Loads secrets from .env file |
| **bcryptjs** | ^3.0.2 | Password hashing | Scrambles passwords so they can't be read |
| **jsonwebtoken** | ^9.0.2 | JWT creation | Creates secure login tokens (like VIP passes) |
| **cors** | ^2.8.5 | Cross-origin requests | Allows frontend to talk to backend |
| **express-validator** | ^7.2.1 | Input validation | Checks user input is valid |
| **express-rate-limit** | ^8.1.0 | Rate limiting | Stops spam and API abuse |
| **helmet** | ^8.1.0 | Security headers | Protects against common web attacks |
| **morgan** | ^1.10.1 | HTTP logging | Records all requests for debugging |
| **multer** | ^2.0.2 | File uploads | Handles product images, logos, etc. |
| **nodemon** | ^3.1.10 | Auto-restart | Restarts server when code changes |

---

## 📁 FOLDER STRUCTURE

```
afrimercato-backend/
│
├── src/
│   ├── config/           # Configuration files
│   │   └── database.js   # MongoDB connection setup
│   │
│   ├── models/           # Database schemas
│   │   ├── User.js       # User accounts (customers, vendors, riders)
│   │   ├── Vendor.js     # Vendor store information
│   │   ├── Product.js    # Products sold by vendors
│   │   └── Order.js      # Customer orders
│   │
│   ├── controllers/      # Business logic
│   │   ├── authController.js    # Authentication logic
│   │   ├── vendorController.js  # Vendor operations (coming next)
│   │   └── productController.js # Product management (coming next)
│   │
│   ├── routes/           # API endpoints
│   │   ├── authRoutes.js       # /api/auth/* (coming next)
│   │   ├── vendorRoutes.js     # /api/vendor/* (coming next)
│   │   └── productRoutes.js    # /api/products/* (coming next)
│   │
│   ├── middleware/       # Request interceptors
│   │   ├── auth.js             # JWT authentication
│   │   ├── errorHandler.js     # Error catching
│   │   └── validator.js        # Input validation
│   │
│   └── utils/            # Helper functions (coming next)
│
├── uploads/              # Uploaded files (images, documents)
├── .env                  # Environment variables (NEVER commit!)
├── .env.example          # Example env file (safe to share)
├── .gitignore            # Files to exclude from Git
├── package.json          # Dependencies and scripts
└── README.md             # This file!
```

---

## ⚙️ INSTALLATION & SETUP

### Prerequisites

Before you begin, make sure you have:
- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or MongoDB Atlas) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** (for version control) - [Download here](https://git-scm.com/)

### Step-by-Step Installation

```bash
# 1. Navigate to the backend folder
cd c:\Users\Arbythecoder\Downloads\afrihub\afrimercato-backend

# 2. Install dependencies (already done, but if needed)
npm install

# 3. Copy .env.example to .env
cp .env.example .env

# 4. Edit .env file with your actual values
# Open .env in your text editor and update:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (generate a long random string)
# - Other settings as needed

# 5. Start MongoDB (if running locally)
# On Windows: Open MongoDB Compass or run mongod.exe
# On Mac/Linux: mongod

# 6. Start the development server
npm run dev

# Server will start on http://localhost:5000
```

---

## 🔐 ENVIRONMENT VARIABLES EXPLAINED

### What are Environment Variables?

Environment variables are like settings for your app. They store:
- **Secrets**: Passwords, API keys, database URLs
- **Configuration**: Port numbers, email settings
- **Switches**: Development vs Production mode

**WHY USE THEM?**
- Keep secrets out of your code
- Easy to change settings without modifying code
- Different settings for dev, staging, production

### Key Variables

| Variable | Example | What It Does |
|----------|---------|--------------|
| `PORT` | `5000` | Which port your server runs on |
| `MONGODB_URI` | `mongodb://localhost:27017/afrimercato` | Database connection address |
| `JWT_SECRET` | `your-long-random-secret-key` | Secret for creating login tokens |
| `JWT_EXPIRE` | `7d` | How long before users must re-login |
| `CLIENT_URL` | `http://localhost:3000` | Your React frontend address |
| `NODE_ENV` | `development` or `production` | Which mode you're running in |

---

## 💾 DATABASE MODELS EXPLAINED

### 1. User Model (`src/models/User.js`)

**What it stores:**
- Basic account info: name, email, password
- User role: customer, vendor, rider, picker, admin
- Login tokens and verification status

**Key Features:**
- Passwords automatically hashed before saving
- Methods to generate JWT tokens
- Email verification and password reset tokens

**Example User:**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "isEmailVerified": true,
  "createdAt": "2024-10-17T00:00:00.000Z"
}
```

### 2. Vendor Model (`src/models/Vendor.js`)

**What it stores:**
- Store information: name, description, logo
- Business address and geolocation
- Business hours (open/close times for each day)
- Bank details for payments
- Ratings and reviews

**Relationship:**
- One User (with role='vendor') → One Vendor profile

**Example Vendor:**
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "user": "507f1f77bcf86cd799439011",
  "storeName": "Fresh Farms Market",
  "category": "fresh-produce",
  "rating": 4.5,
  "isVerified": true,
  "address": {
    "street": "123 Market Street",
    "city": "Lagos",
    "coordinates": {
      "latitude": 6.5244,
      "longitude": 3.3792
    }
  }
}
```

### 3. Product Model (`src/models/Product.js`)

**What it stores:**
- Product details: name, description, price
- Images (array of URLs)
- Stock/inventory levels
- Category and tags

**Key Features:**
- Automatically sets `inStock` to false when stock = 0
- Calculates discount percentage if originalPrice is set
- Tracks views and sales count

**Example Product:**
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "vendor": "507f1f77bcf86cd799439012",
  "name": "Fresh Organic Tomatoes",
  "price": 500,
  "stock": 100,
  "unit": "kg",
  "category": "vegetables",
  "rating": 4.8,
  "inStock": true
}
```

### 4. Order Model (`src/models/Order.js`)

**What it stores:**
- Order items (products, quantities, prices)
- Customer delivery address
- Order status (pending → confirmed → delivered)
- Payment information
- Delivery details

**Key Features:**
- Auto-generates unique order numbers (AFM2024001, AFM2024002, etc.)
- Tracks status changes with timestamps
- Calculates totals automatically

**Example Order:**
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "orderNumber": "AFM2024001",
  "customer": "507f1f77bcf86cd799439011",
  "vendor": "507f1f77bcf86cd799439012",
  "status": "confirmed",
  "pricing": {
    "subtotal": 1500,
    "deliveryFee": 200,
    "total": 1700
  }
}
```

---

## 🔒 SECURITY FEATURES

### 1. Password Security
- **Bcrypt Hashing**: Passwords are scrambled before storing
- **Salt Rounds**: Configurable hash complexity (default: 10 rounds)
- **Never Stored Plain**: Original passwords never saved

### 2. JWT Authentication
- **Token-Based**: No need to send password with every request
- **Expiration**: Tokens expire after 7 days (configurable)
- **Refresh Tokens**: Get new tokens without re-login
- **Role-Based**: Different access levels for different users

### 3. Input Validation
- **Email Format**: Must be valid email address
- **Password Strength**: Minimum 6 characters, must include uppercase, lowercase, number
- **MongoDB Injection**: All inputs sanitized
- **XSS Protection**: HTML/JavaScript stripped from inputs

### 4. Rate Limiting
- **100 requests per 15 minutes** per IP address
- Prevents:
  - Brute force password attacks
  - API spam
  - Denial of service (DoS) attacks

### 5. Security Headers (Helmet)
- **XSS Protection**: Prevents cross-site scripting
- **Clickjacking Protection**: Prevents iframe hijacking
- **MIME Sniffing**: Prevents MIME type confusion attacks

---

## 🚀 HOW EVERYTHING WORKS

### Request Flow (With Example)

Let's trace what happens when a user logs in:

```
1. User fills login form and clicks "Login"
   Frontend sends: POST /api/auth/login
   Body: { email: "john@example.com", password: "MyPass123" }

2. Request hits CORS middleware
   ✅ Checks if request is from allowed origin (localhost:3000)

3. Request goes through Morgan logger
   ✅ Logs: "POST /api/auth/login 200 45ms"

4. Request goes through Rate Limiter
   ✅ Checks: Has this IP made too many requests?

5. Request hits Validator middleware
   ✅ Validates: Is email format correct? Is password provided?

6. Request reaches authController.login()
   ✅ Finds user by email
   ✅ Compares password with hashed version
   ✅ Generates JWT token
   ✅ Updates lastLogin timestamp

7. Response sent back to frontend
   {
     "success": true,
     "data": {
       "user": { ... },
       "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
     }
   }

8. Frontend stores token in localStorage
   Now every request includes: Authorization: Bearer <token>
```

### Protected Route Flow

For routes that require authentication (like getting dashboard):

```
1. User requests: GET /api/vendor/dashboard
   Headers: { Authorization: "Bearer eyJhbGci..." }

2. Request hits 'protect' middleware
   ✅ Extracts token from header
   ✅ Verifies token is valid and not expired
   ✅ Finds user in database
   ✅ Attaches user to req.user

3. Request hits 'authorize' middleware
   ✅ Checks if user.role === 'vendor'

4. Request reaches vendorController.getDashboard()
   ✅ Can access req.user (current logged-in user)
   ✅ Can access req.vendor (vendor profile)

5. Response sent with dashboard data
```

---

## 📡 API ENDPOINTS

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Private |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password/:token` | Reset password | Public |
| GET | `/api/auth/verify-email/:token` | Verify email | Public |
| POST | `/api/auth/refresh-token` | Get new access token | Public |

### Vendor Endpoints (Coming Next)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/vendor/dashboard/stats` | Get dashboard statistics | Vendor |
| GET | `/api/vendor/products` | List vendor products | Vendor |
| POST | `/api/vendor/products` | Create new product | Vendor |
| PUT | `/api/vendor/products/:id` | Update product | Vendor |
| DELETE | `/api/vendor/products/:id` | Delete product | Vendor |
| GET | `/api/vendor/orders` | List vendor orders | Vendor |
| PUT | `/api/vendor/orders/:id/status` | Update order status | Vendor |

---

## 🧪 TESTING THE API

### Using Postman or Thunder Client

1. **Register a User:**
   ```
   POST http://localhost:5000/api/auth/register
   Body (JSON):
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "Test123!",
     "confirmPassword": "Test123!",
     "role": "vendor"
   }
   ```

2. **Login:**
   ```
   POST http://localhost:5000/api/auth/login
   Body (JSON):
   {
     "email": "test@example.com",
     "password": "Test123!"
   }
   ```

   Copy the `token` from response!

3. **Get Current User (Protected Route):**
   ```
   GET http://localhost:5000/api/auth/me
   Headers:
   Authorization: Bearer <paste-token-here>
   ```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue 1: "Cannot connect to MongoDB"

**Solution:**
- Make sure MongoDB is running
- Check `MONGODB_URI` in .env file
- For local MongoDB: `mongodb://localhost:27017/afrimercato`
- For MongoDB Atlas: Use connection string from Atlas dashboard

### Issue 2: "JWT Secret not defined"

**Solution:**
- Open `.env` file
- Set `JWT_SECRET` to a long random string
- Example: `JWT_SECRET=my-super-secret-key-change-this-in-production`

### Issue 3: "Port 5000 already in use"

**Solution:**
- Change `PORT` in .env file to different number (e.g., 5001)
- Or find and kill process using port 5000

### Issue 4: "CORS error when calling from frontend"

**Solution:**
- Check `CLIENT_URL` in .env matches your frontend URL
- Default should be `http://localhost:3000`

---

## 📝 NEXT STEPS

To complete the backend, we need to create:

1. ✅ Database Models - **DONE**
2. ✅ Authentication System - **DONE**
3. ✅ Security Middleware - **DONE**
4. ✅ Input Validation - **DONE**
5. ✅ Error Handling - **DONE**
6. 🔄 Vendor Controller - **IN PROGRESS**
7. 🔄 Product Controller - **COMING NEXT**
8. 🔄 Order Controller - **COMING NEXT**
9. 🔄 API Routes - **COMING NEXT**
10. 🔄 Main Server File - **COMING NEXT**

---

## 👨‍💻 FOR DEVELOPERS

### Code Comments

All code files have extensive comments explaining:
- **WHAT** the code does
- **WHY** it's needed
- **HOW** it works
- Examples and use cases

### Best Practices Used

- ✅ Environment variables for configuration
- ✅ Async/await for cleaner code
- ✅ Middleware for reusable logic
- ✅ Input validation on all routes
- ✅ Comprehensive error handling
- ✅ Security headers and rate limiting
- ✅ Password hashing with bcrypt
- ✅ JWT for stateless authentication
- ✅ MongoDB indexes for fast queries
- ✅ Consistent API response format

---

## 📄 LICENSE

ISC

---

## 🤝 SUPPORT

If you encounter issues or have questions:
1. Check this README
2. Look at code comments in the files
3. Check console logs for error messages
4. Verify `.env` configuration

---

**Built with ❤️ for Afrimercato Marketplace**
