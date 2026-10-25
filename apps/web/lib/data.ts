import 'server-only';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  JsonFileStore, isPublic,
  type DayRecord, type FestivalRecord, type HolidayRecord, type MoonPhaseRecord,
} from '@hindu-calendar/calendar-data';

// Phase 1: JSON files in /data. Swap JsonFileStore for a database-backed
// CalendarStore later; nothing else in the app needs to change.
const DATA_DIR = join(process.cwd(), '..', '..', 'data');
const store = new JsonFileStore(async (p) => JSON.parse(await readFile(join(DATA_DIR, p), 'utf8')));

export const YEAR = 2027;
export const CITY = 'auckland';
export const CITY_LABEL = 'Auckland, New Zealand';

/**
 * 'preview'  – shows CALCULATED (unreviewed) data with a clear banner. For internal review only.
 * 'public'   – shows only APPROVED / PUBLISHED festival records. Default.
 */
export const MODE: 'preview' | 'public' = process.env.DATA_MODE === 'preview' ? 'preview' : 'public';
export const showCalculated = MODE === 'preview';

export async function getDays(): Promise<DayRecord[]> {
  return store.days(YEAR, CITY);
}

export async function getFestivals(): Promise<FestivalRecord[]> {
  const all = await store.festivals(YEAR, CITY);
  return all
    .filter((f) => showCalculated || isPublic(f))
    .map((f) => ({ ...f, slug: f.slug ?? f.id }));
}

export async function getFestival(slug: string) {
  return (await getFestivals()).find((f) => f.slug === slug) ?? null;
}

export async function getHolidays(): Promise<HolidayRecord[]> {
  return store.holidays(YEAR);
}

export async function getMoonPhases(): Promise<MoonPhaseRecord[]> {
  return store.moonPhases(YEAR, CITY);
}

/** "2027-10-29T19:50+13:00" → "7:50 pm" (time already in local zone). */
export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [h, m] = iso.slice(11, 16).split(':').map(Number);
  const ap = h >= 12 ? 'pm' : 'am';
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${ap}`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const monthName = (m: number) => MONTHS[m - 1];

export function fmtDate(iso: string, opts: { weekday?: boolean } = {}): string {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  const wd = WD[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${opts.weekday ? wd + ' ' : ''}${d} ${MONTHS[m - 1]} ${y}`;
}

/** Same-day "time on date" if the instant falls on a different civil date. */
export function fmtTimeOn(iso: string | null | undefined, refDate: string): string {
  if (!iso) return '—';
  return iso.slice(0, 10) === refDate ? fmtTime(iso) : `${fmtTime(iso)}, ${fmtDate(iso, { weekday: true })}`;
}
