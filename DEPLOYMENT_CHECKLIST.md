# Production Deployment Checklist

Complete checklist for deploying Afrimercato authentication system to production (Vercel + Fly.io).

---

## Pre-Deployment Verification

### Code Quality

- [ ] All authentication code refactored to use centralized `authHelpers.js`
- [ ] No duplicate `getCookieOptions()` or `generateRefreshToken()` in controllers
- [ ] Frontend `api.js` uses `import.meta.env.VITE_API_URL` (not hardcoded)
- [ ] All `.env` files use base URL only (NO `/api` suffix)
- [ ] No console.logs or debug code in production builds
- [ ] All linting errors resolved: `npm run lint`

### Local Testing Complete

- [ ] Customer login/register tested locally
- [ ] Vendor login/register tested locally
- [ ] Rider, Picker login tested locally
- [ ] All roles redirect correctly after login
- [ ] No page refreshes on form submissions
- [ ] Inline error handling works
- [ ] Token storage verified (localStorage + cookies)
- [ ] Refer to [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for complete test suite

---

## Frontend Deployment (Vercel)

### Pre-Deployment

- [ ] **Build succeeds locally:** `npm run build`
- [ ] Check build output in `dist/` folder
- [ ] Verify bundle size is reasonable (< 1MB for main chunk)
- [ ] No build warnings or errors

### Environment Variables

Set in **Vercel Dashboard → Project → Settings → Environment Variables**:

```
Name: VITE_API_URL
Value: https://afrimercato-backend.fly.dev
Environments: ✓ Production  ✓ Preview  ✓ Development
```

**IMPORTANT:** No `/api` suffix!

- [ ] `VITE_API_URL` set to backend domain (without `/api`)
- [ ] Environment variables applied to all environments (Production, Preview, Development)

### Vercel Configuration

Verify `vercel.json` or project settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Node.js version: 18.x or higher

### Deploy to Preview First

```bash
# Deploy to preview environment
vercel

# Or via GitHub
# Commit to a feature branch → Vercel auto-deploys preview
```

- [ ] Preview deployment successful
- [ ] Visit preview URL: `https://afrimercato-frontend-<branch>.vercel.app`
- [ ] Test customer login/register on preview
- [ ] Check browser console for API URL: Should show `https://afrimercato-backend.fly.dev/api`
- [ ] Test vendor login on preview
- [ ] Verify no CORS errors in console
- [ ] Check Network tab: API calls go to correct backend
- [ ] Cookies set correctly (DevTools → Application → Cookies)

### Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or merge to main branch (if using GitHub integration)
```

- [ ] Production deployment successful
- [ ] Visit production URL: `https://afrimercato.com` (or your domain)
- [ ] Test all roles login/register
- [ ] Verify redirects work
- [ ] Check cookies are secure (`secure: true`)
- [ ] Monitor for 30 minutes for any errors

### Post-Deployment Verification

- [ ] Customer registration works on production
- [ ] Customer login works on production
- [ ] Vendor registration works
- [ ] Vendor dashboard accessible
- [ ] All protected routes require authentication
- [ ] Logout clears tokens correctly
- [ ] Token refresh works (test by waiting or manually expiring)

---

## Backend Deployment (Fly.io)

### Pre-Deployment

- [ ] **Backend runs locally without errors:** `npm start`
- [ ] MongoDB connection successful
- [ ] All environment variables set in local `.env`
- [ ] Test API endpoints with Postman/curl

### Fly.io Setup

Install Fly.io CLI if not already installed:

```bash
# Install Fly.io CLI
# Windows (PowerShell):
iwr https://fly.io/install.ps1 -useb | iex

# Mac/Linux:
curl -L https://fly.io/install.sh | sh

# Login
fly auth login
```

### Environment Variables (Secrets)

Set secrets via Fly.io CLI:

```bash
# Navigate to backend directory
cd afrimercato-backend

# Set all secrets
fly secrets set \
  NODE_ENV=production \
  PORT=8080 \
  MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/afrimercato?retryWrites=true&w=majority" \
  JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")" \
  FRONTEND_ORIGINS="https://afrimercato.com,https://www.afrimercato.com,https://*.vercel.app,https://afrimercato-*.vercel.app"
```

**Critical Secrets Checklist:**

- [ ] `NODE_ENV=production`
- [ ] `PORT=8080` (or your Fly.io configured port)
- [ ] `MONGODB_URI` (production MongoDB cluster)
- [ ] `JWT_SECRET` (64+ character random string)
- [ ] `FRONTEND_ORIGINS` (includes production domain + Vercel wildcards)

**Verify secrets set:**
```bash
fly secrets list
```

### Generate Secure JWT_SECRET

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Using OpenSSL
openssl rand -hex 64
```

- [ ] JWT_SECRET is 64+ characters long
- [ ] JWT_SECRET is different from development
- [ ] JWT_SECRET stored securely (password manager)

### Fly.io Configuration

Verify `fly.toml` in backend directory:

```toml
app = "afrimercato-backend"

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "8080"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    port = 80
    handlers = ["http"]
    force_https = true

  [[services.ports]]
    port = 443
    handlers = ["tls", "http"]

  [services.concurrency]
    type = "connections"
    hard_limit = 25
    soft_limit = 20

[[services.http_checks]]
  interval = 10000
  timeout = 2000
  grace_period = "5s"
  method = "get"
  path = "/health"  # Make sure you have a health endpoint
```

- [ ] `internal_port` matches `PORT` env variable
- [ ] HTTPS forced (`force_https = true`)
- [ ] Health check endpoint exists (`/health` or `/api/health`)

### Health Check Endpoint

Add to `server.js` if not already present:

```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});
```

- [ ] Health check endpoint added
- [ ] Health check returns 200 OK

### Deploy to Fly.io

```bash
# First deployment
fly deploy

