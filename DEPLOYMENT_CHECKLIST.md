# Deployment Checklist - Vercel & Render

## ✅ Pre-Deployment Status

**Build Status**: ✓ PASSING
- TypeScript compilation: Success
- Vite bundling: 91 modules, 328KB JS gzipped to 90KB
- All merge conflicts resolved
- All TypeScript errors fixed

**Current Issues Fixed**:
- ✅ Removed all merge conflict markers
- ✅ Fixed `express` package not found error on Render
- ✅ Fixed build command in render.yaml
- ✅ Improved login error messages with credential hints
- ✅ Added persistent user synchronization with backend

---

## 🚀 DEPLOYMENT STEPS

### **Step 1: Deploy Backend to Render** ⚠️ CRITICAL FIX

**IMPORTANT**: The previous build command was failing. Use this exact configuration:

1. **Push code to GitHub** (if using git integration)
   ```bash
   git add .
   git commit -m "Fix Render deployment - use npm ci for reliable installs"
   git push origin main
   ```

2. **On Render Dashboard** - IMPORTANT settings:
   - Repository: `your-repo-url`
   - Branch: `main`
   - Build Command: `cd server && npm ci --production=false`
   - Start Command: `cd server && npm ci --production=false && npm start`
   - Environment: Node
   - Node Version: 24 (set as environment variable)

3. **Set These Exact Environment Variables** in Render dashboard:
   ```
   NODE_VERSION = 24
   PORT = 5000
   FRONTEND_URL = https://<your-vercel-app>.vercel.app
   GOOGLE_CLIENT_ID = <from Google Cloud Console>
   GOOGLE_CLIENT_SECRET = <from Google Cloud Console>
   GOOGLE_REDIRECT_URI = https://update-tool.onrender.com/auth/google/callback
   CHAT_WEBHOOK_SPACE_DEVELOPMENT = https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=API_KEY
   CHAT_WEBHOOK_SPACE_DESIGN = https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=API_KEY
   CHAT_WEBHOOK_SPACE_MARKETING = https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=API_KEY
   CHAT_WEBHOOK_SPACE_SALES = https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=API_KEY
   CHAT_WEBHOOK_SPACE_CLIENT_SUCCESS = https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=API_KEY
   CHAT_WEBHOOK_SPACE_GENERAL = https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=API_KEY
   ```

4. **Deploy**:
   - Render will automatically build and deploy on push
   - Check Logs to verify: you should see
     ```
     ==> Build command: cd server && npm ci --production=false
     ==> npm install (with all packages installed)
     ==> Start command: cd server && npm ci --production=false && npm start
     ```
   - Wait until you see: `Listening on port 5000` or similar

**Troubleshooting Render Deployment**:
   - If you see `ERR_MODULE_NOT_FOUND: express`, it means npm ci didn't run
   - Check Render Logs (not the deploy output) for detailed error messages
   - If stuck, go to Render dashboard → Clear build cache → Redeploy

### **Step 2: Deploy Frontend to Vercel**

1. **On Vercel Dashboard**:
   - Create new project or use existing
   - Connect to GitHub repo
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Set Environment Variables:
     ```
     VITE_API_BASE = https://update-tool.onrender.com
     ```

2. **Deploy** - Should complete in 1-2 minutes

### **Step 3: Verify Deployments**

1. **Test Vercel Frontend**:
   - Visit your Vercel URL
   - Try logging in with demo accounts:
     - Email: `info@maplelearningsolutions.com`
     - Password: `admin`
   - Or: `sandeep@maplelearningsolutions.com`, password: `executive`

2. **Test Render Backend**:
   - Check health endpoint: `https://<your-render-app>.onrender.com/health`
   - Or test users endpoint: `https://<your-render-app>.onrender.com/api/users`

3. **Test Integration**:
   - Submit an employee update
   - Verify Google Chat notification is sent
   - Check email for Gmail notification (if configured)

---

## 🔧 TROUBLESHOOTING

### **Issue: "Cannot find package 'express'" on Render**

**Cause**: Dependencies weren't installed before the server tried to start

