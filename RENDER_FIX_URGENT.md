# URGENT: Render Deployment Fix

## The Problem
Render is failing with: `Error [ERR_MODULE_NOT_FOUND]: Cannot find package 'express'`

This means **the server dependencies aren't being installed** before the app tries to start.

## The Fix (IMMEDIATE ACTION REQUIRED)

### Option 1: Update render.yaml (RECOMMENDED)
The `render.yaml` file has been updated with the correct configuration. Push this to GitHub:

```yaml
buildCommand: cd server && npm ci --production=false
startCommand: cd server && npm ci --production=false && npm start
```

Then:
1. Go to Render Dashboard
2. Click on your service
3. Click "Redeploy" (or clear cache and redeploy)
4. Watch the logs for "npm ci" to run and install packages

### Option 2: Manually Update Render Dashboard (If above doesn't work)

1. Go to **Render Dashboard** → Select your **update-tool-backend** service
2. Click **Settings** tab
3. Under **Build & Deploy**:
   - **Build Command**: Change to `cd server && npm ci --production=false`
   - **Start Command**: Change to `cd server && npm ci --production=false && npm start`
4. Scroll down and click **Save**
5. Click **Redeploy** button
6. Click **View logs** and wait until you see:
   ```
   added X packages
   Listening on port 5000
   ```

### Option 3: Clear Build Cache (Last Resort)
1. In Render Dashboard → Settings
2. Scroll to bottom → Click **Clear build cache**
3. Go back and click **Redeploy**

---

## Why This Fixes It

The old commands:
- Build: `npm install --prefix server` ← May not work on Render
- Start: `cd server && npm start` ← Runs before packages installed

The new commands:
- Build: `cd server && npm ci --production=false` ← Explicitly cd, reliable install
- Start: `cd server && npm ci --production=false && npm start` ← Install again if needed, then start

`npm ci` (clean install) is better than `npm install` for deployments because it:
- Uses the exact versions from package-lock.json
- Fails loudly if something is wrong (doesn't continue silently)
- Is optimized for CI/CD environments

---

## Verify It's Working

After deployment, check the **Logs** tab in Render:
- ❌ BAD: Shows "ERR_MODULE_NOT_FOUND"
- ✅ GOOD: Shows "Listening on port 5000" or "Server running..."

Once you see "Listening on port 5000":
1. Test the backend: `curl https://update-tool.onrender.com/health`
2. Test the API: `curl https://update-tool.onrender.com/api/users`
3. Both should return JSON responses

---

## Why Google Chat Notifications Aren't Showing

If the server isn't running (because of the express error), then:
- ❌ Frontend can't reach backend API
- ❌ Employee updates aren't being persisted
- ❌ Google Chat notifications aren't being sent
- ❌ Emails aren't being sent

**Once you fix the Render deployment**, notifications will work automatically:
1. Submit an update from the Employee Dashboard
2. You should see:
   - Update appears in Executive Dashboard
   - Message appears in your Google Chat spaces
   - (Optional) Email sent if Gmail configured

---

## Quick Checklist

- [ ] I've updated render.yaml OR manually updated Render Dashboard
- [ ] Build Command is: `cd server && npm ci --production=false`
- [ ] Start Command is: `cd server && npm ci --production=false && npm start`
- [ ] I clicked "Redeploy" in Render Dashboard
- [ ] Logs show "added packages" and "Listening on port 5000"
- [ ] Backend URL works: https://update-tool.onrender.com/api/users returns JSON
- [ ] Vercel frontend has `VITE_API_BASE = https://update-tool.onrender.com`

---

## Need Help?

If it still doesn't work:

1. **Check Render Logs** (not build output):
   - View detailed error messages
   - Look for "npm" errors
   - Copy the full error and search for it

2. **Verify Environment Variables**:
   - Go to Render Settings → Environment
   - Check that `NODE_VERSION = 24` is set
   - Check that `GOOGLE_*` variables are filled in

3. **Check GitHub Repository**:
   - Ensure render.yaml is committed and pushed
   - Ensure server/package.json exists with all dependencies
   - Ensure server/index.js exists

4. **Last Resort** - Delete and recreate:
   - Delete the Render service
   - Create new Web Service
   - Connect to GitHub
   - Use build/start commands above