# Subsequent deployments
fly deploy
```

- [ ] Deployment successful
- [ ] No build errors
- [ ] App shows as healthy: `fly status`

### Post-Deployment Verification

```bash
# Check app status
fly status

# View logs (real-time)
fly logs

# Check if app is running
fly open
```

- [ ] App status: `running`
- [ ] No errors in logs
- [ ] MongoDB connection successful (check logs)
- [ ] CORS configuration logged: `✅ CORS configured for origins: ...`
- [ ] JWT_SECRET loaded (check logs, should not show actual value)

### Test Backend API

```bash
# Test health endpoint
curl https://afrimercato-backend.fly.dev/health

# Test customer registration
curl -X POST https://afrimercato-backend.fly.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "deploy-test@test.com",
    "password": "test123",
    "firstName": "Deploy",
    "lastName": "Test",
    "phone": "1234567890"
  }'

# Test customer login
curl -X POST https://afrimercato-backend.fly.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "deploy-test@test.com",
    "password": "test123"
  }'
```

**Verify:**
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Registration returns token
- [ ] Login returns token
- [ ] Cookies set in `Set-Cookie` headers

---

## Integration Testing (Frontend + Backend)

### CORS Verification

- [ ] Login from Vercel production URL
- [ ] Check Network tab: No CORS errors
- [ ] Verify `Access-Control-Allow-Origin` header in responses
- [ ] Cookies set correctly from Vercel domain

### End-to-End Tests

Test all roles on production:

- [ ] **Customer:**
  - Register new customer from production frontend
  - Login with customer account
  - Browse products
  - Add to cart
  - Verify token works across pages

- [ ] **Vendor:**
  - Register new vendor
  - Verify redirect to dashboard
  - Create a product
  - View orders

- [ ] **Rider:**
  - Login as rider
  - View rider dashboard
  - Check deliveries

- [ ] **Picker:**
  - Login as picker
  - View picker dashboard
  - Check assigned orders

- [ ] **Admin:**
  - Login as admin
  - Access admin dashboard
  - Approve vendor
  - Manage users

---

## Security Checklist

### Backend Security

- [ ] `NODE_ENV=production` set
- [ ] JWT_SECRET is strong (64+ chars)
- [ ] Passwords hashed with bcrypt (never stored plain)
- [ ] CORS restricted to trusted origins only
- [ ] Rate limiting enabled (if implemented)
- [ ] Helmet.js middleware active (security headers)
- [ ] HTTPS enforced (Fly.io auto-provides)
- [ ] No sensitive data in logs (passwords, full tokens)

### Frontend Security

- [ ] No API keys or secrets in frontend code
- [ ] Tokens stored in localStorage (acceptable for JWTs)
- [ ] User data NOT stored in localStorage (security)
- [ ] HTTPS enforced (Vercel auto-provides)
- [ ] No inline scripts (CSP if configured)
- [ ] Dependencies up-to-date: `npm audit`

### Cookie Security

Production cookies should have:

- [ ] `httpOnly: true` (prevent XSS)
- [ ] `secure: true` (HTTPS only)
- [ ] `sameSite: none` (for cross-origin, requires HTTPS)
- [ ] Valid `maxAge` (7 days for access, 30 days for refresh)

Verify in browser DevTools → Application → Cookies:
```
Name: token
Value: eyJhbGc...
Domain: .afrimercato-backend.fly.dev
Path: /
Expires: [7 days from now]
HttpOnly: ✓
Secure: ✓
SameSite: None
```

---

## Performance Checklist

### Frontend Performance

- [ ] Lighthouse score > 90 (Performance)
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 4s
- [ ] Bundle size optimized (code splitting, lazy loading)
- [ ] Images optimized (WebP, lazy loading)
- [ ] CDN enabled (Vercel provides)

### Backend Performance

- [ ] API response times < 500ms
- [ ] Database queries optimized (indexes)
- [ ] No N+1 query issues
- [ ] Connection pooling enabled (MongoDB)
- [ ] Logs structured for monitoring

---

## Monitoring & Logging

### Vercel Monitoring

- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (Sentry optional)
- [ ] Deployment notifications enabled (Slack/Email)

Check: Vercel Dashboard → Analytics

### Fly.io Monitoring

- [ ] Fly.io metrics enabled
- [ ] Log aggregation configured
- [ ] Alerts set up for errors/downtime

```bash
# Monitor logs in real-time
fly logs

