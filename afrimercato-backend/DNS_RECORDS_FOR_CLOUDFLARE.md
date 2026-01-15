# DNS Records to Add in Cloudflare for afrimercato.com

## Go to: https://dash.cloudflare.com
Login → Select "afrimercato.com" → Click "DNS"

## Add These 3 Records:

### 1. A Record (IPv4)
```
Type:     A
Name:     api
Content:  66.241.125.43
Proxy:    DNS only (gray cloud ☁️)
TTL:      Auto
```

### 2. AAAA Record (IPv6)
```
Type:     AAAA
Name:     api
Content:  2a09:8280:1::b4:b0bc:0
Proxy:    DNS only (gray cloud ☁️)
TTL:      Auto
```

### 3. ACME Challenge (for SSL)
```
Type:     CNAME
Name:     _acme-challenge.api
Content:  api.afrimercato.com.dmyq3kr.flydns.net
Proxy:    DNS only (gray cloud ☁️)
TTL:      Auto
```

## Important Notes:

1. **MUST keep Proxy status as "DNS only" (gray cloud)** during certificate setup
2. After SSL certificate is issued (5-10 minutes), you can enable proxy (orange cloud)
3. Your backend will be accessible at: **https://api.afrimercato.com**

## After Adding DNS Records:

Wait 5-10 minutes, then run:
```bash
cd afrimercato-backend
fly certs check api.afrimercato.com
```

## SSL/TLS Settings in Cloudflare (After Certificate is Issued):

1. Go to SSL/TLS → Overview
2. Set to: **Full (strict)**
3. Enable "Always Use HTTPS"

## Your New Backend URLs:

- **Custom Domain**: https://api.afrimercato.com/api
- **Health Check**: https://api.afrimercato.com/api/health
- **Fly.io Direct**: https://afrimercato-api.fly.dev/api (still works as backup)
