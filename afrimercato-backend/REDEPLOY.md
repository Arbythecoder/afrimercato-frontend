# Backend Redeploy Instructions

## Your backend needs to be redeployed to apply the new CORS settings.

### Option 1: Using Fly CLI (Recommended)

1. Make sure you're logged in:
```bash
fly auth login
```

2. Navigate to backend directory:
```bash
cd afrimercato-backend
```

3. Deploy the updated backend:
```bash
fly deploy
```

4. Check if it's running:
```bash
fly status
```

5. View logs to confirm CORS is working:
```bash
fly logs
```

### Option 2: Push to GitHub (if auto-deploy is set up)

```bash
git add .
git commit -m "Update CORS for Vercel deployment"
git push
```

## Verify CORS Update

After redeploying, test CORS from browser console:

```javascript
fetch('https://afrimercato-backend.fly.dev/api/vendors/profile', {
  credentials: 'include',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error)
```

## What Was Changed

The backend CORS configuration now accepts requests from:
- ✅ All Vercel deployments (`*.vercel.app`)
- ✅ GitHub Pages
- ✅ Cloudflare Pages
- ✅ Localhost (development)

## Next Steps

1. Redeploy backend using one of the methods above
2. Deploy frontend to Vercel (see QUICK_DEPLOY.md)
3. Test the connection!
