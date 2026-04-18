# DAYOS — Product Requirements Document

## Overview

DAYOS is a proactive personal AI assistant that handles the 
logistics of your life so you can just live it. It connects 
your calendar, real-time search, weather, and personal context 
into one intelligent layer that surfaces the right information 
and takes action at the right moment — without being asked.

---

## Problem

Most people lose hours every week to small decisions and 
forgotten logistics. What should I do today. Did I book that 
thing. Should I leave now. Did I forget anything. Which tickets 
are selling out.

None of these decisions are hard. But together they create a 
constant low-level mental drain. Every tool that exists today 
is either a dashboard that shows you data, a reactive assistant 
that waits to be asked, or a single-purpose app that only does 
one thing. Nothing connects it all and acts proactively on 
your behalf.

---

## Solution

One assistant that connects everything and acts without being 
asked. It knows you — your interests, your habits, your schedule 
— and uses that knowledge to stay one step ahead of your day.

---

## Goals

- Reduce the cognitive overhead of managing daily life
- Surface opportunities and experiences the user would have 
  wanted to know about but would never have found on their own
- Feel less like an app and more like a smart friend who 
  has your back

---

## Users

Anyone with a busy life who spends too much mental energy 
managing the logistics of their own day.

Early profile: professionals in their 20s and 30s based in 
a city, active social life, interested in events and experiences, 
attends conferences, plays sports, likes trying new places.

---

## Core features

### Morning briefing
Every morning the assistant proactively generates a full 
briefing covering the weather, the day's schedule, something 
interesting happening nearby, and one thing the user is likely 
to forget. Delivered as text and read out loud via voice.

### Conversational chat
The user can ask anything at any time. Find me a badminton 
court. Any tech meetups this week? What should I do tonight? 
The assistant searches in real time and gives specific, 
personal answers based on what it knows about the user.

### Proactive reminders
Contextual nudges throughout the day based on the user's 
known habits and tendencies. Sunglasses on sunny days. 
Laptop before a presentation. Leave early when Midtown 
is busy. Book that conference before it sells out.

### Event and experience discovery
Monitors what is happening locally based on the user's 
interests and surfaces it at the right time. Not a dump 
of everything — a specific, well-timed suggestion when 
it is relevant.

### Voice layer
Every response is read out loud automatically. The user 
can also speak to the assistant instead of typing. Full 
two-way voice conversation.

### Calendar intelligence (coming soon)
Reads the user's real Google Calendar. Blocks focus time. 
Adds travel time automatically. Prevents back-to-back 
meetings that require travel. Flags scheduling conflicts 
before they become a problem.

### Logistics actions (coming soon)
Pre-orders coffee on the user's route. Schedules an Uber 
before they think to. Orders food timed to arrive when 
they get home. Handles the small actions the user would 
otherwise do manually in fragmented moments.

---

## Tech stack

| Layer | Tool |
|---|---|
| AI brain | Baseten — DeepSeek V3.1 |
| Real-time search | you.com API |
| Calendar | Google Calendar API (coming soon) |
| Voice output | ElevenLabs (coming soon) |
| Voice input | VoiceRun (coming soon) |
| Server | Node.js + Express |
| Frontend | Vanilla HTML/CSS/JS |

---

## Phases

### Phase 1 — Core loop (current)
Morning briefing, real-time search, conversational chat, 
hardcoded user context. Enough to demo and show the value.

### Phase 2 — Voice
ElevenLabs reads every response out loud. VoiceRun enables 
the user to speak back. Full two-way voice conversation.

### Phase 3 — Real calendar
Google Calendar API replaces hardcoded schedule. Assistant 
reads real events, blocks time, adds travel time, sends 
meeting nudges.

### Phase 4 — Logistics actions
Uber, DoorDash, coffee pre-ordering. The assistant starts 
taking action, not just surfacing information.

### Phase 5 — Deep personalization
Pattern learning fully active. The assistant observes 
behavior over time and gets significantly more accurate. 
Suggestions feel genuinely personal.

---

## Success metrics

- Daily active usage — useful enough to open every day
- Morning briefing engagement rate
- Number of proactive suggestions acted on vs dismissed
- Reduction in time spent on manual logistics tasks
- User-reported sense of being more organized

---

## What makes it different

Every existing tool is one of three things — a dashboard, 
a reactive assistant, or single-purpose. DAYOS is proactive, 
multi-source, and acts across everything simultaneously. 
It does not wait to be opened. It connects everything and 
moves first.

The shift is not better features. It is a fundamentally 
different relationship between the user and their assistant.
