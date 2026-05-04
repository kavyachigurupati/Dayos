require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { runAgent } = require('./agent');
const { isConnected, createAuthClient, SCOPES } = require('./tools/calendar');
const { sendBriefingEmail } = require('./tools/email');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const PORT = process.env.PORT || 3000;
const PROFILE_PATH = path.join(__dirname, 'profile.json');
const CREDENTIALS_PATH = path.join(__dirname, 'credentials.json');
const TOKENS_PATH = path.join(__dirname, 'tokens.json');

function loadProfile() {
  try { return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8')); }
  catch { return {}; }
}

function saveProfile(profile) {
  try {
    profile.last_updated = new Date().toISOString().split('T')[0];
    fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2));
  } catch (err) {
    console.error('Could not save profile:', err.message);
  }
}

// ── /plan — morning briefing ────────────────────────────────────────────────

app.post('/plan', async (req, res) => {
  try {
    const profile = loadProfile();
    const { text, usage } = await runAgent(
      'Give me my morning briefing for today. Keep it under 150 words. Include a clickable link wherever relevant — hackathon registration, Luma event page, conference deadline page. Do not include badminton.',
      profile
    );
    res.json({ success: true, briefing: text, usage });
  } catch (err) {
    console.error('/plan error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── /chat — conversational assistant ───────────────────────────────────────

app.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    const profile = loadProfile();
    const { text, usage } = await runAgent(message, profile);
    res.json({ success: true, reply: text, usage });
  } catch (err) {
    console.error('/chat error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── /status — what's connected ─────────────────────────────────────────────

app.get('/status', (req, res) => {
  res.json({ calendarConnected: isConnected() });
});

// ── Google OAuth ────────────────────────────────────────────────────────────

app.get('/auth/google', (req, res) => {
  if (!fs.existsSync(CREDENTIALS_PATH)) {
    return res.status(400).send('credentials.json not found. Add your Google OAuth credentials first.');
  }
  const auth = createAuthClient();
  const url = auth.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const auth = createAuthClient();
    const { tokens } = await auth.getToken(code);
    fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
    res.send('<script>window.close();</script>Connected! You can close this tab.');
  } catch (err) {
    res.status(500).send('OAuth failed: ' + err.message);
  }
});

// ── /profile ────────────────────────────────────────────────────────────────

app.get('/profile', (req, res) => res.json(loadProfile()));

app.patch('/profile', (req, res) => {
  try {
    const profile = loadProfile();
    for (const key of Object.keys(req.body)) {
      if (Array.isArray(req.body[key]) && Array.isArray(profile[key])) {
        profile[key] = [...new Set([...profile[key], ...req.body[key]])];
      } else {
        profile[key] = req.body[key];
      }
    }
    saveProfile(profile);
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── morning briefing cron ───────────────────────────────────────────────────

function getBriefingSchedule() {
  try {
    const profile = loadProfile();
    const time = profile.briefing_time || '08:00';
    const [hour, minute] = time.split(':');
    return `${minute} ${hour} * * *`;
  } catch {
    return '0 8 * * *'; // default 8:00am
  }
}

cron.schedule(getBriefingSchedule(), async () => {
  const profile = loadProfile();
  const to = profile.briefing_email || process.env.EMAIL_USER;

  if (!to) {
    console.log('Morning briefing skipped — no email address set.');
    return;
  }

  console.log(`Running morning briefing for ${to}...`);

  try {
    const { text: briefing } = await runAgent(
      'Give me my morning briefing for today. Keep it under 150 words. Include a clickable link wherever relevant — hackathon registration, Luma event page, conference deadline page. Do not include badminton.',
      profile
    );
    const date = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
    await sendBriefingEmail({ to, briefing, date });
    console.log(`Morning briefing sent to ${to}`);
  } catch (err) {
    console.error('Morning briefing failed:', err.message);
  }
}, { timezone: 'America/New_York' });

// ── start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  const profile = loadProfile();
  const time = profile.briefing_time || '08:00';
  const email = profile.briefing_email || process.env.EMAIL_USER || 'not set';
  console.log(`DAYOS running at http://localhost:${PORT}`);
  console.log(`Morning briefing scheduled at ${time} ET → ${email}`);
});
