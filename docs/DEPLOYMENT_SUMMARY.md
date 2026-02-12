# 🎯 Vercel Deployment - Complete Setup Summary

## ✅ What Has Been Configured

### Frontend (afrimercato-frontend)
- ✅ `vercel.json` - Vercel routing and configuration
- ✅ `.env.example` - Environment variables template
- ✅ `.env` - Already exists (make sure it has `VITE_API_URL`)
- ✅ Build configuration in `vite.config.js`

### Backend (afrimercato-backend)
- ✅ `server.js` - CORS updated to accept Vercel domains (`*.vercel.app`)
- ✅ Supports all deployment platforms (Vercel, GitHub Pages, Cloudflare, Localhost)

### Documentation
- ✅ `VERCEL_DEPLOYMENT.md` - Detailed deployment guide
- ✅ `QUICK_DEPLOY.md` - Fast deployment reference
- ✅ `REDEPLOY.md` - Backend redeployment instructions
- ✅ `deploy-to-vercel.ps1` - Automated deployment script

---

## 🚀 Deploy Now (3 Methods)

### Method 1: Automated Script (Easiest for Windows)
```powershell
.\deploy-to-vercel.ps1
```

### Method 2: Manual CLI (Fastest)
```bash
# Deploy frontend
cd afrimercato-frontend
vercel --prod

# Deploy backend (if needed)
cd ../afrimercato-backend
fly deploy
```

### Method 3: Vercel Dashboard (No CLI needed)
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Select `afrimercato-frontend` folder
4. Add env var: `VITE_API_URL=https://afrimercato-backend.fly.dev`
5. Click Deploy

---

## 🔧 Backend Redeploy Required

**Important:** You MUST redeploy the backend for CORS changes to take effect!

```bash
cd afrimercato-backend
fly deploy
```

Or use the automated script which will prompt you.

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure:

- [ ] Backend is running at `https://afrimercato-backend.fly.dev`
- [ ] Frontend `.env` file has correct `VITE_API_URL`
- [ ] All code is committed to Git
- [ ] You have a Vercel account
- [ ] Vercel CLI is installed (`npm install -g vercel`)

---

## 🧪 Testing After Deployment

Once deployed, test these critical features:

1. **User Authentication**
   - Login with vendor account
   - Signup for new account
   - Logout

2. **Vendor Dashboard**
   - Access dashboard
   - View products
   - Navigate between tabs

3. **Product Management**
   - Create new product
   - Upload product images
   - Edit product
   - Delete product

4. **API Connection**
   - Open browser DevTools (F12)
   - Check Network tab
   - Verify API calls go to backend
   - Check for CORS errors

---

## 🐛 Troubleshooting

### CORS Errors
**Symptom:** "CORS policy: No 'Access-Control-Allow-Origin' header"

**Fix:**
1. Redeploy backend: `cd afrimercato-backend && fly deploy`
2. Check backend logs: `fly logs`
3. Verify your Vercel URL is in browser console error
4. Make sure backend is running: `fly status`

### Build Failures
**Symptom:** Vercel build fails

**Fix:**
1. Test locally first: `npm run build`
2. Check Vercel build logs
3. Verify all dependencies in `package.json`
4. Clear node_modules: `rm -rf node_modules && npm install`

### Environment Variables Not Working
**Symptom:** API calls go to wrong URL

**Fix:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `VITE_API_URL` = `https://afrimercato-backend.fly.dev`
3. Redeploy from Vercel dashboard

### Images Not Uploading
**Symptom:** 404 or 500 errors on image upload

**Fix:**
1. Check Cloudinary credentials in backend `.env`
2. Verify backend has write permissions
3. Check backend logs for errors: `fly logs`

---

## 🎨 Custom Domain (Optional)

To use your own domain (e.g., afrimercato.com):

1. Buy domain from registrar (Namecheap, GoDaddy, etc.)
2. In Vercel Dashboard → Settings → Domains
3. Add your domain
4. Update DNS records at your registrar:
   - Type: CNAME
   - Name: www (or @)
   - Value: cname.vercel-dns.com
5. Wait for DNS propagation (up to 48 hours)

---

## 📊 Deployment Workflow

### Development
```bash
# Make changes locally
npm run dev

# Test changes
# Commit when ready
git add .
git commit -m "Your changes"
git push
```

### Automatic Deployment
Vercel automatically deploys when you push to `main` branch!

### Manual Deployment
```bash
vercel --prod
```

---

## 🔐 Security Notes

- ✅ `.env` is in `.gitignore` (never commit secrets!)
- ✅ CORS is restricted to specific origins
- ✅ Helmet.js security headers enabled
- ✅ HTTPS enforced on both frontend and backend

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Fly.io Documentation](https://fly.io/docs/)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

## 🎉 Success Indicators

You'll know deployment is successful when:

1. ✅ Vercel gives you a `.vercel.app` URL
2. ✅ Frontend loads without errors
3. ✅ You can login as vendor
4. ✅ Dashboard displays properly
5. ✅ Product creation works
6. ✅ Images upload successfully
7. ✅ No CORS errors in browser console

---

## 🆘 Need Help?

If you're still stuck:

1. Check all the markdown files created:
   - `VERCEL_DEPLOYMENT.md` - Detailed guide
   - `QUICK_DEPLOY.md` - Fast reference
   - `REDEPLOY.md` - Backend instructions

2. Check logs:
   - Vercel: Dashboard → Deployments → Click deployment → View logs
   - Backend: `fly logs`

3. Common issues:
   - Backend not running → `fly status`
   - Wrong env vars → Check Vercel dashboard
   - CORS errors → Redeploy backend

---

## 📝 Summary

**What you need to do:**

1. ✅ Run `.\deploy-to-vercel.ps1` OR manually deploy using CLI/dashboard
2. ✅ Ensure backend is redeployed with new CORS settings
3. ✅ Test the deployment URL
4. ✅ Celebrate! 🎉

**Everything is configured and ready. Just deploy!**
