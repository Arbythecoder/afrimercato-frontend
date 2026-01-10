# 🚀 Deploy to Production - Final Steps

## ✅ What We Fixed

1. ✅ MongoDB connection string updated (correct credentials)
2. ✅ Added "snacks" category to validator
3. ✅ Added "snacks" category to Vendor model
4. ✅ Committed changes to Git
5. ✅ Pushed to GitHub

---

## 🔥 Deploy to Fly.io Production

### Step 1: Update MongoDB Credentials in Fly.io

Run these commands in your terminal:

```bash
cd afrimercato-backend

# Set the correct MongoDB URI in Fly.io secrets
fly secrets set "MONGODB_URI=mongodb+srv://africa:Oluwanifemi123.@afrihub.lmp2s8m.mongodb.net/afrimercato?retryWrites=true&w=majority&appName=Afrihub" -a afrimercato-backend
```

**Expected output:**
```
Release v2 created
Monitoring deployment...
✓ Secrets updated
```

### Step 2: Deploy the Updated Code

```bash
fly deploy -a afrimercato-backend
```

**This will:**
- Build your Docker container
- Deploy with the new code (snacks category support)
- Use the new MongoDB credentials
- Restart the app

**Deployment takes 2-3 minutes.**

### Step 3: Verify Deployment

#### Check if app is running:
```bash
fly status -a afrimercato-backend
```

#### Check logs:
```bash
fly logs -a afrimercato-backend
```

**Look for:**
```
✅ MongoDB Connected
📊 Database Name: afrimercato
```

#### Test the API:
```bash
curl https://afrimercato-backend.fly.dev/api/health
```

**Expected:**
```json
{"status":"ok","message":"Server is running"}
```

---

## 🎯 Test Vendor Registration (Production)

### Test 1: Register Vendor
```bash
curl -X POST https://afrimercato-backend.fly.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Production Test Vendor",
    "email": "prodvendor@test.com",
    "password": "Password123",
    "confirmPassword": "Password123",
    "role": "vendor"
  }'
```

**Expected:** Success with token returned

### Test 2: Create Vendor Profile with "Snacks"
```bash
# Use the token from Test 1 registration response
curl -X POST https://afrimercato-backend.fly.dev/api/vendor/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "storeName": "Snack Paradise",
    "category": "snacks",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "London",
      "state": "London"
    }
  }'
```

**Expected:** Success - vendor profile created!

---

## ✅ Success Checklist

- [ ] Fly.io secrets updated with new MongoDB credentials
- [ ] App deployed to Fly.io
- [ ] Logs show "MongoDB Connected"
- [ ] Health check returns 200 OK
- [ ] Vendor can register
- [ ] Vendor can create profile with "snacks" category

---

## 🎉 Tell Your Client

Once all checks pass, your app is LIVE and ready for Global Talent Visa!

**Production URLs:**
- Backend API: https://afrimercato-backend.fly.dev/api
- Frontend: https://arbythecoder.github.io/afrimercato-frontend/

**Features Working:**
✅ Vendor registration
✅ All categories including "snacks"
✅ Profile creation
✅ Dashboard access
✅ UberEats-style approval flow

---

## 🚨 If Deployment Fails

### Check Fly.io Login
```bash
fly auth login
```

### Check Fly.io Apps
```bash
fly apps list
```

### View Full Logs
```bash
fly logs -a afrimercato-backend --tail
```

### Restart App
```bash
fly apps restart afrimercato-backend
```

---

## 📝 Summary

**The Real Problem Was:** Wrong MongoDB credentials in production (AFROMERT:africamartgrocery instead of africa:Oluwanifemi123.)

**The Fix:**
1. Updated local `.env` with correct credentials
2. Added "snacks" to validator and model
3. Pushed to GitHub
4. Updating Fly.io secrets with correct MongoDB URI
5. Deploying updated code

**Time to Complete:** 5-10 minutes

**Your client can start using the app TODAY for Global Talent Visa!** 🇬🇧
