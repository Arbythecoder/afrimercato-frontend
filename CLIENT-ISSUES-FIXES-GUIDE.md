# 🎯 CLIENT QA FIXES - STEP-BY-STEP GUIDE
## Simple English Instructions for Remaining Fixes

---

## ✅ ALREADY FIXED (Automatic Fixes Applied)

### 1. OAuth Login (Google & Facebook) ✅
**What was wrong:** When users clicked "Sign in with Google/Facebook", they got error pages.

**What I fixed:**
- Added the OAuth callback route to `App.jsx`
- Now when users login with Google/Facebook, they will be redirected properly

**Test it:**
1. Start your frontend: `npm run dev` (in afrimercato-frontend folder)
2. Go to login page
3. Click "Sign in with Google" or "Sign in with Facebook"
4. It should work now (if you have Google/Facebook credentials set up in backend .env file)

---

### 2. State → County Field ✅
**What was wrong:** Form said "State" but UK uses "County", and it was required.

**What I fixed:**
- Changed label from "State *" to "County (Optional)"
- Updated placeholder to show UK examples
- Made the field optional (not required anymore)
- Backend also updated to make county optional

**Test it:**
1. Register as a vendor
2. During store setup, you'll see "County (Optional)" instead of "State *"
3. You can leave it blank now

---

## 📋 FIXES YOU NEED TO DO

### FIX #3: Multiple Category Selection for Vendors
**Priority:** HIGH
**Difficulty:** Medium
**Time:** 30-45 minutes

**Problem:** Vendors can only pick ONE category (like "Fresh Produce"). But they might sell products in multiple categories (Fresh Produce + Meat + Dairy).

**Step-by-Step Fix:**

#### STEP 1: Update Vendor Backend Model
File: `afrimercato-backend/src/models/Vendor.js`

Find this code (around line 39):
```javascript
category: {
  type: String,
  enum: {
    values: [
      'fresh-produce',
      'groceries',
      'meat-fish',
      'bakery',
      'beverages',
      'household',
      'beauty-health',
      'other'
    ],
    message: '{VALUE} is not a valid category'
  },
  required: [true, 'Please select a business category']
},
```

**REPLACE WITH:**
```javascript
categories: {  // Changed from 'category' to 'categories' (plural)
  type: [String],  // Changed from String to [String] (array)
  enum: {
    values: [
      'fresh-produce',
      'groceries',
      'meat-fish',
      'bakery',
      'beverages',
      'household',
      'beauty-health',
      'other'
    ],
    message: '{VALUE} is not a valid category'
  },
  default: [],  // Default is empty array
  validate: {
    validator: function(categories) {
      return categories && categories.length > 0;  // Must pick at least one
    },
    message: 'Please select at least one category'
  }
},
```

#### STEP 2: Update Frontend Form
File: `afrimercato-frontend/src/components/VendorOnboarding.jsx`

Find this code (around line 19):
```javascript
category: 'fresh-produce',
```

**REPLACE WITH:**
```javascript
categories: [],  // Empty array instead of single string
```

Find this code (around line 379):
```javascript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Store Category *
  </label>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {categories.map((cat) => (
      <motion.button
        key={cat.value}
        type="button"
        onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
        className={`p-4 rounded-lg border-2 transition-all ${
          formData.category === cat.value
            ? 'border-afri-green bg-afri-green/10 text-afri-green'
            : 'border-gray-200 hover:border-gray-300'
        }`}
```

**REPLACE WITH:**
```javascript
<div>
  <label className="block text-sm font-medium text-gray-700 mb-3">
    Store Categories * (Select all that apply)
  </label>
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {categories.map((cat) => (
      <motion.button
        key={cat.value}
        type="button"
        onClick={() => {
          // Toggle category selection
          setFormData(prev => {
            const isSelected = prev.categories.includes(cat.value);
            if (isSelected) {
              // Remove if already selected
              return { ...prev, categories: prev.categories.filter(c => c !== cat.value) };
            } else {
              // Add if not selected
              return { ...prev, categories: [...prev.categories, cat.value] };
            }
          });
        }}
        className={`p-4 rounded-lg border-2 transition-all ${
          formData.categories.includes(cat.value)
            ? 'border-afri-green bg-afri-green/10 text-afri-green'
            : 'border-gray-200 hover:border-gray-300'
        }`}
```

