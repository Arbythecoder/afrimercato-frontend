# Deploy Backend to Fly.io

## Quick Deployment Steps

### 1. Login to Fly.io
```bash
cd afrimercato-backend
flyctl auth login
```

### 2. Create the App (First Time Only)
```bash
flyctl launch --no-deploy
```
**Answer the prompts:**
- App name: `afrimercato-backend` (or your choice)
- Region: `lhr` (London) or closest to you
- PostgreSQL: **No** (we use MongoDB)
- Redis: **No** (unless you need it)

### 3. Set Environment Variables (CRITICAL!)
```bash
# MongoDB
flyctl secrets set MONGO_URI="your_mongodb_connection_string"

# JWT Secrets (generate new ones!)
flyctl secrets set JWT_SECRET="your_64_char_secret"
flyctl secrets set JWT_REFRESH_SECRET="your_64_char_secret"
flyctl secrets set JWT_EXPIRE="7d"
flyctl secrets set JWT_COOKIE_EXPIRE="7"

# Email
flyctl secrets set EMAIL_HOST="smtp.gmail.com"
flyctl secrets set EMAIL_PORT="587"
flyctl secrets set EMAIL_USER="your_email@gmail.com"
flyctl secrets set EMAIL_PASS="your_app_password"

# Cloudinary
flyctl secrets set CLOUDINARY_CLOUD_NAME="your_cloud_name"
flyctl secrets set CLOUDINARY_API_KEY="your_key"
flyctl secrets set CLOUDINARY_API_SECRET="your_secret"

# Frontend URL
flyctl secrets set CLIENT_URL="https://your-frontend-domain.com"

# Admin Email
flyctl secrets set ADMIN_EMAIL="admin@yourdomain.com"
```

### 4. Deploy!
```bash
flyctl deploy
```

### 5. Check Status
```bash
flyctl status
flyctl logs
```

### 6. Get Your Backend URL
```bash
flyctl info
```
Your API will be at: `https://afrimercato-backend.fly.dev`

---

## Update Deployment (After Changes)

Whenever you make code changes and push to GitHub:

```bash
cd afrimercato-backend
git pull origin main  # Get latest changes
flyctl deploy         # Deploy to Fly.io
```

---

## View Logs (Debugging)
```bash
flyctl logs           # Recent logs
flyctl logs -a afrimercato-backend  # Specific app
```

---

## Scale Up/Down
```bash
# Increase memory
flyctl scale memory 512

# Increase CPU
flyctl scale count 2
```

---

## Important Notes

1. **Dockerfile Required:** Make sure you have a `Dockerfile` in the backend folder
2. **Port 8080:** Fly.io expects your app to listen on port 8080 (already configured)
3. **Secrets:** NEVER commit secrets - always use `flyctl secrets set`
4. **Database:** Your MongoDB must be accessible from the internet (MongoDB Atlas works great)

---

## What Changed Today

✅ Removed ALL admin approval requirements
✅ Vendors can create products immediately after signup
✅ No waiting for admin verification

**Latest commit:** `afa3325` - "remove: Remove ALL admin approval requirements for vendors"

**Files changed:**
- src/controllers/productController.js
- src/routes/productRoutes.js
- src/models/Vendor.js (default: 'approved')
- src/models/User.js (default: 'approved')

After deploying, vendors can:
1. Register
2. Login
3. Create products immediately
4. Products go live instantly

---

## Troubleshooting

**"unauthorized" error:**
```bash
flyctl auth login
```

**"app not found" error:**
```bash
flyctl launch
```

**App crashes after deploy:**
```bash
flyctl logs
```
Check for missing environment variables or MongoDB connection issues.

---

**Generated:** 2026-01-12
**Status:** Ready to deploy
