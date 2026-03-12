# =================================================================
# STRIPE LIVE KEYS CONFIGURATION - PRODUCTION LAUNCH
# =================================================================
# ⚠️ CRITICAL: Complete this BEFORE switching to production
# Last Updated: February 9, 2026

---

## 🔴 CURRENT STATUS: TEST MODE

The app is currently using **Stripe Test Keys**. This means:
- ❌ No real payments are processed
- ❌ Customers can't actually pay you
- ✅ Safe for testing and development

---

## ✅ PRE-LAUNCH CHECKLIST

Before switching to live keys, ensure:

- [ ] **Bank account connected** to your Stripe account
- [ ] **Business verification** completed in Stripe Dashboard
- [ ] **Payout schedule** configured (recommend weekly)
- [ ] **Webhook endpoint** tested and verified
- [ ] **Tax settings** configured in Stripe
- [ ] **Dispute handling** policy documented
- [ ] **Refund policy** added to Terms of Service

---

## 📋 STEP-BY-STEP GUIDE

### STEP 1: Get Your Stripe Live Keys

1. **Log into Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com
   - Switch to **Live Mode** (toggle in top-right)

2. **Get Publishable Key:**
   - Navigate to: **Developers → API Keys**
   - Copy the **Publishable key** (starts with `pk_live_...`)
   - Example: `pk_live_51ABC...XYZ`

3. **Get Secret Key:**
   - On the same page, reveal and copy the **Secret key** (starts with `sk_live_...`)
   - Example: `sk_live_51ABC...XYZ`
   - ⚠️ **NEVER commit this to GitHub or share publicly**

---

### STEP 2: Update Backend (Fly.io)

**Option A: Using Fly CLI (Recommended)**

```powershell
# Set Stripe secret key
fly secrets set STRIPE_SECRET_KEY="sk_live_YOUR_ACTUAL_KEY_HERE" -a afrimercato-backend

# Set webhook secret (get from Step 3)
fly secrets set STRIPE_WEBHOOK_SECRET="whsec_YOUR_WEBHOOK_SECRET" -a afrimercato-backend

# Verify secrets are set
fly secrets list -a afrimercato-backend
```

**Option B: Using Fly.io Dashboard**

1. Go to: https://fly.io/dashboard/afrimercato-backend
2. Click **Secrets** tab
3. Add new secret:
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_live_YOUR_ACTUAL_KEY_HERE`
4. Click **Add Secret**
5. Repeat for `STRIPE_WEBHOOK_SECRET`

---

### STEP 3: Configure Stripe Webhook

**Why?** Stripe webhooks notify your backend when payments succeed/fail.

1. **In Stripe Dashboard:**
   - Go to: **Developers → Webhooks**
   - Click **Add endpoint**

2. **Endpoint Configuration:**
   - **Endpoint URL:** `https://afrimercato-backend.fly.dev/api/payments/webhook`
   - **Description:** Afrimercato Payment Events (Production)
   - **Events to send:** Select these events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`

3. **Get Webhook Secret:**
   - After creating endpoint, click **Reveal** under "Signing secret"
   - Copy the webhook secret (starts with `whsec_...`)
   - Add to Fly.io secrets (see Step 2)

4. **Test Webhook:**
   ```powershell
   # Send test event from Stripe Dashboard
   # Check Fly logs to confirm receipt
   fly logs -a afrimercato-backend
   ```

---

### STEP 4: Update Frontend (Vercel)

1. **Log into Vercel:**
   - Go to: https://vercel.com/dashboard
   - Select your project: `afrimercato-frontend`

2. **Update Environment Variable:**
   - Go to: **Settings → Environment Variables**
   - Find: `VITE_STRIPE_PUBLISHABLE_KEY`
   - Click **Edit**
   - Replace test key with: `pk_live_YOUR_ACTUAL_KEY_HERE`
   - Select environments: **Production, Preview, Development**
   - Click **Save**

3. **Redeploy:**
   ```powershell
   # Trigger new deployment to apply changes
   cd afrimercato-frontend
   git commit --allow-empty -m "chore: update to Stripe live keys"
   git push origin main
   ```

   Or manually in Vercel Dashboard:
   - Go to **Deployments** tab
   - Click **Redeploy** on latest deployment

---

### STEP 5: Verify Configuration

**Test Payment Flow:**

1. **Place a test order:**
   - Use a **real credit card** (yours)
   - Go through complete checkout
   - Check order confirmation

2. **Verify in Stripe Dashboard:**
   - Go to: **Payments** tab (Live Mode)
   - Confirm payment appears
   - Check payment status is "Succeeded"

3. **Verify in Your Database:**
   - Check MongoDB Atlas
   - Confirm order has `paymentStatus: 'paid'`
   - Verify commission calculation is correct

4. **Check Backend Logs:**
   ```powershell
   fly logs -a afrimercato-backend
   ```
   Look for:
   - `✓ Stripe webhook verified`
   - `✓ Payment confirmed for order`
   - `✓ Order status updated`

5. **Verify Vendor Earnings:**
   - Log in as vendor
   - Go to `/vendor/earnings`
   - Confirm payment shows with correct commission

---

## 🔐 SECURITY CHECKLIST

- [ ] **Never commit** `.env` files to Git
- [ ] **Rotate keys** if accidentally exposed
- [ ] **Use HTTPS only** (already enforced)
- [ ] **Validate webhook signatures** (already implemented)
- [ ] **Set up Stripe Radar** for fraud detection
- [ ] **Enable 3D Secure** for European cards (PSD2 compliance)
- [ ] **Monitor failed payments** in Stripe Dashboard

---

## 💰 COMMISSION & PAYOUTS

### Platform Commission
- **Rate:** 12% of order subtotal
- **Calculated automatically** on each order
- **Stored in:** `Order.pricing.platformCommission`

### Vendor Earnings
- **Calculation:** Subtotal - 12% commission
- **Stored in:** `Order.pricing.vendorEarnings`
- **Payout Schedule:** Every Friday (manual for beta)

### Payout Process (Beta)
1. Every Friday, export vendor earnings:
   ```javascript
   // Run in MongoDB
   db.orders.aggregate([
     { $match: { status: 'delivered', paymentStatus: 'paid' } },
     { $group: {
       _id: '$vendor',
       totalEarnings: { $sum: '$pricing.vendorEarnings' },
       orderCount: { $sum: 1 }
     }}
   ])
   ```

2. Initiate bank transfers via Stripe or your bank
3. Mark payouts as completed in your records

---

## 📊 MONITORING

### Key Metrics to Watch

**Daily:**
- Total transactions
- Failed payments
- Webhook delivery failures
- Refund requests

**Weekly:**
- Total revenue
- Platform commission earned
- Vendor payouts processed
- Average order value

**Monthly:**
- Customer churn rate
- Payment method distribution
- Stripe fees vs revenue

### Stripe Dashboard Views

1. **Home** - Revenue overview
2. **Payments** - Transaction history
3. **Disputes** - Chargebacks/refunds
4. **Radar** - Fraud detection
5. **Reports** - Financial analytics

---

## 🚨 TROUBLESHOOTING

### "Payment failed" errors

**Possible causes:**
1. Card declined by bank
2. Insufficient funds
3. Card expired or blocked
4. 3D Secure authentication failed

**Solution:**
- Show clear error message to customer
- Suggest alternative payment method
- Check Stripe Dashboard for specific decline reason

### Webhook not receiving events

**Check:**
1. Endpoint URL is correct: `https://afrimercato-backend.fly.dev/api/payments/webhook`
2. Webhook secret is set in environment variables
3. Events are selected in Stripe Dashboard
4. Fly.io app is running: `fly status -a afrimercato-backend`

