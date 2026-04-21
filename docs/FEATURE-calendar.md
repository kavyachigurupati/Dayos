# FEATURE — Google Calendar Integration

**Status:** Next  
**Phase:** 1  
**Links:** [PRD](../PRD.md)

---

## What it does

Replaces the hardcoded schedule in server.js with your real Google Calendar. The assistant reads your actual events, recurring PhD commitments, and upcoming plans — and uses them to plan your day intelligently.

---

## Why now

Right now the schedule is hardcoded:
```javascript
schedule: [
  { time: "10:00 AM", event: "Team standup call" },
  { time: "3:00 PM", event: "Meeting at WeWork Midtown" }
]
```

This is fake. The assistant cannot actually help you plan your day if it does not know your real schedule. Google Calendar is already connected as an MCP connector in this project — wiring it in is the next logical step.

---

## How it works

Google Calendar API returns your events via OAuth. The data flows entirely through your local machine — it never goes anywhere except through the sanitizer and then to your private model deployment.

```
Google Calendar API
        ↓
Raw events hit your local machine only
        ↓
sanitizer.js strips names, locations, 
attendees, sensitive titles
        ↓
Clean summary: "university meeting 10am, 
meeting in midtown 3pm"
        ↓
Goes to private model deployment
        ↓
Model plans around your real day
```

---

## What the assistant does with your calendar

**Reads your day** — knows what you have, when you have it, how long it runs, where there is free time.

**Understands recurring patterns** — sees that every Monday at 9am you have a PhD seminar, automatically adds this to profile.json recurring_commitments.

**Plans around your schedule** — suggests things that fit your free time not your busy time. Does not suggest a 2 hour badminton session when you have back to back meetings.

**Flags conflicts** — notices you have a meeting at 3pm in Midtown and your next one at 4pm across town. Flags it before it becomes a problem.

**Detects important events** — recognizes thesis defenses, conference deadlines, exam periods — gives them extra buffer and reminds you about them in advance.

---

## Setup required

Google Calendar MCP is already connected in this project. Three things needed in the code:

1. Add a `fetchCalendar()` function to server.js that calls the MCP connector
2. Pass the raw result through sanitizer.js before using it
3. Replace the hardcoded schedule in USER_CONTEXT with the live calendar data

---

## Privacy note

Raw calendar data — event titles, attendee names, locations — never leaves your machine. The sanitizer runs first. Only generalized summaries go to the model. See [FEATURE-privacy-architecture.md](FEATURE-privacy-architecture.md).

---

## Dependencies

- [FEATURE-privacy-architecture.md](FEATURE-privacy-architecture.md) — sanitizer must be built first
- [FEATURE-local-memory.md](FEATURE-local-memory.md) — recurring events detected from calendar automatically update profile.json

---

## Success criteria

- Assistant knows your real schedule every morning without any manual input
- Recurring PhD commitments automatically appear in profile.json
- Suggestions fit your actual free time
- No raw calendar data ever appears in outgoing API requests
