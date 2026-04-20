# DAYOS — Product Requirements Document

## Overview

DAYOS is a proactive personal AI assistant that handles the logistics of your life so you can just live it. It connects your calendar, real-time search, weather, and personal context into one intelligent layer that surfaces the right information and takes action at the right moment — without being asked.

Unlike every other assistant that waits for you to open it, DAYOS works in the background, stays one step ahead, and acts before you think to ask. Built privacy-first — your personal data never reaches shared infrastructure in a meaningful way.

---

## Problem

Most people lose hours every week to small decisions and forgotten logistics. What should I do today. Did I book that conference. Should I leave now. Did I forget anything. Which tickets are selling out.

None of these decisions are hard individually. But together they create a constant low-level mental drain that pulls attention away from actually living your life.

Every tool that exists today is either a dashboard that shows you data, a reactive assistant that waits to be asked, or a single-purpose app that only does one thing. Nothing connects it all, acts proactively, and does it without compromising your privacy.

---

## Solution

One assistant that connects your real data sources, understands your life, and acts without being asked. Built with a two-layer privacy architecture so your personal data never leaves your control in a meaningful way.

---

## Goals

- Reduce the cognitive overhead of managing daily life
- Surface opportunities and experiences the user would have wanted to know about but would never have found on their own
- Feel less like an app and more like a smart friend who has your back
- Keep personal data private by design — not just by policy

---

## Users

### Current — single user (you)
A PhD student based in New York who plays badminton, attends hackathons and AI conferences, has recurring academic commitments, likes exploring the city, and wants an assistant that genuinely knows their life without requiring constant input or compromising privacy.

### Future
Professionals in their 20s and 30s based in a city, active social life, interested in events and experiences, attends conferences, plays sports, likes trying new places — and cares about where their data goes.

---

## Privacy architecture

Two layers working together. See [FEATURE-privacy-architecture.md](features/FEATURE-privacy-architecture.md) for full detail.

**Layer 1 — Sanitizer (technical guarantee)**
A sanitizer module runs on your machine before any data leaves. Strips names, emails, exact locations, and identifying details. Replaces them with generalized categories. Even if every other protection failed, an attacker would only see sanitized context.

**Layer 2 — Private dedicated model deployment (contractual guarantee)**
Your model runs on a dedicated private instance on Baseten or Fireworks. No shared infrastructure. No other customer's data mingles with yours.

**What leaves your device**
- Sanitized generalized context only — "university meeting at 10am" not "thesis review with Dr. Johnson"
- Anonymous search keywords — "AI hackathons NYC May 2026" — no personal data attached

**What never leaves your device**
- Raw calendar events, names, exact locations, email addresses
- profile.json — your local memory file
- Behavioral patterns and history

---

## Core features

| Feature | Status | Document |
|---|---|---|
| Morning briefing | Built | [FEATURE-morning-briefing.md](features/FEATURE-morning-briefing.md) |
| Conversational chat | Built | [FEATURE-chat.md](features/FEATURE-chat.md) |
| Privacy architecture | In progress | [FEATURE-privacy-architecture.md](features/FEATURE-privacy-architecture.md) |
| Local memory | In progress | [FEATURE-local-memory.md](features/FEATURE-local-memory.md) |
| Google Calendar integration | Next | [FEATURE-calendar.md](features/FEATURE-calendar.md) |
| Event and conference discovery | Next | [FEATURE-event-discovery.md](features/FEATURE-event-discovery.md) |
| Proactive reminders | Planned | [FEATURE-reminders.md](features/FEATURE-reminders.md) |
| Voice output | Planned | [FEATURE-voice.md](features/FEATURE-voice.md) |
| Voice input | Planned | [FEATURE-voice.md](features/FEATURE-voice.md) |
| Logistics actions | Future | [FEATURE-logistics.md](features/FEATURE-logistics.md) |
| Mobile | Future | [FEATURE-mobile.md](features/FEATURE-mobile.md) |
| Federated learning | Future | [FEATURE-federated-learning.md](features/FEATURE-federated-learning.md) |

---

## Tech stack

| Component | Tool | Purpose |
|---|---|---|
| AI model | Baseten or Fireworks — private dedicated deployment | Core intelligence, planning, conversation |
| Open source model | Llama 3.1 8B or Mistral 7B | Runs on your private deployment |
| Real-time search | you.com API | Live events, hackathons, weather, conferences |
| Calendar | Google Calendar via MCP | Real schedule, recurring commitments |
| Sanitizer | sanitizer.js — runs locally | Strips sensitive data before it leaves device |
| Local memory | profile.json — stored on device | Interests, patterns, habits, plans |
| Backend | Node.js + Express | Server, routing, API orchestration |
| Frontend | HTML/CSS/JS | Chat UI, morning briefing display |
| Voice output | ElevenLabs — phase 2 | Reads briefings and responses out loud |
| Voice input | VoiceRun — phase 2 | Speak to the assistant instead of typing |
| Mobile | Cactus — phase 3 | On-device inference on mobile |
| Federated learning | Flower — phase 5 | Multi-user privacy-preserving personalization |

---

## Phases

### Phase 1 — Private core loop (current)
Google Calendar connected via MCP. Sanitizer running locally. profile.json as local memory. Private dedicated model deployment. Morning briefing and chat working. you.com searching for hackathons, conferences, events. Implicit personalization observing behavior and updating profile.json over time.

### Phase 2 — Voice
ElevenLabs reads every response out loud. VoiceRun enables two-way voice conversation. Morning briefing delivered automatically at a set time without opening the app.

### Phase 3 — Mobile
Cactus runs inference on phone. Same privacy architecture moves to mobile. Push notifications for proactive nudges.

### Phase 4 — Logistics actions
Uber, coffee pre-ordering, food ordering. The assistant starts taking real-world action, not just surfacing information.

### Phase 5 — Federated learning
When DAYOS has real users — Flower federated learning improves personalization models across users without anyone's raw data ever leaving their device.

---

## Success metrics

- Used every single day without thinking about it
- Morning briefing feels genuinely personal and useful
- Surfaces at least one thing per week you would have missed
- Profile grows and suggestions get more accurate over time
- Zero raw personal data ever sent to any third party

---

## What makes it different

Every existing tool is one of three things — a dashboard, a reactive assistant, or single-purpose. DAYOS is proactive, multi-source, and acts across everything simultaneously. It does not wait to be opened. It connects everything and moves first.

The privacy architecture is not a feature bolted on — it is a core design decision. The sanitizer technically enforces privacy. The private deployment adds a second layer. Together they make DAYOS the only personal assistant where you genuinely control your data while still getting the full power of a cloud AI model.
