# Render Backend - Why It's Failing & How to Fix

## The Error You're Seeing

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express'
Cannot find module at /opt/render/project/src/server/index.js
```

## Root Cause (Simplified)

1. Render tries to run: `node server/index.js`
2. Node tries to load: `import express from 'express'`
3. Node can't find express → Crash
4. **Why?** Dependencies weren't installed yet!

## The Solution (What I've Done)

Updated `render.yaml` with better commands:

```yaml
# OLD (BROKEN)
buildCommand: npm install --prefix server
startCommand: cd server && npm start

# NEW (FIXED)
buildCommand: cd server && npm ci --production=false
startCommand: cd server && npm ci --production=false && npm start
```

**Key differences:**
- `cd server &&` → Explicitly change to server directory first (more reliable)
- `npm ci` → Uses package-lock.json for exact versions (more reliable than `npm install`)
- `--production=false` → Installs dev dependencies too (needed for some packages)
- Start command runs `npm ci` again as fallback → Extra safety

## What You Need to Do NOW

### ✅ All Changes Committed - Just Push to GitHub

The fixed `render.yaml` is already updated. Just:

```bash
git add .
git commit -m "Fix Render deployment - use npm ci for reliable installs"
git push origin main
```

### ✅ Render Dashboard Configuration

**If Render is using the GitHub webhook**, it will auto-deploy. To verify/force:

1. Go to **Render Dashboard** → Select **update-tool-backend** service
2. Scroll to **Build & Deploy** section
3. Verify:
   - Build Command: `cd server && npm ci --production=false`
   - Start Command: `cd server && npm ci --production=false && npm start`
4. If different, update them manually and save
5. Click **Redeploy** button

### ✅ Check the Logs

1. In Render Dashboard, click **Logs** tab
2. Wait for the build and start to complete
3. Look for these messages (in order):
   ```
   ==> Build command: cd server && npm ci --production=false
   added X packages
   
   ==> Start command: cd server && npm ci --production=false && npm start
   added X packages (from cache)
   Listening on port 5000
   ```
4. If you see `Listening on port 5000` ✅ SUCCESS!

---

## After It's Fixed

### Test the Backend

Once Render shows "Listening on port 5000":

```bash
# Test API (should return JSON with users)
curl https://update-tool.onrender.com/api/users

# Test health (if endpoint exists)
curl https://update-tool.onrender.com/health
```

### Connect Frontend

Your Vercel frontend needs to know where the backend is:

In **Vercel Dashboard** → Environment Variables:
```
VITE_API_BASE = https://update-tool.onrender.com
```

### Test End-to-End

1. Go to Vercel app
2. Log in with demo account:
   - Email: `info@maplelearningsolutions.com`
   - Password: `admin`
3. Submit an update from Employee Dashboard
4. Check your Google Chat spaces for notification message
5. Check Executive Dashboard - update should appear there too

---

## If It Still Doesn't Work

### Check 1: Render Logs Show Actual Errors

Click **Logs** in Render Dashboard and scroll through for red/error messages. Common ones:

```
ERR_MODULE_NOT_FOUND: Cannot find package 'express'
  → npm ci didn't run or failed silently
  → Solution: Clear build cache and redeploy

ERR_EACCES: permission denied
  → Rare, file permission issue
  → Solution: Try "Clear build cache" in Render

ENOTFOUND: ... getaddrinfo (network error)
  → Trying to connect to external service
  → Solution: Check GOOGLE_CLIENT_ID is set in Environment Variables
```

### Check 2: Environment Variables

In Render Dashboard → Settings → Environment Variables:

```
NODE_VERSION = 24          ← Must be set
PORT = 5000               ← Optional but good to have
GOOGLE_CLIENT_ID = ...    ← Required for Gmail/Chat auth
GOOGLE_CLIENT_SECRET = ...← Required
GOOGLE_REDIRECT_URI = https://update-tool.onrender.com/auth/google/callback
CHAT_WEBHOOK_SPACE_* = ..← Required for Google Chat
```

All GOOGLE_* variables must have actual values (not placeholder text).

### Check 3: Verify Files Exist

```bash
# Local check - run this in project folder
ls -la server/
```

Should show:
```
package.json        ✅
package-lock.json   ✅
index.js           ✅
node_modules/      ✅
```

If any missing, run:
```bash
cd server
npm install
```

---

## Summary

| Issue | Cause | Fix |
|-------|-------|-----|
| `ERR_MODULE_NOT_FOUND: express` | Dependencies not installed before server starts | Use `npm ci` in build AND start commands |
| Google Chat notifications not appearing | Backend isn't running (because of express error) | Fix the Render deployment first |
| Backend can't connect to Google APIs | Missing/invalid environment variables | Set all GOOGLE_* variables in Render dashboard |
| Frontend shows "API error" | Vercel `VITE_API_BASE` not set or wrong | Set `VITE_API_BASE = https://update-tool.onrender.com` in Vercel |

---

## Files Modified

- ✅ `render.yaml` - Fixed build and start commands
- ✅ `server/package.json` - Added version info
- ✅ `DEPLOYMENT_CHECKLIST.md` - Updated with correct commands
- ✅ `RENDER_FIX_URGENT.md` - This file

**Next Step**: Push to GitHub and watch Render logs for "Listening on port 5000" ✨
