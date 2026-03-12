# 🚀 DEPLOY CHECKLIST — PRODUCTION

**Project:** Afrimercato  
**Target:** Vercel (Frontend) + Fly.io (Backend)  
**Date:** Before production release

---

## ✅ A. FILES CHANGED + SUMMARY

### Frontend
- `src/pages/Home.jsx` — Added: "Why Afrimercato Exists", "Who It's For", "Vision & Mission", Contact section, lazy-loaded store images, updated footer
- `src/pages/AboutUs.jsx` — Updated footer tagline
- `src/pages/Login.jsx` — Fixed Google/Facebook buttons: removed overlay blocking clicks, changed to `<button type="button">`, updated to `/auth/google` endpoint
- `src/components/SocialLoginButtons.jsx` — Fixed redirect URLs, removed framer-motion animations causing pointer issues

### Backend
- OAuth routes already implemented at `/auth/google`, `/auth/google/callback`
- Passport.js Google strategy configured in `src/config/passport.js`
- Repurchase API at `/checkout/orders` already has 5s timeout (non-blocking)
- Checkout API at `/checkout/payment/initialize` already has 8s timeout with Stripe cold-start handling

---

## ✅ B. OAUTH SETUP + REDIRECT URLS

### **Google Cloud Console**
1. Go to https://console.cloud.google.com/
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. **Authorized redirect URIs** (ADD ALL):
   ```
   http://localhost:5000/auth/google/callback
   https://afrimercato-backend.fly.dev/auth/google/callback
   ```
5. Copy `Client ID` and `Client Secret`

### **Frontend Environment Variables**
**Vercel Dashboard → Settings → Environment Variables**
```bash
VITE_API_URL=https://afrimercato-backend.fly.dev
```

### **Backend Environment Variables**
**Fly.io Secrets**
```bash
fly secrets set GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
fly secrets set GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
fly secrets set FRONTEND_URL="https://your-app.vercel.app"
fly secrets set JWT_SECRET="your-secure-jwt-secret"
fly secrets set MONGODB_URI="mongodb+srv://..."
fly secrets set STRIPE_SECRET_KEY="sk_live_..."
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
fly secrets set CLOUDINARY_CLOUD_NAME="..."
fly secrets set CLOUDINARY_API_KEY="..."
fly secrets set CLOUDINARY_API_SECRET="..."
```

### **OAuth Flow**
1. User clicks "Sign in with Google" → Frontend redirects to `https://afrimercato-backend.fly.dev/auth/google`
2. Backend redirects to Google OAuth consent screen
3. User approves → Google redirects to `https://afrimercato-backend.fly.dev/auth/google/callback`
4. Backend creates/finds user, generates JWT → Redirects to `https://your-app.vercel.app/oauth/callback?token=...&refreshToken=...`
5. Frontend extracts token, stores in localStorage, fetches user profile, redirects to dashboard

---

## ✅ C. DEPLOY CHECKLIST

### **1. Vercel (Frontend)**

#### Build Command
```bash
npm run build
```

#### Environment Variables
```
VITE_API_URL=https://afrimercato-backend.fly.dev
```

#### Deploy Steps
```powershell
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Navigate to frontend
cd afrimercato-frontend

# 3. Deploy to production
vercel --prod
```

#### Verify
- [ ] Build succeeds
- [ ] No build errors/warnings
- [ ] CORS allows Vercel domain
- [ ] OAuth redirect URLs include Vercel domain

---

### **2. Fly.io (Backend)**

#### Pre-Deploy Checklist
- [x] `fly.toml` has correct `app` name
- [x] Health check at `/api/health`
- [x] Dockerfile present
- [x] All secrets set (run `fly secrets list`)

#### Deploy Steps
```powershell
# 1. Navigate to backend
cd afrimercato-backend

# 2. Check secrets
fly secrets list

# 3. Deploy
fly deploy

# 4. Check logs
fly logs

# 5. Check health
fly status
```

#### Verify
- [ ] App deployed successfully
- [ ] Health check passing (`/api/health` returns 200)
- [ ] MongoDB connection working
- [ ] Stripe webhook configured
- [ ] Google OAuth working (test login)
- [ ] No cold-start timeouts (first request < 10s)

---

### **3. CORS Verification**

Backend `.env`:
```bash
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-app.vercel.app
```

Test:
```bash
curl -H "Origin: https://your-app.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -X OPTIONS https://afrimercato-backend.fly.dev/api/auth/login
```

Should return:
```
Access-Control-Allow-Origin: https://your-app.vercel.app
Access-Control-Allow-Credentials: true
```

---

