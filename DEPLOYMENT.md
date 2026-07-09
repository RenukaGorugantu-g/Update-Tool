# Deployment Guide

This guide covers deploying Updates Tool to production using **Vercel** (frontend) and **Render** (backend).

## Prerequisites

- GitHub account with your repo pushed
- Vercel account (free, auto-created from GitHub)
- Render account
- Google OAuth credentials (already set up locally)

## Step 1: Deploy Frontend to Vercel

### 1a. Import Project
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Paste your GitHub repo URL: `https://github.com/RenukaGorugantu-g/Update-Tool`
5. Vercel auto-detects the build settings (build: `npm run build`, output: `dist`)
6. Click **"Deploy"** (takes 1-2 minutes)

### 1b. Frontend Backend URL
The frontend is configured in code to use `https://update-tool.onrender.com`.
After code changes, redeploy: Click **"Deployments"** → Click on the latest → **"Redeploy"**.

You now have a live frontend! (e.g., `https://update-tool-abc123.vercel.app`)

---

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

```
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=https://update-tool.onrender.com/auth/google/callback
FRONTEND_URL=https://update-tool-five.vercel.app
CHAT_WEBHOOK_SPACE_DEVELOPMENT=https://chat.googleapis.com/v1/spaces/AAA.../messages?key=...
CHAT_WEBHOOK_SPACE_DESIGN=https://chat.googleapis.com/v1/spaces/BBB.../messages?key=...
(and other chat webhooks if needed)
```

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

---

## Step 4: Test Production

1. Visit your Vercel frontend URL
2. Sign in as any user
3. Click profile → **"Connect Gmail"**
4. Approve OAuth consent
5. Submit an update or comment
6. Verify:
   - Token stored by the Render backend (`server/tokens.json`)
   - Update persisted by the Render backend (`server/updates.json`)
   - Email sent from Gmail account

---

## Troubleshooting

### "Google OAuth credentials are not configured"
- Check Render environment variables are set correctly
- Ensure `GOOGLE_REDIRECT_URI` matches `https://update-tool.onrender.com/auth/google/callback`

### Updates not persisting
- Render file storage on free web services is ephemeral
- For persistent storage, migrate to PostgreSQL or MongoDB
- Temp solution: Add a cron job to back up `tokens.json` and `updates.json` to GitHub

### Email not sending
- Verify sender's Gmail is connected (token stored in `tokens.json`)
- Check Render logs for API errors: Render Dashboard → Logs

---

## Production Improvements (Future)

To avoid file storage limitations on serverless/ephemeral platforms:

1. **Use a Database** (PostgreSQL, MongoDB)
   - Migrate `tokenStore.js` and `updatesStore.js` to use a database client
   - Render provides managed PostgreSQL

2. **Separate Deployments**
   - Backend: Render Node.js server
   - Frontend: Vercel (static, no backend needed)

3. **GitHub Actions CI/CD**
   - Auto-deploy on push to main branch

Let me know if you need help with any of these steps!
