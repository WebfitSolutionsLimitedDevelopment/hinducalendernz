import { fmtTime, fmtDate } from './format';
import { cityLabel } from './cities';
import type { Festival } from './data';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

/** Fold lines to 75 octets as required by RFC 5545. */
function fold(line: string) {
  const out: string[] = [];
  let cur = '';
  for (const ch of line) {
    if (Buffer.byteLength(cur + ch) > 74) { out.push(cur); cur = ' ' + ch; } else cur += ch;
  }
  out.push(cur);
  return out.join('\r\n');
}

const ymd = (iso: string) => iso.slice(0, 10).replace(/-/g, '');
const nextDay = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
};

export function timingSummary(f: Festival) {
  const t = f.timing;
  if (t.windowStart) return `${fmtTime(t.windowStart)} – ${fmtTime(t.windowEnd)}`;
  if (t.moonrise) return `Moonrise ${fmtTime(t.moonrise)}`;
  if (t.paranaStart) return `Parana ${fmtTime(t.paranaStart)} – ${fmtTime(t.paranaEnd)} (${fmtDate(t.paranaStart, { weekday: true, short: true })})`;
  return '';
}

export function buildIcs(opts: { name: string; city: string; site: string; festivals: Festival[] }) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hindu Calendar NZ//hinducalendar.co.nz//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    `X-WR-CALNAME:${esc(opts.name)}`, 'X-WR-TIMEZONE:Pacific/Auckland', 'REFRESH-INTERVAL;VALUE=DURATION:P1D', 'X-PUBLISHED-TTL:P1D',
  ];
  for (const f of opts.festivals) {
    const url = `${opts.site}/festivals/${opts.city}/${f.date.slice(0, 4)}/${f.slug}`;
    const timing = timingSummary(f);
    const desc = [
      timing && `${cityLabel(opts.city)}: ${timing}`,
      f.basis,
      f.status === 'CALCULATED' ? 'Calculated for your city; being reviewed.' : '',
      url,
    ].filter(Boolean).join('\n');
    lines.push(
      'BEGIN:VEVENT',
      `UID:${f.slug}-${f.date}-${opts.city}@hinducalendar.co.nz`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(f.date)}`,
      `DTEND;VALUE=DATE:${ymd(nextDay(f.date))}`,
      `SUMMARY:${esc(f.name + (timing ? ` (${timing})` : ''))}`,
      `DESCRIPTION:${esc(desc)}`,
      `URL:${url}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** Google Calendar "add event" link for a single all-day festival. */
export function googleAddLink(f: Festival, city: string, site: string) {
  const url = `${site}/festivals/${city}/${f.date.slice(0, 4)}/${f.slug}`;
  const timing = timingSummary(f);
  const p = new URLSearchParams({
    action: 'TEMPLATE',
    text: f.name,
    dates: `${ymd(f.date)}/${ymd(nextDay(f.date))}`,
    details: [timing && `${cityLabel(city)}: ${timing}`, url].filter(Boolean).join('\n'),
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
