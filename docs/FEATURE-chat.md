# FEATURE — Conversational Chat

**Status:** Built  
**Phase:** 1  
**Links:** [PRD](../PRD.md)

---

## What it does

The user can ask DAYOS anything at any time in natural conversation. It searches in real time and gives specific, personal answers grounded in what it knows about the user.

---

## Current behavior

- User types a message in the chat input
- Message plus last 6 messages of history sent to DeepSeek on Baseten
- Model responds using hardcoded user context as system prompt
- Response displayed in chat UI
- Conversation history maintained in browser memory for the session

---

## Example queries it handles today

- "Find me a badminton court in NYC today"
- "Any AI hackathons this month?"
- "What should I do this Saturday?"
- "Are there any tech meetups this week?"

---

## What needs to change

- Connect you.com search to chat route so answers are grounded in live data not just model knowledge
- Replace hardcoded system prompt context with profile.json
- Persist conversation history across sessions — right now history resets on page refresh
- Sanitize any personal context before it goes to the model
- Surface proactive suggestions mid-conversation when relevant

---

## Dependencies

- [FEATURE-local-memory.md](FEATURE-local-memory.md) — profile.json provides personal context
- [FEATURE-privacy-architecture.md](FEATURE-privacy-architecture.md) — sanitizer runs on context before sending
- [FEATURE-event-discovery.md](FEATURE-event-discovery.md) — you.com wired into chat route

---

## Success criteria

- Answers feel grounded in real current information not stale model knowledge
- Remembers context from earlier in the conversation
- Feels like talking to someone who knows you, not a generic chatbot
