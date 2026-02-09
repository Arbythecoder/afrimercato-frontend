# VERIFICATION CURL COMMANDS

Copy-paste these commands after deployment to verify all fixes.

---

## 1. HEALTH CHECK
```bash
curl https://afrimercato-backend.fly.dev/api/health
```
**Expected:** `{"ok":true,"uptime":...,"db":"up","timestamp":"..."}`

---

## 2. GOOGLE OAUTH
```bash
curl -I https://afrimercato-backend.fly.dev/api/auth/google
```
**Expected:** `302 Found` with `Location: https://accounts.google.com/...`

---

## 3. FACEBOOK OAUTH
```bash
curl -I https://afrimercato-backend.fly.dev/api/auth/facebook
```
**If configured:** `302 Found` with `Location: https://www.facebook.com/...`  
**If not configured:** `501 Not Implemented`

---

## 4. STORE SEARCH (Case-Insensitive)
```bash
# Test different cases - should all return same results
curl "https://afrimercato-backend.fly.dev/api/locations/search-vendors?locationText=London"
curl "https://afrimercato-backend.fly.dev/api/locations/search-vendors?locationText=london"
curl "https://afrimercato-backend.fly.dev/api/locations/search-vendors?locationText=LONDON"
```
**Expected:** All return same vendor count (case-insensitive)

---

## 5. FEATURED VENDORS
```bash
curl "https://afrimercato-backend.fly.dev/api/products/featured-vendors?limit=10"
```
**Expected:** `{"success":true,"count":...,"data":[...]}`

---

## 6. CHECKOUT PREVIEW (Requires Auth)
```bash
TOKEN="your_jwt_token_here"
curl -X POST https://afrimercato-backend.fly.dev/api/checkout/preview \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"addressId":"test"}'
```
**Expected:** `{"success":false,"message":"Cart is empty"}` (if cart is empty)

---

## 7. MONITORING COMMANDS

### View Logs
```bash
fly logs
```

### Check App Status
```bash
fly status
```

### List Secrets
```bash
fly secrets list
```

### Restart App
```bash
fly apps restart afrimercato-backend
```

---

## PERFORMANCE TEST

### Measure Response Time
```bash
curl -w "\nTime: %{time_total}s\n" -o /dev/null -s https://afrimercato-backend.fly.dev/api/health
```

### Expected Times:
- Cold start: <2s
- Warm: <0.05s (50ms)

---

## SLOW QUERY MONITORING
```bash
fly logs | grep SLOW_QUERY
```
**Expected:** Only shows queries taking >100ms

---

✅ **All tests passing = Ready for production**
