const { google } = require('googleapis');
const { getAuthClient, isConnected } = require('./calendar');

async function sendBriefingEmail({ to, briefing, date }) {
  if (!isConnected()) throw new Error('Google not connected — run auth first.');

  const auth = getAuthClient();
  const gmail = google.gmail({ version: 'v1', auth });

  const subject = `DAYOS — ${date}`;

  // plain text + simple HTML so it reads well in any email client
  const html = `
<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 2rem; color: #2d2416; background: #fdfaf5;">
  <h2 style="font-family: Georgia, serif; font-size: 1.1rem; color: #7c6f5a; font-weight: normal; margin-bottom: 1.5rem; border-bottom: 1px dashed #d4c5a9; padding-bottom: 0.75rem;">
    DAYOS &mdash; ${date}
  </h2>
  <div style="font-size: 1rem; line-height: 1.75; white-space: pre-wrap;">${briefing.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
  <p style="margin-top: 2rem; font-size: 0.8rem; color: #c9b99a; border-top: 1px dashed #d4c5a9; padding-top: 0.75rem;">
    sent by DAYOS &middot; reply to this email or open the app to chat
  </p>
</div>`;

  // RFC 2822 format required by Gmail API
  const raw = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
  ].join('\r\n');

  const encoded = Buffer.from(raw).toString('base64url');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded },
  });
}

module.exports = { sendBriefingEmail };
