# DAYOS — Your Personal Day Intelligence

DAYOS is a proactive personal AI assistant that manages the 
logistics of your day before you even think to ask. It connects 
your interests, habits, and real-time information about the world 
around you into one intelligent layer that stays one step ahead 
of your life.

Unlike every other assistant app that waits for you to ask, 
DAYOS thinks ahead on your behalf.

## What it does

- Gives you a proactive morning briefing every day
- Searches for things happening around you based on your interests
- Surfaces events, conferences, sports, and experiences you would 
  actually care about
- Lets you ask questions in natural conversation
- Reminds you of things you tend to forget
- Coming soon: reads everything out loud via voice

## Tech stack

- **Baseten** — runs DeepSeek V3.1 as the AI brain
- **you.com** — real-time search for events, weather, and local info
- **Node.js + Express** — lightweight local server
- **ElevenLabs** — voice layer (coming soon)

## Getting started

### 1. Clone the repo

git clone https://github.com/yourusername/dayos.git
cd dayos

### 2. Install dependencies

npm install

### 3. Add your API keys

Copy the example env file and fill in your keys:

cp .env.example .env

Then open .env and replace the placeholder values with your 
real API keys:
- Baseten key: baseten.co → dashboard → API keys
- you.com key: you.com/api → sign up → copy key
- ElevenLabs key: elevenlabs.io → profile → API keys

### 4. Run the server

node server.js

### 5. Open the app

Go to http://localhost:3000 in your browser.
Click Plan My Day or type anything in the chat.

## Customize it for yourself

Open server.js and update the USER_CONTEXT block with your 
actual name, city, interests, and schedule. The more accurate 
this is, the more personal the responses will be.

## Folder structure

```
dayos/
├── server.js          # backend — routes, API calls, AI logic
├── index.html         # frontend — chat UI
├── package.json       # dependencies
├── .env               # your API keys (never commit this)
├── .env.example       # template for API keys (safe to commit)
├── .gitignore         # files to exclude from git
├── PRD.md             # product requirements document
└── README.md          # this file
```

## Coming soon

- VoiceRun integration — full two-way voice conversation
- Google Calendar sync — reads your real schedule
- Smart notifications — proactive nudges throughout the day
- Mobile app
