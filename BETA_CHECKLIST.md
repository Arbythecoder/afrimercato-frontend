# 🚀 BETA VERIFICATION CHECKLIST

**Last Updated:** February 5, 2026  
**Target Launch:** 7 days from beta start  
**Scope:** Vendor + Customer modules only (Dublin + UK)

---

## ✅ PRE-DEPLOYMENT CHECKS

### Environment Configuration
- [ ] **Frontend (.env)**
  - [ ] `VITE_FEEDBACK_URL` set to Google Form / Typeform URL
  - [ ] `VITE_LAUNCH_DAYS` set to desired countdown (default: 7)
  - [ ] `VITE_LAUNCH_DATE` (optional) set to specific date
  - [ ] `VITE_APP_VERSION` set to `beta-1.0`
  - [ ] `VITE_API_URL` points to production backend (Fly.io)
  - [ ] `VITE_STRIPE_PUBLIC_KEY` configured (test mode)
  - [ ] `VITE_CLOUDINARY_CLOUD_NAME` configured

- [ ] **Backend (.env)**
  - [ ] `MONGO_URI` points to production MongoDB
  - [ ] `JWT_SECRET` is strong and unique
  - [ ] `STRIPE_SECRET_KEY` configured (test mode)
  - [ ] `STRIPE_WEBHOOK_SECRET` configured
  - [ ] `CLOUDINARY_*` variables set
  - [ ] `DEMO_STORE_PASSWORD` set (strong password)
  - [ ] `ADMIN_SEED_ENABLED=true` (for initial demo store seeding)
  - [ ] `NODE_ENV=production`

### Database Preparation
- [ ] MongoDB indexes created (run `npm run db:index` or manual creation)
  - [ ] Vendor `location.coordinates.coordinates` 2dsphere index
  - [ ] GeoCache TTL index on `expiresAt`
- [ ] Backup current database before seeding demo stores

---

## 🌍 REGION LOCK VERIFICATION (UK + DUBLIN)

### Frontend Validation
- [ ] Search for "Nigeria" or "Lagos" → Should show "We currently support delivery only in Dublin (Ireland) and the UK."
- [ ] Search for "New York" or "USA" → Should block with friendly message
- [ ] Search for "Hull" → Should allow (shows Coming Soon if no stores)
- [ ] Search for "London" → Should work and return stores
- [ ] Search for "Dublin" → Should work and return stores (EUR currency)

### Address Validation at Checkout
- [ ] Try to save Nigerian address → Should block
- [ ] Try UK postcode (e.g., "SW1A 1AA") → Should allow
- [ ] Try Dublin Eircode (e.g., "D01 X2E1") → Should allow
- [ ] Try Cork/Galway Eircode → Should block (Dublin-only for Ireland)
- [ ] Invalid UK postcode format → Should show validation error

---

## 🏪 DEMO STORES SEEDING

### Seed Demo Stores
```bash
curl -X POST https://afrimercato-backend.fly.dev/api/seed/demo-stores
```
**Expected Response:**
- 4 demo stores created
- 27 total products across stores
- Credentials provided for testing

### Verify Demo Store Data
- [ ] **Abis Fresh Farm** (London SE15 4NB) - 8 products, GBP currency
- [ ] **Mama Khadija's Market** (Manchester M8 8PZ) - 6 products, GBP currency
- [ ] **Tropical Harvest Store** (Birmingham B21 9LR) - 7 products, GBP currency
- [ ] **Afro-Irish Provisions** (Dublin D01 X2E1) - 6 products, EUR currency

### Verify Geocoding
- [ ] All 4 stores have `location.coordinates.coordinates` populated
- [ ] Stores appear in search results when searching by city
- [ ] Radius search works (e.g., search "London" with 25km radius)

---

## 🔍 LOCATION SEARCH & EMPTY STATE

### Valid Locations with Stores
- [ ] Search "London" → Shows Abis Fresh Farm
- [ ] Search "SE15 4NB" (postcode) → Shows Abis Fresh Farm
- [ ] Search "Manchester" → Shows Mama Khadija's Market
- [ ] Search "Birmingham" → Shows Tropical Harvest Store
- [ ] Search "Dublin" → Shows Afro-Irish Provisions (EUR prices)
- [ ] "Browse all stores" → Shows all 4 stores (no location filter)

### Valid Locations WITHOUT Stores ("Coming Soon")
- [ ] Search "Hull" →  Empty state shows:
  - "Coming Soon in Hull"
  - Email notification form
  - Nearby suggestions: Leeds, Sheffield, Nottingham
  - "Browse all stores" link
