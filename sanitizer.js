/**
 * sanitizer.js — Layer 1 of DAYOS privacy architecture
 *
 * Field whitelist approach: only explicitly allowed fields leave the device.
 * Attendees, descriptions, and exact addresses are never included — not stripped, just never forwarded.
 */

function sanitizeEvent(event) {
  return {
    title: event.title || event.summary || '',
    start: event.start,
    end: event.end,
    duration: event.duration,
  };
}

function sanitizeEvents(events) {
  if (!Array.isArray(events)) return [];
  return events.map(sanitizeEvent);
}

/**
 * Sanitize raw context before it leaves the device.
 *
 * @param {object} rawData
 * @param {Array}  rawData.events   — raw calendar events from Google Calendar API
 * @param {object} rawData.profile  — full profile.json object
 * @returns {object} cleanContext — safe to send to the model
 */
function sanitize(rawData = {}) {
  const { events, profile } = rawData;
  const clean = {};

  if (profile) {
    clean.city = profile.identity?.city || 'New York';
    clean.interests = profile.interests;
    clean.recurring_commitments = profile.recurring_commitments;
    clean.upcoming_plans = profile.upcoming_plans;
    clean.conference_interests = profile.conference_interests;
    clean.habits = profile.habits;
    clean.reminders = profile.reminders;
    clean.proactive_suggestions = profile.proactive_suggestions;
    clean.behavioral_patterns = profile.behavioral_patterns;
  }

  if (events) {
    clean.schedule = sanitizeEvents(events);
  }

  return clean;
}

module.exports = { sanitize, sanitizeEvent, sanitizeEvents };
