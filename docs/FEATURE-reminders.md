# FEATURE — Proactive Reminders

**Status:** Planned  
**Phase:** 2  
**Links:** [PRD](../PRD.md)

---

## What it does

Sends contextual nudges throughout the day based on what the assistant knows about the user's schedule, habits, and tendencies — without being asked. Not generic calendar alerts. Smart, situational reminders that feel like a friend who is paying attention.

---

## The difference from a calendar alert

A calendar alert fires at a time you set. It does not think.

A DAYOS reminder fires because the assistant noticed something:

```
Calendar alert: "Meeting at 3pm" (fires at 2:45pm)

DAYOS reminder: "You have a meeting in Midtown at 3pm. 
It is raining and the subway is slow today — 
leave by 2:15 to be safe."
```

---

## Types of reminders

**Schedule-aware reminders**
- Leave early when weather or traffic is bad
- Buffer time before important academic events
- Back-to-back meeting conflicts flagged the night before

**Habit-based reminders**
- "You have a presentation today — laptop and charger"
- "Sunny and 75 degrees — you usually forget sunglasses"
- "You mentioned wanting to play badminton this weekend — courts fill up, want to book now?"

**Deadline reminders**
- Conference abstract deadline approaching
- Hackathon registration closing
- "NeurIPS deadline is in 5 days — you have mentioned wanting to submit"

**Opportunity reminders**
- "Free afternoon today and weather is perfect — badminton court near you has open slots at 3pm"
- "Your friend mentioned no plans — there is a festival in Brooklyn this weekend"

---

## How reminders are triggered

Phase 2 — time-based polling. A background job runs every hour, checks the current context (calendar, weather, upcoming deadlines from profile.json), and decides if anything is worth surfacing.

Decision logic runs through the model:
```
Current time + calendar + weather + profile
        ↓
Model asked: "Is there anything the user 
should know right now that they have not 
been told today?"
        ↓
If yes → push notification or in-app alert
If no → check again in an hour
```

---

## Delivery methods

**Phase 2 — in-app**
Alert appears in the chat UI the next time the user opens the app.

**Phase 3 — push notifications**
Mobile push notification so reminders arrive even when the app is closed.

**Phase 3 — voice**
Spoken reminder via ElevenLabs at a relevant moment.

---

## What reminders never do

- Fire more than 2-3 times a day — frequency kills trust
- Remind about things the user has already acted on
- Surface the same suggestion twice in the same week if ignored

---

## Dependencies

- [FEATURE-local-memory.md](FEATURE-local-memory.md) — habit patterns and tendencies live in profile.json
- [FEATURE-calendar.md](FEATURE-calendar.md) — schedule context needed for timing reminders correctly
- [FEATURE-event-discovery.md](FEATURE-event-discovery.md) — deadline monitoring feeds into reminders
- [FEATURE-voice.md](FEATURE-voice.md) — voice delivery in phase 3

---

## Success criteria

- User acts on at least 50% of reminders
- Never feels spammy or repetitive
- At least once a week surfaces something the user is genuinely glad they were reminded about
- Deadline reminders result in the user registering for things before they close
