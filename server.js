require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const { sanitize } = require('./sanitizer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const PORT = process.env.PORT || 3000;
const BASETEN_API_KEY = process.env.BASETEN_API_KEY;
const YDC_API_KEY = process.env.YDC_API_KEY;

const PROFILE_PATH = path.join(__dirname, 'profile.json');

// Load profile.json fresh on each request so manual edits take effect immediately
function loadProfile() {
  try {
    return JSON.parse(fs.readFileSync(PROFILE_PATH, 'utf8'));
  } catch (err) {
    console.error('Could not read profile.json:', err.message);
    return {};
  }
}

// Persist profile.json after behavioral updates
function saveProfile(profile) {
  try {
    profile.last_updated = new Date().toISOString().split('T')[0];
    fs.writeFileSync(PROFILE_PATH, JSON.stringify(profile, null, 2));
  } catch (err) {
    console.error('Could not save profile.json:', err.message);
  }
}

// ── you.com search ──────────────────────────────────────────────────────────

async function searchYouCom(query) {
  const url = `https://api.ydc-index.io/search?query=${encodeURIComponent(query)}&num_web_results=3`;
  const response = await fetch(url, {
    headers: { 'X-API-Key': YDC_API_KEY }
  });
  const data = await response.json();
  const hits = data.hits || [];
  return hits.map(h => h.snippets?.join(' ') || h.description || '').join('\n\n');
}

// Decide whether a chat message needs a live search and what to search for
function buildSearchQuery(message, context) {
  const lower = message.toLowerCase();
  const city = context.city || 'New York';

  const eventKeywords = ['event', 'happening', 'today', 'this week', 'weekend', 'hackathon', 'conference', 'meetup', 'concert', 'festival', 'popup'];
  const sportsKeywords = ['badminton', 'court', 'pickup', 'game', 'sports', 'play'];
  const weatherKeywords = ['weather', 'rain', 'sunny', 'temperature', 'forecast', 'cold', 'hot', 'outside'];
  const foodKeywords = ['restaurant', 'eat', 'food', 'brunch', 'lunch', 'dinner', 'cafe', 'coffee', 'bar'];
  const conferenceKeywords = ['neurips', 'icml', 'iclr', 'conference', 'deadline', 'submit', 'paper'];

  if (weatherKeywords.some(k => lower.includes(k))) {
    return `weather ${city} today`;
  }
  if (conferenceKeywords.some(k => lower.includes(k))) {
    return `AI machine learning conference deadlines 2026 ${message}`;
  }
  if (sportsKeywords.some(k => lower.includes(k))) {
    return `badminton courts pickup games ${city} ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  }
  if (foodKeywords.some(k => lower.includes(k))) {
    return `best new restaurants ${city} 2026`;
  }
  if (eventKeywords.some(k => lower.includes(k))) {
    return `things to do events ${city} ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`;
  }

  // If message is a question about something specific, search for it
  if (lower.includes('?') || lower.startsWith('what') || lower.startsWith('where') || lower.startsWith('when') || lower.startsWith('find') || lower.startsWith('any')) {
    return `${message} ${city} 2026`;
  }

  return null; // no search needed
}

// ── Baseten / model call ────────────────────────────────────────────────────

async function callBaseten(systemPrompt, messages) {
  const response = await fetch('https://inference.baseten.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Api-Key ${BASETEN_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3.1',
      max_tokens: 600,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ]
    })
  });
  const data = await response.json();
  console.log('Baseten response:', JSON.stringify(data, null, 2));
  return data.choices?.[0]?.message?.content || 'Sorry, could not get a response.';
}

// Build a system prompt from sanitized context
function buildSystemPrompt(ctx, extra = '') {
  return `You are DAYOS, a personal day intelligence assistant.
You know this person deeply — they are based in ${ctx.city || 'New York'}, love badminton, enjoy exploring the city, attend AI conferences and hackathons, and are doing a PhD in machine learning.
You are proactive, warm, and helpful — like a smart friend who has their back, not a robot listing facts.
Be specific. Be useful. Give actionable answers grounded in real information.
Keep responses concise.

Their interests: ${(ctx.interests || []).join(', ')}.
Their reminders: ${(ctx.reminders || []).join('; ')}.
${extra}`;
}

// ── /plan — morning briefing ────────────────────────────────────────────────

app.post('/plan', async (req, res) => {
  try {
    const profile = loadProfile();
    const ctx = sanitize({ profile });

    console.log('Generating morning briefing for user in', ctx.city);

    const city = ctx.city || 'New York';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const [eventsData, weatherData, sportsData] = await Promise.all([
      searchYouCom(`things to do events ${city} ${today}`),
      searchYouCom(`weather ${city} today`),
      searchYouCom(`AI hackathons tech meetups ${city} ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`)
    ]);

    const scheduleLines = ctx.recurring_commitments
      ? ctx.recurring_commitments
          .filter(c => c.day === new Date().toLocaleDateString('en-US', { weekday: 'long' }))
          .map(c => `- ${c.time}: ${c.label}`)
          .join('\n') || '(no university commitments today)'
      : '(schedule not available)';

    const systemPrompt = `You are DAYOS, a personal day intelligence assistant.
You know the user deeply and give them a warm, natural, proactive morning briefing.
Keep it conversational, like a smart friend talking to them — not a robot listing facts.
Be specific. Be useful. Surface one surprise or thing they might have missed.
Keep the briefing under 200 words.`;

    const userMessage = `Plan my day. Today is ${today}.

My city: ${city}
My interests: ${(ctx.interests || []).join(', ')}

My schedule today:
${scheduleLines}

Things I always want to know:
${(ctx.reminders || []).join('\n')}

Live data:

WEATHER:
${weatherData}

LOCAL EVENTS:
${eventsData}

AI/TECH EVENTS THIS MONTH:
${sportsData}

Give me my morning briefing. Surface something I should act on today or this week.`;

    const briefing = await callBaseten(systemPrompt, [{ role: 'user', content: userMessage }]);
    res.json({ success: true, briefing });

  } catch (error) {
    console.error('Error in /plan:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── /chat — conversational assistant with live search ──────────────────────

app.post('/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    const profile = loadProfile();
    const ctx = sanitize({ profile });

    // Decide if we need a live search for this message
    const searchQuery = buildSearchQuery(message, ctx);
    let searchContext = '';

    if (searchQuery && YDC_API_KEY) {
      console.log('Searching you.com for:', searchQuery);
      const results = await searchYouCom(searchQuery);
      if (results) {
        searchContext = `\n\nLive search results for "${searchQuery}":\n${results}`;
      }
    }

    const systemPrompt = buildSystemPrompt(ctx, searchContext
      ? `Use the live search results below when they are relevant to the question.${searchContext}`
      : '');

    const reply = await callBaseten(systemPrompt, [
      ...((history || []).slice(-6)),
      { role: 'user', content: message }
    ]);

    // Observe behavioral pattern: track what topics they ask about
    observeBehavior(profile, message);

    res.json({ success: true, reply });

  } catch (error) {
    console.error('Chat error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── Behavioral learning ─────────────────────────────────────────────────────
// Simple passive observation: log topic categories that get asked about

function observeBehavior(profile, message) {
  try {
    const lower = message.toLowerCase();
    const patterns = profile.behavioral_patterns || { acted_on: [], ignored: [] };

    const topicMap = {
      'badminton': ['badminton', 'court', 'pickup game'],
      'hackathon': ['hackathon', 'hack'],
      'conference': ['neurips', 'icml', 'iclr', 'conference', 'deadline'],
      'weather': ['weather', 'rain', 'sunny', 'cold', 'hot'],
      'restaurant': ['restaurant', 'eat', 'food', 'brunch', 'lunch', 'dinner'],
      'events': ['event', 'happening', 'what to do', 'this weekend'],
    };

    for (const [topic, keywords] of Object.entries(topicMap)) {
      if (keywords.some(k => lower.includes(k))) {
        if (!patterns.acted_on.includes(topic)) {
          patterns.acted_on.push(topic);
          profile.behavioral_patterns = patterns;
          saveProfile(profile);
        }
        break;
      }
    }
  } catch (_) {
    // behavioral tracking is best-effort, never block a response
  }
}

// ── /profile — read and update profile ─────────────────────────────────────

app.get('/profile', (req, res) => {
  res.json(loadProfile());
});

app.patch('/profile', (req, res) => {
  try {
    const profile = loadProfile();
    const updates = req.body;

    // deep merge top-level keys
    for (const key of Object.keys(updates)) {
      if (Array.isArray(updates[key]) && Array.isArray(profile[key])) {
        // merge arrays, deduplicate strings
        profile[key] = [...new Set([...profile[key], ...updates[key]])];
      } else {
        profile[key] = updates[key];
      }
    }

    saveProfile(profile);
    res.json({ success: true, profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── start ───────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`DAYOS running at http://localhost:${PORT}`);
});
