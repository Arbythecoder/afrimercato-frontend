# How to Add DNS Records in Cloudflare - Step by Step

## Step 1: Login to Cloudflare
1. Go to: **https://dash.cloudflare.com**
2. Enter email: **afrimercatro@gmail.com**
3. Enter password: **Afrimercato123@**
4. Click "Log in"

## Step 2: Select Your Domain
1. After logging in, you'll see a list of your websites
2. Click on **afrimercato.com** (or www.afrimercato.com if that's listed)

## Step 3: Go to DNS Settings
1. Look at the **top menu bar** (you'll see: Overview, Analytics, DNS, Email, etc.)
2. Click on **"DNS"** (should be the third tab)
3. You're now in the DNS management page!

## Step 4: Add DNS Records
You should see a section that says "DNS Management for afrimercato.com"

### Add Record 1 - A Record (IPv4):
1. Click the **"Add record"** button (usually blue button on the right)
2. Fill in:
   - **Type**: Select "A" from dropdown
   - **Name**: Type `api`
   - **IPv4 address**: Type `66.241.125.43`
   - **Proxy status**: Click the **orange cloud** to turn it **GRAY** (very important!)
   - **TTL**: Leave as "Auto"
3. Click **"Save"**

### Add Record 2 - AAAA Record (IPv6):
1. Click **"Add record"** again
2. Fill in:
   - **Type**: Select "AAAA" from dropdown
   - **Name**: Type `api`
   - **IPv6 address**: Type `2a09:8280:1::b4:b0bc:0`
   - **Proxy status**: Make sure it's **GRAY** cloud (not orange)
   - **TTL**: Leave as "Auto"
3. Click **"Save"**

### Add Record 3 - ACME Challenge (for SSL):
1. Click **"Add record"** again
2. Fill in:
   - **Type**: Select "CNAME" from dropdown
   - **Name**: Type `_acme-challenge.api`
   - **Target**: Type `api.afrimercato.com.dmyq3kr.flydns.net`
   - **Proxy status**: Make sure it's **GRAY** cloud
   - **TTL**: Leave as "Auto"
3. Click **"Save"**

## What You Should See After Adding Records:

Your DNS records table should show something like this:

| Type  | Name                  | Content                                    | Proxy Status | TTL  |
|-------|----------------------|---------------------------------------------|--------------|------|
| A     | api                  | 66.241.125.43                              | DNS only     | Auto |
| AAAA  | api                  | 2a09:8280:1::b4:b0bc:0                     | DNS only     | Auto |
| CNAME | _acme-challenge.api  | api.afrimercato.com.dmyq3kr.flydns.net    | DNS only     | Auto |

## Important Notes:
- The **cloud icon MUST be GRAY** (not orange) during setup
- After SSL certificate is issued (10-15 minutes), you can turn the clouds orange if you want Cloudflare protection
- DNS changes take 5-10 minutes to propagate

## After Adding DNS Records:
Wait 10 minutes, then let me know and I'll check if your SSL certificate is ready!

Your backend will then be available at: **https://api.afrimercato.com**
