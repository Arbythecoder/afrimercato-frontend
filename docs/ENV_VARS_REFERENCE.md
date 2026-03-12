# ENVIRONMENT VARIABLES - COMPLETE REFERENCE

All environment variables required for Afrimercato Backend.

---

## 🔴 CRITICAL (Required for Production)

### Database
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/afrimercato?retryWrites=true&w=majority
```

### JWT Authentication
```bash
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
```

### Frontend URLs (OAuth redirects)
```bash
FRONTEND_URL=https://afrimercato.vercel.app
CLIENT_URL=https://afrimercato.vercel.app
FRONTEND_ORIGINS=https://afrimercato.vercel.app,http://localhost:3000,http://localhost:5173
```

### Google OAuth (MUST be set for login to work)
```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=https://afrimercato-backend.fly.dev/api/auth/google/callback
```

---

## 🟡 IMPORTANT (Recommended for Production)

### Stripe Payment Processing
```bash
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### Cloudinary (Image Uploads)
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

### Node Environment
```bash
NODE_ENV=production
PORT=8080
```

---

## 🟢 OPTIONAL (Enhanced Features)

### Facebook OAuth
```bash
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abcdef1234567890abcdef1234567890
FACEBOOK_CALLBACK_URL=https://afrimercato-backend.fly.dev/api/auth/facebook/callback
```

### Email Service (NodeMailer)
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=noreply@afrimercato.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Afrimercato <noreply@afrimercato.com>
```

### Status Endpoint Protection
```bash
STATUS_KEY=random-secret-key-for-status-endpoint
```

---

## 📋 FLY.IO DEPLOYMENT COMMANDS

### Set All Critical Secrets at Once
```bash
fly secrets set \
  MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/afrimercato" \
  JWT_SECRET="your-super-secret-key-minimum-32-characters-long" \
  FRONTEND_URL="https://afrimercato.vercel.app" \
  CLIENT_URL="https://afrimercato.vercel.app" \
  FRONTEND_ORIGINS="https://afrimercato.vercel.app,http://localhost:3000" \
  GOOGLE_CLIENT_ID="your-google-client-id" \
  GOOGLE_CLIENT_SECRET="your-google-client-secret" \
  GOOGLE_CALLBACK_URL="https://afrimercato-backend.fly.dev/api/auth/google/callback"
```

### Set Stripe Secrets
```bash
fly secrets set \
  STRIPE_SECRET_KEY="sk_live_xxxxx" \
  STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
```

### Set Cloudinary Secrets
```bash
fly secrets set \
  CLOUDINARY_CLOUD_NAME="your-cloud-name" \
  CLOUDINARY_API_KEY="123456789012345" \
  CLOUDINARY_API_SECRET="your-api-secret"
```

### Set Facebook OAuth (Optional)
```bash
fly secrets set \
  FACEBOOK_APP_ID="your-facebook-app-id" \
  FACEBOOK_APP_SECRET="your-facebook-app-secret" \
  FACEBOOK_CALLBACK_URL="https://afrimercato-backend.fly.dev/api/auth/facebook/callback"
```

---

## 🔍 VERIFY SECRETS

### List All Secrets
```bash
fly secrets list
```

### Expected Output:
```
NAME                        DIGEST          CREATED AT
CLOUDINARY_API_KEY          abc123def...    2024-01-15
CLOUDINARY_API_SECRET       abc123def...    2024-01-15
CLOUDINARY_CLOUD_NAME       abc123def...    2024-01-15
FACEBOOK_APP_ID             abc123def...    2026-02-08
FACEBOOK_APP_SECRET         abc123def...    2026-02-08
FACEBOOK_CALLBACK_URL       abc123def...    2026-02-08
FRONTEND_ORIGINS            abc123def...    2024-01-15
FRONTEND_URL                abc123def...    2026-02-08
CLIENT_URL                  abc123def...    2026-02-08
GOOGLE_CALLBACK_URL         abc123def...    2026-02-08
GOOGLE_CLIENT_ID            abc123def...    2024-01-15
GOOGLE_CLIENT_SECRET        abc123def...    2024-01-15
JWT_SECRET                  abc123def...    2024-01-15
MONGODB_URI                 abc123def...    2024-01-15
STRIPE_SECRET_KEY           abc123def...    2024-01-15
STRIPE_WEBHOOK_SECRET       abc123def...    2024-01-15
```

---

## 🎯 OAUTH SETUP GUIDES

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project or select existing
3. Enable "Google+ API"
4. Create OAuth 2.0 Client ID (Web application)
5. Add authorized redirect URI:
   - `https://afrimercato-backend.fly.dev/api/auth/google/callback`
   - `http://localhost:5000/api/auth/google/callback` (for local testing)