# Check metrics
fly dashboard
```

### Application Monitoring

- [ ] Error logging configured (Winston + Sentry optional)
- [ ] Failed login attempts logged
- [ ] API errors logged with stack traces
- [ ] Performance metrics tracked

---

## Rollback Plan

### If Frontend Deployment Fails

```bash
# Revert to previous deployment in Vercel
# Via Dashboard: Deployments → Select previous → Promote to Production

# Or via CLI
vercel rollback
```

- [ ] Rollback procedure documented
- [ ] Team knows how to revert deployments
- [ ] Previous working version identified

### If Backend Deployment Fails

```bash
# View deployment history
fly releases

# Rollback to previous version
fly releases rollback
```

- [ ] Rollback procedure documented
- [ ] Database migrations reversible (if any)
- [ ] Previous working version known

---

## Post-Deployment Tasks

### Immediate (Within 1 Hour)

- [ ] Monitor error logs for 1 hour
- [ ] Test all critical flows (login, register, checkout)
- [ ] Verify no spike in error rates
- [ ] Check system metrics (CPU, memory, requests)

### Within 24 Hours

- [ ] Monitor user feedback for auth issues
- [ ] Check analytics for drop-offs on login/register
- [ ] Verify email notifications working (if configured)
- [ ] Test from multiple devices/browsers

### Within 1 Week

- [ ] Review auth-related support tickets
- [ ] Analyze login/register conversion rates
- [ ] Check for unusual patterns (brute force attempts)
- [ ] Rotate JWT_SECRET if planned (invalidates all tokens)

---

## Domain Configuration (If Using Custom Domain)

### Vercel Custom Domain

1. **Add domain in Vercel Dashboard:**
   - Settings → Domains → Add Domain
   - Enter `afrimercato.com` and `www.afrimercato.com`

2. **Configure DNS:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21 (Vercel IP)

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

3. **Verify:**
   - [ ] DNS propagated (use `dig afrimercato.com`)
   - [ ] SSL certificate issued (auto by Vercel)
   - [ ] HTTPS enforced
   - [ ] www redirects to non-www (or vice versa)

### Update Backend CORS

```bash
fly secrets set FRONTEND_ORIGINS="https://afrimercato.com,https://www.afrimercato.com,https://*.vercel.app"
```

- [ ] Custom domain added to `FRONTEND_ORIGINS`
- [ ] Both www and non-www included
- [ ] Vercel wildcard still present (for previews)

---

## Database Backup

Before major deployments:

```bash
# Backup MongoDB
mongodump --uri="mongodb+srv://..." --out=backup-2026-01-31

# Or use MongoDB Atlas automated backups
# Settings → Backup → Configure
```

- [ ] Database backup created
- [ ] Backup stored securely (S3, Google Drive, etc.)
- [ ] Restore procedure tested (on dev environment)

---

## Documentation Updates

- [ ] [ENV_SETUP.md](ENV_SETUP.md) reflects production URLs
- [ ] [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) updated with production tests
- [ ] README.md includes deployment instructions
- [ ] Team notified of deployment
- [ ] Deployment notes in changelog/release notes

---

## Future Improvements Checklist

Consider for future updates:

- [ ] Implement refresh token storage in database (currently only client-side)
- [ ] Add 2FA for all admin accounts
- [ ] Implement rate limiting on auth endpoints (prevent brute force)
- [ ] Add session management (view active sessions, logout all devices)
- [ ] Implement OAuth (Google, Facebook) for all roles
- [ ] Add email verification for new registrations
- [ ] Implement password reset via email
- [ ] Add account lockout after failed login attempts
- [ ] Implement CSRF protection for cookie-based auth
- [ ] Add audit logging for sensitive actions

---

## Emergency Contacts

**If critical issues arise:**

- Backend Developer: [contact]
- Frontend Developer: [contact]
- DevOps/Infrastructure: [contact]
- MongoDB Support: https://support.mongodb.com/
- Vercel Support: https://vercel.com/support
- Fly.io Support: https://fly.io/docs/about/support/

---

## Deployment Sign-Off

**Before marking deployment complete, ensure:**

- [ ] All items in this checklist completed
- [ ] Production tested and verified working
- [ ] Team notified and aware of deployment
- [ ] Monitoring active and alerts configured
- [ ] Rollback plan tested and ready
- [ ] Documentation updated
- [ ] Customer-facing features working (login, register, dashboard for all roles)

**Deployed By:** ___________________
**Deployment Date:** ___________________
**Version/Commit:** ___________________
**Sign-Off:** ___________________

---

**Last Updated:** 2026-01-31
**Next Review:** After major auth system updates or new role additions
