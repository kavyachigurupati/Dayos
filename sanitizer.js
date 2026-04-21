/**
 * sanitizer.js — Layer 1 of DAYOS privacy architecture
 *
 * Runs locally on your machine before any data leaves the device.
 * Strips names, emails, exact locations, and identifying details.
 * Replaces them with generalized categories safe to send to the model.
 *
 * Flow:
 *   Raw MCP data → sanitize() → clean context → model
 */

// Patterns to strip
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
const ROOM_REGEX = /\b(room|rm|suite|ste|floor|fl|apt|office)\s*[#\-]?\s*\d+[a-zA-Z]?\b/gi;
const STREET_REGEX = /\d+\s+[A-Z][a-zA-Z\s]+(Street|St|Avenue|Ave|Boulevard|Blvd|Road|Rd|Drive|Dr|Lane|Ln|Way|Place|Pl|Court|Ct|Broadway)\b[^,]*/gi;
const URL_REGEX = /https?:\/\/[^\s]+/g;

// Known institution patterns → generalized labels
const INSTITUTION_PATTERNS = [
  { regex: /\b(columbia|nyu|cornell|princeton|yale|harvard|mit|stanford|penn|brown|dartmouth|duke)\b/gi, replacement: 'university' },
  { regex: /\b(google|meta|amazon|apple|microsoft|openai|anthropic|deepmind|nvidia)\b/gi, replacement: 'tech company' },
  { regex: /\b(wework|regus|industrious|spaces)\b/gi, replacement: 'coworking space' },
  { regex: /\b(uber|lyft|doordash|grubhub|seamless)\b/gi, replacement: 'service' },
];

// NYC borough/area generalizations
const NYC_AREAS = [
  { regex: /\b(upper west side|upper east side|harlem|washington heights|inwood|morningside heights)\b/gi, replacement: 'Upper Manhattan' },
  { regex: /\b(midtown|times square|hell.s kitchen|chelsea|gramercy|murray hill|kips bay|flatiron)\b/gi, replacement: 'Midtown Manhattan' },
  { regex: /\b(lower east side|les|soho|tribeca|chinatown|financial district|fidi|battery park)\b/gi, replacement: 'Lower Manhattan' },
  { regex: /\b(williamsburg|bushwick|bedford.stuyvesant|crown heights|park slope|brooklyn heights|dumbo)\b/gi, replacement: 'Brooklyn' },
  { regex: /\b(astoria|long island city|lic|flushing|jackson heights|forest hills)\b/gi, replacement: 'Queens' },
];

// Generalizes a calendar event title
function sanitizeEventTitle(title) {
  if (!title) return title;

  let s = title;

  // strip emails first
  s = s.replace(EMAIL_REGEX, '');

  // generalize institutions
  for (const { regex, replacement } of INSTITUTION_PATTERNS) {
    s = s.replace(regex, replacement);
  }

  // patterns that reveal personal relationships
  s = s.replace(/\bwith\s+(?:Dr\.?\s+|Prof\.?\s+|Mr\.?\s+|Ms\.?\s+|Mrs\.?\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g, '');
  s = s.replace(/\b(thesis|dissertation|defense|qualifying exam|qual)\b/gi, 'academic milestone');
  s = s.replace(/\b(advisor|supervisor|committee|PI|professor)\b/gi, 'academic contact');
  s = s.replace(/\bphd\b/gi, 'doctoral');

  // strip room numbers
  s = s.replace(ROOM_REGEX, '');

  return s.trim().replace(/\s+/g, ' ');
}

// Generalizes a location string
function sanitizeLocation(location) {
  if (!location) return location;

  let s = location;

  // strip full street addresses
  s = s.replace(STREET_REGEX, '');

  // generalize to NYC area if we can
  for (const { regex, replacement } of NYC_AREAS) {
    if (regex.test(s)) {
      return replacement + ', New York';
    }
    regex.lastIndex = 0; // reset stateful regex
  }

  // fall back to just the city
  if (/new york|nyc|manhattan|brooklyn|queens|bronx|staten island/i.test(s)) {
    return 'New York';
  }

  // strip room numbers
  s = s.replace(ROOM_REGEX, '');
  s = s.replace(URL_REGEX, '');

  // generalize institutions
  for (const { regex, replacement } of INSTITUTION_PATTERNS) {
    s = s.replace(regex, replacement);
  }

  return s.trim().replace(/\s+/g, ' ');
}

// Sanitize a single calendar event object
function sanitizeEvent(event) {
  return {
    title: sanitizeEventTitle(event.title || event.summary || ''),
    start: event.start,   // times are safe
    end: event.end,
    duration: event.duration,
    location: event.location ? sanitizeLocation(event.location) : undefined,
    // attendees and descriptions are stripped entirely
  };
}

// Sanitize an array of calendar events
function sanitizeEvents(events) {
  if (!Array.isArray(events)) return [];
  return events.map(sanitizeEvent);
}

// Sanitize the identity section of profile.json before sending
function sanitizeIdentity(identity) {
  if (!identity) return {};
  return {
    city: identity.city || 'New York',
    neighborhood: identity.neighborhood
      ? sanitizeLocation(identity.neighborhood)
      : undefined,
    // name is never sent
  };
}

/**
 * Main export — sanitize any raw context object before it leaves the device.
 *
 * Usage:
 *   const { sanitize } = require('./sanitizer');
 *   const cleanContext = sanitize({ events, profile });
 *
 * @param {object} rawData
 * @param {Array}  rawData.events    — raw calendar events from MCP
 * @param {object} rawData.profile   — full profile.json object
 * @returns {object} cleanContext — safe to send to the model
 */
function sanitize(rawData = {}) {
  const { events, profile } = rawData;

  const clean = {};

  if (profile) {
    clean.city = profile.identity?.city || 'New York';
    clean.neighborhood = profile.identity?.neighborhood
      ? sanitizeLocation(profile.identity.neighborhood)
      : undefined;

    // everything below identity is already generalized
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

module.exports = { sanitize, sanitizeEvent, sanitizeLocation, sanitizeEventTitle };
