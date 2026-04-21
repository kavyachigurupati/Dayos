# FEATURE — Privacy Architecture

**Status:** In progress  
**Phase:** 1  
**Links:** [PRD](../PRD.md)

---

## Why this exists

Right now the code sends everything to Baseten raw and unfiltered — name, city, schedule details, interests. When Google Calendar is connected it will be even more exposed — actual event titles, attendee names, locations, everything Google stores. This feature adds two layers of protection so personal data never reaches shared infrastructure in a meaningful way.

---

## Two layers

### Layer 1 — Sanitizer (technical guarantee)

A `sanitizer.js` module runs on your machine before any data leaves. It sits between your raw MCP data and the model. No matter what provider you use, no matter what their policy says, the raw data technically never leaves your device because the sanitizer runs first.

**What it strips:**
- Full names of people
- Email addresses
- Exact street addresses and room numbers
- University or company names
- Meeting titles that reveal sensitive context

**What it keeps:**
- Times and durations — needed for planning
- Generalized categories — "university meeting" not "PhD thesis with Dr. Johnson"
- Day of week and rough time of day
- General area — "Upper Manhattan" not exact address

**How it works:**
```
Raw event: "Thesis review with Dr. Sarah Johnson, Columbia Room 401, 10am"
Sanitized: "University meeting, 10am, 1 hour"

Raw location: "123 Broadway, New York, NY 10027"  
Sanitized: "Upper Manhattan, New York"

Raw attendee: "sarah.johnson@columbia.edu"
Sanitized: removed entirely
```

### Layer 2 — Private dedicated model deployment (contractual guarantee)

Instead of the shared Baseten Model API endpoint — which runs on shared infrastructure alongside other customers — you deploy your own private instance of an open source model. Your requests go to a container only you use. No other customer's data mingles with yours.

**How to set this up on Baseten:**
1. Go to Baseten dashboard
2. Deploy a model — Llama 3.1 8B or Mistral 7B
3. Select dedicated deployment
4. Copy the private endpoint URL
5. Replace the shared endpoint URL in server.js

**Alternatively on Fireworks AI:**
- Same concept, slightly cheaper
- Explicit no-training, no-logging policy
- Private deployments available

---

## What leaves your device after both layers

| Data | Before sanitizer | After sanitizer |
|---|---|---|
| Calendar event title | "PhD thesis with Dr. Johnson" | "university meeting" |
| Location | "Columbia Room 401, Broadway" | removed |
| Attendee | "sarah@columbia.edu" | removed |
| Time | "10:00 AM" | "10:00 AM" |
| Search query to you.com | — | "AI hackathons NYC May 2026" |

---

## File to create

`sanitizer.js` — a module that exports one function:

```javascript
sanitize(rawData) → cleanContext
```

It receives raw MCP data and returns a clean context object safe to send to the model.

---

## Where sanitizer.js sits in the flow

```
MCP connectors fetch raw data
        ↓
sanitizer.js runs locally
        ↓
Clean context only
        ↓
server.js sends to private model deployment
        ↓
Response comes back
        ↓
profile.json updated locally
```

---

## Dependencies

- Google Calendar MCP connected — [FEATURE-calendar.md](FEATURE-calendar.md)
- Private model deployment set up on Baseten or Fireworks

---

## Success criteria

- No raw names, emails, or exact locations ever appear in outgoing requests
- Sanitized context is still useful enough for the model to give good planning responses
- Adding a new data source automatically goes through the sanitizer
- Any developer reading the code can verify what gets sent and what does not
