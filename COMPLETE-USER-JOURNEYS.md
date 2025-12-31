# 🚀 AFRIMERCATO - COMPLETE USER JOURNEYS
## Step-by-Step Guide for Vendors, Riders, and Customers

**Last Updated:** December 31, 2025

---

# 📖 TABLE OF CONTENTS

1. [Vendor Journey](#vendor-journey) - Sell products on the platform
2. [Rider Journey](#rider-journey) - Deliver orders and earn money
3. [Customer Journey](#customer-journey) - Shop and receive deliveries

---

# 1️⃣ VENDOR JOURNEY

## 🎯 Goal: Set up a store and start selling products

### Step 1: Registration (5 minutes)

**URL:** http://localhost:5173/register

1. **Open the registration page**
   - Click "Sign Up" or "Get Started"

2. **Fill in your details:**
   ```
   Full Name: John's Fresh Produce
   Email: john@freshproduce.com
   Password: SecurePass123!
   Confirm Password: SecurePass123!
   Role: Select "Vendor" (click the vendor card)
   ```

3. **Click "Create Account"**
   - You'll be redirected to login page
   - You'll receive a welcome email (if email is configured)

**Alternative: OAuth Registration**
- Click "Sign in with Google"
- Authorize with your Google account
- Select "Vendor" role
- Done!

---

### Step 2: First Login

**URL:** http://localhost:5173/login

1. **Enter your credentials:**
   ```
   Email: john@freshproduce.com
   Password: SecurePass123!
   ```

2. **Click "Sign In"**
   - You'll be redirected to vendor onboarding

---

### Step 3: Store Setup (10 minutes)

**URL:** Automatically redirected to `/vendor/setup`

#### 📋 Step 3.1: Business Information

**What you'll see:** A beautiful multi-step onboarding form

**Fill in:**
```
Store Name: John's Fresh Produce
Business Type:
  ☐ Individual
  ☑ Registered Business
  ☐ Cooperative

Store Description:
"We provide fresh, locally-sourced organic vegetables and fruits
delivered straight from our farm to your door. All our produce is
pesticide-free and harvested daily."

Phone Number: +44 20 1234 5678
```

#### 📍 Step 3.2: Store Address

**Important:** Notice the UK address format!

```
Street Address: 123 Market Street
City: London
County (Optional): Greater London    ← Notice: NOT "State *"
Postal Code: SW1A 1AA
Country: United Kingdom (pre-filled)
```

**Optional Feature:** Postcode Lookup
- Enter your postcode (e.g., "SW1A 1AA")
- Click "Find Address"
- It auto-fills city and county
- You just edit the street address

#### 🏷️ Step 3.3: Select Categories

**Question:** "What do you sell?"

**Select one or more categories:**
```
☑ Fresh Produce (Fruits & Vegetables)
☑ Groceries (Packaged foods, staples)
☐ Meat & Fish
☐ Bakery
☐ Beverages
☐ Household Items
☐ Beauty & Health
☐ Other
```

**Tip:** You can select multiple! Click all that apply.

#### 📸 Step 3.4: Store Logo & Images (Optional)

```
Upload Store Logo: [Click to upload]
Upload Store Banner: [Click to upload]
Upload Product Photos: [Click to upload multiple]
```

**Supported formats:** JPG, PNG (max 5MB each)

#### ✅ Step 3.5: Review & Submit

- Review all your information
- Check the box: "I agree to terms and conditions"
- Click **"Launch My Store"**

**Success!** You'll see:
```
🎉 Congratulations! Your store is now live!
```

You'll be redirected to your **Vendor Dashboard**.

---

### Step 4: Vendor Dashboard - First Look

**URL:** http://localhost:5173/vendor/dashboard

**What you'll see:**

```
┌─────────────────────────────────────────────────────┐
│  👋 Welcome back, John's Fresh Produce!              │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │  🎯 QUICK ACTION                             │   │
│  │  ┌───────────────────────────────────────┐  │   │
│  │  │  ➕ Add New Product                    │  │   │ ← NEW! Prominent button
│  │  └───────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  📊 Today's Stats:                                   │
│  ┌───────┐  ┌───────┐  ┌───────┐  ┌───────┐       │
│  │   0   │  │   0   │  │  £0   │  │   0   │       │
│  │Products  │Orders │  │Revenue│  │Pending│       │
│  └───────┘  └───────┘  └───────┘  └───────┘       │
└─────────────────────────────────────────────────────┘
```

---

### Step 5: Add Your First Product ⭐

**Two ways to start:**

1. **Click the big green "+ Add New Product" button** (on dashboard)
2. Or navigate to: Products → Add Product

**URL:** http://localhost:5173/vendor/products/new

#### 📝 Product Details Form

**Fill in all fields:**

```
┌─────────────────────────────────────────────────────┐
│  Add New Product                                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Product Name *                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │ Fresh Organic Tomatoes                         │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Category *                                          │
│  ┌────────────────────────────────────────────────┐ │
│  │ Fresh Produce ▼                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Description *                                       │
│  ┌────────────────────────────────────────────────┐ │
│  │ Vine-ripened organic tomatoes, grown locally   │ │
│  │ without pesticides. Perfect for salads and     │ │
│  │ cooking. Harvested fresh daily.                │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Price * (£)              Unit *                     │
│  ┌──────────────────┐    ┌──────────────────────┐  │
│  │ 2.50             │    │ per kg ▼             │  │
│  └──────────────────┘    └──────────────────────┘  │
│                                                      │
│  Stock Quantity *         Low Stock Alert            │
│  ┌──────────────────┐    ┌──────────────────────┐  │
│  │ 100              │    │ 10                   │  │
│  └──────────────────┘    └──────────────────────┘  │
│                                                      │
│  Product Images *                                    │
│  ┌────────────────────────────────────────────────┐ │
│  │  [Upload] or Drag & Drop                       │ │
│  │  (You can upload multiple images)              │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌─────────────┐                                    │
│  │ Add Product │                                    │
│  └─────────────┘                                    │
└─────────────────────────────────────────────────────┘
```

**Example product details:**
```
Product Name: Fresh Organic Tomatoes
Category: Fresh Produce
Description: Vine-ripened organic tomatoes, grown locally without
pesticides. Perfect for salads and cooking. Harvested fresh daily.
Price: £2.50
Unit: per kg
Stock Quantity: 100 kg
Low Stock Alert: 10 kg
Images: tomatoes-1.jpg, tomatoes-2.jpg
```

**Click "Add Product"**

**Success message:**
```
✅ Product added successfully!
```

You'll be redirected to your **Products List**.

---

### Step 6: Manage Your Products

**URL:** http://localhost:5173/vendor/products

**What you'll see:**

```
┌─────────────────────────────────────────────────────┐
│  My Products                        [+ Add Product]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🔍 [Search products...]          📁 All Categories▼│
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🍅 Fresh Organic Tomatoes                   │   │
│  │ Fresh Produce • £2.50/kg                    │   │
│  │ Stock: 100 kg • Status: Active              │   │
│  │                                              │   │
│  │ [View] [Edit] [Delete]                      │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🥕 Organic Carrots                          │   │
│  │ Fresh Produce • £1.80/kg                    │   │
│  │ Stock: 75 kg • Status: Active               │   │
│  │                                              │   │
│  │ [View] [Edit] [Delete]                      │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

#### 📝 Edit a Product (UPDATE)

1. **Click "Edit" on any product**
2. **Modify any field:**
   - Change price: £2.50 → £2.99
   - Update stock: 100 → 85
   - Edit description
   - Add more images
3. **Click "Save Changes"**

**Success:**
```
✅ Product updated successfully!
```

#### 👁️ View Product Details (READ)

1. **Click "View" on any product**
2. **See all details:**
   - Product name and description
   - Current price and unit
   - Stock level
   - All images
   - Sales history
   - Customer reviews

#### 🗑️ Delete a Product (DELETE)

1. **Click "Delete" on any product**
2. **Confirmation modal appears:**
   ```
   ⚠️ Delete Product?

   Are you sure you want to delete "Fresh Organic Tomatoes"?
   This action cannot be undone.

   [Cancel]  [Yes, Delete]
   ```
3. **Click "Yes, Delete"**

**Success:**
```
✅ Product deleted successfully!
```

---

### Step 7: Receive Your First Order! 🎉

**When a customer places an order:**

1. **You'll receive a notification:**
   - Email: "New order received!"
   - Dashboard: Red badge with order count

2. **Navigate to Orders:**
   **URL:** http://localhost:5173/vendor/orders

**What you'll see:**

```
┌─────────────────────────────────────────────────────┐
│  Orders                                              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Filters: [All] [Pending] [Processing] [Completed]  │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Order #AF12345                    🟡 PENDING │   │
│  │ Customer: Sarah Johnson                      │   │
│  │ Items: 3 items • Total: £15.50              │   │
│  │ Delivery: 123 Park Lane, London SW1A 1AA    │   │
│  │ Placed: 10 minutes ago                       │   │
│  │                                              │   │
│  │ [View Details] [Accept Order]                │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

3. **Click "View Details" to see:**
   ```
   Order Items:
   - Fresh Organic Tomatoes (2 kg) - £5.00
   - Organic Carrots (3 kg) - £5.40
   - Red Onions (2 kg) - £3.60

   Subtotal: £14.00
   Delivery Fee: £1.50
   Total: £15.50

   Customer Note: "Please select ripe tomatoes"
   ```

4. **Process the order:**
   - Click "Accept Order"
   - Status changes to "Processing"
   - Assign to a picker (if you have team members)

5. **Update order status as you prepare:**
   ```
   Pending → Processing → Ready for Pickup → Out for Delivery → Delivered
   ```

---

### Step 8: Assign to Picker (Team Management)

**URL:** http://localhost:5173/vendor/team

1. **Add a picker:**
   ```
   Picker Name: Mike Smith
   Email: mike@example.com
   Phone: +44 20 9876 5432
   ```

2. **Assign order to picker:**
   - Go to Orders
   - Click "Assign Picker"
   - Select Mike Smith
   - Mike gets notification to prepare order

---

### Step 9: Track Your Earnings

**URL:** http://localhost:5173/vendor/financials

**What you'll see:**

```
┌─────────────────────────────────────────────────────┐
│  Financial Dashboard                                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  💰 Total Revenue                                    │
│  ┌────────────────┐                                 │
│  │   £1,245.50    │                                 │
│  └────────────────┘                                 │
│                                                      │
│  📊 This Month                                       │
│  Gross Sales:      £850.00                          │
│  Platform Fee:     -£42.50  (5%)                    │
│  Net Earnings:     £807.50                          │
│                                                      │
│  💳 Payouts                                          │
│  Last Payout:      £500.00 (Dec 15)                 │
│  Next Payout:      Jan 1 (£807.50 pending)          │
│                                                      │
│  [Request Payout]  [Download Reports]               │
└─────────────────────────────────────────────────────┘
```

---

### Step 10: Update Store Settings

**URL:** http://localhost:5173/vendor/settings

**What you can update:**
```
✏️ Store Information
   - Store name
   - Description
   - Phone number
   - Business hours

📍 Address
   - Street
   - City
   - County
   - Postal Code

🔐 Security
   - Change password
   - Two-factor authentication

📧 Notifications
   - Email alerts for new orders
   - SMS notifications
   - Low stock alerts

💳 Payment Details
   - Bank account for payouts
   - Tax information
```

---

### 🎯 Vendor Journey Summary

```
1. Register as Vendor (5 min)
   ↓
2. Set up store profile (10 min)
   ↓
3. Add products (5 min per product)
   ↓
4. Receive orders
   ↓
5. Process & fulfill orders
   ↓
6. Get paid!
```

**Total time to start selling:** ~20 minutes

---

# 2️⃣ RIDER JOURNEY

## 🎯 Goal: Deliver orders and earn money

### Step 1: Rider Registration (10 minutes)

**URL:** http://localhost:5173/register

1. **Select "Rider" role**

2. **Fill in personal details:**
   ```
   Full Name: David Wilson
   Email: david.rider@example.com
   Password: RiderPass123!
   Phone: +44 20 5555 1234
   ```

3. **Vehicle information:**
   ```
   Vehicle Type:
     ☐ Bicycle
     ☑ Motorcycle
     ☐ Car
     ☐ Van

   Vehicle Registration: MT21 ABC
   Vehicle Model: Honda CB125
   Insurance Expiry: 2025-12-31
   ```

4. **Upload documents:**
   ```
   📄 Driver's License: [Upload]
   📄 Vehicle Insurance: [Upload]
   📄 Proof of Address: [Upload]
   📸 Profile Photo: [Upload]
   ```

5. **Background check consent:**
   ```
   ☑ I consent to a background check
   ☑ I have valid insurance
   ☑ I agree to rider terms and conditions
   ```

6. **Click "Complete Registration"**

**Status:**
```
⏳ Your application is under review
We'll email you within 24-48 hours when approved.
```

---

### Step 2: Account Approval

**When admin approves your account:**

1. **You receive an email:**
   ```
   🎉 Congratulations! You're now an AfriMercato Rider

   Your account has been approved. You can now start accepting
   delivery requests and earning money.

   [Login to Dashboard]
   ```

2. **Login to your account:**
   **URL:** http://localhost:5173/login
   ```
   Email: david.rider@example.com
   Password: RiderPass123!
   ```

---

### Step 3: Rider Dashboard - First Look

**URL:** http://localhost:5173/rider/dashboard

**What you'll see:**

```
┌─────────────────────────────────────────────────────┐
│  🏍️ Rider Dashboard                                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Status: ⚫ OFFLINE  [Go Online 🟢]                  │
│                                                      │
│  📊 Today's Stats:                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │     0      │  │     £0     │  │    5.0⭐   │   │
│  │ Deliveries │  │  Earnings  │  │   Rating   │   │
│  └────────────┘  └────────────┘  └────────────┘   │
│                                                      │
│  🗺️ Available Deliveries Near You:                  │
│  [Map showing delivery locations]                   │
└─────────────────────────────────────────────────────┘
```

---

### Step 4: Go Online and Accept Deliveries

#### 📱 Step 4.1: Set Status to Online

1. **Click "Go Online 🟢" button**

**Status changes:**
```
Status: 🟢 ONLINE - Ready for deliveries
```

2. **Your location is shared:**
   - App uses your GPS location
   - You appear on vendor/customer maps
   - You start receiving delivery requests

---

#### 📦 Step 4.2: View Available Deliveries

**Available deliveries appear:**

```
┌─────────────────────────────────────────────────────┐
│  Available Deliveries                                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🏪 John's Fresh Produce                     │   │
│  │                                              │   │
│  │ Pickup: 123 Market St, London (1.2 mi)     │   │
│  │ Delivery: 456 Park Lane, London (2.5 mi)   │   │
│  │                                              │   │
│  │ Total Distance: 3.7 miles                   │   │
│  │ Estimated Time: 25 minutes                  │   │
│  │ Delivery Fee: £4.50                         │   │
│  │                                              │   │
│  │ Items: 3 items (Groceries)                  │   │
│  │ Customer Note: "Ring doorbell twice"        │   │
│  │                                              │   │
│  │ [View Route] [Accept Delivery]              │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

#### ✅ Step 4.3: Accept a Delivery

1. **Click "View Route" to see:**
   - Map with pickup and delivery locations
   - Turn-by-turn directions
   - Traffic conditions
   - Estimated arrival time

2. **Click "Accept Delivery"**

**Confirmation:**
```
✅ Delivery accepted!
Navigate to pickup location.
```

**Dashboard updates:**
```
┌─────────────────────────────────────────────────────┐
│  🚴 Active Delivery                                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Status: 🔵 Heading to Pickup                       │
│                                                      │
│  📍 Pickup Location:                                 │
│  John's Fresh Produce                                │
│  123 Market Street, London SW1 1AA                  │
│  Distance: 1.2 miles • ETA: 8 minutes               │
│                                                      │
│  [Navigate] [Call Vendor] [Cancel Delivery]         │
│                                                      │
│  🗺️ [Live Map with Your Location]                   │
└─────────────────────────────────────────────────────┘
```

---

### Step 5: Pickup the Order

#### 📍 Step 5.1: Navigate to Vendor

1. **Click "Navigate"**
   - Opens turn-by-turn GPS directions
   - Shows your live location
   - Updates ETA in real-time

**Directions:**
```
🧭 Turn-by-turn Navigation

1. Head north on High Street (0.2 mi)
2. Turn right onto Market Street (0.8 mi)
3. Destination will be on your left (0.2 mi)

ETA: 7 minutes
```

#### 📦 Step 5.2: Arrive at Vendor

**When you arrive:**

1. **App detects you're at pickup location:**
   ```
   📍 You've arrived at John's Fresh Produce

   Order #AF12345
   Items: 3 items

   Show this code to vendor: 1234

   [Mark as Picked Up]
   ```

2. **Collect the order from vendor**
   - Vendor gives you the package
   - Verify items match the order
   - Check for any special instructions

3. **Click "Mark as Picked Up"**

**Status updates:**
```
✅ Order picked up
Now heading to customer
```

---

### Step 6: Deliver to Customer

#### 🚗 Step 6.1: Navigate to Delivery Address

**New navigation starts:**
```
┌─────────────────────────────────────────────────────┐
│  🚴 Active Delivery                                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Status: 🟢 Out for Delivery                        │
│                                                      │
│  📍 Delivery Location:                               │
│  Sarah Johnson                                       │
│  456 Park Lane, London SW1A 2AA                     │
│  Distance: 2.5 miles • ETA: 15 minutes              │
│                                                      │
│  📝 Customer Note:                                   │
│  "Ring doorbell twice, leave at door if no answer"  │
│                                                      │
│  [Navigate] [Call Customer]                          │
│                                                      │
│  🗺️ [Live Map]                                       │
└─────────────────────────────────────────────────────┘
```

1. **Click "Navigate"** - GPS starts
2. **Follow directions** to customer address

---

#### 📦 Step 6.2: Deliver the Order

**When you arrive at customer's location:**

```
📍 You've arrived!

Order #AF12345
Customer: Sarah Johnson
Items: 3 items
Total: £15.50

🔔 [Ring Doorbell]

Delivery Verification Required:
┌─────────────────────────────────────┐
│  Choose verification method:        │
│                                     │
│  📸 [Take Photo]                    │
│  ✍️  [Get Signature]                │
│  📧 [Send OTP Code]                 │
└─────────────────────────────────────┘

[Mark as Delivered]
```

**Steps:**

1. **Ring doorbell** (or knock)
2. **Hand over the order** to customer
3. **Verify delivery:**
   - Option 1: Take a photo of delivered package
   - Option 2: Get customer's signature
   - Option 3: Customer enters OTP code

4. **Click "Mark as Delivered"**

**Success:**
```
🎉 Delivery Completed!

You earned: £4.50
Total deliveries today: 1
Total earnings today: £4.50

[View Receipt] [Accept Next Delivery]
```

---

### Step 7: Track Your Earnings

**URL:** http://localhost:5173/rider/earnings

**What you'll see:**

```
┌─────────────────────────────────────────────────────┐
│  💰 Earnings Dashboard                               │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Today                                               │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │     5      │  │   £22.50   │  │   £4.50    │   │
│  │ Deliveries │  │   Total    │  │   Average  │   │
│  └────────────┘  └────────────┘  └────────────┘   │
│                                                      │
│  This Week: £145.00                                 │
│  This Month: £580.00                                │
│                                                      │
│  📊 Earnings Breakdown:                              │
│  Delivery Fees:    £520.00                          │
│  Tips:             £45.00                           │
│  Bonuses:          £15.00                           │
│  ─────────────────────────                          │
│  Total:            £580.00                          │
│                                                      │
│  Platform Fee (10%): -£58.00                        │
│  ─────────────────────────                          │
│  Net Earnings:      £522.00                         │
│                                                      │
│  💳 Payout Status:                                   │
│  Next Payout: Jan 1, 2025                           │
│  Amount: £522.00                                    │
│                                                      │
│  [Request Early Payout] [Download Statement]        │
└─────────────────────────────────────────────────────┘
```

---

### Step 8: Request Payout

1. **Click "Request Payout"**
2. **Minimum payout:** £50
3. **Choose method:**
   ```
   🏦 Bank Transfer (1-3 days) - FREE
   💳 Instant Transfer (2 hours) - 1% fee
   ```
4. **Confirm bank details**
5. **Submit request**

**Confirmation:**
```
✅ Payout requested
£522.00 will be transferred to your bank account
ending in ****1234 within 1-3 business days.
```

---

### Step 9: View Your Performance

**URL:** http://localhost:5173/rider/performance

```
┌─────────────────────────────────────────────────────┐
│  📊 Performance Metrics                              │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ⭐ Overall Rating: 4.8 / 5.0                        │
│  Based on 45 customer reviews                       │
│                                                      │
│  📈 Stats:                                           │
│  Total Deliveries: 127                              │
│  On-Time Rate: 96%                                  │
│  Acceptance Rate: 88%                               │
│  Cancellation Rate: 2%                              │
│                                                      │
│  🏆 Achievements:                                    │
│  ✅ 50 Deliveries Badge                             │
│  ✅ 100 Deliveries Badge                            │
│  ⭐ 5-Star Streak (20 in a row)                     │
│  🚀 Speed Demon (Fast deliveries)                   │
│                                                      │
│  💬 Recent Reviews:                                  │
│  ┌───────────────────────────────────────────────┐ │
│  │ ⭐⭐⭐⭐⭐ "Very professional and friendly!"     │ │
│  │ - Sarah J. (2 days ago)                       │ │
│  └───────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

---

### Step 10: Go Offline

**When you're done for the day:**

1. **Click "Go Offline"** button
2. **Status changes:**
   ```
   Status: ⚫ OFFLINE
   You won't receive new delivery requests
   ```

3. **View daily summary:**
   ```
   📊 Today's Summary

   Time Online: 6 hours 30 minutes
   Deliveries: 12
   Earnings: £54.00
   Average per delivery: £4.50
   Rating: 4.9⭐

   Great job! 🎉
   ```

---

### 🎯 Rider Journey Summary

```
1. Register as Rider (10 min)
   ↓
2. Get approved by admin (24-48 hours)
   ↓
3. Go online
   ↓
4. Accept delivery requests
   ↓
5. Pick up from vendor
   ↓
6. Deliver to customer
   ↓
7. Earn money!
   ↓
8. Request payout weekly/monthly
```

**Average earning potential:** £10-£20 per hour (depends on location and time)

---

# 3️⃣ CUSTOMER JOURNEY

## 🎯 Goal: Order groceries and receive delivery

### Step 1: Visit Homepage

**URL:** http://localhost:5173

**What you'll see:**

```
┌─────────────────────────────────────────────────────┐
│  🌍 AFRIMERCATO                         [Sign In]   │
├─────────────────────────────────────────────────────┤
│                                                      │
│    Fresh groceries delivered to your door           │
│    🚚 Same-day delivery • 🏪 Local vendors          │
│                                                      │
│    📍 [Enter your delivery address...]              │
│       [Search]                                       │
│                                                      │
│    🏷️ Shop by Category:                             │
│    [Fresh Produce] [Meat] [Dairy] [Bakery] [More]  │
│                                                      │
│    🔥 Featured Vendors:                              │
│    ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│    │ John's   │ │ Sarah's  │ │ Mike's   │         │
│    │ Fresh    │ │ Bakery   │ │ Butcher  │         │
│    │ ⭐ 4.8   │ │ ⭐ 4.9   │ │ ⭐ 4.7   │         │
│    └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────┘
```

---

### Step 2: Enter Delivery Address

**Before you can shop, enter your location:**

1. **Click on the address search box**

2. **Type your address:**
   ```
   📍 Enter your delivery address

   ┌─────────────────────────────────────────────┐
   │ 789 Baker Street, London                    │
   └─────────────────────────────────────────────┘

   Suggestions:
   ✓ 789 Baker Street, London NW1 6XE
   ✓ 789 Baker Street, Marylebone, London
   ```

3. **Select your exact address**

**System finds vendors near you:**
```
✅ 15 vendors deliver to your area
Delivery available within 2 hours
```

---

### Step 3: Browse Products

**URL:** http://localhost:5173/products

**Two ways to shop:**

#### Option 1: Browse All Products

```
┌─────────────────────────────────────────────────────┐
│  All Products                      🛒 Cart (0)      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🔍 [Search products...]                            │
│                                                      │
│  Filters:                         Sort by: Popular▼ │
│  ☐ Fresh Produce                                    │
│  ☐ Meat & Fish                                      │
│  ☐ Dairy                                            │
│  ☐ Bakery                                           │
│                                                      │
│  Price: £0 ═══○═══ £50                             │
│                                                      │
│  ──────────────────────────────────────────────     │
│                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ 🍅      │  │ 🥕      │  │ 🍞      │            │
│  │ Organic │  │ Carrots │  │ Fresh   │            │
│  │ Tomatoes│  │ £1.80/kg│  │ Bread   │            │
│  │ £2.50/kg│  │         │  │ £2.00   │            │
│  │ ⭐ 4.5  │  │ ⭐ 4.7  │  │ ⭐ 4.9  │            │
│  │         │  │         │  │         │            │
│  │ [+ Cart]│  │ [+ Cart]│  │ [+ Cart]│            │
│  └─────────┘  └─────────┘  └─────────┘            │
└─────────────────────────────────────────────────────┘
```

#### Option 2: Browse by Vendor

**URL:** http://localhost:5173/vendors

```
┌─────────────────────────────────────────────────────┐
│  Vendors Near You                                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🏪 John's Fresh Produce              ⭐ 4.8 │   │
│  │                                              │   │
│  │ Fresh, organic vegetables & fruits          │   │
│  │ 📍 1.2 miles away • 🚚 30 min delivery      │   │
│  │                                              │   │
│  │ [View Store]                                 │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🍞 Sarah's Artisan Bakery           ⭐ 4.9 │   │
│  │                                              │   │
│  │ Freshly baked bread, pastries & cakes       │   │
│  │ 📍 0.8 miles away • 🚚 20 min delivery      │   │
│  │                                              │   │
│  │ [View Store]                                 │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Click "View Store" to see vendor's products:**

```
┌─────────────────────────────────────────────────────┐
│  🏪 John's Fresh Produce                    ⭐ 4.8 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  About:                                              │
│  "We provide fresh, locally-sourced organic         │
│  vegetables and fruits delivered straight from      │
│  our farm to your door."                            │
│                                                      │
│  📍 123 Market Street, London                       │
│  ⏰ Open: 8:00 AM - 8:00 PM                         │
│  🚚 Min. Order: £10 • Delivery Fee: £2              │
│                                                      │
│  ──────────────────────────────────────────────     │
│                                                      │
│  Products (24):                                      │
│                                                      │
│  [Product grid showing all vendor's products]       │
└─────────────────────────────────────────────────────┘
```

---

### Step 4: Add Products to Cart

**Click on any product to see details:**

```
┌─────────────────────────────────────────────────────┐
│  🍅 Fresh Organic Tomatoes                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [Product Image]                                     │
│                                                      │
│  £2.50 per kg                                       │
│  ⭐ 4.5 (23 reviews)                                │
│                                                      │
│  Description:                                        │
│  Vine-ripened organic tomatoes, grown locally       │
│  without pesticides. Perfect for salads and         │
│  cooking. Harvested fresh daily.                    │
│                                                      │
│  From: John's Fresh Produce                         │
│  In Stock: 100 kg available                         │
│                                                      │
│  Quantity:                                           │
│  ┌──────────────────────────────┐                  │
│  │  [−]    2 kg    [+]          │                  │
│  └──────────────────────────────┘                  │
│                                                      │
│  Total: £5.00                                       │
│                                                      │
│  [Add to Cart] 🛒                                   │
└─────────────────────────────────────────────────────┘
```

**Actions:**

1. **Adjust quantity:** Use [−] and [+] buttons or type amount
2. **Click "Add to Cart"**

**Confirmation:**
```
✅ Added to cart!
2 kg of Fresh Organic Tomatoes
```

**Cart icon updates:**
```
🛒 Cart (1)  ← Shows item count
```

**Continue shopping and add more items:**
- Carrots (3 kg) - £5.40
- Red Onions (2 kg) - £3.60
- Fresh Bread (1 loaf) - £2.00

---

### Step 5: View Shopping Cart

**Click on cart icon:** 🛒 Cart (4)

**URL:** http://localhost:5173/cart

```
┌─────────────────────────────────────────────────────┐
│  🛒 Shopping Cart                                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  🏪 John's Fresh Produce                            │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🍅 Fresh Organic Tomatoes                   │   │
│  │ £2.50/kg × 2 kg                      £5.00  │   │
│  │ [−] 2 [+]                        [Remove]   │   │
│  ├─────────────────────────────────────────────┤   │
│  │ 🥕 Organic Carrots                          │   │
│  │ £1.80/kg × 3 kg                      £5.40  │   │
│  │ [−] 3 [+]                        [Remove]   │   │
│  ├─────────────────────────────────────────────┤   │
│  │ 🧅 Red Onions                               │   │
│  │ £1.80/kg × 2 kg                      £3.60  │   │
│  │ [−] 2 [+]                        [Remove]   │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  🍞 Sarah's Artisan Bakery                          │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🍞 Fresh Sourdough Bread                    │   │
│  │ £2.00 × 1                            £2.00  │   │
│  │ [−] 1 [+]                        [Remove]   │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ──────────────────────────────────────────────     │
│                                                      │
│  Subtotal:                              £16.00      │
│  Delivery Fee (2 vendors):              £4.00       │
│  ──────────────────────────────────────────────     │
│  Total:                                 £20.00      │
│                                                      │
│  [Continue Shopping]  [Proceed to Checkout] →       │
└─────────────────────────────────────────────────────┘
```

**You can:**
- Adjust quantities
- Remove items
- Add promo code
- Save cart for later

---

### Step 6: Checkout

**Click "Proceed to Checkout"**

**URL:** http://localhost:5173/checkout

**You'll need to register/login first if you haven't:**

#### 📝 Quick Registration

```
┌─────────────────────────────────────────────────────┐
│  Create Account                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Full Name:                                          │
│  ┌────────────────────────────────────────────────┐ │
│  │ Sarah Johnson                                  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Email:                                              │
│  ┌────────────────────────────────────────────────┐ │
│  │ sarah@example.com                              │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  Password:                                           │
│  ┌────────────────────────────────────────────────┐ │
│  │ ••••••••••                                     │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  [Create Account and Continue]                       │
│                                                      │
│  Or sign in with:                                    │
│  [🔵 Google] [📘 Facebook]                          │
└─────────────────────────────────────────────────────┘
```

#### 📍 Delivery Details

**After login, complete checkout:**

```
┌─────────────────────────────────────────────────────┐
│  Checkout                                            │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1️⃣ Delivery Address                                │
│  ┌────────────────────────────────────────────────┐ │
│  │ Street Address:                                │ │
│  │ 789 Baker Street                               │ │
│  │                                                │ │
│  │ City:                   County (Optional):     │ │
│  │ London                  Greater London         │ │
│  │                                                │ │
│  │ Postal Code:           Country:                │ │
│  │ NW1 6XE                United Kingdom          │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  2️⃣ Delivery Time                                   │
│  ┌────────────────────────────────────────────────┐ │
│  │ ⚡ ASAP (30-45 minutes)                        │ │
│  │ ○ Today, 2:00 PM - 3:00 PM                    │ │
│  │ ○ Today, 5:00 PM - 6:00 PM                    │ │
│  │ ○ Tomorrow, 10:00 AM - 11:00 AM               │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  3️⃣ Payment Method                                  │
│  ┌────────────────────────────────────────────────┐ │
│  │ ○ Card Payment (Visa/Mastercard)              │ │
│  │ ● Cash on Delivery                             │ │
│  │ ○ Apple Pay                                    │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  📝 Special Instructions (Optional):                 │
│  ┌────────────────────────────────────────────────┐ │
│  │ Ring doorbell twice. Leave at door if out.    │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ──────────────────────────────────────────────     │
│                                                      │
│  Order Summary:                                      │
│  Items (4):                             £16.00      │
│  Delivery Fee:                          £4.00       │
│  ──────────────────────────────────────────────     │
│  Total:                                 £20.00      │
│                                                      │
│  [Place Order] 💳                                   │
└─────────────────────────────────────────────────────┘
```

**Important notes:**
- ✅ **County field is optional** (UK address format)
- You can select delivery time slot
- Multiple payment methods available
- Add special delivery instructions

---

### Step 7: Place Order

**Click "Place Order"**

**Order confirmation:**

```
┌─────────────────────────────────────────────────────┐
│  🎉 Order Placed Successfully!                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Order #AF12345                                      │
│  Estimated Delivery: 30-45 minutes                   │
│                                                      │
│  ✅ Your order has been sent to the vendors         │
│  ✅ You'll receive updates via email and SMS        │
│                                                      │
│  What happens next:                                  │
│  1. Vendors prepare your items                      │
│  2. A rider will pick up your order                 │
│  3. Rider delivers to your address                  │
│                                                      │
│  [Track Order] [View Receipt]                        │
└─────────────────────────────────────────────────────┘
```

**You'll receive:**
- Email confirmation with order details
- SMS with order number
- Real-time updates as order progresses

---

### Step 8: Track Your Order

**URL:** http://localhost:5173/orders/AF12345

```
┌─────────────────────────────────────────────────────┐
│  Order #AF12345                    🟢 Out for Delivery│
├─────────────────────────────────────────────────────┤
│                                                      │
│  📊 Order Status:                                    │
│                                                      │
│  ✅ Order Placed          10:00 AM                  │
│  ✅ Accepted by Vendor    10:02 AM                  │
│  ✅ Being Prepared        10:05 AM                  │
│  ✅ Ready for Pickup      10:25 AM                  │
│  ✅ Picked up by Rider    10:30 AM                  │
│  🚴 Out for Delivery      10:32 AM ← Current        │
│  ⏳ Delivered             ETA 10:50 AM              │
│                                                      │
│  🗺️ Track Rider Location:                           │
│  ┌────────────────────────────────────────────────┐ │
│  │                                                │ │
│  │     [Live Map showing rider's location]        │ │
│  │                                                │ │
│  │     🏍️ David (Rider)                          │ │
│  │     ETA: 18 minutes                            │ │
│  │     Distance: 1.2 miles away                   │ │
│  │                                                │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  🏍️ Your Rider: David Wilson                       │
│  ⭐ Rating: 4.8 (45 deliveries)                     │
│  📞 [Call Rider]                                     │
│                                                      │
│  📦 Order Items:                                     │
│  🏪 John's Fresh Produce                            │
│  - Fresh Organic Tomatoes (2 kg) - £5.00           │
│  - Organic Carrots (3 kg) - £5.40                  │
│  - Red Onions (2 kg) - £3.60                       │
│                                                      │
│  🍞 Sarah's Artisan Bakery                          │
│  - Fresh Sourdough Bread (1) - £2.00               │
│                                                      │
│  💰 Total: £20.00                                   │
│                                                      │
│  [Need Help?] [Cancel Order]                         │
└─────────────────────────────────────────────────────┘
```

**Live features:**
- See rider's location update in real-time
- Get ETA updates
- Call rider if needed
- Receive push notifications for status changes

---

### Step 9: Receive Delivery

**When rider arrives:**

**You'll receive notification:**
```
📱 Your order has arrived!
Rider is at your door.

Order #AF12345
Total: £20.00
Payment: Cash on Delivery

[Open Door]
```

**Steps:**
1. **Answer the door**
2. **Receive your groceries**
3. **Pay if Cash on Delivery** (or already paid online)
4. **Rider may ask for:**
   - Photo of delivery
   - Your signature
   - Or OTP code (check your SMS)

**Delivery complete!**

```
✅ Delivery Completed!

Your order #AF12345 has been delivered.
Hope you enjoy your groceries!

[Rate Your Experience]
```

---

### Step 10: Rate Your Experience

**After delivery, rate:**

```
┌─────────────────────────────────────────────────────┐
│  Rate Your Experience                                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Order #AF12345                                      │
│                                                      │
│  🏪 Rate John's Fresh Produce:                      │
│  ⭐⭐⭐⭐⭐ (tap to rate)                              │
│  ┌────────────────────────────────────────────────┐ │
│  │ Product quality was excellent! Fresh and       │ │
│  │ well-packaged.                                 │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  🏍️ Rate Rider (David):                            │
│  ⭐⭐⭐⭐⭐ (tap to rate)                              │
│  ┌────────────────────────────────────────────────┐ │
│  │ Very professional and friendly. On time        │ │
│  │ delivery.                                      │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  📸 Add Photos (Optional):                           │
│  [Upload photos of products]                         │
│                                                      │
│  [Submit Review]                                     │
└─────────────────────────────────────────────────────┘
```

**Click "Submit Review"**

**Confirmation:**
```
✅ Thank you for your feedback!
Your review helps us improve.

💰 You earned 50 loyalty points!
```

---

### Step 11: View Order History

**URL:** http://localhost:5173/orders

```
┌─────────────────────────────────────────────────────┐
│  My Orders                                           │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Filters: [All] [Active] [Completed] [Cancelled]    │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Order #AF12345          ✅ DELIVERED        │   │
│  │ Dec 31, 2025 • 10:50 AM                     │   │
│  │                                              │   │
│  │ 4 items from 2 vendors • £20.00             │   │
│  │ Delivered by: David Wilson                  │   │
│  │                                              │   │
│  │ [View Details] [Reorder] [Leave Review]    │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Order #AF12344          ✅ DELIVERED        │   │
│  │ Dec 28, 2025 • 3:20 PM                      │   │
│  │                                              │   │
│  │ 6 items from 3 vendors • £35.50             │   │
│  │                                              │   │
│  │ [View Details] [Reorder]                    │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Features:**
- View all past orders
- Reorder with one click
- Download receipts
- Track active deliveries

---

### Step 12: Reorder (Quick Repeat Order)

**Click "Reorder" on any past order:**

```
✅ Items added to cart!

Would you like to:
[Checkout Now] [Continue Shopping]
```

**One-click reordering!**

---

### Bonus: Save Favorite Products

**On any product page, click ❤️ icon:**

```
✅ Added to favorites!
```

**View favorites:**
**URL:** http://localhost:5173/favorites

```
┌─────────────────────────────────────────────────────┐
│  ❤️ My Favorites                                    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  [Grid of all your favorited products]              │
│  Quick "Add to Cart" for each                       │
└─────────────────────────────────────────────────────┘
```

---

### 🎯 Customer Journey Summary

```
1. Visit website and enter delivery address (1 min)
   ↓
2. Browse products or vendors (5 min)
   ↓
3. Add items to cart (2 min)
   ↓
4. Register/Login (2 min)
   ↓
5. Checkout with delivery details (3 min)
   ↓
6. Place order (30 seconds)
   ↓
7. Track order in real-time
   ↓
8. Receive delivery (30-45 min)
   ↓
9. Rate experience
   ↓
10. Reorder anytime!
```

**Total time from browsing to ordering:** ~15 minutes
**Delivery time:** 30-60 minutes (depends on location)

---

# 🎉 CONCLUSION

## All Three Journeys Work Seamlessly!

### ✅ Vendor Journey
- Easy store setup
- **Prominent product management** with Add Product button
- Full CRUD operations
- Order fulfillment
- Earnings tracking

### ✅ Rider Journey
- Simple registration
- Accept deliveries on the go
- GPS navigation
- Proof of delivery
- Earn money flexibly

### ✅ Customer Journey
- Quick address entry
- Easy product browsing
- Simple checkout (**County optional** ✅)
- Real-time order tracking
- Fast delivery

---

## 🚀 Ready to Test!

Start your local servers and walk through each journey:

```bash
# Terminal 1: Backend
cd afrimercato-backend
npm run dev

# Terminal 2: Frontend
cd afrimercato-frontend
npm run dev
```

**Visit:** http://localhost:5173

---

**Questions? Issues? Let me know!** 🙌
