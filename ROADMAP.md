# DAYOS — Roadmap

## Now — Phase 1 (Core Loop)

**Done**
- [x] profile.json — local memory with interests, PhD schedule, plans
- [x] you.com search — wired into chat and morning briefing
- [x] Morning briefing + chat UI — working locally

**Building now**
- [ ] Step 1 — Replace sanitizer regex → clean field whitelist (title, start, end, duration only)
- [ ] Step 2 — Google Calendar via OAuth + API (replace hardcoded schedule)
- [ ] Step 3 — Settings panel in UI (calendar connect, email, briefing time)
- [ ] Step 4 — Auto 8am briefing via node-cron + email delivery via nodemailer
- [ ] Step 5 — Deploy to Railway (always-on, accessible from phone browser)

## Next — Phase 2 (Mobile)

- [ ] Progressive Web App — home screen icon, works offline
- [ ] Web Push notifications — real Apple notifications via Safari, no App Store needed
- [ ] Mobile-optimised UI — responsive layout, touch-friendly
- [ ] Cactus on-device inference — model runs on phone, nothing leaves

## Later — Phase 3 (Voice)

- [ ] Voice input — speak to DAYOS instead of typing
- [ ] Voice output — briefings and responses read out loud
- [ ] Two-way voice conversation

## Future — Phase 4+

- [ ] Logistics actions — Uber, food ordering, coffee pre-ordering
- [ ] Federated learning — Flower, when there are real users

---

## Docs

- [PRD](docs/PRD.md)
- [Privacy Architecture](docs/features/FEATURE-privacy-architecture.md)
- [Local Memory](docs/features/FEATURE-local-memory.md)
- [Calendar](docs/features/FEATURE-calendar.md)
- [Event Discovery](docs/features/FEATURE-event-discovery.md)
- [Morning Briefing](docs/features/FEATURE-morning-briefing.md)
- [Chat](docs/features/FEATURE-chat.md)
- [Reminders](docs/features/FEATURE-reminders.md)
- [Voice](docs/features/FEATURE-voice.md)
- [Logistics](docs/features/FEATURE-logistics.md)
- [Mobile](docs/features/FEATURE-mobile.md)
- [Federated Learning](docs/features/FEATURE-federated-learning.md)