**Debug:**
```powershell
# Check webhook delivery in Stripe Dashboard
# Look for failed attempts with error messages

# Check backend logs
fly logs -a afrimercato-backend --region lhr
```

### Commission calculation wrong

**Verify:**
1. `PLATFORM_COMMISSION_RATE=0.12` in backend env
2. Calculation excludes delivery fee
3. Values rounded to 2 decimals

**Test:**
```javascript
// Should be 12% of subtotal only
Subtotal: £100
Delivery: £5
Total: £105
Commission: £12.00 (12% of £100)
Vendor Earnings: £88.00 (£100 - £12)
```

---

## 📞 SUPPORT

### Stripe Support
- **Email:** support@stripe.com
- **Phone:** +44 20 7084 0555 (UK)
- **Live Chat:** Available in Dashboard

### Emergency Contacts
- **Technical Issues:** your-dev-email@example.com
- **Payment Disputes:** your-support-email@example.com
- **Emergency Hotline:** +44 7778 285855

---

## 🔄 ROLLBACK PLAN

If live keys cause issues:

1. **Immediately revert to test keys:**
   ```powershell
   fly secrets set STRIPE_SECRET_KEY="sk_test_YOUR_TEST_KEY" -a afrimercato-backend
   ```

2. **Update frontend:**
   - Vercel Dashboard → Environment Variables
   - Set `VITE_STRIPE_PUBLISHABLE_KEY` back to test key

3. **Notify customers:**
   - Display maintenance banner
   - Process pending orders manually

4. **Investigate issue:**
   - Check Fly.io logs
   - Review Stripe webhook logs
   - Contact Stripe support

---

## ✅ POST-LAUNCH VALIDATION

After switching to live keys:

- [ ] **Test transaction** completes successfully
- [ ] **Webhook events** are received and processed
- [ ] **Order status** updates correctly in database
- [ ] **Commission** calculates accurately
- [ ] **Vendor earnings** display correctly
- [ ] **Email confirmations** sent to customers
- [ ] **Stripe Dashboard** shows transactions
- [ ] **No errors** in Fly.io logs

---

## 📝 CURRENT CONFIGURATION

**Backend (Fly.io):**
- App Name: `afrimercato-backend`
- Region: London (lhr)
- Webhook URL: `https://afrimercato-backend.fly.dev/api/payments/webhook`

**Frontend (Vercel):**
- Project: `afrimercato-frontend`
- Production URL: Update in Vercel settings

**Stripe:**
- Test Mode: ✅ Currently Active
- Live Mode: ❌ Not Configured
- Webhook: ⚠️ Needs setup

---

**⚠️ IMPORTANT:** Do NOT switch to live keys until ALL checklist items are complete!

**Last Updated:** February 9, 2026  
**Next Review:** Before production launch
