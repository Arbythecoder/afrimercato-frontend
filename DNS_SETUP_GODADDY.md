# GoDaddy DNS Setup for Vercel Deployment

Complete guide to connect your GoDaddy domain to Vercel for Afrimercato frontend.

---

## Overview

**Goal:** Point `afrimercato.com` and `www.afrimercato.com` to your Vercel deployment

**Time Required:** 15 minutes (DNS propagation takes 1-48 hours)

**What You Need:**
- GoDaddy account with domain purchased
- Vercel project deployed (afrimercato-frontend)
- Access to both dashboards

---

## Step 1: Add Domain in Vercel

### 1.1 Open Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on your project: **afrimercato-frontend**
3. Go to **Settings** tab
4. Click **Domains** in the left sidebar

### 1.2 Add Your Domain

1. In the domain input field, type: `afrimercato.com`
2. Click **Add**
3. Vercel will show you DNS records to configure

**Screenshot should show:**
```
Domain: afrimercato.com
Status: Invalid Configuration
```

### 1.3 Note the Required DNS Records

Vercel will show one of these options:

**Option A: A Record (Recommended for root domain)**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 600
```

**Option B: CNAME Record (Alternative)**
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
TTL: 600
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 600
```

**Write these down or keep the tab open!**

---

## Step 2: Configure DNS in GoDaddy

### 2.1 Login to GoDaddy

1. Go to https://www.godaddy.com/
2. Click **Sign In** (top right)
3. Enter your credentials
4. Click **My Products**

### 2.2 Access DNS Management

1. Find your domain: `afrimercato.com`
2. Click the **DNS** button next to it
   - Or click the three dots (...) → **Manage DNS**

You should now see the DNS Management page with existing records.

### 2.3 Remove Conflicting Records (Important!)

**Before adding new records, remove these if they exist:**

1. Look for existing **A Records** with name `@`:
   - Click the **pencil icon** (edit)
   - Click **Delete** or trash icon
   - Confirm deletion

2. Look for existing **CNAME Records** with name `@`:
   - Delete if present

3. Look for **Parked Domain** records:
   - Often show as `@` pointing to GoDaddy's parking page
   - Delete these

**Keep these records (DO NOT DELETE):**
- NS (Nameserver) records
- MX (Email) records (if you use email with this domain)
- TXT records for email verification

### 2.4 Add Vercel A Record for Root Domain