6. Copy Client ID and Client Secret
7. Set secrets in Fly.io

### Facebook OAuth Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create app (Business > Consumer)
3. Add "Facebook Login" product
4. Settings → Basic → Copy App ID and App Secret
5. Facebook Login → Settings → Add OAuth Redirect URIs:
   - `https://afrimercato-backend.fly.dev/api/auth/facebook/callback`
   - `http://localhost:5000/api/auth/facebook/callback` (for local testing)
6. Make app public (App Review → Permissions and Features)
7. Set secrets in Fly.io

---

## 🧪 LOCAL DEVELOPMENT (.env file)

Create `.env` file in `afrimercato-backend/`:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/afrimercato

# JWT
JWT_SECRET=local-dev-secret-key-at-least-32-chars

# Frontend
FRONTEND_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
FRONTEND_ORIGINS=http://localhost:3000,http://localhost:5173

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Facebook OAuth (optional)
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback

# Stripe (use test keys)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=your-api-secret

# Node
NODE_ENV=development
PORT=5000
```

---

## ✅ VALIDATION CHECKLIST

Before deploying, verify:

- [ ] MONGODB_URI is set and valid
- [ ] JWT_SECRET is at least 32 characters
- [ ] FRONTEND_URL matches your actual frontend domain
- [ ] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set
- [ ] GOOGLE_CALLBACK_URL matches your backend domain
- [ ] STRIPE_SECRET_KEY starts with `sk_live_` (production) or `sk_test_` (testing)
- [ ] All required secrets are set in Fly.io (`fly secrets list`)
- [ ] OAuth redirect URIs are whitelisted in Google/Facebook consoles

---

## 🚨 SECURITY NOTES

1. **Never commit `.env` file to git** (already in `.gitignore`)
2. **Rotate secrets regularly** (JWT_SECRET, OAuth secrets)
3. **Use different secrets for dev/staging/production**
4. **Stripe test keys for development, live keys for production**
5. **Limit FRONTEND_ORIGINS to trusted domains only**

---

## 📞 TROUBLESHOOTING

### "Invalid redirect_uri" error (OAuth)
→ Check callback URL is whitelisted in Google/Facebook console  
→ Verify GOOGLE_CALLBACK_URL/FACEBOOK_CALLBACK_URL matches exactly

### "MongoDB connection failed"
→ Check MONGODB_URI is correct  
→ Verify IP whitelist in MongoDB Atlas (0.0.0.0/0 for Fly.io)  
→ Test connection locally: `mongosh "your-mongodb-uri"`

### "JWT malformed" error
→ JWT_SECRET must be same across all instances  
→ Don't change JWT_SECRET with active users (invalidates all tokens)

### Stripe webhook failing
→ Verify STRIPE_WEBHOOK_SECRET matches Stripe dashboard  
→ Check webhook URL is `https://afrimercato-backend.fly.dev/api/payments/webhook`  
→ Test webhook: `stripe listen --forward-to localhost:5000/api/payments/webhook`

---

**Last Updated:** February 8, 2026  
**Deployment Guide:** [DEPLOY_NOW.md](DEPLOY_NOW.md)
