# FEATURE — Voice (Output and Input)

**Status:** Planned  
**Phase:** 2  
**Links:** [PRD](../PRD.md)

---

## What it does

Two-way voice interaction. The assistant reads every response out loud automatically. The user can speak to it instead of typing. The morning briefing is delivered as audio at a set time without opening the app.

---

## Two components

### Voice output — ElevenLabs
Every time DAYOS responds — morning briefing or chat reply — it reads the response out loud in a natural voice. Automatic. No button press.

### Voice input — VoiceRun
The user speaks to DAYOS instead of typing. VoiceRun handles the speech-to-text pipeline and the event-driven harness around the voice agent.

---

## Why ElevenLabs for output, VoiceRun for input

**ElevenLabs** — best quality text-to-speech available. Simple REST API. One call, returns audio, plays in browser. Takes 10 minutes to integrate. Right tool for reading responses out loud.

**VoiceRun** — built specifically for production voice agents. Handles the complexity of real voice input — interruptions, silence detection, turn-taking, low latency. Not just speech-to-text but the full conversational harness. Right tool for two-way voice conversation.

Using ElevenLabs alone for output is phase 2. Full VoiceRun two-way conversation is phase 2 part 2.

---

## Voice output implementation (ElevenLabs)

Add to .env:
```
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=your_chosen_voice_id
```

Add `/speak` route to server.js:
```javascript
app.post('/speak', async (req, res) => {
  const { text } = req.body;
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    }
  );
  const audioBuffer = await response.arrayBuffer();
  res.set('Content-Type', 'audio/mpeg');
  res.send(Buffer.from(audioBuffer));
});
```

In index.html — after every assistant response, call `/speak` and play the audio automatically.

---

## Voice input implementation (VoiceRun)

VoiceRun is code-first. You define the agent, its prompts, tools, and workflow in code. It handles the runtime, CLI, and model integrations.

The DAYOS voice agent on VoiceRun:
- Listens for the user to speak
- Transcribes speech in real time
- Passes text to the same `/chat` route already built
- Reads response back via ElevenLabs

VoiceRun setup requires:
- VoiceRun account and API key
- Agent definition file
- Connecting it to the existing chat backend

---

## Morning briefing auto-delivery

Phase 2 adds a scheduled job that fires at a set time (e.g. 7:30am) and:
1. Generates the morning briefing automatically
2. Reads it out loud via ElevenLabs
3. Does not require the user to open the app or press anything

On mobile (phase 3) this becomes a push notification that plays audio.

---

## Voice ID selection

ElevenLabs has many voices. Recommended starting points:
- **Rachel** — calm, clear, professional
- **Adam** — natural, conversational
- **Bella** — warm, friendly

The right voice makes the briefing feel like a person, not a robot. Worth spending 10 minutes testing a few.

---

## Dependencies

- ElevenLabs account and API key
- VoiceRun account and API key
- [FEATURE-morning-briefing.md](FEATURE-morning-briefing.md) — briefing content to read out
- [FEATURE-chat.md](FEATURE-chat.md) — chat backend that voice input connects to

---

## Success criteria

- Morning briefing plays automatically at set time without opening app
- Voice output sounds natural — not robotic
- Voice input understands natural speech reliably
- Latency from speaking to hearing a response is under 3 seconds
- User prefers voice over typing for at least some interactions
