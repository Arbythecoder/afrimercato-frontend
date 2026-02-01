# Environment Variable Setup Guide

Complete guide for configuring environment variables across all roles for Afrimercato platform.

---

## Frontend Environment Variables

### File Locations
- `.env.development` - Local development settings
- `.env.production` - Production deployment settings (Vercel)
- `.env.local` - Local overrides (gitignored, highest priority)
- `.env` - Default settings

### Required Variables

```bash
# Backend API Base URL
# IMPORTANT: Do NOT include /api suffix - it's added automatically in code
VITE_API_URL=http://localhost:5000          # Local development
# VITE_API_URL=https://afrimercato-backend.fly.dev  # Production
```

### Environment Priority (Vite)
1. `.env.local` (highest priority, use for local testing)
2. `.env.[mode]` (e.g., `.env.production`)
3. `.env` (default)

### Vercel Deployment

Set in **Vercel Dashboard → Settings → Environment Variables**:

```
Name: VITE_API_URL
Value: https://afrimercato-backend.fly.dev
Environments: Production, Preview, Development
```

**Important Notes:**
- All Vite variables MUST start with `VITE_` prefix
- Variables are bundled at BUILD time (not runtime)
- Restart dev server after changing `.env` files
- Never commit `.env.local` to git

---

## Backend Environment Variables

### Required Variables

```bash
# Server Configuration
NODE_ENV=production                         # production | development
PORT=5000                                   # Server port

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/afrimercato?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=your-super-secret-key-minimum-32-characters-long-use-random-generator

# CORS Configuration (CRITICAL for frontend access)
# Supports wildcards for Vercel preview deployments
FRONTEND_ORIGINS=https://afrimercato.com,https://www.afrimercato.com,https://*.vercel.app,https://afrimercato-*.vercel.app

# Legacy CORS support (fallback)
CLIENT_URL=https://afrimercato.com
FRONTEND_URL=https://afrimercato.com
```

### Wildcard Pattern Support

The `FRONTEND_ORIGINS` variable supports wildcard patterns for dynamic subdomain matching:

```bash
# Exact matches
https://afrimercato.com                     # Only this domain

# Wildcard patterns
https://*.vercel.app                        # Matches any-subdomain.vercel.app
https://afrimercato-*.vercel.app           # Matches afrimercato-anything.vercel.app
https://*.cloudflare-pages.dev            # Matches any Cloudflare Pages deployment

# Comma-separated list
FRONTEND_ORIGINS=https://afrimercato.com,https://*.vercel.app,http://localhost:3000
```

### Development vs Production

**Development (.env.development or local .env):**
```bash
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/afrimercato
JWT_SECRET=dev-secret-key-change-in-production
FRONTEND_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

**Production (Fly.io secrets):**
```bash
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://[production-cluster]
JWT_SECRET=[64-character-random-string]
FRONTEND_ORIGINS=https://afrimercato.com,https://*.vercel.app
```

---

## Adding New Domains (NO CODE CHANGES NEEDED)

Simply update the `FRONTEND_ORIGINS` environment variable:

```bash
# Before
FRONTEND_ORIGINS=https://afrimercato.com,https://*.vercel.app

# After - adding new domain and Cloudflare Pages
FRONTEND_ORIGINS=https://afrimercato.com,https://new-domain.com,https://*.vercel.app,https://*.pages.dev
```

Then restart the backend server. No code changes required!

---

## Testing Environment Variables

### Frontend (Vite)

**Check if variables are loaded:**
```javascript
// In any component or file
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Mode:', import.meta.env.MODE);
```

**Browser Console:**
Open your app and check the console for:
```
🔗 API Base URL: https://afrimercato-backend.fly.dev/api
```

### Backend (Node.js)

**Check on server startup:**
```javascript
// In server.js
console.log('Environment:', process.env.NODE_ENV);
console.log('Frontend Origins:', process.env.FRONTEND_ORIGINS);
console.log('MongoDB Connected:', process.env.MONGODB_URI ? 'Yes' : 'No');
```

**Startup logs should show:**
```
✅ CORS configured for origins: https://afrimercato.com, https://*.vercel.app
✅ MongoDB connected
✅ JWT_SECRET configured
```

---

## Fly.io Deployment (Backend)

### Set Secrets via Fly.io CLI

```bash
# Set all secrets at once
fly secrets set \
  NODE_ENV=production \
  MONGODB_URI="mongodb+srv://..." \
  JWT_SECRET="your-secret-key" \
  FRONTEND_ORIGINS="https://afrimercato.com,https://*.vercel.app"