- [ ] Search "Worthing" → Empty state with nearby suggestions
- [ ] Fill email in notification form → Saves to localStorage (or backend if implemented)
- [ ] Click "Browse all stores" → Shows all 4 demo stores

### Mobile Experience
- [ ] Empty state is readable on mobile (< 375px width)
- [ ] Nearby city chips are tappable
- [ ] Email form is easy to fill on mobile keyboard

---

## 💬 CHAT SYSTEM (Customer ↔ Vendor)

### Customer Side
- [ ] Navigate to vendor storefront (e.g., /store/{vendorId})
- [ ] "Message Vendor" button visible
- [ ] Click → Opens chat interface
- [ ] Send message → Appears in chat history
- [ ] Messages persist after refresh

### Vendor Side  
- [ ] Login as vendor (use demo store credentials)
- [ ] Notification bell shows unread chat count
- [ ] Click notification → Opens chat list
- [ ] Reply to customer → Message appears in conversation
- [ ] Unread count updates correctly

### Database Verification
```bash
# Check Chat collection in MongoDB
db.chats.find().pretty()
```
- [ ] Messages stored with sender, senderRole, message, readAt
- [ ] unreadByCustomer and unreadByVendor fields update correctly

---

## 🎨 IMAGES & ACCESSIBILITY

### Hero Section
- [ ] Hero image loads on desktop (1200px+)
- [ ] Hero image loads on tablet (768px-1199px)
- [ ] Hero image loads on mobile (< 768px)
- [ ] Fallback image works if primary fails
- [ ] Alt text present: "Happy customer with fresh groceries"

### Store/Product Images
- [ ] Missing store logos → Use fallback from imageHelpers.js
- [ ] Missing product images → Use category-specific fallbacks
  - Vegetables → Unsplash vegetables image
  - Fruits → Unsplash fruits image
  - Meat → Unsplash meat image
- [ ] Image error handling prevents blank UI states

### Accessibility
- [ ] Contrast ratio >= 4.5:1 for text (use accessibility.js colors)
- [ ] Alt text on all hero, store, product images
- [ ] Keyboard navigation works (Tab, Enter, Space)
- [ ] Screen reader test: NVDA/JAWS can read key content
- [ ] Reduced motion respected (check `prefers-reduced-motion`)

---

## 🔒 SECURITY HARDENING

### Rate Limiting
```bash
# Test login rate limit (should block after 5 attempts in 15 min)
for i in {1..6}; do
  curl -X POST https://afrimercato-backend.fly.dev/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```
- [ ] 6th request returns 429 Too Many Requests
- [ ] Error message: "Too many login attempts..."

### NoSQL Injection Protection
```bash
# Should be sanitized (mongo-sanitize)
curl -X POST https://afrimercato-backend.fly.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":{"$gt":""},"password":"test"}'
```
- [ ] Returns 400/401, not bypassing auth

### XSS Protection
- [ ] Test XSS payload in vendor description: `<script>alert('XSS')</script>`
- [ ] Should be escaped/sanitized (xss-clean middleware)

### CORS
- [ ] Frontend can call backend API
- [ ] Unauthorized origins blocked
- [ ] OPTIONS preflight requests work

---

## 💳 PAYMENTS (STRIPE)

### Test Mode Verification
- [ ] Use Stripe test card: `4242 4242 4242 4242`
- [ ] Expiry: Any future date (e.g., 12/34)
- [ ] CVC: Any 3 digits (e.g., 123)
- [ ] ZIP: Any 5 digits (e.g., 12345)

### Checkout Flow
- [ ] Add products to cart
- [ ] Proceed to checkout
- [ ] Fill valid UK address → Allowed
- [ ] Fill Dublin address → Allowed (EUR currency)
- [ ] Fill Nigerian address → Blocked with error
- [ ] Complete payment with test card → Success
- [ ] Webhook triggers order confirmation
- [ ] Order appears in vendor dashboard

---

## 📱 MOBILE RESPONSIVENESS

### Breakpoints to Test
- [ ] **Mobile (320px - 767px)**
  - [ ] Hero image displays correctly
  - [ ] Beta banner is readable (single line, small text)
  - [ ] Feedback button is round icon (bottom-right)
  - [ ] Empty state "Coming Soon" fits screen
  - [ ] City suggestion chips wrap properly
  - [ ] Navigation menu is hamburger-style
  - [ ] Forms are thumb-friendly (large inputs)

