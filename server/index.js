import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';
import { createTokenStore } from './tokenStore.js';
import { loadServerEnv } from './envConfig.js';
import { createUpdatesStore } from './updatesStore.js';
import { createUsersStore } from './usersStore.js';
import { createTemplatesStore } from './templatesStore.js';
import { createRemindersStore } from './remindersStore.js';
import { createNotificationService } from './notificationService.js';
import { createAttendanceStore } from './attendanceStore.js';

loadServerEnv();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const PORT = process.env.PORT || 5000;
const gmailClientId = process.env.GOOGLE_CLIENT_ID;
const gmailClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const defaultFrontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const isLocalServer = !process.env.RENDER && !process.env.RENDER_SERVICE_ID && process.env.NODE_ENV !== 'production';
const configuredRedirectUri = process.env.GOOGLE_REDIRECT_URI || process.env.GOOGLE_REDIRECT_URI_CALLBACK;
const isInvalidProductionRedirectUri = !configuredRedirectUri || configuredRedirectUri === 'https://developers.google.com/oauthplayground' || (!isLocalServer && configuredRedirectUri.includes('localhost'));
const redirectUri = configuredRedirectUri || (isInvalidProductionRedirectUri ? 'https://update-tool.onrender.com/auth/google/callback' : 'http://localhost:5000/auth/google/callback');

const tokenStore = createTokenStore();
const updatesStore = createUpdatesStore();
const fileUsersStore = createUsersStore();
const templatesStore = createTemplatesStore();
const remindersStore = createRemindersStore();
const attendanceStore = createAttendanceStore();

// File-backed users store. Seeds default users when users.json is empty.
const initialUsers = [
  {
    "id": "u-admin",
    "name": "Admin Root",
    "email": "info@maplelearningsolutions.com",
    "role": "admin",
    "department": "Management",
    "pod": "India Pod",
    "reportingManager": "Board",
    "employeeId": "MP-0000",
    "active": true,
    "avatarColor": "#dc2626",
    "password": "admin"
  },
  {
    "id": "u-sandeep",
    "name": "Sandeep M",
    "email": "sandeep@maplelearningsolutions.com",
    "role": "executive",
    "department": "Executive Board",
    "pod": "India Pod",
    "reportingManager": "CEO",
    "employeeId": "MP-0001",
    "active": true,
    "avatarColor": "#ec4899",
    "password": "executive"
  },
  {
    "id": "u-krishna",
    "name": "Krishna",
    "email": "krishna@maplelearningsolutions.com",
    "role": "executive",
    "department": "Executive Board",
    "pod": "India Pod",
    "reportingManager": "CEO",
    "employeeId": "MP-0002",
    "active": true,
    "avatarColor": "#6366f1",
    "password": "executive"
  },
  {
    "id": "u-rathish",
    "name": "Rathish",
    "email": "rathish@maplelearningsolutions.com",
    "role": "executive",
    "department": "Executive Board",
    "pod": "UAE Pod",
    "reportingManager": "CEO",
    "employeeId": "MP-0003",
    "active": true,
    "avatarColor": "#f59e0b",
    "password": "executive"
  }
];

let usersStoreData = null;

const normalizeUsers = (users) => {
  if (!Array.isArray(users)) return [];
  return users.map((user) => ({
    ...user,
    email: String(user.email || '').trim().toLowerCase(),
    employeeId: String(user.employeeId || '').trim(),
    active: user.active !== false,
    password: user.password || 'password'
  }));
};

const usersStore = {
  async getAll() {
    if (usersStoreData) {
      return usersStoreData;
    }

    const persistedUsers = normalizeUsers(await fileUsersStore.getAll());
    usersStoreData = persistedUsers.length > 0 ? persistedUsers : normalizeUsers(initialUsers);
    if (persistedUsers.length === 0) {
      await fileUsersStore.save(usersStoreData);
    }

    return usersStoreData;
  },
  async save(users) {
    if (!Array.isArray(users)) {
      throw new Error('Users must be an array.');
    }
    usersStoreData = normalizeUsers(users);
    await fileUsersStore.save(usersStoreData);
    return usersStoreData;
  }
};

const oauthScopes = [
  'https://www.googleapis.com/auth/gmail.send',
  'openid',
  'email',
  'profile'
];

const EXPECTED_CHAT_SPACES = [
  'space_development',
  'space_design',
  'space_marketing',
  'space_sales',
  'space_client_success',
  'space_general'
];