#### STEP 3: Update Form Submit
File: Same file - `afrimercato-frontend/src/components/VendorOnboarding.jsx`

Find this code (around line 192):
```javascript
const profileData = {
  storeName: formData.storeName,
  description: formData.description,
  category: formData.category,
```

**REPLACE WITH:**
```javascript
const profileData = {
  storeName: formData.storeName,
  description: formData.description,
  categories: formData.categories,  // Changed from category to categories
```

#### STEP 4: Update Validation
File: Same file - `afrimercato-frontend/src/components/VendorOnboarding.jsx`

Find this code (around line 146):
```javascript
const validateStep = (step) => {
  switch (step) {
    case 1:
      if (!formData.storeName.trim()) {
        setError('Store name is required')
        return false
      }
      if (!formData.description.trim()) {
        setError('Store description is required')
        return false
      }
      break
```

**ADD THIS after the description check:**
```javascript
      if (!formData.categories || formData.categories.length === 0) {
        setError('Please select at least one category')
        return false
      }
      break
```

---

### FIX #4: Add "Add Product" Button
**Priority:** HIGH
**Difficulty:** Easy
**Time:** 10 minutes

**Problem:** Client said vendors have no way to add products.

**Step-by-Step Fix:**

File: `afrimercato-frontend/src/pages/vendor/Dashboard.jsx`

Find this code (around line 587):
```javascript
{/* Quick Actions */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <Link to="/products" className="group relative bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl p-6
```

**ADD THIS NEW BUTTON at the very top of the Dashboard (around line 275, after the welcome header):**
```javascript
{/* Add Product Quick Action Button - Prominent */}
<div className="mb-6">
  <Link
    to="/products/new"
    className="block w-full sm:w-auto sm:inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-afri-green to-emerald-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl transform transition-all duration-300 hover:scale-[1.02] font-bold text-lg group"
  >
    <svg className="w-7 h-7 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
    <span>Add New Product</span>
    <span className="inline-flex items-center justify-center w-6 h-6 bg-white/20 rounded-full text-xs">+</span>
  </Link>
</div>
```

**OR** if you want it inside the Quick Actions section (around line 589), replace the Manage Products card with this:
```javascript
<Link to="/products/new" className="group relative bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-xl p-6 overflow-hidden transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity"></div>
  <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
  <div className="relative z-10 flex items-center justify-between">
    <div>
      <h4 className="text-xl font-bold mb-2">Add New Product</h4>
      <p className="text-green-100">List a new product for sale</p>
    </div>
    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
      </svg>
    </div>
  </div>
</Link>
```

---

### FIX #5: Fix Store Profile Not Showing in Settings
**Priority:** HIGH
**Difficulty:** Medium
**Time:** 30 minutes

**Problem:** Client created a store with email `christabelrosey@gmail.com`, but when they go to Settings, their store info is not there.

**Step-by-Step Fix:**

#### STEP 1: Check if Settings page fetches vendor data

File: `afrimercato-frontend/src/pages/vendor/Settings.jsx`

Look for `useEffect` at the top of the component. It should look something like this:

```javascript
useEffect(() => {
  fetchVendorProfile()
}, [])

const fetchVendorProfile = async () => {
  try {
    const response = await vendorAPI.getProfile()
    if (response.success) {
      // Pre-fill form with vendor data
      setFormData({
        storeName: response.data.storeName,
        description: response.data.description,
        phone: response.data.phone,
        address: response.data.address,
        // ... etc
      })
    }
  } catch (error) {
    console.error('Failed to load profile:', error)
  }
}
```

**If this is MISSING**, you need to add it.

#### STEP 2: Ensure form fields are pre-populated

Make sure the form inputs use `value={formData.storeName}` etc., NOT just empty inputs.

**Example:**
```javascript
<input
  type="text"
  name="storeName"
  value={formData.storeName}  // ← Must have this
  onChange={handleChange}
  className="..."
  placeholder="Store Name"
/>
```

