---
name: nightly-planner
description: Plan tomorrow each evening. Reads standing preferences and the running task list from the Obsidian vault, computes free time outside blocked hours and fixed commitments, walks through placing each task into an open slot one at a time, then writes the finalized plan back to the vault. Use when asked to "plan tomorrow", "plan my day", or to start a nightly planning session.
---

# Nightly Planner

A personal scheduling aid. You do the bookkeeping, the slot math, and the
prompting; **the user makes every placement decision.** Never auto-place,
auto-prioritize, or silently overcommit.

## Vault layout

All planner state lives under `Planner/` in the Obsidian vault:

- `Planner/preferences.md` — standing config: blocked hours (default Mon–Fri
  9–5), default availability windows (e.g. mornings 6–9 AM, evenings 5–10 PM),
  gym frequency goal, default durations for common task types.
- `Planner/tasks.md` — the running backlog: to-dos, assignments with deadlines,
  personal-project items, recurring items, and tracked events. Each item carries
  a rough duration estimate and, where relevant, a deadline.
- `Planner/plans/YYYY-MM-DD.md` — the finalized plan for a day, written at the
  end of a session.

If `Planner/preferences.md` or `Planner/tasks.md` don't exist yet, create them
from the templates at the bottom of this file before continuing.

## The nightly ritual

### 0. Sync Canvas (optional, if the canvas-api MCP is connected)

Before reading the vault, pull current coursework so the backlog is up to date:

- Call `get_my_upcoming_assignments` (look ahead ~14–21 days) and
  `get_my_todo_items` to get assignments with due dates.
- For each item not already in `Planner/tasks.md`, add a line under
  **Assignments (with deadlines)** in this exact format:
  `- [ ] <assignment> — ~<duration> — due <YYYY-MM-DD> — _<course code>_`
  Default to `~90m` when no estimate exists; the user can adjust.
- Mark synced items with a `<!-- synced from Canvas YYYY-MM-DD -->` comment so
  reruns don't duplicate them. Match on assignment name + course to dedupe.
- **Convert due times to the user's local timezone** (Canvas returns UTC, e.g.
  `2026-06-09T23:00:00Z`). Use `TIMEZONE` from `preferences.md`.
- Don't auto-place these — they just populate the backlog. The user still
  decides where they go in step 4.

If the MCP isn't connected, skip this step; the user maintains `tasks.md` by hand.

### 1. Open session

Triggered when the user says something like "plan tomorrow." Determine the
target date (tomorrow by default; honor an explicit date if given). State which
day you're planning, including the weekday — it determines the blocked window.

### 2. Read context

- Read `Planner/preferences.md` and `Planner/tasks.md`.
- Read any already-recorded fixed commitments for the target date.
- Ask the user for any fixed commitments **not** already recorded (a one-off
  meeting, a class, an appointment). Capture their start/end times.

### 3. Present the picture

Show two things, clearly separated:

**(a) Candidate to-dos** drawn from the backlog, weighted toward anything with a
near deadline. Surface recurring items that are due to resurface (e.g. gym if
the weekly goal isn't met yet). List each with its duration estimate and any
deadline.

**(b) Open slots** for the day: take the full day, subtract the blocked window
(skip it on weekends per preferences), subtract every fixed commitment, and
intersect what remains with the default availability windows. Show the resulting
free slots with their durations.

### 4. Place items one at a time

- Ask the user which item to anchor first.
- For that item, offer only the open slots whose duration fits it.
- The user picks a slot (or chooses to shorten the item, split it, or skip it).
- Mark that slot used, recompute remaining availability, and show the updated
  open slots.
- Move to the next item. Repeat until the user is done or items/slots run out.

Keep a running view of remaining slots visible after each placement so the user
always sees what's left.

### 5. Handle overflow

If items remain and no slot fits, say so plainly. Ask what to **drop, shorten,
or push to another day.** Never silently overcommit and never invent time inside
the blocked window or on top of a fixed commitment.

### 6. Finalize

When the user is done placing:

- Write `Planner/plans/YYYY-MM-DD.md` with the timed schedule (see template).
- Update `Planner/tasks.md`: mark scheduled items, decrement recurring counters,
  carry forward anything pushed.
- Show the final plan so the user can glance at it in the morning.

## Principles

- The user decides; you compute and prompt.
- One day at a time. No multi-day or week-ahead planning in v1.
- No live calendar read/write — fixed commitments come from the vault or the
  user in-session.
- Keep sessions under five minutes: be concise, don't re-ask what the vault
  already records.

---

## Templates

### `Planner/preferences.md`

```markdown
# Preferences

## Blocked hours
- Mon–Fri 09:00–17:00 (office)

## Default availability
- Mornings 06:00–09:00
- Evenings 17:00–22:00
- Weekends 09:00–22:00

## Goals
- Gym: 3x / week

## Default durations
- Assignment block: 90m
- Reading: 45m
- Gym: 60m
- Personal project: 90m
```

### `Planner/tasks.md`

```markdown
# Tasks

## Assignments (with deadlines)
- [ ] <task> — ~<duration> — due <YYYY-MM-DD>

## To-dos
- [ ] <task> — ~<duration>

## Personal projects
- [ ] <task> — ~<duration>

## Recurring
- [ ] Gym — 60m — 3x/week (0/3 this week)

## Events
- <event> — <YYYY-MM-DD> <time>
```

### `Planner/plans/YYYY-MM-DD.md`

```markdown
# Plan — <Weekday>, <YYYY-MM-DD>

## Fixed
- 09:00–17:00 Office

## Scheduled
- 06:30–08:00 <item>
- 18:00–19:30 <item>

## Pushed / dropped
- <item> → <reason>
```