const chatWebhookMap = Object.keys(process.env)
  .filter((key) => key.startsWith('CHAT_WEBHOOK_SPACE_'))
  .reduce((map, key) => {
    const suffix = key.slice('CHAT_WEBHOOK_SPACE_'.length).toLowerCase();
    const webhookKey = `space_${suffix}`;
    return {
      ...map,
      [webhookKey]: process.env[key]
    };
  }, {});

const configuredChatSpaces = Object.keys(chatWebhookMap).filter((spaceId) => Boolean(chatWebhookMap[spaceId]));
const configuredGeneralWebhook = chatWebhookMap.space_general || configuredChatSpaces.length > 0 ? chatWebhookMap[configuredChatSpaces[0]] : undefined;

console.log('Google Chat configured spaces:', configuredChatSpaces);

// Create the Google OAuth client used by both the consent and Gmail send flow.
const createOAuth2Client = () => {
  if (!gmailClientId || !gmailClientSecret) {
    throw new Error('Missing Gmail OAuth client credentials.');
  }

  return new google.auth.OAuth2(gmailClientId, gmailClientSecret, redirectUri);
};

// Build the Google OAuth consent URL with offline access so a refresh token is returned.
const buildGoogleAuthUrl = (returnTo = defaultFrontendUrl) => {
  const statePayload = { returnTo };
  const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');

  authUrl.searchParams.set('client_id', gmailClientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', oauthScopes.join(' '));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);

  return authUrl.toString();
};

// Decode the return URL stored in the OAuth state payload.
const getReturnToUrl = (stateValue) => {
  if (!stateValue) {
    return defaultFrontendUrl;
  }

  try {
    const decodedState = JSON.parse(Buffer.from(String(stateValue), 'base64url').toString('utf8'));
    if (decodedState.returnTo && typeof decodedState.returnTo === 'string') {
      return decodedState.returnTo;
    }
  } catch (error) {
    console.warn('Unable to parse OAuth state payload:', error);
  }

  return defaultFrontendUrl;
};

// Fetch the signed-in user's profile from Google's OAuth2 API.
const getGoogleUserProfile = async (accessToken) => {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const profile = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(profile.error?.message || 'Unable to read the authenticated Google account profile.');
  }

  if (!profile.email) {
    throw new Error('Google did not return an email address for the authenticated user.');
  }

  return {
    email: profile.email.toLowerCase(),
    name: profile.name || profile.email
  };
};

const resolveSenderEmail = async (preferredSenderEmail) => {
  const candidates = [
    String(preferredSenderEmail || '').trim().toLowerCase(),
    String(process.env.GMAIL_SENDER_EMAIL || '').trim().toLowerCase(),
    String(process.env.DEFAULT_GMAIL_SENDER || '').trim().toLowerCase()
  ].filter(Boolean);

  for (const candidate of candidates) {
    const account = await tokenStore.getToken(candidate);
    if (account?.refreshToken) {
      return candidate;
    }
  }

  const connectedAccounts = Object.keys(await tokenStore.getAll() || {});
  for (const candidate of connectedAccounts) {
    const account = await tokenStore.getToken(candidate);
    if (account?.refreshToken) {
      return candidate;
    }
  }

  return candidates[0] || connectedAccounts[0] || '';
};

