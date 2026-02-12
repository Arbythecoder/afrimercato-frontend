# Cloudflare Setup Guide for Afrimercato Backend

## Prerequisites
- A domain name (e.g., afrimercato.com)
- Cloudflare account (free tier works fine)

## Step 1: Add Your Domain to Cloudflare

1. Go to https://dash.cloudflare.com
2. Click "Add a Site"
3. Enter your domain name
4. Choose the Free plan
5. Cloudflare will scan your DNS records
6. Update your nameservers at your domain registrar to Cloudflare's nameservers

## Step 2: Add Custom Domain to Fly.io

Run these commands in your terminal:

```bash
cd afrimercato-backend

# Add your custom domain (replace with your actual domain)
fly certs add api.yourdomain.com

# Or for a subdomain:
fly certs add yourdomain.com
```

Fly.io will provide DNS records you need to add.

## Step 3: Configure DNS in Cloudflare

Add these DNS records in Cloudflare:

### For a subdomain (e.g., api.yourdomain.com):
- **Type**: CNAME
- **Name**: api
- **Target**: afrimercato-api.fly.dev
- **Proxy status**: DNS only (gray cloud) ⚠️ Important!

### For root domain (e.g., yourdomain.com):
- **Type**: CNAME or ALIAS
- **Name**: @
- **Target**: afrimercato-api.fly.dev
- **Proxy status**: DNS only (gray cloud) ⚠️ Important!

## Step 4: Wait for DNS Propagation

- DNS changes can take 5-60 minutes to propagate
- Check status with: `fly certs check api.yourdomain.com`

## Step 5: Enable Cloudflare Proxy (Optional)

Once SSL certificate is issued by Fly.io:
1. Go back to Cloudflare DNS settings
2. Click the gray cloud icon to turn it orange (Proxied)
3. This enables Cloudflare's CDN and DDoS protection

## SSL/TLS Settings in Cloudflare

1. Go to SSL/TLS → Overview
2. Set encryption mode to **Full (strict)**
3. Enable "Always Use HTTPS"
4. Enable "Automatic HTTPS Rewrites"

## Your Backend URLs

After setup, your backend will be accessible at:
- **Custom Domain**: https://api.yourdomain.com/api
- **Fly.io URL**: https://afrimercato-api.fly.dev/api (still works)

## Troubleshooting

### Certificate not issuing?
```bash
# Check certificate status
fly certs show api.yourdomain.com

# List all certificates
fly certs list
```

### DNS not resolving?
```bash
# Check DNS propagation
nslookup api.yourdomain.com
```

### Still having issues?
- Make sure Cloudflare proxy is OFF (gray cloud) during certificate issuance
- Verify DNS records are correct
- Wait longer for DNS propagation (can take up to 24 hours in rare cases)