#### STEP 3: Match address structure

Make sure the address structure in Settings matches VendorOnboarding:
```javascript
address: {
  street: '',
  city: '',
  state: '',  // county
  country: 'United Kingdom',
  postalCode: ''
}
```

---

### FIX #6: Admin Verification Before Store Setup
**Priority:** MEDIUM
**Difficulty:** Hard
**Time:** 1-2 hours

**Problem:** Vendors can create stores immediately after registering. Client wants admin to approve them first.

**This is a BIG change. Here's the simplified approach:**

#### STEP 1: Update Registration Flow

File: `afrimercato-backend/src/controllers/authController.js`

When a vendor registers, set them as "pending approval":

```javascript
// After creating user in register function
if (role === 'vendor') {
  user.isVerified = false;  // Not verified yet
  await user.save();

  // Send email to admin (optional)
  // await sendAdminNotification(user);
}
```

#### STEP 2: Block Store Creation Until Approved

File: `afrimercato-backend/src/controllers/vendorController.js`

In the `createVendorProfile` function, add this check at the top:

```javascript
exports.createVendorProfile = async (req, res) => {
  try {
    // Check if user is verified
    if (!req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. You will receive an email when approved.'
      });
    }

    // Rest of the code...
```

#### STEP 3: Show "Pending Approval" Message in Frontend

File: `afrimercato-frontend/src/components/VendorOnboarding.jsx`

When the backend returns the 403 error, show a nice message:

```javascript
} catch (err) {
  console.error('Onboarding error:', err)

  if (err.response?.status === 403) {
    setError('⏳ Your vendor account is pending admin approval. We will email you when your account is approved!')
  } else {
    setError(err.response?.data?.message || 'Failed to create vendor profile')
  }
}
```

#### STEP 4: Create Admin Approval Page

Create a new page: `afrimercato-frontend/src/pages/admin/VendorApproval.jsx`

```javascript
import { useState, useEffect } from 'react'

function VendorApproval() {
  const [pendingVendors, setPendingVendors] = useState([])

  useEffect(() => {
    // Fetch vendors where isVerified = false
    fetchPendingVendors()
  }, [])

  const fetchPendingVendors = async () => {
    // Call GET /api/admin/pending-vendors
  }

  const approveVendor = async (vendorId) => {
    // Call POST /api/admin/approve-vendor/:vendorId
    // Set user.isVerified = true
    // Send email to vendor
  }

  const rejectVendor = async (vendorId) => {
    // Call POST /api/admin/reject-vendor/:vendorId
  }

  return (
    <div>
      <h1>Pending Vendor Approvals</h1>
      {pendingVendors.map(vendor => (
        <div key={vendor._id}>
          <p>{vendor.name} - {vendor.email}</p>
          <button onClick={() => approveVendor(vendor._id)}>Approve</button>
          <button onClick={() => rejectVendor(vendor._id)}>Reject</button>
        </div>
      ))}
    </div>
  )
}
```

#### STEP 5: Create Backend Admin Routes

