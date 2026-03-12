# 🔐 OAUTH CONFIGURATION GUIDE

## 📋 Table of Contents
1. [Environment Variables](#environment-variables)
2. [Google OAuth Setup](#google-oauth-setup)
3. [Facebook OAuth Setup](#facebook-oauth-setup)
4. [Common Mistakes](#common-mistakes)
5. [Testing OAuth Locally](#testing-oauth-locally)
6. [Production Deployment](#production-deployment)

---

## Environment Variables

### **Backend (.env)**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=1004174139642-cve442jrrhukt9pboohp79abrkedc035.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-W_W1zEO__lAjbTkeMAFnb1RBpE-

# Frontend URL (where OAuth will redirect)
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Production
NODE_ENV=production
API_URL=https://afrimercato-backend.fly.dev
```

### **Frontend (.env)**
```bash
VITE_API_URL=http://localhost:5000
# Production: VITE_API_URL=https://afrimercato-backend.fly.dev
```

---

## Google OAuth Setup

### **Step 1: Create Google Cloud Project**
1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable **Google+ API** (APIs & Services → Library → Search "Google+" → Enable)

### **Step 2: Create OAuth 2.0 Credentials**
1. Go to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth 2.0 Client ID**
3. Configure consent screen (if not done):
   - User Type: **External**
   - App name: **Afrimercato**
   - Support email: Your email
   - Developer contact: Your email
4. Create credentials:
   - Application type: **Web application**
   - Name: **Afrimercato Production**

### **Step 3: Configure Redirect URIs**

#### **Local Development**
```
http://localhost:5000/auth/google/callback
```

#### **Production**
```
https://afrimercato-backend.fly.dev/auth/google/callback
```

⚠️ **IMPORTANT:** Add BOTH URLs separated by line breaks

### **Step 4: Copy Credentials**
- Copy **Client ID** → `GOOGLE_CLIENT_ID` in `.env`
- Copy **Client Secret** → `GOOGLE_CLIENT_SECRET` in `.env`

---

## Facebook OAuth Setup

### **Step 1: Create Facebook App**
1. Go to https://developers.facebook.com/
2. My Apps → Create App
3. Type: **Consumer**
4. Name: **Afrimercato**

### **Step 2: Configure Facebook Login**
1. Add Product: **Facebook Login**
2. Settings → Client OAuth Settings

#### **Valid OAuth Redirect URIs**
```
http://localhost:5000/auth/facebook/callback
https://afrimercato-backend.fly.dev/auth/facebook/callback
```

### **Step 3: Copy Credentials**
- App ID → `FACEBOOK_APP_ID` in `.env`
- App Secret → `FACEBOOK_APP_SECRET` in `.env`

---

## Common Mistakes

### ❌ **Mistake 1: Wrong Redirect URL Format**
**Error:**
```
redirect_uri_mismatch
```

**Fix:**
- No trailing slash: `https://afrimercato-backend.fly.dev/auth/google/callback` ✅
- Not `https://afrimercato-backend.fly.dev/auth/google/callback/` ❌
- Not `https://afrimercato-backend.fly.dev/api/auth/google/callback` ❌

### ❌ **Mistake 2: Missing FRONTEND_URL**
**Error:** OAuth succeeds but user stuck on callback page

**Fix:**
```bash
# Backend .env
FRONTEND_URL=https://your-app.vercel.app
CLIENT_URL=https://your-app.vercel.app
```

### ❌ **Mistake 3: Frontend Sends to Wrong Endpoint**
**Error:** 404 on OAuth initiation

**Fix:**
Frontend button should redirect to:
```javascript
// ✅ CORRECT
window.location.href = `${VITE_API_URL}/auth/google`

// ❌ WRONG
window.location.href = `${VITE_API_URL}/api/auth/google`
```

### ❌ **Mistake 4: Buttons Not Clickable**
**Error:** Clicks don't work

**Fix:**
```jsx
// ✅ CORRECT
<button type="button" onClick={handleLogin}>Login</button>

// ❌ WRONG (motion.button can block pointer events)
<motion.button onClick={handleLogin}>Login</motion.button>
```

### ❌ **Mistake 5: CORS Blocking OAuth Redirect**
**Error:** `Access-Control-Allow-Origin` error

**Fix:**
```javascript
// Backend CORS config
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-app.vercel.app'
  ],
  credentials: true
};
```

---

## Testing OAuth Locally

### **1. Start Backend**
```bash
cd afrimercato-backend
npm run dev
```

Backend should log:
```
✓ Google OAuth strategy registered
Server running on port 5000
```

### **2. Start Frontend**
```bash
cd afrimercato-frontend
npm run dev
```

### **3. Test OAuth Flow**
1. Navigate to `http://localhost:5173/login`
2. Click **"Sign in with Google"**
3. Browser redirects to Google consent screen
4. Approve
5. Browser redirects back to `http://localhost:3000/oauth/callback?token=...`
6. Frontend stores token and redirects to `/`

### **4. Verify Token**
```javascript
// Browser console
localStorage.getItem('afrimercato_token')
```

Should return a JWT like:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MzJjZjNiYWUyNDhjMDA1YjE1ZWY3NyIsInJvbGVzIjpbImN1c3RvbWVyIl0sImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTczMTQwNDYwMywiZXhwIjoxNzMyMDA5NDAzfQ.K5xJzG_YJ5KzGfTjZ_xBXfg3bYvN5J8wTZ5wGfTjZ_x
```

---

## Production Deployment

### **1. Update Google Cloud Console**
Add production redirect URI:
```
https://afrimercato-backend.fly.dev/auth/google/callback
```

### **2. Set Fly.io Secrets**
```bash
fly secrets set GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
fly secrets set GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
fly secrets set FRONTEND_URL="https://your-app.vercel.app"
fly secrets set CLIENT_URL="https://your-app.vercel.app"
fly secrets set JWT_SECRET="your-production-jwt-secret"
```

### **3. Verify Secrets**
```bash
fly secrets list
```

Should show:
```
GOOGLE_CLIENT_ID        2h ago
GOOGLE_CLIENT_SECRET    2h ago
FRONTEND_URL            2h ago
JWT_SECRET              2h ago
```

### **4. Deploy Backend**
```bash
fly deploy
```

### **5. Set Vercel Environment Variables**
```bash
VITE_API_URL=https://afrimercato-backend.fly.dev
```

### **6. Deploy Frontend**
```bash
vercel --prod
```

### **7. Test Production OAuth**
1. Go to `https://your-app.vercel.app/login`
2. Click "Sign in with Google"
3. Verify redirect to Google
4. Approve
5. Verify redirect back to `https://your-app.vercel.app/oauth/callback`
6. Verify user logged in

---

## OAuth Callback URL Examples

### **Local Development**
```
Backend runs on: http://localhost:5000
Frontend runs on: http://localhost:3000

OAuth Flow:
1. Click "Google Login" → http://localhost:5000/auth/google
2. Google redirects to → http://localhost:5000/auth/google/callback
3. Backend redirects to → http://localhost:3000/oauth/callback?token=...
```

### **Production**
```
Backend: https://afrimercato-backend.fly.dev
Frontend: https://your-app.vercel.app

OAuth Flow:
1. Click "Google Login" → https://afrimercato-backend.fly.dev/auth/google
2. Google redirects to → https://afrimercato-backend.fly.dev/auth/google/callback
3. Backend redirects to → https://your-app.vercel.app/oauth/callback?token=...
```

---

## Debugging OAuth Issues

### **Check Backend Logs**
```bash
fly logs --app afrimercato-backend
```

Look for:
```
[OAUTH_FAIL] ... Error: ...
[OAUTH_TOKEN_FAIL] ... Error: ...
```

### **Check Frontend Console**
Look for:
```
OAuth callback error: ...
Logged in via google: user@example.com
```

### **Common Errors**

#### **Error: "redirect_uri_mismatch"**
**Cause:** Redirect URI in Google Console doesn't match backend URL

**Fix:**
```
Google Console redirect URI MUST be EXACTLY:
https://afrimercato-backend.fly.dev/auth/google/callback
```

#### **Error: "Invalid token"**
**Cause:** JWT_SECRET mismatch or token expired

**Fix:**
```bash
# Backend .env
JWT_SECRET=your-secure-secret-key-minimum-32-characters
```

#### **Error: "No user found"**
**Cause:** Backend failed to create user in database

**Fix:** Check MongoDB connection, verify User model schema

---

## Security Best Practices

1. **Never commit credentials to Git**
   ```bash
   # .gitignore
   .env
   .env.local
   .env.production
   ```

2. **Use different credentials for dev/prod**
   - Dev: `GOOGLE_CLIENT_ID_DEV`
   - Prod: `GOOGLE_CLIENT_ID_PROD`

3. **Rotate secrets regularly**
   - Every 90 days minimum
   - After suspected breach

4. **Validate JWT on every request**
   ```javascript
   // Already implemented in middleware/auth.js
   const decoded = jwt.verify(token, process.env.JWT_SECRET);
   ```

5. **Use HTTPS in production**
   - Fly.io enforces HTTPS by default ✅
   - Vercel enforces HTTPS by default ✅

---

**✅ OAuth configuration complete when all steps verified.**
