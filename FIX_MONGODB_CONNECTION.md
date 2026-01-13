# 🔧 Fix MongoDB Connection - Step by Step

## Current Status
✅ Cluster is RUNNING (not paused)
✅ IP whitelist is correct (0.0.0.0/0)
❌ Connection still failing

## Most Likely Issues
1. Wrong password in connection string
2. Password needs URL encoding
3. Old/incorrect connection string format

---

## SOLUTION 1: Get Fresh Connection String (RECOMMENDED)

### Step 1: Get New Connection String from MongoDB Atlas

1. **On your MongoDB Atlas page**, find your cluster "Afrihub"
2. **Click the "Connect" button** (big button on the cluster)
3. **Select "Drivers"**
4. **Select:**
   - Driver: Node.js
   - Version: 5.5 or later
5. **Copy the connection string** - it will look like:
   ```
   mongodb+srv://<username>:<password>@afrihub.lmp2s8m.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2: Update Your .env File

1. Open: `afrimercato-backend/.env`
2. Find line 24 (MONGODB_URI)
3. Replace with the new connection string
4. **Important:** Replace `<username>` with your actual username
5. **Important:** Replace `<password>` with your actual password

**Example:**
```env
# OLD (not working)
MONGODB_URI=mongodb://AFROMERT:africamartgrocery@afrihub-shard-00-00.lmp2s8m.mongodb.net:27017...

# NEW (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://AFROMERT:your_actual_password@afrihub.lmp2s8m.mongodb.net/afrimercato?retryWrites=true&w=majority
```

### Step 3: Test Connection

```bash
cd afrimercato-backend
node diagnose-mongodb.js
```

---

## SOLUTION 2: Check Database User Password

### Option A: Verify Current Password Works

1. Go to MongoDB Atlas → **Database Access** (left sidebar)
2. Find user **AFROMERT**
3. Click "Edit" button
4. Check if password is correct: `africamartgrocery`

### Option B: Create New Password (If Current is Wrong)

1. Go to MongoDB Atlas → **Database Access**
2. Find user **AFROMERT**
3. Click "Edit"
4. Click "Edit Password"
5. Enter new password (e.g., `NewPassword123`)
6. Click "Update User"
7. Update `.env` file with new password

---

## SOLUTION 3: URL Encode Special Characters

If your password has special characters like: `@`, `#`, `$`, `%`, etc.

**You need to URL encode them:**

| Character | Encoded |
|-----------|---------|
| @ | %40 |
| # | %23 |
| $ | %24 |
| % | %25 |
| ^ | %5E |
| & | %26 |

**Example:**
- Password: `Pass@word#123`
- Encoded: `Pass%40word%23123`

---

## Quick Test Commands

### Test 1: Check if MongoDB Atlas is reachable
```bash
ping afrihub-shard-00-00.lmp2s8m.mongodb.net
```

### Test 2: Test connection with diagnostic script
```bash
cd afrimercato-backend
node diagnose-mongodb.js
```

### Test 3: Test with simple script
```bash
cd afrimercato-backend
node test-connection-simple.js
```

---

## What to Do RIGHT NOW

1. **Click "Connect" on your Afrihub cluster** in MongoDB Atlas
2. **Select "Drivers"** → **Node.js**
3. **Copy the connection string**
4. **Paste it in your `.env` file** (replace the MONGODB_URI line)
5. **Replace `<username>` with: AFROMERT**
6. **Replace `<password>` with your actual password**
7. **Run test:** `node diagnose-mongodb.js`

---

## Expected Result

```
🔍 MongoDB Connection Diagnostics
============================================================
Username: AFROMERT
Hosts: afrihub.lmp2s8m.mongodb.net
Database: afrimercato
============================================================

⏳ Attempting connection (15 second timeout)...

✅ SUCCESS! Connection working!

Database: afrimercato
Host: afrihub-shard-00-00.lmp2s8m.mongodb.net

✨ Everything is fine! You can now start your backend.
```

---

## Still Not Working?

### Create Brand New User (100% Fresh Start)

1. Go to MongoDB Atlas → **Database Access**
2. Click **"Add New Database User"**
3. **Authentication Method:** Password
4. **Username:** `afrimercato_user`
5. **Password:** Click "Autogenerate Secure Password" → **COPY IT!**
6. **Database User Privileges:** "Read and write to any database"
7. **Click "Add User"**
8. **Update .env:**
   ```env
   MONGODB_URI=mongodb+srv://afrimercato_user:THE_GENERATED_PASSWORD@afrihub.lmp2s8m.mongodb.net/afrimercato?retryWrites=true&w=majority
   ```
9. **Test:** `node diagnose-mongodb.js`

**Your existing data will still be there!** Multiple users can access the same database.

---

## Next Steps After Connection Works

1. ✅ Start backend: `npm start`
2. ✅ Test vendor registration
3. ✅ Deploy to production
4. ✅ Tell your client it's ready!