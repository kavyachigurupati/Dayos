const fetch = require('node-fetch');

const ZERO_USAGE = { prompt_tokens: 0, completion_tokens: 0 };

function formatFallback(toolResults) {
  if (!toolResults.length) {
    return 'DAYOS could not generate your briefing right now — AI generation unavailable. Try again later.';
  }
  const sections = toolResults.map(t => {
    const label = t.tool.replace(/_/g, ' ').toUpperCase();
    if (Array.isArray(t.result)) {
      const items = t.result.map(r => `  • ${r.title || JSON.stringify(r)}${r.url ? '\n    ' + r.url : ''}`).join('\n');
      return `${label}:\n${items}`;
    }
    if (typeof t.result === 'object') {
      return `${label}:\n${JSON.stringify(t.result, null, 2)}`;
    }
    return `${label}: ${t.result}`;
  });
  return `(AI generation unavailable — here's the raw data)\n\n${sections.join('\n\n')}`;
}

async function generateResponse(ctx, toolResults, userMessage) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  const systemPrompt = `You are DAYOS, a personal day intelligence assistant.
You know this person deeply — based in ${ctx.city || 'New York'}, PhD in machine learning, attends AI hackathons and conferences, follows NeurIPS/ICML/ICLR/CVPR/AAAI/ACL.
You are proactive, warm, and specific — like a smart friend, not a robot listing facts.
Always surface: time-sensitive actions, hackathon/conference early bird windows, Luma events worth attending.
Include real links (URLs) wherever you have them — registration pages, event pages, deadline pages. Format links as plain URLs on their own line.
Keep responses concise and specific.

IMPORTANT — date hygiene: Today is ${today}. Before mentioning any event, check its date. If the event date is before today, skip it entirely — do not mention it. Only surface events that are upcoming or currently open for registration. If you cannot confirm an event is in the future, omit it.

Their interests: ${(ctx.interests || []).join(', ')}.
Their reminders: ${(ctx.reminders || []).join('; ')}.`;

  const gathered = toolResults
    .map(t => `[${t.tool.replace(/_/g, ' ').toUpperCase()}]\n${typeof t.result === 'object' ? JSON.stringify(t.result, null, 2) : t.result}`)
    .join('\n\n');

  const userContent = `${userMessage}

Today is ${today}. My city: ${ctx.city || 'New York'}.
My upcoming plans: ${(ctx.upcoming_plans || []).join('; ')}

Information gathered:
${gathered || '(no external data gathered)'}`;

  try {
    const response = await fetch('https://inference.baseten.co/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Api-Key ${process.env.BASETEN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3.1',
        max_tokens: 350,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.error(`Baseten error ${response.status}:`, errText);
      return { text: formatFallback(toolResults), usage: ZERO_USAGE };
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || formatFallback(toolResults);
    const usage = data.usage || ZERO_USAGE;
    return { text, usage };
  } catch (err) {
    console.error('Baseten unavailable:', err.message);
    return { text: formatFallback(toolResults), usage: ZERO_USAGE };
  }
}

module.exports = { generateResponse };
