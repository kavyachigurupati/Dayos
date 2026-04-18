require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const PORT = process.env.PORT || 3000;
const BASETEN_API_KEY = process.env.BASETEN_API_KEY;
const YDC_API_KEY = process.env.YDC_API_KEY;

// Hardcoded user context for the demo
const USER_CONTEXT = {
    name: "Your Name",
    city: "New York",
    interests: [
      "badminton",
      "exploring new places in New York",
      "tech conferences and meetups",
      "trying new restaurants and food spots",
      "discovering new events and experiences in the city"
    ],
    habits: {
      morning: "likes to plan the day early",
      activity: "plays badminton regularly, always looking for courts or pickup games",
      social: "enjoys going out and exploring the city",
      work: "attends tech conferences and networking events but often forgets to register early"
    },
    reminders: [
      "always forgets to book conference tickets until its too late",
      "loves being outdoors when weather is good",
      "open to spontaneous plans if something interesting is happening nearby",
      "likes knowing about badminton courts, open play sessions, or sports events",
      "enjoys trying new neighborhoods, pop-ups, food markets, and hidden gems in NYC"
    ],
    proactive_suggestions: [
      "if weather is nice, suggest somewhere to go outside or play badminton",
      "if there is a tech event or conference happening soon in NYC, flag it",
      "if a new restaurant or food experience opened nearby, mention it",
      "if there is something spontaneous and interesting happening today, surface it",
      "always tell me if there are open badminton sessions or sports courts available"
    ],
    schedule: [
      { time: "10:00 AM", event: "Team standup call" },
      { time: "3:00 PM", event: "Meeting at WeWork Midtown" }
    ]
  };

// Step 1 — search you.com for local events and weather
async function searchYouCom(query) {
  const url = `https://api.ydc-index.io/search?query=${encodeURIComponent(query)}&num_web_results=3`;
  const response = await fetch(url, {
    headers: {
      'X-API-Key': YDC_API_KEY
    }
  });
  const data = await response.json();
  // extract snippets from results
  const hits = data.hits || [];
  return hits.map(h => h.snippets?.join(' ') || h.description || '').join('\n\n');
}

// Step 2 — call Baseten with Llama 4 Maverick
async function callBaseten(systemPrompt, userMessage) {
  const response = await fetch('https://inference.baseten.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Api-Key ${BASETEN_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-ai/DeepSeek-V3.1',
      max_tokens: 600,
      temperature: 0.7,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    })
  });
  const data = await response.json();
    console.log('Baseten response:', JSON.stringify(data, null, 2));
    return data.choices?.[0]?.message?.content || 'Sorry, could not generate a briefing.';
}

// Main route — plan my day
app.post('/plan', async (req, res) => {
  try {
    console.log('Planning day for', USER_CONTEXT.name, 'in', USER_CONTEXT.city);

    // search you.com for three things in parallel
    const [eventsData, weatherData, sportsData] = await Promise.all([
      searchYouCom(`things to do in ${USER_CONTEXT.city} today 2026`),
      searchYouCom(`weather ${USER_CONTEXT.city} today`),
      searchYouCom(`NBA basketball games today 2026`)
    ]);

    console.log('Search complete, calling Baseten...');

    const systemPrompt = `You are DAYOS, a personal day intelligence assistant. 
You know the user deeply and give them a warm, natural, proactive morning briefing.
Keep it conversational, like a smart friend talking to them — not a robot listing facts.
Be specific. Be useful. Surface one surprise or thing they might have missed.
Keep the briefing under 200 words.`;

    const userMessage = `
Plan my day. Here is my context:

Name: ${USER_CONTEXT.name}
City: ${USER_CONTEXT.city}
Interests: ${USER_CONTEXT.interests.join(', ')}

My schedule today:
${USER_CONTEXT.schedule.map(s => `- ${s.time}: ${s.event}`).join('\n')}

Here is what is happening today based on live search:

WEATHER:
${weatherData}

LOCAL EVENTS & THINGS TO DO:
${eventsData}

BASKETBALL TODAY:
${sportsData}

Give me my morning briefing. Be proactive — tell me something I should know, something I might enjoy, and make sure I am ready for my day.
    `;

    const briefing = await callBaseten(systemPrompt, userMessage);

    res.json({ success: true, briefing });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/chat', async (req, res) => {
    try {
      const { message, history } = req.body;
  
      const systemPrompt = `You are DAYOS, a personal day intelligence assistant.
  You know the user deeply — they are based in New York, love badminton, enjoy going out and exploring the city, attend tech conferences, and like trying new restaurants and experiences.
  You are proactive, warm, and helpful like a smart friend.
  When they ask about something, search for real current information and give specific useful answers.
  Keep responses concise and actionable.`;
  
      const response = await fetch('https://inference.baseten.co/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Api-Key ${BASETEN_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-ai/DeepSeek-V3.1',
          max_tokens: 400,
          temperature: 0.7,
          messages: [
            { role: 'system', content: systemPrompt },
            ...history.slice(-6),
            { role: 'user', content: message }
          ]
        })
      });
  
      const data = await response.json();
      const reply = data.choices?.[0]?.message?.content || 'Sorry, could not get a response.';
      res.json({ success: true, reply });
  
    } catch (error) {
      console.error('Chat error:', error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  });
  

app.listen(PORT, () => {
  console.log(`DAYOS running at http://localhost:${PORT}`);
});