// Send an email using the stored refresh token for the selected sender account.
const sendGmailMessage = async ({ senderEmail, to, subject, message }) => {
  const resolvedSenderEmail = await resolveSenderEmail(senderEmail);
  const account = resolvedSenderEmail ? await tokenStore.getToken(resolvedSenderEmail) : null;
  if (!account?.refreshToken) {
    throw new Error('Google account not connected.');
  }

  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: account.refreshToken });
    await oauth2Client.getAccessToken();

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const emailLines = [
      `From: ${resolvedSenderEmail}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=UTF-8',
      '',
      message
    ];

    const raw = Buffer.from(emailLines.join('\r\n'), 'utf-8')
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw
      }
    });

    return response.data;
  } catch (error) {
    const messageText = error?.response?.data?.error?.message || error?.message || 'Unknown Gmail API error';
    if (/invalid_grant|invalid_client|invalid credentials|unauthorized/i.test(messageText)) {
      throw new Error('Google OAuth credentials are invalid or expired. Reconnect the Gmail account.');
    }

    if (/network|fetch/i.test(messageText)) {
      throw new Error('Network error while contacting Gmail. Please try again.');
    }

    throw new Error(`Gmail API error: ${messageText}`);
  }
};

// Send a message payload to a Google Chat webhook.
const sendChatMessage = async (spaceId, payload) => {
  // const webhook = chatWebhookMap[spaceId];
  // if (!webhook) {
  //   throw new Error(`No webhook configured for chat space ${spaceId}`);
  // }
   const webhook =
    chatWebhookMap[spaceId] ||
    chatWebhookMap.space_mels;

  if (!webhook) {
    throw new Error(`No webhook configured for chat space ${spaceId}`);
  }

  const requestBody = typeof payload === 'string' ? { text: payload } : payload;
  const bodyString = JSON.stringify(requestBody, null, 2);
  console.log('Google Chat webhook payload:', bodyString);

  const response = await fetch(webhook, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: bodyString
  });

  const bodyJson = await response.text();
  if (!response.ok) {
    throw new Error(`Google Chat webhook failed: ${response.status} ${bodyJson}`);
  }

  return { status: response.status, body: bodyJson };
};

const notificationService = createNotificationService({
  sendGmailMessage,
  sendChatMessage
});

// Start the OAuth consent flow for the current user.
app.get('/auth/google', (req, res) => {
  const returnTo = typeof req.query.returnTo === 'string' ? req.query.returnTo : defaultFrontendUrl;

  if (!gmailClientId || !gmailClientSecret) {
    // Redirect back to frontend with an error message so the UI can show guidance
    try {
      const redirectTarget = new URL(returnTo, defaultFrontendUrl);
      redirectTarget.searchParams.set('gmail', 'error');
      redirectTarget.searchParams.set('gmailMessage', encodeURIComponent('Google OAuth credentials are not configured on the backend. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server/.env and restart the server.'));
      return res.redirect(redirectTarget.toString());
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Google OAuth credentials are not configured.' });
    }
  }

  return res.redirect(buildGoogleAuthUrl(returnTo));
});

// Exchange the authorization code for tokens and persist the refresh token for the signed-in Gmail account.
app.get('/auth/google/callback', async (req, res) => {
  const { code, error, state } = req.query;
  const returnTo = getReturnToUrl(state);

  if (error) {
    console.error('Google OAuth callback error:', error);
    return res.status(400).send(`Gmail authorization failed: ${error}`);
  }

  if (!code) {
    return res.status(400).send('The Google OAuth callback did not include an authorization code.');
  }

  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(String(code));
    const accessToken = tokens.access_token;

    if (!accessToken) {
      throw new Error('Google did not return an access token.');
    }

    const profile = await getGoogleUserProfile(accessToken);
    const storedRefreshToken = tokens.refresh_token || (await tokenStore.getToken(profile.email))?.refreshToken;

    if (!storedRefreshToken) {
      throw new Error('Google did not return a refresh token. Please reconnect and grant offline access.');
    }

    await tokenStore.saveToken(profile.email, {
      refreshToken: storedRefreshToken,
      name: profile.name
    });

    const redirectTarget = new URL(returnTo, defaultFrontendUrl);
    redirectTarget.searchParams.set('gmail', 'connected');
    redirectTarget.searchParams.set('gmailEmail', profile.email);
    redirectTarget.searchParams.set('redirectUri', redirectUri);
    return res.redirect(redirectTarget.toString());
  } catch (error) {
    console.error('google callback error:', error);
    const redirectTarget = new URL(returnTo, defaultFrontendUrl);
    redirectTarget.searchParams.set('gmail', 'error');
    const message = /invalid_client/i.test(error.message)
      ? 'Google OAuth client ID and client secret do not match. Copy both values from the same Web application OAuth client into Render, then redeploy.'
      : error.message;
    redirectTarget.searchParams.set('gmailMessage', encodeURIComponent(message));
    return res.redirect(redirectTarget.toString());
  }
});

// Users persistence API (for cross-device employee list sync)
app.get('/api/users', async (req, res) => {
  try {
    const users = await usersStore.getAll();
    return res.json({ success: true, users });
  } catch (error) {
    console.error('get users error:', error);
    return res.status(500).json({ success: false, error: 'Unable to read users.' });
  }
});

// Templates API
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await templatesStore.getAll();
    return res.json({ success: true, templates });
  } catch (err) {
    console.error('get templates error:', err);
    return res.status(500).json({ success: false, error: 'Unable to read templates.' });
  }
});

app.post('/api/templates', async (req, res) => {
  const data = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({ success: false, error: 'Templates payload must be an array.' });
  }

  try {
    const saved = await templatesStore.save(data);
    return res.json({ success: true, templates: saved });
  } catch (err) {
    console.error('save templates error:', err);
    return res.status(500).json({ success: false, error: 'Unable to persist templates.' });
  }
});

// Reminders API
app.get('/api/reminders', async (req, res) => {
  try {
    const reminders = await remindersStore.getAll();
    return res.json({ success: true, reminders });
  } catch (err) {
    console.error('get reminders error:', err);
    return res.status(500).json({ success: false, error: 'Unable to read reminders.' });
  }
});

app.post('/api/reminders', async (req, res) => {
  const data = req.body;
  if (!Array.isArray(data)) {
    return res.status(400).json({ success: false, error: 'Reminders payload must be an array.' });
  }

  try {
    const saved = await remindersStore.save(data);
    return res.json({ success: true, reminders: saved });
  } catch (err) {
    console.error('save reminders error:', err);
    return res.status(500).json({ success: false, error: 'Unable to persist reminders.' });
  }
});

app.post('/api/users', async (req, res) => {
  const users = req.body;
  if (!Array.isArray(users)) {
    return res.status(400).json({ success: false, error: 'Users payload must be an array.' });
  }

  try {
    const saved = await usersStore.save(users);
    return res.json({ success: true, users: saved });
  } catch (error) {
    console.error('save users error:', error);
    return res.status(500).json({ success: false, error: 'Unable to persist users.' });
  }
});

// Attendance persistence API
app.get('/api/attendance', async (req, res) => {
  try {
    const items = await attendanceStore.getAll();
    return res.json({ success: true, attendance: items });
  } catch (error) {
    console.error('get attendance error:', error);
    return res.status(500).json({ success: false, error: 'Unable to read attendance.' });
  }
});

app.post('/api/attendance', async (req, res) => {
  try {
    const entry = req.body;
    if (!entry || !entry.userId) {
      return res.status(400).json({ success: false, error: 'attendance entry requires userId.' });
    }
    const saved = await attendanceStore.save(entry);
    return res.json({ success: true, attendance: saved });
  } catch (error) {
    console.error('save attendance error:', error);
    return res.status(500).json({ success: false, error: 'Unable to persist attendance.' });
  }
});

app.get('/api/attendance/export', async (req, res) => {
  try {
    const items = await attendanceStore.getAll();
    const { userId, email, employeeName, date } = req.query;
    const normalizedUserId = userId ? String(userId).trim().toLowerCase() : '';
    const normalizedEmail = email ? String(email).trim().toLowerCase() : '';
    const normalizedEmployeeName = employeeName ? String(employeeName).trim().toLowerCase() : '';
    const normalizedDate = date ? String(date).trim().toLowerCase() : '';
    const filtered = items.filter((entry) => {
      const entryUserId = String(entry.userId || '').trim().toLowerCase();
      const entryEmail = String(entry.email || '').trim().toLowerCase();
      const entryEmployeeName = String(entry.employeeName || '').trim().toLowerCase();
      const matchesUserId = !normalizedUserId || entryUserId === normalizedUserId;
      const matchesEmail = !normalizedEmail || entryEmail === normalizedEmail || entryUserId === normalizedEmail || entryEmployeeName === normalizedEmail;
      const matchesEmployeeName = !normalizedEmployeeName || entryEmployeeName.includes(normalizedEmployeeName) || entryEmail.includes(normalizedEmployeeName) || entryUserId.includes(normalizedEmployeeName);
      const matchesDate = !normalizedDate || String(entry.date || '').trim().toLowerCase() === normalizedDate;
      return (matchesUserId || matchesEmail || matchesEmployeeName) && matchesDate;
    });
    const header = 'Employee Name,Email,Department,Date,Login,Logout,Working Hours,Idle Time,Productive Hours,Attendance Status,Office/Remote,IP Address,Browser,Operating System,Device\n';
    const rows = filtered.map((entry) => {
      const values = [
        entry.employeeName || '',
        entry.email || '',
        entry.department || '',
        entry.date || '',
        entry.loginTime || '',
        entry.logoutTime || '',
        entry.workingHours || '',
        entry.idleTime || '',
        entry.productiveHours || '',
        entry.status || '',
        entry.officeRemote || '',
        entry.ipAddress || '',
        entry.browser || '',
        entry.os || '',
        entry.device || ''
      ];
      return values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',');
    }).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="attendance-export.csv"');
    return res.end(header + rows);
  } catch (error) {
    console.error('export attendance error:', error);
    return res.status(500).json({ success: false, error: 'Unable to export attendance.' });
  }
});

// Updates persistence API
app.get('/api/updates', async (req, res) => {
  try {
    const items = await updatesStore.getAll();
    return res.json({ success: true, updates: items });
  } catch (error) {
    console.error('get updates error:', error);
    return res.status(500).json({ success: false, error: 'Unable to read updates.' });
  }
});

app.post('/api/updates', async (req, res) => {
  const { sendNotification = true, ...updatePayload } = req.body;
  if (!updatePayload) return res.status(400).json({ success: false, error: 'Update payload required.' });

  try {
    if (!updatePayload.id) {
      updatePayload.id = `up-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    }

    const saved = await updatesStore.save(updatePayload);
    let notificationResult = null;

    if (sendNotification) {
      try {
        notificationResult = await notificationService.notifyUpdateSubmission({
          update: saved,
          user: updatePayload.user || null
        });
      } catch (notifyError) {
        console.error('Notification error:', notifyError);
        // Don't fail the request if notification fails
      }
    }

    return res.json({ success: true, update: saved, notification: notificationResult });
  } catch (error) {
    console.error('save update error:', error);
    return res.status(500).json({ success: false, error: 'Unable to persist update.' });
  }
});

