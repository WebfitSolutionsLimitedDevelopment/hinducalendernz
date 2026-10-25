// Date/time formatting for ISO strings that already carry the local NZ offset.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const monthName = (m: number) => MONTHS[m - 1];

/** "2027-10-29T19:50+13:00" → "7:50 pm" */
export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [h, m] = iso.slice(11, 16).split(':').map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
}

export function fmtDate(iso: string, opts: { weekday?: boolean; short?: boolean } = {}): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const wd = WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  if (opts.short) return `${opts.weekday ? wd.slice(0, 3) + ' ' : ''}${d} ${MONTHS[m - 1].slice(0, 3)}`;
  return `${opts.weekday ? wd + ' ' : ''}${d} ${MONTHS[m - 1]} ${y}`;
}

/** Time, with the date added when the instant is on a different civil date. */
export function fmtTimeOn(iso: string | null | undefined, refDate: string): string {
  if (!iso) return '—';
  return iso.slice(0, 10) === refDate ? fmtTime(iso) : `${fmtTime(iso)}, ${fmtDate(iso, { weekday: true })}`;
}
