# FEATURE — Local Memory (profile.json)

**Status:** In progress  
**Phase:** 1  
**Links:** [PRD](../PRD.md)

---

## What it does

profile.json is a local file stored on your machine that acts as the assistant's long-term memory. It contains everything the assistant knows about you — your interests, your recurring plans, your PhD schedule, your behavioral patterns. It never leaves your device raw. It grows over time automatically as the assistant observes what you do.

---

## Why it exists

Right now the assistant's knowledge of you is hardcoded in server.js. That means it only knows what you manually typed in, it never learns anything new, and anyone who looks at the code sees your personal details. profile.json fixes all three problems — it is editable, it grows automatically, and it stays local.

---

## Structure

```json
{
  "identity": {
    "name": "your name",
    "city": "New York",
    "neighborhood": "Upper Manhattan"
  },

  "interests": [
    "badminton",
    "AI and machine learning",
    "hackathons",
    "tech conferences",
    "trying new restaurants",
    "exploring NYC"
  ],

  "recurring_commitments": [
    { "day": "Monday", "time": "9:00 AM", "type": "university", "label": "PhD seminar" },
    { "day": "Wednesday", "time": "2:00 PM", "type": "university", "label": "lab meeting" },
    { "day": "Friday", "time": "10:00 AM", "type": "university", "label": "research group" }
  ],

  "upcoming_plans": [
    "Looking for hackathons in NYC in the next 3 months",
    "Interested in NeurIPS, ICML, ICLR conference deadlines",
    "Want to find regular badminton pickup games on weekends"
  ],

  "conference_interests": [
    "NeurIPS",
    "ICML", 
    "ICLR",
    "local AI meetups",
    "NYC hackathons"
  ],

  "behavioral_patterns": {
    "acted_on": [],
    "ignored": [],
    "active_hours": ["8am", "9am", "6pm", "7pm"],
    "preferred_activity_days": ["Saturday", "Sunday"]
  },

  "reminders": [
    "tends to forget conference registration until too late",
    "likes to know about badminton courts in advance",
    "prefers morning plans on weekends"
  ],

  "last_updated": "2026-04-20"
}
```

---

## How it gets smarter over time

The assistant observes two things without asking you anything:

**What you acted on** — when you respond positively to a suggestion or follow up on something, it adds that to `behavioral_patterns.acted_on`. Over time it knows what kinds of suggestions you actually use.

**What you ignored** — when a suggestion gets no response across multiple sessions, it adds it to `behavioral_patterns.ignored`. It stops recommending things you do not care about.

Example over time:
```
Week 1: suggests both museum events and badminton courts
Week 2: you asked follow-up questions about badminton courts, 
        ignored museum events
Week 3: profile notes "badminton courts → acted on", 
        "museum events → ignored"
Week 4: stops suggesting museums, surfaces more sports options
```

No machine learning. No training. Just memory and observation.

---

## How to edit it manually

You can open profile.json in any text editor and add things directly. Want to add your Thursday class? Add it to `recurring_commitments`. Interested in a specific conference? Add it to `conference_interests`. The assistant reads this file fresh on every request so changes take effect immediately.

---

## What gets sanitized before leaving the device

The `identity` section — name and exact neighborhood — gets generalized by the sanitizer before being sent to the model. Everything else in profile.json is already generalized enough to send safely.

---

## Dependencies

- [FEATURE-privacy-architecture.md](FEATURE-privacy-architecture.md) — sanitizer handles the identity fields before sending
- [FEATURE-calendar.md](FEATURE-calendar.md) — calendar data informs recurring_commitments automatically

---

## Success criteria

- profile.json exists and is read on every request
- Suggestions get noticeably more accurate after 2 weeks of use
- User never has to manually update it for the assistant to learn basic preferences
- File is human readable and easy to edit manually when needed
