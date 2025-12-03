# 🧪 QUICK TEST GUIDE - Verify All Fixes

## BEFORE TESTING: Restart Both Servers

### Backend
```bash
cd afrimercato-backend
# Stop current server (Ctrl+C)
npm start
```

### Frontend
```bash
cd afrimercato-frontend
# Stop current server (Ctrl+C)
npm run dev
```

---

## TEST 1: Customer Registration & Login ✅

### Steps:
1. Open browser → `http://localhost:5173`
2. Click **"Sign Up"** or **"Register"**
3. **VERIFY:** Page says "Join as Customer, Vendor, Rider, or Picker" (not vendor-only)
4. **VERIFY:** Email placeholder is `your.email@example.com` (not vendor-specific)
5. Fill form:
   - Role: **Customer**
   - Name: Test Customer
   - Email: testcustomer@test.com
   - Password: Password123
6. Click **"Create Account"**
7. **VERIFY:** Success message says "Account created successfully! You can now start shopping."
8. **VERIFY:** You're automatically logged in (no email verification confusion)

### Expected Result:
✅ Registration works smoothly
✅ No confusing email verification messages
✅ User is logged in immediately

---

## TEST 2: Checkout Redirect Flow ✅

### Steps:
1. **Logout** first (to test as new user)
2. Browse to a store → Add items to cart
3. Click **"Checkout"**
4. **VERIFY:** Redirected to login page (not stuck in a loop)
5. Click **"Create an account"** or use login form
6. Complete registration/login
7. **VERIFY:** After successful login, you're automatically redirected BACK to checkout page
8. Complete checkout process

### Expected Result:
✅ Seamless redirect to login
✅ Automatic redirect back to checkout after login
✅ Can complete purchase without confusion

---

## TEST 3: Login Page is Role-Agnostic ✅

### Steps:
1. Go to `http://localhost:5173/login`
2. **VERIFY:** Subtitle says "Sign in as Customer, Vendor, Rider, or Picker"
3. **VERIFY:** Email placeholder is `your.email@example.com`
4. **VERIFY:** Nothing indicates it's vendor-only

### Expected Result:
✅ Clear that login is for ALL user types
✅ No vendor-specific messaging

---

## TEST 4: Contact Us Form Works ✅

### Steps:
1. Go to Contact Us page
2. Fill out contact form:
   - Name: Test User
   - Email: test@test.com
   - Subject: General Inquiry
   - Message: Testing form submission
3. Click **"Send Message"**
4. **VERIFY:** Button shows "Sending..." (not just fake success)
5. **VERIFY:** Success message appears: "Message Sent! ✓"
6. Check backend logs or database to confirm submission

### Expected Result:
✅ Form actually submits to backend
✅ Data is saved in database
✅ User sees proper feedback

---

## TEST 5: Different User Roles ✅

### Test Vendor Registration:
1. Register new account with role: **Vendor**
2. **VERIFY:** Redirected to vendor dashboard (`/dashboard`)

### Test Rider Registration:
1. Register new account with role: **Rider**
2. **VERIFY:** Redirected to rider dashboard (`/rider/dashboard`)

### Test Picker Registration:
1. Register new account with role: **Picker**
2. **VERIFY:** Redirected to picker dashboard (`/picker/dashboard`)

### Expected Result:
✅ Each role redirects to correct dashboard
✅ No confusion about which login to use

---

## 🐛 IF SOMETHING DOESN'T WORK

### Check Browser Console:
1. Press F12 → Console tab
2. Look for errors (red text)
3. Share error messages if any

### Check Backend Terminal:
1. Look at backend console output
2. Check for error messages
3. Verify API calls are being received

### Common Issues:
- **Cache:** Clear browser cache (Ctrl+Shift+Del)
- **Ports:** Ensure frontend (5173) and backend (5000) are running
- **Database:** Ensure MongoDB is connected

---

## ✅ SUCCESS CRITERIA

All tests should show:
- ✅ No login/register confusion
- ✅ Smooth customer checkout flow
- ✅ Clear role-agnostic messaging
- ✅ No email verification confusion
- ✅ Contact form actually submits
- ✅ Professional, working functionality

---

## 📞 REPORT RESULTS

After testing, report:
1. ✅ All tests passing
2. ❌ Which test failed (if any)
3. Error messages/screenshots (if any)

---

**Ready to Test!** 🚀
