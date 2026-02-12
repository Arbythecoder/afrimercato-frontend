# 🚀 DEPLOYMENT GUIDE - AFRIMERCATO BACKEND

This guide will help you deploy your production-ready backend to the cloud in under 30 minutes!

---

## 📋 PRE-DEPLOYMENT CHECKLIST

Before deploying, make sure you have:

- [x] ✅ All code committed to Git
- [x] ✅ MongoDB Atlas account (free tier available)
- [x] ✅ Hosting platform account (Render/Railway/Heroku)
- [x] ✅ .env file configured locally
- [x] ✅ Backend tested locally

---

## 🎯 DEPLOYMENT OPTIONS

### Option 1: Render (Recommended - FREE)
### Option 2: Railway (Easy - FREE tier available)
### Option 3: Heroku (Classic - Paid)

We'll use **Render** for this guide (easiest and free).

---

## 📝 STEP 1: SET UP MONGODB ATLAS (DATABASE)

### Why MongoDB Atlas?
- **FREE** 512MB database
- **Global** reach (servers worldwide)
- **Managed** (automatic backups, scaling)

### Instructions:

1. **Create Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Click "Try Free"
   - Sign up with email or Google

2. **Create Cluster**
   - Choose **FREE** M0 tier
   - Select region closest to your users
   - Name: `afrimercato-cluster`
   - Click "Create"

3. **Create Database User**
   - Go to **Database Access** (left menu)
   - Click "Add New Database User"
   - Username: `afrimercato-admin`
   - Password: Click "Autogenerate Secure Password" (SAVE THIS!)
   - Database User Privileges: **Read and write to any database**
   - Click "Add User"

4. **Whitelist IP Addresses**
   - Go to **Network Access** (left menu)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for production, be more specific)
   - Click "Confirm"

5. **Get Connection String**
   - Go to **Database** → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://afrimercato-admin:<password>@cluster0.xxxxx.mongodb.net/`
   - **REPLACE** `<password>` with your actual password
   - **ADD** database name: `mongodb+srv://afrimercato-admin:YourPassword@cluster0.xxxxx.mongodb.net/afrimercato`

---

## 🌐 STEP 2: DEPLOY TO RENDER

### Instructions:

1. **Create Render Account**
   - Go to: https://render.com
   - Sign up with GitHub (easier deployment)

2. **Push Code to GitHub** (if not already)
   ```bash
   cd c:\Users\Arbythecoder\Downloads\afrihub\afrimercato-backend
   git init
   git add .
   git commit -m "Initial commit: Production-ready backend"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

3. **Create New Web Service on Render**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `afrimercato-backend` repo

4. **Configure Service**
   ```
   Name: afrimercato-backend
   Region: Choose closest to your users
   Branch: main
   Root Directory: (leave empty)
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. **Add Environment Variables**
   Click "Advanced" → "Add Environment Variable"

   Add these **ONE BY ONE**:

   ```
   NODE_ENV = production

   PORT = 5000

   MONGODB_URI = mongodb+srv://afrimercato-admin:YourPassword@cluster0.xxxxx.mongodb.net/afrimercato

   JWT_SECRET = generate-a-super-long-random-string-here-at-least-32-characters

   JWT_EXPIRE = 7d

   JWT_REFRESH_SECRET = another-different-super-long-random-string-32-chars-minimum

   JWT_REFRESH_EXPIRE = 30d

   CLIENT_URL = https://your-frontend-url.com
   (Or http://localhost:3000 for development)

   BCRYPT_ROUNDS = 10

   MAX_FILE_SIZE = 5242880

   RATE_LIMIT_WINDOW = 15

   RATE_LIMIT_MAX = 100
   ```

   **HOW TO GENERATE RANDOM SECRETS:**
   - Go to: https://randomkeygen.com/
   - Copy a "CodeIgniter Encryption Key" (long random string)
   - Use different strings for JWT_SECRET and JWT_REFRESH_SECRET

6. **Deploy**
   - Click "Create Web Service"
   - Wait 3-5 minutes for deployment
   - Your backend will be live at: `https://afrimercato-backend.onrender.com`

7. **Test Deployment**
   - Go to: `https://your-app-name.onrender.com/api/health`
   - You should see:
     ```json
     {
       "success": true,
       "message": "Afrimercato API is running!",
       "timestamp": "2024-10-17T...",
       "environment": "production"
     }
     ```

---

## 🔧 STEP 3: UPDATE FRONTEND

Update your React frontend's `.env` file:

```env
# Development (local backend)
REACT_APP_API_URL=http://localhost:5000/api

# Production (deployed backend)
# REACT_APP_API_URL=https://your-app-name.onrender.com/api
```

For production, uncomment the production line and comment out development.

---

## 🎉 STEP 4: VERIFY EVERYTHING WORKS

