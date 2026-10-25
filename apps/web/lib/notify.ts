import 'server-only';
import { SITE } from './site';

/**
 * Emails the team about a new form submission (via Resend).
 * Does nothing until RESEND_API_KEY and REMINDER_FROM_EMAIL are set. Never throws.
 */
export async function notifyTeam(subject: string, fields: Record<string, unknown>) {
  const key = process.env.RESEND_API_KEY, from = process.env.REMINDER_FROM_EMAIL;
  if (!key || !from) return;
  const text = Object.entries(fields)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from, to: process.env.NOTIFY_EMAIL ?? SITE.email, subject: `[Hindu Calendar NZ] ${subject}`, text }),
    });
  } catch (e) {
    console.error('notifyTeam failed', e);
  }
}
