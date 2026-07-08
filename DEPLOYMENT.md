# Deployment Guide

<<<<<<< HEAD
This guide covers deploying Updates Tool to production using **Vercel** (frontend) and **Railway** (backend).
=======
This guide covers deploying Updates Tool to production using **Vercel** (frontend) and **Render** (backend).
>>>>>>> be3e839df724e02efd83e87e9ea6c4fd6962d4d1

## Prerequisites

- GitHub account with your repo pushed
- Vercel account (free, auto-created from GitHub)
<<<<<<< HEAD
- Railway account (free tier with limited hours)
=======
- Render account
>>>>>>> be3e839df724e02efd83e87e9ea6c4fd6962d4d1
- Google OAuth credentials (already set up locally)

## Step 1: Deploy Frontend to Vercel

### 1a. Import Project
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Paste your GitHub repo URL: `https://github.com/RenukaGorugantu-g/Update-Tool`
5. Vercel auto-detects the build settings (build: `npm run build`, output: `dist`)
6. Click **"Deploy"** (takes 1-2 minutes)

<<<<<<< HEAD
### 1b. Add Environment Variables (After Step 2 Backend Deployment)
1. Go to your Vercel project settings → **"Environment Variables"**
2. Add one variable:
   - **Name**: `VITE_API_BASE`
   - **Value**: `https://your-railway-url.up.railway.app` (you'll get this from Railway)
3. Redeploy: Click **"Deployments"** → Click on the latest → **"Redeploy"**
=======
### 1b. Frontend Backend URL
The frontend is configured in code to use `https://update-tool.onrender.com`.
After code changes, redeploy: Click **"Deployments"** → Click on the latest → **"Redeploy"**.
>>>>>>> be3e839df724e02efd83e87e9ea6c4fd6962d4d1

You now have a live frontend! (e.g., `https://update-tool-abc123.vercel.app`)

---

<<<<<<< HEAD
## Step 2: Deploy Backend to Railway

### 2a. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub"**
4. Authorize Railway with GitHub
5. Search and select your repo: `Update-Tool`
6. Railway detects the Node.js project and starts building

### 2b. Set Environment Variables
In Railway dashboard → **"Variables"** tab, add:
=======
## Step 2: Deploy Backend to Render

### 2a. Create Render Web Service
1. Go to [render.com](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Select **"Build and deploy from a Git repository"**
4. Authorize Render with GitHub
5. Search and select your repo: `Update-Tool`
6. Render can use the committed `render.yaml`, or you can enter the commands manually

### 2b. Set Environment Variables
In Render dashboard → **"Environment"** tab, add:
>>>>>>> be3e839df724e02efd83e87e9ea6c4fd6962d4d1

```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
<<<<<<< HEAD
GOOGLE_REDIRECT_URI=https://your-railway-url.up.railway.app/auth/google/callback
=======
GOOGLE_REDIRECT_URI=https://update-tool.onrender.com/auth/google/callback
FRONTEND_URL=https://update-tool-five.vercel.app
>>>>>>> be3e839df724e02efd83e87e9ea6c4fd6962d4d1
CHAT_WEBHOOK_SPACE_DEVELOPMENT=https://chat.googleapis.com/v1/spaces/AAA.../messages?key=...
CHAT_WEBHOOK_SPACE_DESIGN=https://chat.googleapis.com/v1/spaces/BBB.../messages?key=...
(and other chat webhooks if needed)
```

<<<<<<< HEAD
⚠️ **Important**: Replace `https://your-railway-url.up.railway.app` with the actual Railway URL once assigned.

### 2c. Configure Start Command
Railway should auto-detect `server/package.json`, but ensure:
1. Go to **"Settings"** tab
2. Set **"Build Command"** to: `npm install` (if needed)
3. Set **"Start Command"** to: `cd server && npm run dev` (or update `server/package.json` `start` script)

Railway will build and deploy. You'll get a public URL like: `https://update-tool-prod-randomid.up.railway.app`

---

## Step 3: Update Frontend API Base

Once Railway is live:
1. Copy the Railway URL (e.g., `https://update-tool-prod-randomid.up.railway.app`)
2. Go to Vercel → Project Settings → Environment Variables
3. Update `VITE_API_BASE` to the Railway URL
4. Redeploy frontend (Vercel will rebuild and pick up the new API base)
=======
⚠️ **Important**: In Google Cloud Console, add `https://update-tool.onrender.com/auth/google/callback` as an authorized redirect URI.

### 2c. Configure Start Command
Render should use `render.yaml`, but if configuring manually:
1. Go to **"Settings"** tab
2. Set **"Build Command"** to: `npm install && npm install --prefix server`
3. Set **"Start Command"** to: `cd server && npm start`

Render will build and deploy the backend at `https://update-tool.onrender.com`.

---

## Step 3: Confirm Frontend Backend URL

Once Render is live:
1. Use the Render URL: `https://update-tool.onrender.com`
2. Redeploy frontend so Vercel rebuilds with the latest code
>>>>>>> be3e839df724e02efd83e87e9ea6c4fd6962d4d1

---

## Step 4: Test Production

1. Visit your Vercel frontend URL
2. Sign in as any user
3. Click profile → **"Connect Gmail"**
4. Approve OAuth consent
5. Submit an update or comment
6. Verify:
<<<<<<< HEAD
   - Token stored in Railway (`server/tokens.json`)
   - Update persisted in Railway (`server/updates.json`)
=======
   - Token stored by the Render backend (`server/tokens.json`)
   - Update persisted by the Render backend (`server/updates.json`)
>>>>>>> be3e839df724e02efd83e87e9ea6c4fd6962d4d1
   - Email sent from Gmail account

---

## Troubleshooting

### "Google OAuth credentials are not configured"
<<<<<<< HEAD
- Check Railway environment variables are set correctly
- Ensure `GOOGLE_REDIRECT_URI` matches the actual Railway URL

### Updates not persisting
- Railway stores files in `/tmp` by default (ephemeral)
=======
- Check Render environment variables are set correctly
- Ensure `GOOGLE_REDIRECT_URI` matches `https://update-tool.onrender.com/auth/google/callback`

### Updates not persisting
- Render file storage on free web services is ephemeral
>>>>>>> be3e839df724e02efd83e87e9ea6c4fd6962d4d1
- For persistent storage, migrate to PostgreSQL or MongoDB
- Temp solution: Add a cron job to back up `tokens.json` and `updates.json` to GitHub

### Email not sending
- Verify sender's Gmail is connected (token stored in `tokens.json`)
<<<<<<< HEAD
- Check Railway logs for API errors: Railway Dashboard → Logs
=======
- Check Render logs for API errors: Render Dashboard → Logs
>>>>>>> be3e839df724e02efd83e87e9ea6c4fd6962d4d1

---

## Production Improvements (Future)

To avoid file storage limitations on serverless/ephemeral platforms:

1. **Use a Database** (PostgreSQL, MongoDB)
   - Migrate `tokenStore.js` and `updatesStore.js` to use a database client
<<<<<<< HEAD
   - Railway provides free PostgreSQL add-on

2. **Separate Deployments**
   - Backend: Railway Node.js server (file storage OK)
=======
   - Render provides managed PostgreSQL

2. **Separate Deployments**
   - Backend: Render Node.js server
>>>>>>> be3e839df724e02efd83e87e9ea6c4fd6962d4d1
   - Frontend: Vercel (static, no backend needed)

3. **GitHub Actions CI/CD**
   - Auto-deploy on push to main branch

Let me know if you need help with any of these steps!
