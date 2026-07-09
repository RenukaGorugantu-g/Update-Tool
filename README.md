# Updates Tool

Updates Tool is a full-stack employee update tracking platform with live Gmail and Google Chat notifications, built with React + TypeScript + Vite (frontend) and Express (backend).

## Local Development

### Gmail OAuth Setup

1. Copy [server/.env.example](server/.env.example) to [server/.env](server/.env).
2. Fill in your Google OAuth credentials:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback`
3. Add the Google Chat incoming webhook URLs if you want chat notifications.

### Running Locally

Start both servers:
```bash
# Terminal 1: Backend
npm run server:dev

# Terminal 2: Frontend
npm run dev
```

Frontend runs on `http://localhost:5174` and connects to backend at `http://localhost:5000`.

## How Gmail OAuth Works

1. User clicks "Connect Gmail" in the profile dropdown.
2. Redirected to Google's consent screen (scopes: gmail.send, email, profile, openid).
3. User approves → backend receives refresh token and stores it by email.
4. When user sends an email/comment, the backend uses their stored token to send from their Gmail account.

Tokens are stored in [server/tokens.json](server/tokens.json) (modular storage layer in [server/tokenStore.js](server/tokenStore.js)).

## Updates Persistence

Employee updates and comments are stored server-side in [server/updates.json](server/updates.json) and kept for at least 7 days. Users can manually delete updates via the API.

## Production Deployment

### Frontend → Vercel

1. Push your repo to GitHub (already done: `https://github.com/RenukaGorugantu-g/Update-Tool`)
2. Go to [vercel.com](https://vercel.com) → Import Project → Select your GitHub repo
3. Vercel auto-detects the build command and output directory
4. Deploy. The frontend is configured to use `https://update-tool.onrender.com`.

### Backend → Render

1. Go to [render.com](https://render.com) → New → Web Service
2. Select your repo (Updates Tool)
3. Add environment variables (from [server/.env.example](server/.env)):
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `GOOGLE_REDIRECT_URI=https://update-tool.onrender.com/auth/google/callback`
   - Google Chat webhook URLs (if using)
4. Render can use `render.yaml`, or set build command `npm install && npm install --prefix server` and start command `cd server && npm start`
5. Deploy

### Frontend Backend URL

The frontend uses `https://update-tool.onrender.com` for backend requests.

## Testing

### Unit Tests
```bash
cd server
npm test
```

### Build
```bash
npm run build
```

## Project Structure

```
Updates Tool/
├── src/                    # React frontend
│   ├── components/
│   ├── context/           # PulseContext (state management)
│   └── App.tsx
├── server/                # Express backend
│   ├── index.js
│   ├── tokenStore.js      # OAuth token persistence
│   ├── updatesStore.js    # Updates & comments persistence
│   ├── tokens.json        # Stored refresh tokens
│   ├── updates.json       # Stored updates
│   └── package.json
├── dist/                  # Built frontend (Vercel deploys this)
├── package.json
├── vercel.json            # Vercel config
├── render.yaml            # Render backend config
└── README.md
```
