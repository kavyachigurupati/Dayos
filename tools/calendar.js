const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const TOKENS_PATH = path.join(__dirname, '../tokens.json');
const CREDENTIALS_PATH = path.join(__dirname, '../credentials.json');

// calendar read+write + gmail send — all via same OAuth token
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/gmail.send',
];

function isConnected() {
  return fs.existsSync(TOKENS_PATH) && fs.existsSync(CREDENTIALS_PATH);
}

// Returns an OAuth2 client without tokens — used during the initial OAuth flow
function createAuthClient() {
  const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  const c = raw.web || raw.installed || raw;
  return new google.auth.OAuth2(
    c.client_id,
    c.client_secret,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
  );
}

// Returns an OAuth2 client with stored tokens — used for actual API calls
function getAuthClient() {
  const auth = createAuthClient();
  auth.setCredentials(JSON.parse(fs.readFileSync(TOKENS_PATH)));
  return auth;
}

async function getCalendarEvents(date) {
  if (!isConnected()) return [];

  const auth = getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  const target = date ? new Date(date) : new Date();
  const start = new Date(target); start.setHours(0, 0, 0, 0);
  const end = new Date(target);   end.setHours(23, 59, 59, 999);

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  return (res.data.items || []).map(event => ({
    id: event.id,
    title: event.summary || '',
    start: event.start?.dateTime || event.start?.date,
    end: event.end?.dateTime || event.end?.date,
    duration: event.start?.dateTime && event.end?.dateTime
      ? Math.round((new Date(event.end.dateTime) - new Date(event.start.dateTime)) / 60000) + ' min'
      : undefined,
  }));
}

async function createCalendarEvent({ title, date, startTime, endTime, description, recurrence }) {
  if (!isConnected()) throw new Error('Google Calendar not connected.');

  const auth = getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });

  // Build ISO datetime strings — e.g. date='2026-05-05', startTime='09:00'
  const start = new Date(`${date}T${startTime}:00`);
  const end   = new Date(`${date}T${endTime}:00`);

  const event = {
    summary: title,
    description: description || '',
    start: { dateTime: start.toISOString(), timeZone: 'America/New_York' },
    end:   { dateTime: end.toISOString(),   timeZone: 'America/New_York' },
  };

  // Optional recurrence — e.g. 'WEEKLY' or 'DAILY'
  if (recurrence) {
    event.recurrence = [`RRULE:FREQ=${recurrence.toUpperCase()}`];
  }

  const res = await calendar.events.insert({ calendarId: 'primary', resource: event });
  return { id: res.data.id, title, date, startTime, endTime };
}

async function deleteCalendarEvent(eventId) {
  if (!isConnected()) throw new Error('Google Calendar not connected.');

  const auth = getAuthClient();
  const calendar = google.calendar({ version: 'v3', auth });
  await calendar.events.delete({ calendarId: 'primary', eventId });
  return { deleted: eventId };
}

module.exports = { getCalendarEvents, createCalendarEvent, deleteCalendarEvent, isConnected, createAuthClient, getAuthClient, SCOPES };
