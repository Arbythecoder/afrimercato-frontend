# ⚡ QUICK DEPLOY REFERENCE

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd HH:mm")  
**Status:** ✅ Production Ready

---

## 🚀 DEPLOY COMMANDS

### **Frontend (Vercel)**
```powershell
cd afrimercato-frontend
npm run build          # Verify build works
vercel --prod          # Deploy to production
```

### **Backend (Fly.io)**
```powershell
cd afrimercato-backend
fly secrets list       # Verify secrets set
fly deploy             # Deploy
fly logs               # Check logs
```

---

## 🔑 REQUIRED ENVIRONMENT VARIABLES

### **Vercel (Frontend)**
```
VITE_API_URL=https://afrimercato-backend.fly.dev
```

### **Fly.io (Backend)**
```bash
fly secrets set GOOGLE_CLIENT_ID="..."
fly secrets set GOOGLE_CLIENT_SECRET="..."
fly secrets set FRONTEND_URL="https://your-app.vercel.app"
fly secrets set JWT_SECRET="..."
fly secrets set MONGODB_URI="mongodb+srv://..."
fly secrets set STRIPE_SECRET_KEY="sk_live_..."
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 🔐 OAUTH REDIRECT URLS

### **Google Cloud Console**
Add to **Authorized redirect URIs:**
```
https://afrimercato-backend.fly.dev/auth/google/callback
```

### **Facebook Developers**
Add to **Valid OAuth Redirect URIs:**
```
https://afrimercato-backend.fly.dev/auth/facebook/callback
```

---

## ✅ VERIFICATION CHECKLIST

After deploy, verify:

1. **Backend Health**
   ```bash
   curl https://afrimercato-backend.fly.dev/api/health
   # Should return: {"ok":true,...}
   ```

2. **Frontend Loads**
   ```
   Visit: https://your-app.vercel.app
   Check: No console errors
   ```

3. **OAuth Works**
   - Click "Sign in with Google"
   - Redirects to Google
   - Redirects back and logs in ✅

4. **Checkout Works**
   - Add items to cart
   - Checkout
   - Stripe payment completes ✅

5. **Repurchase Shows**
   - Previous order items appear
   - Does NOT block checkout if API fails ✅

---

## 🐛 COMMON ERRORS

### **Error: "redirect_uri_mismatch"**
**Fix:** Check Google Console redirect URI matches EXACTLY:
```
https://afrimercato-backend.fly.dev/auth/google/callback
```

### **Error: OAuth buttons not clickable**
**Fix:** ✅ Already fixed in Login.jsx

### **Error: Checkout timeout**
**Fix:** ✅ Already handled — 8s timeout with error message

### **Error: CORS**
**Fix:** Add Vercel domain to `FRONTEND_ORIGINS` in backend .env

---

## 📊 PERFORMANCE TARGETS

| Metric | Target | Current |
|--------|--------|---------|
| Lighthouse Performance | >90 | ✅ |
| Lighthouse Accessibility | >90 | ✅ |
| Auth Response Time | <3s | ✅ |
| Checkout Time | <8s | ✅ |
| Repurchase Load | <6s | ✅ (non-blocking) |

---

## 📞 SUPPORT

**Phone:** +44 7778 285855  
**Docs:** See DEPLOY_CHECKLIST_PRODUCTION.md  
**OAuth:** See OAUTH_CONFIGURATION.md

---

**✅ READY TO SHIP**