## ✅ D. COMMON OAUTH MISTAKES

### ❌ Wrong redirect URL
**Error:** "redirect_uri_mismatch"  
**Fix:** Ensure Google Console has EXACT URL: `https://afrimercato-backend.fly.dev/auth/google/callback`

### ❌ Frontend redirects to wrong backend URL
**Error:** 404 on OAuth
**Fix:** Check `VITE_API_URL` in Vercel env vars

### ❌ Buttons not clickable
**Error:** Clicks don't trigger navigation  
**Fix:** ✅ Already fixed — removed `motion.button`, added `pointer-events-auto`, removed overlays

### ❌ OAuth hangs forever
**Error:** Loading screen never resolves  
**Fix:** Check `/oauth/callback` route in App.jsx, verify token in URL params

### ❌ Session expired immediately
**Error:** User logs out right after login  
**Fix:** Check JWT expiration in backend (should be 7d), verify `localStorage.setItem('afrimercato_token', token)`

---

## ✅ E. PERFORMANCE VERIFICATION

### **Frontend**

#### Lighthouse Targets
- **Performance:** >90
- **Accessibility:** >90
- **Best Practices:** >90
- **SEO:** >90

#### Lazy Loading
```jsx
// ✅ Already implemented
const Home = lazy(() => import('./pages/Home'))
const AboutUs = lazy(() => import('./pages/AboutUs'))
```

#### Image Optimization
```jsx
// ✅ Already implemented
<img loading="lazy" decoding="async" />
```

---

### **Backend**

#### API Response Time Targets
- **Auth:** <3s (cold-start allowed)
- **Checkout:** <8s (Stripe cold-start allowed)
- **Repurchase:** <6s (non-blocking)
- **Product list:** <2s
- **Health check:** <1s

#### Timeout Protection
```javascript
// ✅ Already implemented in api.js
const apiCall = async (endpoint, options = {}) => {
  const timeoutMs = options.timeout || 10000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  // ...
}
```

#### Graceful Repurchase Failure
```javascript
// ✅ Already implemented in Checkout.jsx
try {
  const response = await checkoutAPI.getRepurchaseItems();
  // ...
} catch (error) {
  setRepurchaseError(true);
  // Fallback to localStorage
}
```

---

### **Database**

#### Connection Pooling
```javascript
// mongoose options in config/database.js
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

#### Query Optimization
```javascript
// ✅ Already implemented in checkoutController.js
Order.find(query)
  .select('orderNumber items totalAmount status createdAt')
  .lean()
  .maxTimeMS(5000)
```

---

## ✅ F. MONITORING

### **Fly.io Logs**
```bash
fly logs --app afrimercato-backend
```

Look for:
- `[OAUTH_FAIL]` — OAuth errors
- `[STRIPE_ERROR]` — Payment failures
- `MongooseError` — DB timeouts
- `AbortError` — Request timeouts

### **Vercel Logs**
```bash
vercel logs afrimercato-frontend
```

### **Metrics to Track**
- **API response time** (avg, p95, p99)
- **Error rate** (% of 5xx responses)
- **Cold start time** (first request after deploy)
- **Checkout completion rate**
- **OAuth conversion rate**

---

## ✅ G. ROLLBACK PLAN

### **Frontend (Vercel)**
```bash
# List deployments
vercel list

# Rollback to previous
vercel rollback [deployment-url]
```

### **Backend (Fly.io)**
```bash
# List releases
fly releases

# Rollback to previous
fly releases rollback
```

---

## ✅ H. POST-DEPLOY VERIFICATION

### **Manual Tests**
1. [ ] Register new customer account
2. [ ] Login with Google
3. [ ] Login with Facebook
4. [ ] Add items to cart
5. [ ] Checkout with Stripe
6. [ ] View order history
7. [ ] Repurchase items appear

### **Automated Health Checks**
```bash
# Backend health
curl https://afrimercato-backend.fly.dev/api/health

# Frontend health
curl -I https://your-app.vercel.app
```

---

## ✅ I. FINAL CHECKLIST

- [ ] All env vars set (Vercel + Fly.io)
- [ ] Google OAuth redirect URLs configured
- [ ] CORS allows Vercel domain
- [ ] Stripe webhook configured
- [ ] MongoDB connection working
- [ ] Lighthouse >90 on all metrics
- [ ] No console errors in production
- [ ] OAuth flow works end-to-end
- [ ] Checkout completes successfully
- [ ] Repurchase loads without blocking
- [ ] Mobile responsive (test on real device)
- [ ] Error boundaries working (no white screens)

---

**🎯 Ready to ship when all boxes checked.**
