# FEATURE — Morning Briefing

**Status:** Built  
**Phase:** 1  
**Links:** [PRD](../PRD.md)

---

## What it does

Every morning DAYOS proactively generates a full briefing before you ask. It looks at your day, checks the weather, scans what is happening around you, and delivers a natural spoken summary that gets you ready without opening five different apps.

---

## Current behavior

- User clicks "Plan My Day" button
- Server searches you.com for weather, local events, and basketball scores in parallel
- Results plus hardcoded user context sent to DeepSeek V3.1 on Baseten
- Model returns a natural morning briefing
- Displayed in the chat UI

---

## What needs to change

- Replace hardcoded user context with profile.json
- Replace hardcoded schedule with real Google Calendar data
- Trigger automatically at a set time — no button press needed
- Deliver via voice (ElevenLabs — phase 2)
- Sanitize calendar data before it leaves the device

---

## Briefing structure

```
Weather + vibe of the day
Your schedule — sanitized and generalized
Something based on your interests today
One thing you might forget
One conference or hackathon coming up
Your move for today
```

---

## Dependencies

- [FEATURE-local-memory.md](FEATURE-local-memory.md) — profile.json must exist
- [FEATURE-calendar.md](FEATURE-calendar.md) — real calendar replaces hardcoded schedule
- [FEATURE-privacy-architecture.md](FEATURE-privacy-architecture.md) — sanitizer must run before briefing is generated
- [FEATURE-event-discovery.md](FEATURE-event-discovery.md) — you.com searches for relevant events

---

## Success criteria

- Briefing feels personal and specific, not generic
- Surfaces something useful every single day
- Takes under 10 seconds to generate
- User reads or listens to it without skipping
