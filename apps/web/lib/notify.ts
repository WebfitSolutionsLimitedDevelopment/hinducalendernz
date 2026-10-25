import 'server-only';
import { SITE } from './site';

const site = () => process.env.SITE_URL ?? 'https://www.hinducalendar.co.nz';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

/** Simple branded HTML wrapper for outgoing emails. */
function html(paragraphs: string[], footer: string) {
  const body = paragraphs.map((p) => `<p style="margin:0 0 14px">${p}</p>`).join('');
  return `<!doctype html><html><body style="margin:0;background:#FBF5EA;font-family:Arial,Helvetica,sans-serif;color:#2A1A14">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #E4D6BE;border-radius:12px">
<tr><td style="background:#6E1A2A;color:#ffffff;padding:16px 24px;border-radius:12px 12px 0 0;font-size:20px;font-weight:bold">Hindu Calendar NZ <span style="color:#D4952A;font-weight:normal">· हिन्दू पंचांग</span></td></tr>
<tr><td style="padding:24px;font-size:15px;line-height:1.6">${body}</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #E4D6BE;font-size:12px;color:#5E4636">${footer}</td></tr>
</table></td></tr></table></body></html>`;
}

/** Sends one email via Resend. Does nothing until RESEND_API_KEY and REMINDER_FROM_EMAIL are set. Never throws. */
export async function sendEmail(opts: { to: string; subject: string; text: string; html?: string; replyTo?: string; headers?: Record<string, string> }) {
  const key = process.env.RESEND_API_KEY, from = process.env.REMINDER_FROM_EMAIL;
  if (!key || !from) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from, to: opts.to, subject: opts.subject, text: opts.text, html: opts.html,
        reply_to: opts.replyTo ?? SITE.email, headers: opts.headers,
      }),
    });
    if (!r.ok) console.error('sendEmail failed', r.status, await r.text());
    return r.ok;
  } catch (e) {
    console.error('sendEmail failed', e);
    return false;
  }
}

/** Emails the team about a new form submission. */
export async function notifyTeam(subject: string, fields: Record<string, unknown>) {
  const text = Object.entries(fields)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');
  await sendEmail({ to: process.env.NOTIFY_EMAIL ?? SITE.email, subject: `[Hindu Calendar NZ] ${subject}`, text });
}

const contactLine = `Questions? Reply to this email, write to ${SITE.email} or call ${SITE.phone}.`;

/** Confirmation to the person who submitted a form. `kind` picks the wording. */
export async function confirmToSender(
  kind: 'signup' | 'temple' | 'sponsor' | 'correction',
  to: string,
  details: { name?: string | null; subject?: string | null; unsubToken?: string | null },
) {
  const hi = details.name ? `Kia ora ${details.name},` : 'Kia ora,';
  const s = site();
  let subject = '', lines: string[] = [];
  let footer = `${esc(contactLine)}<br>Hindu Calendar NZ · <a href="${s}" style="color:#6E1A2A">${s.replace('https://', '')}</a>`;
  let headers: Record<string, string> | undefined;

  if (kind === 'signup') {
    subject = 'Welcome to Hindu Calendar NZ';
    lines = [
      hi,
      'Thank you for joining the Hindu Calendar NZ mailing list. We’ll let you know when the year’s dates are verified, when the printed calendar is available, and about new features.',
      `In the meantime, you can see festival dates and puja times for your city at ${s}/calendar, and set up free reminders on your phone at ${s}/reminders.`,
    ];
    if (details.unsubToken) {
      const u = `${s}/unsubscribe?t=${details.unsubToken}`;
      footer += `<br>Don’t want these emails? <a href="${u}" style="color:#6E1A2A">Unsubscribe</a>.`;
      headers = { 'List-Unsubscribe': `<${u}>` };
      lines.push(`To unsubscribe at any time: ${u}`);
    }
  } else if (kind === 'temple') {
    subject = 'Thanks — we’ve received your temple listing';
    lines = [hi, `Thank you for sending us details for ${details.subject ?? 'your temple or organisation'}. We’ll check them and update the directory, usually within a few days.`, `You can see the directory at ${s}/temples.`];
  } else if (kind === 'sponsor') {
    subject = 'Thanks for your interest in sponsoring Hindu Calendar NZ';
    lines = [hi, `Thank you for your sponsorship enquiry${details.subject ? ` on behalf of ${details.subject}` : ''}. We’ll be in touch within two working days to talk about options.`];
  } else {
    subject = 'Thanks — we’ve received your correction';
    lines = [hi, `Thank you for taking the time to report ${details.subject ? `a correction about ${details.subject}` : 'a correction'}. Our editor will review it, and accepted corrections are published on ${s}/corrections.`];
  }
  lines.push('Warm regards,\nHindu Calendar NZ');
  const text = `${lines.join('\n\n')}\n\n—\n${contactLine}`;
  return sendEmail({ to, subject, text, html: html(lines.map((l) => esc(l).replace(/\n/g, '<br>')), footer), headers });
}
