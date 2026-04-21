# FEATURE — Event and Conference Discovery

**Status:** Next  
**Phase:** 1  
**Links:** [PRD](../PRD.md)

---

## What it does

Proactively surfaces events, hackathons, AI conferences, badminton games, and local experiences the user would care about — before they think to search. Powered by you.com real-time search grounded in the user's profile.

---

## Why this matters

This is the feature that makes DAYOS feel magical. Not because the user asked — but because it noticed something relevant and brought it to them. A hackathon closing registration in 3 days. A badminton open play session this Saturday. An AI meetup next Tuesday. A conference with an abstract deadline in 2 weeks.

The user would never have found these in time without the assistant watching on their behalf.

---

## What it searches for

Based on profile.json interests, the assistant runs targeted you.com searches:

**Hackathons and conferences:**
- "AI hackathons NYC [current month] [year]"
- "machine learning conferences 2026 registration open"
- "NeurIPS ICML ICLR deadlines 2026"
- "tech hackathons New York [next 3 months]"

**Sports and activity:**
- "badminton open play NYC this weekend"
- "badminton courts Manhattan drop-in"

**Local events:**
- "tech meetups NYC this week"
- "AI events New York [current month]"

**Proactive deadline monitoring:**
- "NeurIPS 2026 submission deadline"
- "hackathon registration closing soon NYC"

---

## How it surfaces results

Not as a dump of everything — as a specific, well-timed suggestion:

**In morning briefing:**
"One thing worth knowing — there is a machine learning hackathon at Cornell Tech next weekend. Registration closes Friday. Want me to find the details?"

**In chat:**
User asks "anything interesting this weekend?" → surfaces 2-3 specific options relevant to their profile, not a generic events list

**Proactive alert (phase 2):**
Without being asked — "NeurIPS abstract deadline is in 8 days. You have mentioned wanting to submit. Want me to help you track this?"

---

## Search query design

Queries sent to you.com contain zero personal information. Just keywords:

```
Good: "AI hackathons NYC May 2026"
Bad: "hackathons near [user's address]"

Good: "badminton open play Manhattan weekend"
Bad: "badminton near [user's exact location]"
```

The city comes from profile.json. No precise location ever goes to you.com.

---

## How results get filtered

The model reads you.com results and filters them through what it knows from profile.json. It does not surface everything — it picks the 1-2 things most relevant to the user right now and presents them naturally in conversation.

---

## Dependencies

- [FEATURE-local-memory.md](FEATURE-local-memory.md) — profile.json interests drive the search queries
- you.com API key configured in .env

---

## Success criteria

- Surfaces at least one genuinely useful event or deadline per week the user would have missed
- User registers for at least one hackathon or conference they found through DAYOS
- Search queries never include personal identifying information
- Results feel curated and personal, not like a generic events feed