# Or set individually
fly secrets set JWT_SECRET="your-secret-key"
fly secrets set FRONTEND_ORIGINS="https://afrimercato.com,https://*.vercel.app"

# View current secrets (values hidden)
fly secrets list

# Remove a secret
fly secrets unset OLD_SECRET_NAME
```

### Generate Secure JWT_SECRET

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

---

## Vercel Deployment (Frontend)

### Set via CLI

```bash
# Set for all environments
vercel env add VITE_API_URL

# Set for specific environment
vercel env add VITE_API_URL production
```

### Set via Dashboard

1. Go to **Project Settings → Environment Variables**
2. Add new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://afrimercato-backend.fly.dev`
   - **Environments:** Production, Preview, Development
3. Click **Save**
4. Redeploy for changes to take effect

---

## Common Issues & Solutions

### Issue: "Network error. Please check your internet connection"

**Cause:** Frontend can't reach backend API.

**Solutions:**
1. Check `VITE_API_URL` is set correctly
2. Verify backend is running and accessible
3. Check browser console for actual URL being called
4. Verify no `/api/api` double path in network requests

### Issue: CORS errors in browser

**Cause:** Backend not configured to accept requests from frontend domain.

**Solutions:**
1. Add frontend domain to `FRONTEND_ORIGINS`
2. Restart backend after env var change
3. Check backend logs for rejected origins
4. Ensure `credentials: true` in fetch requests (already configured)

### Issue: Environment variables not updating

**Frontend (Vite):**
- Restart dev server: `npm run dev`
- Clear browser cache
- Rebuild: `npm run build`

**Backend (Node.js):**
- Restart server: `npm start`
- For Fly.io: `fly deploy` after setting secrets

### Issue: Cookies not being set

**Check:**
1. `NODE_ENV=production` on deployed backend
2. `FRONTEND_ORIGINS` includes your frontend domain
3. Browser allows third-party cookies (or use same domain)
4. HTTPS enabled in production (required for secure cookies)

---

## Security Best Practices

1. **Never commit sensitive env vars to git**
   - Add `.env.local` to `.gitignore`
   - Never commit `.env` with real credentials

2. **Use different secrets for dev/prod**
   - Development: Simple secrets for ease of use
   - Production: 64+ character random strings

3. **Rotate JWT_SECRET regularly**
   - Every 90 days for production
   - Invalidates all existing tokens (users must re-login)

4. **Limit CORS origins**
   - Only add trusted domains to `FRONTEND_ORIGINS`
   - Use wildcards carefully (e.g., `*.vercel.app` is safe for Vercel)

5. **Use HTTPS in production**
   - Required for secure cookies (`secure: true`)
   - Fly.io and Vercel provide free SSL

---

## Quick Reference

### Frontend
```bash
VITE_API_URL=https://afrimercato-backend.fly.dev  # NO /api suffix
```

### Backend
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=[64-char-random-string]
FRONTEND_ORIGINS=https://afrimercato.com,https://*.vercel.app
```

### Verification Commands
```bash
# Frontend - check in browser console
# Should see: 🔗 API Base URL: https://afrimercato-backend.fly.dev/api

# Backend - check startup logs
# Should see: ✅ CORS configured for origins: ...
```

---

## Support

If you encounter issues:
1. Check backend logs: `fly logs` (for Fly.io)
2. Check Vercel deployment logs
3. Verify environment variables are set correctly
4. Test with curl/Postman to isolate frontend vs backend issues

For production deployment, always test in a preview environment first before deploying to main.