File: `afrimercato-backend/src/routes/adminRoutes.js` (create if doesn't exist)

```javascript
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Get pending vendors
router.get('/pending-vendors', protect, authorize('admin'), async (req, res) => {
  const pendingVendors = await User.find({
    role: 'vendor',
    isVerified: false
  }).select('name email createdAt');

  res.json({ success: true, data: pendingVendors });
});

// Approve vendor
router.post('/approve-vendor/:id', protect, authorize('admin'), async (req, res) => {
  const user = await User.findById(req.params.id);
  user.isVerified = true;
  await user.save();

  // Send email to vendor
  // await sendApprovalEmail(user.email);

  res.json({ success: true, message: 'Vendor approved' });
});

module.exports = router;
```

---

### FIX #7: UK Postcode Lookup (BONUS - Advanced)
**Priority:** LOW
**Difficulty:** Medium
**Time:** 45 minutes

**Problem:** Client wants users to enter postcode and auto-fill address.

**Step-by-Step Fix:**

File: `afrimercato-frontend/src/components/VendorOnboarding.jsx`

#### STEP 1: Add Postcode Lookup Button

Find the address section (around line 469) and ADD THIS BEFORE the street address field:

```javascript
{/* Postcode Lookup */}
<div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Quick Address Lookup (UK Only)
  </label>
  <div className="flex gap-2">
    <input
      type="text"
      placeholder="Enter postcode (e.g., SW1A 1AA)"
      value={postcodeSearch}
      onChange={(e) => setPostcodeSearch(e.target.value.toUpperCase())}
      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-afri-green focus:border-transparent transition"
    />
    <button
      type="button"
      onClick={lookupPostcode}
      disabled={loadingPostcode}
      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
    >
      {loadingPostcode ? 'Searching...' : 'Find Address'}
    </button>
  </div>
  {postcodeError && (
    <p className="mt-2 text-sm text-red-600">{postcodeError}</p>
  )}
</div>
```

#### STEP 2: Add State Variables

At the top of the component, add:

```javascript
const [postcodeSearch, setPostcodeSearch] = useState('')
const [loadingPostcode, setLoadingPostcode] = useState(false)
const [postcodeError, setPostcodeError] = useState('')
```

#### STEP 3: Add Lookup Function

```javascript
const lookupPostcode = async () => {
  if (!postcodeSearch.trim()) {
    setPostcodeError('Please enter a postcode')
    return
  }

  setLoadingPostcode(true)
  setPostcodeError('')

  try {
    // Call FREE UK Postcode API
    const response = await fetch(`https://api.postcodes.io/postcodes/${postcodeSearch.replace(/\s/g, '')}`)
    const data = await response.json()

    if (data.status === 200 && data.result) {
      const result = data.result

      // Auto-fill address fields
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          street: result.admin_ward || '',  // Best guess for street area
          city: result.admin_district || result.postcode_area || '',
          state: result.admin_county || '',  // County
          postalCode: result.postcode
        }
      }))

      alert('✅ Address found! Please edit the Street field with your exact address.')
    } else {
      setPostcodeError('Postcode not found. Please enter manually.')
    }
  } catch (error) {
    console.error('Postcode lookup error:', error)
    setPostcodeError('Failed to lookup postcode. Please enter manually.')
  } finally {
    setLoadingPostcode(false)
  }
}
```

---

## 🧪 TESTING CHECKLIST

After making all fixes, test these:

### OAuth Testing
- [ ] Click "Sign in with Google" - should work
- [ ] Click "Sign in with Facebook" - should work
- [ ] User should be redirected to correct dashboard

### Vendor Onboarding Testing
- [ ] Register new vendor account
- [ ] County field says "County (Optional)" not "State *"
- [ ] Can leave county blank
- [ ] Can select MULTIPLE categories (not just one)
- [ ] Selected categories show green highlight

### Product Management Testing
- [ ] Login as vendor
- [ ] See "Add Product" button on dashboard
- [ ] Clicking it takes you to product creation page

### Settings Testing
- [ ] Create vendor store
- [ ] Go to Settings
- [ ] Store name, description, address should already be filled in
- [ ] Address format should match onboarding form

### Admin Approval Testing (if implemented)
- [ ] New vendor registers
- [ ] Vendor tries to create store → sees "pending approval" message
- [ ] Admin logs in, sees pending vendor
- [ ] Admin approves vendor
- [ ] Vendor can now create store

---

## 📝 SUMMARY OF WHAT I FIXED AUTOMATICALLY

✅ **OAuth Login** - Added route so Google/Facebook login works
✅ **State → County** - Changed label and made it optional
✅ **Backend County** - Made county field optional in database

## 📝 WHAT YOU NEED TO FIX (Simple Priority Order)

1. **Add "Add Product" Button** (10 minutes) - Easy
2. **Fix Store Profile in Settings** (30 minutes) - Medium
3. **Multiple Categories** (45 minutes) - Medium
4. **Admin Verification** (1-2 hours) - Hard
5. **Postcode Lookup** (45 minutes) - Medium (bonus feature)

---

## 🆘 NEED HELP?

If you get stuck on any step:
1. Read the error message carefully
2. Check the console (F12 in browser)
3. Look at the file paths - make sure you're editing the right file
4. Ask me for help with the specific step number

Good luck! 🚀