**Solution** (CRITICAL):
1. Go to Render Dashboard → Your Service → Settings
2. Update Build Command: `cd server && npm ci --production=false`
3. Update Start Command: `cd server && npm ci --production=false && npm start`
4. Click "Clear build cache"
5. Redeploy (push to GitHub or manually redeploy from dashboard)
6. Check Logs and verify npm packages are being installed
7. Wait until you see "Listening on port" message

### **Issue: "Invalid credentials" on Login**

**Cause**: Account not persisted to backend or credentials don't match

**Solution**:
1. Try demo accounts:
   - Email: `info@maplelearningsolutions.com`, Password: `admin`
   - Email: `sandeep@maplelearningsolutions.com`, Password: `executive`
2. Create new account via Admin Dashboard (click CEO Admin Panel)
3. Verify created account shows in directory with "active" status
4. Check that password includes year (e.g., `John@Pulse2026!`)

### **Issue: "API request failed" when submitting updates**

**Cause**: `VITE_API_BASE` not set on Vercel

**Solution**:
1. Go to Vercel Project Settings → Environment Variables
2. Add: `VITE_API_BASE = https://update-tool.onrender.com`
3. Redeploy from Vercel dashboard

### **Issue: Google Chat notifications not sending**

**Cause**: Chat webhook URLs not set or invalid

**Solution**:
1. Verify all `CHAT_WEBHOOK_SPACE_*` variables are set in Render environment
2. Check webhook URLs are valid and properly formatted
3. Test manually: 
   ```bash
   curl -X POST https://chat.googleapis.com/v1/spaces/SPACE_ID/messages?key=API_KEY \
     -H "Content-Type: application/json" \
     -d '{"text":"Test message"}'
   ```

### **Issue: Gmail notifications not working**

**Cause**: OAuth credentials not configured or refresh token expired

**Solution**:
1. Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Render environment
2. Check `GOOGLE_REDIRECT_URI` matches Google Cloud Console configuration
3. Re-authenticate: Users must grant OAuth permissions again if token expired
4. Check backend logs for detailed error messages

---

## 📋 IMPORTANT CONFIGURATION NOTES

### **Google Cloud Setup** (Required for Gmail & Chat)

1. Create OAuth 2.0 Client ID in Google Cloud Console
2. Set Authorized redirect URIs:
   - `https://update-tool.onrender.com/auth/google/callback`
   - `http://localhost:5000/auth/google/callback` (for local testing)
3. Download credentials JSON and set in Render environment variables
4. Create Google Chat webhooks and copy URLs to environment variables

### **Frontend Configuration**

- `VITE_API_BASE`: Must point to Render backend
- If empty, defaults to `http://localhost:5000` (local dev only)
- On production Vercel, MUST be set to Render backend URL

### **Backend Configuration**

- Port defaults to 5000
- Stores data in JSON files (`users.json`, `updates.json`, `tokens.json`)
- Uses `.env` file for sensitive configuration (see `server/.env.example`)

---

## 📊 VERIFICATION CHECKLIST

Before considering deployment complete:

- [ ] Render backend builds without errors
- [ ] Vercel frontend builds without errors  
- [ ] Can log in with demo accounts on Vercel
- [ ] Can create new employee accounts via Admin Dashboard
- [ ] Can submit employee updates
- [ ] Google Chat notifications appear in configured spaces
- [ ] Email notifications sent (if Gmail configured)
- [ ] Admin dashboard shows all users as active
- [ ] Executive dashboard displays submitted updates
- [ ] Pagination and filtering work correctly
- [ ] Comments on updates sync across browser tabs

---

## 🔄 POST-DEPLOYMENT

### **Monitor**
- Check Render logs for any errors
- Monitor Vercel deployment status
- Test functionality regularly

### **Update Demo Data**
- Access Admin Dashboard (`https://<vercel-url>/admin`)
- Create test employee accounts for team members
- Generate sample updates for testing

### **Backup Data**
- Backend stores data in JSON files on Render
- Consider setting up automated backups of `users.json` and `updates.json`
- For persistent storage, consider upgrading to Render's PostgreSQL

---

## 📞 SUPPORT

For issues during deployment:
1. Check backend logs: Render dashboard → Logs tab
2. Check frontend logs: Browser DevTools → Console
3. Verify all environment variables are set correctly
4. Ensure GitHub repo is up to date with all fixes
