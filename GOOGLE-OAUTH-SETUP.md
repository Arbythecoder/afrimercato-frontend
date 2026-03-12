# Google OAuth Setup Guide

## Step-by-Step: Create Google OAuth Credentials

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### Step 2: Create a New Project (or Select Existing)
1. Click the project dropdown at the top
2. Click **"New Project"**
3. Enter project name: `Afrimercato`
4. Click **"Create"**

### Step 3: Enable Google+ API
1. In the left sidebar, go to **APIs & Services** > **Library**
2. Search for **"Google+ API"** or **"Google Identity"**
3. Click on it and press **"Enable"**

### Step 4: Configure OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (for public users)
3. Click **"Create"**

4. Fill in the required information:
   - **App name**: `Afrimercato`
   - **User support email**: Your email
   - **App logo**: Upload your logo (optional)
   - **Developer contact email**: Your email

5. Click **"Save and Continue"**

6. **Scopes**: Click "Add or Remove Scopes"
   - Add: `userinfo.email`
   - Add: `userinfo.profile`
   - Click **"Update"** then **"Save and Continue"**

7. **Test users** (optional for development):
   - Add your email address
   - Click **"Save and Continue"**

### Step 5: Create OAuth Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **"+ CREATE CREDENTIALS"** > **OAuth client ID**
3. Select **Application type**: `Web application`
4. **Name**: `Afrimercato Web Client`

5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://yourdomain.com
   https://afrimercato-backend.fly.dev
   ```

6. **Authorized redirect URIs**:
   ```
   http://localhost:5000/api/auth/google/callback
   https://afrimercato-backend.fly.dev/api/auth/google/callback
   ```



7. Click **"Create"**

### Step 6: Copy Your Credentials
You'll see a popup with:
- **Client ID**: `1234567890-abc123def456.apps.googleusercontent.com`
- **Client Secret**: `GOCSPX-xxxxxxxxxxxxxxxxxxxx`

**IMPORTANT**: Copy these immediately!

### Step 7: Add to Your .env File
```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=https://afrimercato-backend.fly.dev/api/auth/google/callback
```

### Step 8: Add to Fly.io Secrets
```bash
cd afrimercato-backend

# Set the secrets
fly secrets set GOOGLE_CLIENT_ID="your-client-id-here"
fly secrets set GOOGLE_CLIENT_SECRET="your-client-secret-here"
fly secrets set GOOGLE_CALLBACK_URL="https://afrimercato-backend.fly.dev/api/auth/google/callback"

# Verify secrets are set
fly secrets list
```

### Step 9: Redeploy Your App
```bash
fly deploy
```

## Troubleshooting

### "redirect_uri_mismatch" Error
Make sure the redirect URI in Google Console **exactly matches** your callback URL:
- Development: `http://localhost:5000/api/auth/google/callback`
- Production: `https://afrimercato-backend.fly.dev/api/auth/google/callback`

### "Access Blocked" Error
1. Go back to OAuth consent screen
2. Make sure your app is in "Testing" mode (for development)
3. Add your test email addresses

### Still Getting "OAuth not configured" Warning
This warning appears because the credentials are optional. If you've added them:
1. Restart your Fly.io app: `fly apps restart`
2. Check logs: `fly logs`
3. You should see: `✅ Google OAuth configured`

## Facebook OAuth Setup (Similar Process)

1. Go to: https://developers.facebook.com/
2. Create a new app > **Consumer** type
3. Add **Facebook Login** product
4. Settings > Basic:
   - Copy **App ID** → `FACEBOOK_APP_ID`
   - Copy **App Secret** → `FACEBOOK_APP_SECRET`
5. Facebook Login > Settings:
   - Add redirect URI: `https://afrimercato-backend.fly.dev/api/auth/facebook/callback`

Add to Fly.io:
```bash
fly secrets set FACEBOOK_APP_ID="your-app-id"
fly secrets set FACEBOOK_APP_SECRET="your-app-secret"
fly secrets set FACEBOOK_CALLBACK_URL="https://afrimercato-backend.fly.dev/api/auth/facebook/callback"
```

## Testing OAuth Flow

### Test Locally First
1. Start your server: `npm start`
2. Visit: `http://localhost:5000/api/auth/google`
3. Should redirect to Google login
4. After login, should redirect back to your app

### Test on Production
1. Visit: `https://afrimercato-backend.fly.dev/api/auth/google`
2. Complete the OAuth flow
3. Check if user is created in your database