app.delete('/api/updates', async (req, res) => {
  try {
    await updatesStore.clearAll();
    return res.json({ success: true, cleared: true });
  } catch (error) {
    console.error('clear updates error:', error);
    return res.status(500).json({ success: false, error: 'Unable to clear updates.' });
  }
});

app.delete('/api/updates/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const removed = await updatesStore.remove(id);
    if (!removed) return res.status(404).json({ success: false, error: 'Update not found.' });
    return res.json({ success: true });
  } catch (error) {
    console.error('delete update error:', error);
    return res.status(500).json({ success: false, error: 'Unable to delete update.' });
  }
});

// Do not automatically delete saved updates on startup. Updates remain until the admin removes them.
// If cleanup is required, it can be triggered explicitly by an admin-specific endpoint later.

app.post('/api/send-gmail', async (req, res) => {
  const senderEmail = req.body.senderEmail || req.body.fromEmail || req.body.sender || req.body.gmailSenderEmail;
  const to = req.body.to || req.body.recipientEmail || req.body.toEmail;
  const subject = req.body.subject;
  const message = req.body.message || req.body.body;

  if (!senderEmail || !to || !subject || !message) {
    return res.status(400).json({ success: false, error: 'senderEmail, to, subject and message are required.' });
  }

  try {
    const result = await sendGmailMessage({ senderEmail, to, subject, message });
    return res.json({ success: true, result });
  } catch (error) {
    console.error('send-gmail error:', error);
    if (error.message === 'Google account not connected.') {
      return res.status(404).json({ success: false, error: error.message });
    }

    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/send-chat', async (req, res) => {
  const { spaceId, text } = req.body;
  if (!spaceId || !text) {
    return res.status(400).json({ error: 'spaceId and text are required.' });
  }

  try {
    const result = await sendChatMessage(spaceId, text);
    return res.json({ ok: true, result });
  } catch (error) {
    console.error('send-chat error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  return res.json({ ok: true, message: 'Backend is running.' });
});

app.get('/api/integrations/status', async (req, res) => {
  const connectedGmailAccounts = Object.keys(await tokenStore.getAll());
  const configuredChatSpaces = Object.entries(chatWebhookMap)
    .filter(([, webhook]) => Boolean(webhook))
    .map(([spaceId]) => spaceId);

  return res.json({
    success: true,
    gmail: {
      oauthConfigured: Boolean(gmailClientId && gmailClientSecret),
      clientId: gmailClientId || null,
      redirectUri,
      connectedAccounts: connectedGmailAccounts
    },
    chat: {
      configuredSpaces: configuredChatSpaces,
      missingSpaces: Object.keys(chatWebhookMap).filter(spaceId => !chatWebhookMap[spaceId])
    }
  });
});

app.listen(PORT, () => {
  console.log(`Updates Tool backend listening on http://localhost:${PORT}`);
});
