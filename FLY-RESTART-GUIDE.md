# How to Restart Your Fly.io App

## The Issue
When an app crashes more than 10 times consecutively, Fly.io suspends it to prevent infinite restart loops.

## Solution: Manual Restart

### Option 1: Via Fly.io CLI (Recommended)
```bash
cd afrimercato-backend

# Check app status
fly status

# Restart the app
fly apps restart afrimercato-backend

# Or restart specific machine
fly machine restart <MACHINE_ID>

# Watch logs to verify it's working
fly logs
```

### Option 2: Via Fly.io Dashboard
1. Go to https://fly.io/dashboard
2. Click on your app: **afrimercato-backend**
3. Go to the **Machines** tab
4. Click on your machine ID (e.g., `2863ee4f633368`)
5. Click the **Restart** button

### Option 3: Redeploy
```bash
cd afrimercato-backend
fly deploy
```

## Verify It's Working
After restarting, check the logs:
```bash
fly logs
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 8080
```

**No more crash errors!** ✅
