# FEATURE — Logistics Actions

**Status:** Future  
**Phase:** 4  
**Links:** [PRD](../PRD.md)

---

## What it does

The assistant stops just surfacing information and starts taking real-world action on your behalf. Pre-orders coffee on your route. Schedules an Uber before you think to. Orders food timed to arrive when you get home. Handles the small logistics actions you would otherwise do manually in fragmented moments.

---

## The shift this represents

Every feature before this is about intelligence — knowing things, surfacing things, reminding you. This feature is about action. The assistant does not just say "you might want to order food before your late meeting" — it says "I ordered your usual from that Thai place, estimated delivery 7:30pm when you get home. Want me to cancel?"

This is the difference between an assistant that informs and an assistant that acts.

---

## Actions in scope

**Coffee pre-ordering**
Detects you have a morning meeting route. Finds a coffee shop on the way. Pre-orders your usual (learned from profile). Ready when you pass. Powered by the coffee shop's ordering API or a general food ordering API.

**Uber scheduling**
Detects you need to be somewhere at a specific time. Calculates departure time based on current traffic. Schedules an Uber to arrive at the right moment. Powered by Uber API.

**Food ordering**
Detects you have a late night or busy evening. Knows your preferred restaurants from profile. Places an order timed to arrive when you get home. Powered by DoorDash or Uber Eats API.

**Conference and event registration**
Detects a deadline approaching for something in your interests. Surfaces the registration link. With permission, fills in known details to speed up the process.

---

## How it asks permission

The assistant never takes a logistics action without confirmation. The confirmation is designed to be as frictionless as possible:

```
DAYOS: "You finish late tonight and it is raining. 
Want me to order from Wok to Walk, usual order, 
arrive 8pm? Just say yes."

User: "yes"

DAYOS: "Done. Order placed, arriving 8:05pm."
```

One word confirmation. The assistant handles the rest.

---

## APIs required

| Action | API | Notes |
|---|---|---|
| Uber scheduling | Uber API | Requires OAuth |
| Food ordering | DoorDash Drive API or Uber Eats API | Requires merchant agreements |
| Coffee ordering | Square API or specific chain APIs | Varies by coffee shop |
| Event registration | Eventbrite API | Can pre-fill form fields |

---

## Privacy considerations

Logistics actions require sharing more context with third parties than any other feature. Uber needs a pickup location. DoorDash needs a delivery address. This is the one area where precise location and address are unavoidable.

Mitigation:
- Only share with the specific third party needed for that action
- Never share with the AI model — the model decides what action to take, the action itself is executed locally with the direct API
- User explicitly confirms every action before it is taken

---

## Dependencies

- [FEATURE-local-memory.md](FEATURE-local-memory.md) — knows preferred restaurants, usual coffee order, typical routes
- [FEATURE-calendar.md](FEATURE-calendar.md) — knows schedule to time actions correctly
- [FEATURE-reminders.md](FEATURE-reminders.md) — reminders trigger the action suggestion
- [FEATURE-voice.md](FEATURE-voice.md) — voice confirmation is the ideal interaction pattern for actions

---

## Success criteria

- User confirms at least 3 logistics actions per week
- Actions are timed correctly — food arrives when expected, Uber shows up on time
- User never feels the assistant overstepped or acted without permission
- Saves measurable time compared to doing these actions manually