### Test Authentication

1. **Register a User**
   ```
   POST https://your-app-name.onrender.com/api/auth/register
   Body: {
     "name": "Test User",
     "email": "test@example.com",
     "password": "Test123!",
     "confirmPassword": "Test123!",
     "role": "vendor"
   }
   ```

2. **Login**
   ```
   POST https://your-app-name.onrender.com/api/auth/login
   Body: {
     "email": "test@example.com",
     "password": "Test123!"
   }
   ```

3. **Get Dashboard** (use token from login)
   ```
   GET https://your-app-name.onrender.com/api/vendor/dashboard/stats
   Headers: {
     "Authorization": "Bearer YOUR_TOKEN_HERE"
   }
   ```

---

## 📊 MONITORING YOUR APP

### Render Dashboard
- View logs: Click your service → "Logs" tab
- View metrics: "Metrics" tab shows CPU, memory usage
- View deployment history: "Events" tab

### MongoDB Atlas Dashboard
- View database: "Browse Collections"
- Monitor queries: "Performance Advisor"
- Check storage: "Metrics" tab

---

## 🐛 TROUBLESHOOTING

### Issue 1: "Cannot connect to MongoDB"

**Solution:**
- Check MongoDB connection string is correct
- Verify password doesn't have special characters (or encode them)
- Ensure IP whitelist includes 0.0.0.0/0 (all IPs)

### Issue 2: "JWT Secret not defined"

**Solution:**
- Go to Render → Your service → "Environment"
- Verify `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Restart service

### Issue 3: "CORS error from frontend"

**Solution:**
- Update `CLIENT_URL` environment variable
- Include your actual frontend URL
- Example: `https://afrimercato-frontend.vercel.app`

### Issue 4: "Service crashes on startup"

**Solution:**
- Check logs in Render dashboard
- Common causes:
  - Missing environment variables
  - MongoDB connection failed
  - Port already in use (use PORT from env)

---

## 🔐 SECURITY BEST PRACTICES

### Before Going Live:

1. **Change All Secrets**
   - Generate new JWT_SECRET and JWT_REFRESH_SECRET
   - Use strong, random 32+ character strings
   - NEVER reuse secrets from development

2. **Enable HTTPS Only**
   - Render provides HTTPS automatically
   - Ensure frontend uses HTTPS URLs

3. **Restrict CORS**
   - Update CLIENT_URL to your actual frontend domain
   - Don't use wildcards (*) in production

4. **Set Rate Limits**
   - Keep RATE_LIMIT_MAX at 100 or lower
   - Monitor for abuse in logs

5. **Backup Database**
   - MongoDB Atlas does automatic backups (free tier)
   - Download manual backup monthly

---

## 💰 COST BREAKDOWN

### Free Tier (Start Here)
- **Render**: FREE (500 hours/month)
- **MongoDB Atlas**: FREE (512MB storage)
- **Total**: $0/month 🎉

### When You Need to Scale
- **Render Pro**: $7/month (never sleeps, better performance)
- **MongoDB Atlas M2**: $9/month (2GB storage)
- **Total**: $16/month

---

## 🚀 DEPLOYING UPDATES

When you make changes to code:

```bash
# 1. Commit changes
git add .
git commit -m "Description of changes"

# 2. Push to GitHub
git push origin main

# 3. Render auto-deploys!
# Check Render dashboard for deployment status
```

---

## 📞 NEED HELP?

### Resources:
- Render Docs: https://render.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Express Docs: https://expressjs.com/

### Common Questions:

**Q: How long does deployment take?**
A: 3-5 minutes for first deployment, 2-3 minutes for updates

**Q: Can I use a custom domain?**
A: Yes! Render supports custom domains (free on all plans)

**Q: What if I exceed free tier limits?**
A: Render will email you. You can upgrade or optimize code.

**Q: Is my data safe?**
A: MongoDB Atlas has enterprise-grade security. Enable 2FA on your account.

---

## ✅ POST-DEPLOYMENT CHECKLIST

After deployment, verify:

- [ ] Health check endpoint works
- [ ] User registration works
- [ ] User login works
- [ ] Protected routes require authentication
- [ ] File uploads work
- [ ] Database is receiving data
- [ ] Frontend can connect to backend
- [ ] Error messages are user-friendly (no stack traces in production)
- [ ] Rate limiting is active
- [ ] CORS is configured correctly

---

## 🎊 CONGRATULATIONS!

Your production-ready backend is now LIVE! 🚀

**Your API Base URL:**
```
https://your-app-name.onrender.com/api
```

**Next Steps:**
1. Deploy your React frontend (Vercel/Netlify)
2. Update frontend API URL
3. Test end-to-end flow
4. Monitor logs for first 24 hours
5. Share with your first users!

---

**Built with ❤️ for Afrimercato Marketplace**
