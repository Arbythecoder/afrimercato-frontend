# 🚀 Deployment Options (No Fly CLI Needed!)

## ✅ Good News!

Your code is already pushed to GitHub, and you have **automatic deployment** set up via GitHub Actions!

**However**, we still need to update the MongoDB credentials in Fly.io.

---

## 🎯 OPTION 1: Use Fly.io Web Dashboard (EASIEST)

### Step 1: Go to Fly.io Dashboard
1. Open: https://fly.io/dashboard
2. Login with your account
3. Find your app: **afrimercato-backend**
4. Click on the app

### Step 2: Update Secrets
1. Click **"Secrets"** in the left sidebar (or top tabs)
2. Find **MONGODB_URI** (or click "New Secret" if it doesn't exist)
3. Update the value to:
   ```
   mongodb+srv://africa:Oluwanifemi123.@afrihub.lmp2s8m.mongodb.net/afrimercato?retryWrites=true&w=majority&appName=Afrihub
   ```
4. Click **"Save"** or **"Set Secret"**

### Step 3: Restart App
The app will automatically restart after updating the secret. Wait 1-2 minutes.

### Step 4: Verify
Check logs in the dashboard or visit:
```
https://afrimercato-backend.fly.dev/api/health
```

**✅ DONE! No CLI needed!**

---

## 🎯 OPTION 2: Install Fly CLI (If You Want)

### Install Fly CLI on Windows:

**Option A: Using PowerShell (Recommended)**
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

**Option B: Using Scoop**
```bash
scoop install flyctl
```

**Option C: Using Chocolatey**
```bash
choco install flyctl
```

### After Installation:
```bash
# Login
fly auth login

# Update secrets
fly secrets set "MONGODB_URI=mongodb+srv://africa:Oluwanifemi123.@afrihub.lmp2s8m.mongodb.net/afrimercato?retryWrites=true&w=majority&appName=Afrihub" -a afrimercato-backend

# Deploy (or wait for GitHub Actions)
fly deploy -a afrimercato-backend
```

---

## 🎯 OPTION 3: GitHub Actions Auto-Deploy (Already Set Up!)

Since you already pushed to GitHub, your app should be deploying automatically!

### Check Deployment Status:

1. Go to: https://github.com/Arbythecoder/afrimercato-backend/actions
2. Look for the latest workflow run (should be running or completed)
3. Check if it succeeded

**BUT:** The deployment will still use the old MongoDB credentials until you update them via Option 1 or 2!

---

## 🎯 OPTION 4: Use Railway (You Have Config File!)

I noticed you have `railway.json`. If you prefer Railway:

1. Go to: https://railway.app
2. Login and find your project
3. Go to Variables
4. Update `MONGODB_URI` to:
   ```
   mongodb+srv://africa:Oluwanifemi123.@afrihub.lmp2s8m.mongodb.net/afrimercato?retryWrites=true&w=majority&appName=Afrihub
   ```
5. Railway will auto-deploy

---

## 🎯 OPTION 5: Use Render (You Have Config File!)

I noticed you have `render.yaml`. If you prefer Render:

1. Go to: https://dashboard.render.com
2. Find your service
3. Go to Environment
4. Update `MONGODB_URI` to:
   ```
   mongodb+srv://africa:Oluwanifemi123.@afrihub.lmp2s8m.mongodb.net/afrimercato?retryWrites=true&w=majority&appName=Afrihub
   ```
5. Render will auto-deploy

---

## 📊 Which Platform Are You Using?

You have config files for:
- ✅ **Fly.io** (fly.toml + GitHub Actions)
- ✅ **Railway** (railway.json)
- ✅ **Render** (render.yaml)

**Which one is your app currently deployed on?**

To find out, try these URLs:

1. **Fly.io**: https://afrimercato-backend.fly.dev/api/health
2. **Railway**: Check your Railway dashboard for the URL
3. **Render**: Check your Render dashboard for the URL

Whichever one responds, that's where your app is deployed!

---

## ⚡ QUICKEST SOLUTION

**Use the web dashboard of whichever platform you're deployed on:**

1. Login to the platform (Fly.io, Railway, or Render)
2. Find your app
3. Go to Environment Variables / Secrets
4. Update `MONGODB_URI` with the new value above
5. Save

**App will restart automatically with new MongoDB credentials!**

**No CLI installation needed!** ✅

---

## 🎉 After MongoDB Credentials Are Updated

Your app will:
- ✅ Connect to MongoDB successfully
- ✅ Allow vendors to register
- ✅ Support "snacks" category
- ✅ Be ready for your client's Global Talent Visa!

---

## Need Help?

Tell me which platform you're using (Fly.io, Railway, or Render) and I'll give you exact steps!