- [ ] **Tablet (768px - 1023px)**
  - [ ] Hero section 2-column layout
  - [ ] Feedback button shows text on hover
  - [ ] Vendor cards show 2 per row
  - [ ] Chat interface readable

- [ ] **Desktop (1024px+)**
  - [ ] Hero section full-width with parallax
  - [ ] Feedback button expands on hover
  - [ ] Vendor cards show 3-4 per row
  - [ ] All features accessible

### Device Testing
- [ ] iPhone SE (375px)
- [ ] iPhone 12 Pro (390px)
- [ ] iPad Mini (768px)
- [ ] Desktop 1920px

---

## 🎯 BETA FEATURES

### Beta Banner
- [ ] Shows on all pages
- [ ] Countdown displays correctly
- [ ] "Share Feedback" link works (opens VITE_FEEDBACK_URL)
- [ ] Dismissible (stored in sessionStorage)
- [ ] Reappears after session ends

### Feedback Button
- [ ] Visible on all pages (bottom-right)
- [ ] Desktop: Expands on hover to show "Beta Feedback"
- [ ] Mobile: Round icon only
- [ ] Click opens feedback form with context params:
  - `role` (customer/vendor/guest)
  - `path` (current page)
  - `timestamp`
  - `version` (beta-1.0)
- [ ] Disabled state works if VITE_FEEDBACK_URL not set

---

## 🚀 DEPLOYMENT

### Frontend (Vercel)
```bash
cd afrimercato-frontend
npm install
npm run build
vercel --prod
```
- [ ] Build successful (no errors)
- [ ] Deployed to production URL
- [ ] Environment variables set in Vercel dashboard
- [ ] Custom domain configured (if applicable)

### Backend (Fly.io)
```bash
cd afrimercato-backend
npm install
fly deploy
```
- [ ] Deploy successful
- [ ] Health check passes: `https://afrimercato-backend.fly.dev/health`
- [ ] Secrets set via `fly secrets set`
- [ ] Logs accessible: `fly logs`

---

## 🎉 POST-DEPLOYMENT SMOKE TESTS

### Critical Paths (5-Minute Test)
1. [ ] Visit homepage → Hero loads, search works
2. [ ] Search "London" → Shows Abis Fresh Farm
3. [ ] Click store → Storefront opens, products load
4. [ ] Add product to cart → Cart updates
5. [ ] Proceed to checkout → Stripe form loads
6. [ ] Complete test payment → Order confirms
7. [ ] Login as vendor (demo store) → Dashboard shows stats
8. [ ] Check notifications → Chat works

### Error Monitoring
- [ ] Setup Sentry/Bugsnag (optional but recommended)
- [ ] Frontend error boundary catches crashes
- [ ] Backend logs errors to console/file
- [ ] Monitor Fly.io metrics (CPU, memory)

---

## 📢 LAUNCH COMMUNICATIONS

### Before Public Announcement
- [ ] Test with 5-10 beta testers privately
- [ ] Collect initial feedback via feedback button
- [ ] Fix critical bugs
- [ ] Seed demo stores (if database is empty)

### LinkedIn/Slack Launch Message Template
```
🚀 Excited to announce Afrimercato is now LIVE in beta!

We're starting in Dublin (Ireland) and across the UK, bringing African groceries to your doorstep.

🌍 Search your area (e.g., London, Manchester, Dublin)
🛒 Browse authentic ingredients
💬 Chat directly with vendors
💳 Secure checkout with Stripe

👉 Try it now: [YOUR_URL]
📝 Share feedback: [FEEDBACK_URL]

Beta launch - your feedback shapes our future! 🙌
#AfricanGroceries #FoodTech #BetaLaunch
```

### Support Channels
- [ ] Feedback form monitored daily
- [ ] Email support ready: support@afrimercato.com
- [ ] Social media handles active

---

## 🐛 KNOWN LIMITATIONS (Document for Users)

- ✅ Dublin only for Ireland (Cork/Galway coming soon)
- ✅ 4 demo stores (real vendors can register via /partner)
- ✅ Test payments only (real payments after full launch)
- ✅ Basic chat (no real-time WebSockets yet)
- ✅ No rider tracking UI (deliveries handled manually)

---

## 📊 SUCCESS METRICS (Week 1)

- [ ] 50+ unique visitors
- [ ] 10+ vendor inquiries via /partner
- [ ] 5+ test orders completed
- [ ] 20+ feedback submissions
- [ ] 0 critical bugs reported

---

**Status:** Ready for public beta launch ✅  
**Next Review:** 48 hours after launch
