import { DateTime } from 'luxon';
import {
  Location, addDays, addMinutes, elongation, moonSidereal, sunSidereal,
  searchAngle, riseSet, newMoons,
} from './astro.ts';
import { MASA_NAMES, NAKSHATRA_NAMES, RASHI_NAMES, tithiName, type Paksha } from './constants.ts';

export interface Lunation {
  start: Date;        // new moon that begins the month (amanta)
  end: Date;          // next new moon
  masa: number;       // amanta month index, 0 = Chaitra
  adhika: boolean;    // intercalary month (no sankranti within lunation)
}

/** Lunations overlapping [from, to], with amanta month names and adhika detection. */
export function lunations(from: Date, to: Date): Lunation[] {
  const nms = newMoons(addDays(from, -45), addDays(to, 45));
  const out: Lunation[] = [];
  for (let i = 0; i < nms.length - 1; i++) {
    const r0 = Math.floor(sunSidereal(nms[i]) / 30);
    const r1 = Math.floor(sunSidereal(nms[i + 1]) / 30);
    out.push({ start: nms[i], end: nms[i + 1], masa: (r0 + 1) % 12, adhika: r0 === r1 });
  }
  return out.filter((l) => l.end > from && l.start < to);
}

export function lunationAt(lunas: Lunation[], t: Date): Lunation {
  const l = lunas.find((x) => x.start <= t && t < x.end);
  if (!l) throw new Error('lunationAt: instant outside computed range');
  return l;
}

/** Start/end of tithi n (1..30) within a lunation. */
export function tithiInterval(l: Lunation, n: number): { start: Date; end: Date } {
  const start = n === 1 ? l.start : searchAngle(elongation, (n - 1) * 12, l.start, 6);
  const end = n === 30 ? l.end : searchAngle(elongation, n * 12, start, 6);
  return { start, end };
}

export const tithiAt = (t: Date) => Math.floor(elongation(t) / 12) + 1; // 1..30
export const nakshatraAt = (t: Date) => Math.floor(moonSidereal(t) / (360 / 27)) + 1; // 1..27

// ---------- civil days ----------

export function localMidnight(isoDate: string, loc: Location): Date {
  return DateTime.fromISO(isoDate, { zone: loc.timeZone }).startOf('day').toJSDate();
}
export function localDate(t: Date, loc: Location): string {
  return DateTime.fromJSDate(t, { zone: loc.timeZone }).toISODate()!;
}
export function localISO(t: Date | null | undefined, loc: Location): string | null {
  if (!t) return null;
  // Minute precision: published times are rounded to the minute.
  return DateTime.fromJSDate(new Date(Math.round(t.getTime() / 60_000) * 60_000), { zone: loc.timeZone }).toFormat("yyyy-MM-dd'T'HH:mmZZ");
}
export function nextDate(isoDate: string, n = 1): string {
  return DateTime.fromISO(isoDate).plus({ days: n }).toISODate()!;
}

export interface SolarDay {
  date: string;
  sunrise: Date;
  sunset: Date;
  nextSunrise: Date;
  moonrise: Date | null; // within this civil date, else null
  moonset: Date | null;
}

const solarCache = new Map<string, SolarDay>();

export function solarDay(isoDate: string, loc: Location): SolarDay {
  const key = `${loc.id}|${isoDate}`;
  const hit = solarCache.get(key);
  if (hit) return hit;
  const m0 = localMidnight(isoDate, loc);
  const m1 = localMidnight(nextDate(isoDate), loc);
  const sunrise = riseSet('Sun', loc, 1, m0)!;
  const sunset = riseSet('Sun', loc, -1, sunrise)!;
  const nextSunrise = riseSet('Sun', loc, 1, sunset)!;
  const mr = riseSet('Moon', loc, 1, m0);
  const ms = riseSet('Moon', loc, -1, m0);
  const day: SolarDay = {
    date: isoDate, sunrise, sunset, nextSunrise,
    moonrise: mr && mr < m1 ? mr : null,
    moonset: ms && ms < m1 ? ms : null,
  };
  solarCache.set(key, day);
  return day;
}

// ---------- daily panchang ----------

export interface DailyPanchang {
  date: string;
  location: string;
  sunrise: string; sunset: string;
  moonrise: string | null; moonset: string | null;
  tithi: { number: number; paksha: Paksha; name: string; endsAt: string | null };
  /** A second tithi that begins and ends between this sunrise and the next (kshaya). */
  kshayaTithi: { number: number; paksha: Paksha; name: string; endsAt: string | null } | null;
  nakshatra: { number: number; name: string; endsAt: string | null };
  masa: { amanta: string; purnimanta: string; adhika: boolean };
  sunRashi: string;
}

export function dailyPanchang(isoDate: string, loc: Location, lunas: Lunation[]): DailyPanchang {
  const sd = solarDay(isoDate, loc);
  const sr = sd.sunrise;
  const n = tithiAt(sr);
  const tEnd = searchAngle(elongation, (n * 12) % 360, sr, 6);
  const t = tithiName(n);
  let kshaya: DailyPanchang['kshayaTithi'] = null;
  if (tEnd < sd.nextSunrise) {
    const n2 = (n % 30) + 1;
    const t2End = searchAngle(elongation, (n2 * 12) % 360, addMinutes(tEnd, 1), 6);
    if (t2End < sd.nextSunrise) {
      const t2 = tithiName(n2);
      kshaya = { number: n2, paksha: t2.paksha, name: t2.name, endsAt: localISO(t2End, loc) };
    }
  }
  const nk = nakshatraAt(sr);
  const nkEnd = searchAngle(moonSidereal, (nk * (360 / 27)) % 360, sr, 3);
  const l = lunationAt(lunas, sr);
  const purn = t.paksha === 'Krishna' ? (l.masa + 1) % 12 : l.masa;
  return {
    date: isoDate,
    location: loc.id,
    sunrise: localISO(sr, loc)!, sunset: localISO(sd.sunset, loc)!,
    moonrise: localISO(sd.moonrise, loc), moonset: localISO(sd.moonset, loc),
    tithi: { number: t.number, paksha: t.paksha, name: t.name, endsAt: localISO(tEnd, loc) },
    kshayaTithi: kshaya,
    nakshatra: { number: nk, name: NAKSHATRA_NAMES[nk - 1], endsAt: localISO(nkEnd, loc) },
    masa: { amanta: MASA_NAMES[l.masa], purnimanta: MASA_NAMES[purn], adhika: l.adhika },
    sunRashi: RASHI_NAMES[Math.floor(sunSidereal(sr) / 30)],
  };
}

// ---------- sankrantis ----------

export interface Sankranti { rashi: string; index: number; moment: string; civilDate: string; observedDate: string }

/** Solar ingresses. Observed date moves to the next day when the ingress falls after local sunset. */
export function sankrantis(from: Date, to: Date, loc: Location): Sankranti[] {
  const out: Sankranti[] = [];
  let t = from;
  let r = Math.floor(sunSidereal(t) / 30);
  for (;;) {
    const next = (r + 1) % 12;
    const moment = searchAngle(sunSidereal, next * 30, t, 24, 40);
    if (moment >= to) break;
    const civil = localDate(moment, loc);
    const sd = solarDay(civil, loc);
    out.push({
      rashi: RASHI_NAMES[next], index: next,
      moment: localISO(moment, loc)!, civilDate: civil,
      observedDate: moment > sd.sunset ? nextDate(civil) : civil,
    });
    t = addMinutes(moment, 60);
    r = next;
  }
  return out;
}