1. Click **Add** button (usually says "Add Record" or just "Add")
2. Select **Type: A**
3. Fill in:
   - **Name (Host):** `@` (this represents your root domain)
   - **Value (Points to):** `76.76.21.21` (Vercel's IP)
   - **TTL:** `600` seconds (or "1 Hour" if dropdown)
4. Click **Save**

**Result:** `afrimercato.com` → Vercel

### 2.5 Add CNAME Record for www Subdomain

1. Click **Add** again
2. Select **Type: CNAME**
3. Fill in:
   - **Name (Host):** `www`
   - **Value (Points to):** `cname.vercel-dns.com`
   - **TTL:** `600` seconds
4. Click **Save**

**Result:** `www.afrimercato.com` → Vercel

### 2.6 Your DNS Records Should Look Like This

```
Type    Name    Value                    TTL
A       @       76.76.21.21             600
CNAME   www     cname.vercel-dns.com    600
NS      @       ns1.godaddy.com         1 Hour
NS      @       ns2.godaddy.com         1 Hour
```

---

## Step 3: Verify in Vercel

### 3.1 Wait for DNS Propagation

**Initial check:** 5-15 minutes
**Full propagation:** Up to 48 hours (usually under 24 hours)

### 3.2 Check Vercel Status

1. Return to Vercel dashboard
2. Go to **Settings → Domains**
3. Refresh the page

**Status progression:**
```
Invalid Configuration → Pending Verification → Valid Configuration
```

When you see **✓ Valid Configuration**, it's working!

### 3.3 Add www Subdomain (Optional but Recommended)

1. In the same Domains section, add: `www.afrimercato.com`
2. Click **Add**
3. Vercel will auto-configure it

**Recommended redirect:**
- Option 1: `www.afrimercato.com` → `afrimercato.com` (redirect www to non-www)
- Option 2: `afrimercato.com` → `www.afrimercato.com` (redirect non-www to www)

Most sites use Option 1 (non-www as primary).

---

## Step 4: Enable SSL (Automatic)

Vercel automatically provisions SSL certificates via Let's Encrypt.

**Check SSL Status:**
1. Vercel dashboard → Domains
2. Look for **🔒 SSL** badge next to your domain
3. Status should show: **Valid Certificate**

**If SSL shows "Pending":**
- Wait 10-20 minutes
- Vercel is provisioning the certificate
- Once DNS is verified, SSL will activate automatically

---

## Step 5: Test Your Domain

### 5.1 Check DNS Propagation

Use these tools to verify DNS changes:

**Tool 1: DNS Checker**
- https://dnschecker.org/
- Enter: `afrimercato.com`
- Select: **A Record**
- Should show: `76.76.21.21` globally

**Tool 2: What's My DNS**
- https://www.whatsmydns.net/
- Enter: `afrimercato.com`
- Type: **A**
- Should show green checkmarks globally

**Tool 3: Command Line (Advanced)**
```bash
# Check A record (Mac/Linux/Windows PowerShell)
nslookup afrimercato.com

# Check CNAME for www
nslookup www.afrimercato.com

# Detailed DNS check (Linux/Mac)
dig afrimercato.com
dig www.afrimercato.com
```

### 5.2 Visit Your Domain

**Once DNS propagates:**

1. Open browser
2. Go to: `https://afrimercato.com`
3. Should show your Afrimercato frontend
4. Check for **🔒** padlock in address bar (SSL working)

**Test both:**
- `https://afrimercato.com` ✓
- `https://www.afrimercato.com` ✓

Both should work and redirect to your preferred version.

---

## Step 6: Update Backend CORS

### 6.1 Add Domain to Backend

Since your frontend is now on a custom domain, update backend CORS:

**Option A: Via Fly.io CLI**
```bash
fly secrets set FRONTEND_ORIGINS="https://afrimercato.com,https://www.afrimercato.com,https://*.vercel.app"
```

**Option B: Via Fly.io Dashboard**
1. Go to Fly.io dashboard
2. Select your backend app
3. Secrets → Edit
4. Update `FRONTEND_ORIGINS`:
   ```
   https://afrimercato.com,https://www.afrimercato.com,https://*.vercel.app,https://afrimercato-*.vercel.app
   ```
5. Save and restart app

### 6.2 Test Login from Custom Domain

1. Visit `https://afrimercato.com/login`
2. Login with test account
3. Open DevTools → Network
4. Verify no CORS errors
5. Check API calls go to backend successfully

---

## Troubleshooting

### Issue: "This site can't be reached"

**Cause:** DNS not propagated yet

**Fix:**
1. Wait longer (DNS takes time)
2. Check DNS propagation: https://dnschecker.org/
3. Clear browser cache: Ctrl+Shift+Delete
4. Try incognito/private mode
5. Flush DNS cache:
   ```bash
   # Windows
   ipconfig /flushdns

   # Mac
   sudo dscacheutil -flushcache

   # Linux
   sudo systemd-resolve --flush-caches
   ```

### Issue: "ERR_SSL_VERSION_OR_CIPHER_MISMATCH"

**Cause:** SSL certificate not provisioned yet

**Fix:**
1. Wait 10-30 minutes for Let's Encrypt
2. Check Vercel dashboard for SSL status
3. Ensure DNS is fully verified first
4. Try visiting with `http://` (will auto-redirect to `https://`)

### Issue: Shows GoDaddy parking page

**Cause:** Old DNS records not deleted

**Fix:**
1. Go back to GoDaddy DNS Management
2. Delete ALL A records pointing to GoDaddy IPs (usually 184.168.x.x)
3. Delete parked domain records
4. Keep only Vercel A record (76.76.21.21)

### Issue: www works but root domain doesn't (or vice versa)

**Cause:** Missing CNAME or A record

**Fix:**
1. Ensure both records exist in GoDaddy:
   - A record for `@`
   - CNAME record for `www`
2. Both should be added in Vercel Domains section
3. Wait for propagation

### Issue: CORS errors after switching to custom domain

**Cause:** Backend not configured for new domain

**Fix:**
1. Update `FRONTEND_ORIGINS` on backend (Step 6.1)
2. Restart backend: `fly deploy`
3. Verify in backend logs: Should show "CORS configured for origins: https://afrimercato.com..."

---

## Advanced: Email Setup (Optional)

If you want to use email with this domain (e.g., `support@afrimercato.com`):

### Using Google Workspace (Recommended)

**GoDaddy DNS Records for Gmail:**
```
Type    Name    Value                          Priority
MX      @       smtp.google.com                1
MX      @       alt.smtp.google.com            5
TXT     @       v=spf1 include:_spf.google.com ~all
```

### Using GoDaddy Email

GoDaddy will auto-configure email MX records if you purchase their email service.

**Important:** Don't delete MX records if you're using email!

---

## DNS Propagation Timeline

**Typical timeline:**
- 5-15 minutes: Initial propagation (some locations)
- 1-2 hours: Most locations worldwide
- 24-48 hours: Full global propagation

**Speed it up:**
- Set TTL to 600 seconds (10 minutes) for faster updates
- Default TTL of 3600 (1 hour) is also fine
- Lower TTL = faster propagation but more DNS queries

---

## Vercel Domain Settings

### Auto-Redirect Setup

In Vercel dashboard → Domains, you can configure:

**Redirect www to non-www:**
1. Add both `afrimercato.com` and `www.afrimercato.com`
2. Set `afrimercato.com` as primary
3. Vercel auto-redirects `www` → non-www

**Or redirect non-www to www:**
1. Set `www.afrimercato.com` as primary
2. Vercel redirects `afrimercato.com` → `www.afrimercato.com`

**Most sites use non-www as primary (Option 1).**

---

## Final Checklist

Before considering setup complete:

- [ ] Domain added in Vercel
- [ ] A record added in GoDaddy (`@` → `76.76.21.21`)
- [ ] CNAME record added in GoDaddy (`www` → `cname.vercel-dns.com`)
- [ ] Old GoDaddy parking records deleted
- [ ] DNS propagation verified (https://dnschecker.org/)
- [ ] SSL certificate active (🔒 in browser)
- [ ] Both `afrimercato.com` and `www.afrimercato.com` work
- [ ] Backend CORS updated with new domain
- [ ] Login/register tested from custom domain
- [ ] No CORS errors in browser console

---

## Quick Reference

**GoDaddy DNS Records:**
```
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

**Vercel Domains:**
```
afrimercato.com (primary)
www.afrimercato.com (redirect to primary)
```

**Backend CORS:**
```bash
FRONTEND_ORIGINS=https://afrimercato.com,https://www.afrimercato.com,https://*.vercel.app
```

---

**Last Updated:** 2026-01-31
**DNS Provider:** GoDaddy
**Hosting:** Vercel
