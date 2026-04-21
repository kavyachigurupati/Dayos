# FEATURE — Federated Learning

**Status:** Future  
**Phase:** 5  
**Links:** [PRD](../PRD.md)

---

## What it does

When DAYOS has real users beyond one person, federated learning allows the personalization model to improve across all users — learning from collective behavioral patterns — without any individual user's data ever leaving their device.

---

## Why this is phase 5 not phase 1

Federated learning solves a multi-user training problem. Right now DAYOS has one user. FL requires:
- Many devices with local data to train on
- A coordination server to aggregate model updates
- A training pipeline, not just inference
- Significant infrastructure and engineering

For a single user, FL adds enormous complexity with zero benefit. The privacy problem for one user is solved more simply and effectively by the sanitizer and on-device inference (Cactus). FL becomes the right tool when there are enough users that collective learning would meaningfully improve the model for everyone.

---

## What federated learning enables at scale

**Better personalization model**
The local model that reads your data and builds profile.json gets smarter across users. It learns what patterns matter without seeing anyone's raw data. Example: it learns that "thesis defense" events need 3 days of calendar buffer — not from your data specifically, but from patterns across thousands of PhD students using DAYOS.

**Better sanitizer**
The sanitizer improves at recognizing what is sensitive. It learns new patterns of sensitive data it had not seen before — not from anyone's personal data, but from model updates that encode only the learned pattern.

**Better event recommendations**
The event discovery model learns which types of suggestions people act on versus ignore. It gets better at distinguishing useful from noise — across all users, without anyone's behavior being centralized.

---

## How federated learning works technically

```
Each user's phone (thousands of devices)
├── Local model trains on local data only
├── Local data never leaves the device
├── Model learns: "users who do X tend to also want Y"
│           ↓
│   Only model weight updates — not data — 
│   are sent to coordination server
│   Updates are encrypted and anonymized
│           ↓
Coordination server (Flower framework)
├── Aggregates updates from all devices
├── Combines them into improved global model
├── Cannot reverse-engineer individual data from updates
│           ↓
│   Improved global model sent back to all devices
│           ↓
Each user's phone gets a smarter model
without their data ever leaving
```

---

## The framework — Flower (flower.ai)

Flower is the recommended FL framework for DAYOS. Reasons:

- Largest open source community of all FL frameworks
- Framework agnostic — works with PyTorch, TensorFlow, or raw NumPy
- Highly customizable — can be adapted to mobile deployment
- Active development and good documentation
- Friendly community with open Slack channel
- Apache 2 license

Alternative: TensorFlow Federated — built by Google originally for mobile keyboard prediction, which is conceptually similar to what DAYOS needs.

---

## What gets trained federatedly vs what stays centralized

| Component | Federated | Centralized | Reason |
|---|---|---|---|
| Personalization model | Yes | No | Learns from user behavior locally |
| Sanitizer model | Yes | No | Improves at detecting sensitive patterns |
| Event recommendation model | Yes | No | Learns what users act on |
| Core planning model (Llama/Mistral) | No | Yes | Too large for on-device training |
| you.com search queries | No | No | Just API calls, no model |

---

## Privacy guarantees with FL

FL alone does not guarantee complete privacy. Additional techniques needed:

**Differential privacy** — adds mathematical noise to model updates before they leave the device. Makes it provably impossible to reverse-engineer individual data from model updates even with sophisticated attacks.

**Secure aggregation** — the coordination server never sees individual device updates. It only sees the already-combined aggregate. Individual contributions are cryptographically hidden.

Both are available in Flower. Both should be used when FL is implemented.

---

## Dependencies

- [FEATURE-mobile.md](FEATURE-mobile.md) — FL runs on mobile devices, requires native app with Cactus
- [FEATURE-local-memory.md](FEATURE-local-memory.md) — behavioral patterns in profile.json are what the local model trains on
- Significant user base — FL is only meaningful with enough devices contributing updates

---

## Success criteria

- Personalization model measurably improves across users over time
- No individual user's raw data can be reconstructed from model updates
- Event recommendations get more accurate for new users faster than they would from individual learning alone
- Differential privacy guarantees are mathematically verifiable
- Implementation passes independent privacy audit
