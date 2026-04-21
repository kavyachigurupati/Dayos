# FEATURE — Mobile

**Status:** Future  
**Phase:** 3  
**Links:** [PRD](../PRD.md)

---

## What it does

Moves DAYOS from a web app you open on your laptop to a presence on your phone that works in the background, sends proactive push notifications, and runs AI inference on-device using Cactus for complete privacy.

---

## Why mobile matters

The morning briefing should arrive before you pick up your phone, not after you open a browser tab. Proactive reminders need to reach you wherever you are. Logistics actions need your location in real time. All of this requires mobile — it cannot be done from a web app on a laptop.

---

## Two approaches to mobile

### Option 1 — Progressive Web App (PWA) — simpler, faster to build
Convert the existing web app to a PWA. Works on iOS and Android without an app store submission. Gets push notifications, home screen icon, offline capability. The server still runs in the cloud. Fastest path to mobile.

### Option 2 — Native app with Cactus — more powerful, fully private
Build a native iOS and Android app. Use Cactus for on-device AI inference. The model runs on your phone. Nothing goes to any cloud server. Complete privacy by architecture. Longer to build but the right long-term foundation.

---

## Cactus for on-device inference

Cactus is a Y Combinator-backed SDK that runs AI models directly on mobile phones with sub-50ms time-to-first-token. It supports Llama, Mistral, Gemma, DeepSeek, Phi, and others. Cross-platform — works on iOS and Android with the same codebase.

**What Cactus enables for DAYOS:**
- The AI model runs on your phone, not in the cloud
- Your calendar data, profile.json, and all personal context never leaves your device
- No Baseten or Fireworks needed — the phone is the model server
- Works offline
- Zero latency from network calls to the model

**The tradeoff:**
Cactus runs smaller quantized models — Llama 3.2 3B or Phi-3 Mini are practical choices. These are less capable than DeepSeek V3.1 on Baseten. For planning your day and answering personal questions, a 3B model is sufficient. For more complex reasoning, you would fall back to the cloud model.

**Cactus optional cloud fallback:**
Cactus v1 has a built-in optional cloud fallback. If the on-device model cannot handle a query, it falls back to a cloud model automatically. Best of both worlds — private by default, capable when needed.

---

## Architecture on mobile

```
Your phone
├── Cactus runs Llama 3.2 3B or Phi-3 Mini on device
├── profile.json stored in encrypted local storage
├── Google Calendar read locally via OAuth
├── Sanitizer runs on device
├── All personal context stays on phone
│           ↓
│   Only anonymous search queries leave
│           ↓
├── you.com — "AI hackathons NYC May 2026"
│           ↓
│   Results come back, model processes on device
│           ↓
└── Push notifications sent from on-device scheduler
    No server involved
```

---

## Push notifications

Mobile enables proactive push notifications — the feature that makes DAYOS feel like it is working for you even when you are not using it.

Examples:
- 7:30am — morning briefing delivered as notification
- 2pm — "Conference registration closes tomorrow. Still interested?"
- 6pm — "Free evening and it is still light out. Badminton court near you has open slots at 7pm."
- 10pm — "Your Monday seminar starts at 9am. Want to set a 7:30am briefing?"

---

## Dependencies

- [FEATURE-morning-briefing.md](FEATURE-morning-briefing.md) — content to deliver via notification
- [FEATURE-reminders.md](FEATURE-reminders.md) — reminder logic to trigger notifications
- [FEATURE-privacy-architecture.md](FEATURE-privacy-architecture.md) — sanitizer moves to on-device
- [FEATURE-local-memory.md](FEATURE-local-memory.md) — profile.json moves to encrypted local storage

---

## Success criteria

- Morning briefing arrives on phone before user picks it up
- At least 3 useful push notifications per week with over 50% tap rate
- App works offline for basic queries using on-device model
- No personal data leaves the phone except anonymous search queries
- Battery impact is negligible — Cactus inference uses under 2% battery per day
