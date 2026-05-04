require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const { getCalendarEvents, createCalendarEvent, deleteCalendarEvent } = require('./tools/calendar');
const { searchWeb } = require('./tools/search');
const { sanitize } = require('./sanitizer');
const { generateResponse } = require('./baseten');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Tools Claude can call — definitions only, no personal data
const TOOLS = [
  {
    name: 'get_calendar_events',
    description: "Get the user's Google Calendar events for a given date. Use this to understand what's on their schedule and find free slots before scheduling anything.",
    input_schema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format. Omit for today.' },
      },
      required: [],
    },
  },
  {
    name: 'search_web',
    description: 'Search the web for real-time information. Returns structured results with title, URL, and snippet — always include the URL in your response so the user can click through. Use OR operators and includeDomains to combine multiple topics into one efficient query.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query. Use OR to combine topics: "AI hackathons OR luma events OR NeurIPS deadline 2026"',
        },
        count: {
          type: 'number',
          description: 'Number of results to return. Default 5, max 10.',
        },
        freshness: {
          type: 'string',
          description: 'Filter by recency: "day", "week", "month", "year"',
        },
        includeDomains: {
          type: 'array',
          items: { type: 'string' },
          description: 'Restrict results to these domains e.g. ["lu.ma","devpost.com","mlh.io"]',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_calendar_event',
    description: "Add an event to the user's Google Calendar. Always check get_calendar_events first to avoid scheduling conflicts. Only call this after the user has confirmed they want the event added.",
    input_schema: {
      type: 'object',
      properties: {
        title:       { type: 'string', description: 'Event title' },
        date:        { type: 'string', description: 'Date in YYYY-MM-DD format' },
        startTime:   { type: 'string', description: 'Start time in HH:MM 24hr format, e.g. 09:00' },
        endTime:     { type: 'string', description: 'End time in HH:MM 24hr format, e.g. 10:00' },
        description: { type: 'string', description: 'Optional event description or notes' },
        recurrence:  { type: 'string', description: 'Optional: DAILY, WEEKLY, or MONTHLY to repeat the event' },
      },
      required: ['title', 'date', 'startTime', 'endTime'],
    },
  },
  {
    name: 'delete_calendar_event',
    description: "Remove an event from the user's Google Calendar by its event ID. Only call this after the user explicitly asks to delete or remove an event.",
    input_schema: {
      type: 'object',
      properties: {
        eventId: { type: 'string', description: 'The calendar event ID to delete' },
      },
      required: ['eventId'],
    },
  },
];

async function executeTool(name, input) {
  if (name === 'get_calendar_events') {
    const raw = await getCalendarEvents(input.date);
    // sanitize before Claude sees it — only title, start, end, duration
    return sanitize({ events: raw }).schedule || [];
  }
  if (name === 'search_web') {
    return await searchWeb(input);
  }
  if (name === 'create_calendar_event') {
    return await createCalendarEvent(input);
  }
  if (name === 'delete_calendar_event') {
    return await deleteCalendarEvent(input.eventId);
  }
  throw new Error(`Unknown tool: ${name}`);
}

/**
 * Run the DAYOS agent for a given user message.
 * Claude decides what tools to call. Baseten generates the final response.
 *
 * @param {string} userMessage
 * @param {object} profile — full profile.json (stays on device, only sanitized version goes to Claude)
 * @returns {string} final response
 */
async function runAgent(userMessage, profile) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  const messages = [{ role: 'user', content: userMessage }];
  const toolResults = [];

  let claudeUsage = { input_tokens: 0, output_tokens: 0 };

  // ── Orchestration loop — Claude decides what to call ─────────────────────
  while (true) {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are the orchestration layer for DAYOS, a personal day intelligence assistant.
Today is ${today}.
Your job is to call the right tools to fulfill the user's request.
Do NOT write the final response — just call tools and gather information.

The user is based in New York, does a PhD in ML, works 9-5, attends AI hackathons and conferences.

Rules:
- For a morning briefing: make exactly 2 search_web calls:
    1. Weather only: query="weather New York today", count=1
    2. Everything else in one combined query: query="AI hackathons OR luma tech events OR NeurIPS ICML ICLR CVPR deadlines early bird NYC 2026", freshness="month", count=8, includeDomains=["lu.ma","devpost.com","mlh.io","neurips.cc","icml.cc","iclr.cc"]
  Also call get_calendar_events for today's schedule.
- For scheduling requests: always call get_calendar_events first to check for conflicts before proposing or creating anything.
- For create_calendar_event: only call it after the user has explicitly confirmed they want the event added. If they say "yes add it" or "go ahead" — create it.
- For delete_calendar_event: only call after explicit user confirmation.
- For chat questions about events, hackathons, or conferences: always call search_web with freshness="month" and include the current year (2026) in the query string. Use includeDomains when relevant.
- For all other chat questions: gather only what's needed to answer.
- Stop calling tools when you have enough information.`,
      tools: TOOLS,
      messages,
    });

    claudeUsage.input_tokens  += response.usage?.input_tokens  || 0;
    claudeUsage.output_tokens += response.usage?.output_tokens || 0;

    // Claude is done calling tools
    if (response.stop_reason === 'end_turn') break;
    if (response.stop_reason !== 'tool_use') break;

    // Execute all tool calls Claude requested
    const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
    messages.push({ role: 'assistant', content: response.content });

    const toolResultContents = await Promise.all(
      toolUseBlocks.map(async (block) => {
        let result;
        try {
          result = await executeTool(block.name, block.input);
        } catch (err) {
          result = `Error: ${err.message}`;
        }
        toolResults.push({ tool: block.name, input: block.input, result });
        return {
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result),
        };
      })
    );

    messages.push({ role: 'user', content: toolResultContents });
  }

  // ── Generation — Baseten writes the actual response with full profile ─────
  const ctx = sanitize({ profile });
  const { text, usage: basetenUsage } = await generateResponse(ctx, toolResults, userMessage);

  const usage = {
    claude:  { input: claudeUsage.input_tokens,  output: claudeUsage.output_tokens },
    baseten: { input: basetenUsage.prompt_tokens, output: basetenUsage.completion_tokens },
  };

  console.log(
    `[tokens] claude in=${usage.claude.input} out=${usage.claude.output} | ` +
    `baseten in=${usage.baseten.input} out=${usage.baseten.output}`
  );

  return { text, usage };
}

module.exports = { runAgent };
