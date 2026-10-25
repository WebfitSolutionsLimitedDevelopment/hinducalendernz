import * as Astronomy from 'astronomy-engine';

export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timeZone: string; // IANA, e.g. Pacific/Auckland
}

const MIN = 60_000;
const DAY = 86_400_000;

export const addMinutes = (d: Date, m: number) => new Date(d.getTime() + m * MIN);
export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * DAY);

const norm360 = (x: number) => ((x % 360) + 360) % 360;

/** Moon–Sun geocentric ecliptic elongation, 0..360°. Tithi = floor(elongation / 12). */
export function elongation(t: Date): number {
  return Astronomy.MoonPhase(t);
}

/**
 * Lahiri (Chitrapaksha) ayanamsa, linear approximation.
 * 23.8571° at J2000.0 plus general precession 50.288"/year.
 * Accurate to ~0.01° over 1950–2050 — adequate for nakshatra and
 * sankranti timing to within a few minutes. Tithi does NOT use it.
 */
export function ayanamsaLahiri(t: Date): number {
  const years = (t.getTime() - Date.UTC(2000, 0, 1, 12)) / (365.25 * DAY);
  return 23.8571 + (50.288 / 3600) * years;
}

export function sunSidereal(t: Date): number {
  return norm360(Astronomy.SunPosition(t).elon - ayanamsaLahiri(t));
}

export function moonSidereal(t: Date): number {
  return norm360(Astronomy.EclipticGeoMoon(t).lon - ayanamsaLahiri(t));
}

/**
 * Find the first instant after `from` when the increasing angle `f` reaches `target` (deg).
 * Steps forward by `stepHours` until the signed difference changes sign, then bisects to 1 s.
 */
export function searchAngle(f: (t: Date) => number, target: number, from: Date, stepHours: number, maxDays = 40): Date {
  const diff = (t: Date) => ((f(t) - target + 540) % 360) - 180; // (-180, 180]
  let a = from;
  let da = diff(a);
  if (da === 0) return a;
  const step = stepHours * 3_600_000;
  for (let i = 0; i * stepHours < maxDays * 24; i++) {
    const b = new Date(a.getTime() + step);
    const db = diff(b);
    if (da < 0 && db >= 0) {
      let lo = a, hi = b;
      while (hi.getTime() - lo.getTime() > 1000) {
        const mid = new Date((lo.getTime() + hi.getTime()) / 2);
        if (diff(mid) < 0) lo = mid; else hi = mid;
      }
      return hi;
    }
    a = b; da = db;
  }
  throw new Error(`searchAngle: target ${target} not reached within ${maxDays} days`);
}

function observer(loc: Location) {
  return new Astronomy.Observer(loc.latitude, loc.longitude, loc.elevation);
}

/** Next rise (+1) or set (-1) of a body after `from`, or null if none within `limitDays`. */
export function riseSet(body: 'Sun' | 'Moon', loc: Location, direction: 1 | -1, from: Date, limitDays = 1.2): Date | null {
  const b = body === 'Sun' ? Astronomy.Body.Sun : Astronomy.Body.Moon;
  const r = Astronomy.SearchRiseSet(b, observer(loc), direction, from, limitDays);
  return r ? r.date : null;
}

export interface MoonQuarterEvent { quarter: 0 | 1 | 2 | 3; time: Date }

export function moonQuarters(from: Date, to: Date): MoonQuarterEvent[] {
  const out: MoonQuarterEvent[] = [];
  let mq = Astronomy.SearchMoonQuarter(from);
  while (mq.time.date < to) {
    out.push({ quarter: mq.quarter as 0 | 1 | 2 | 3, time: mq.time.date });
    mq = Astronomy.NextMoonQuarter(mq);
  }
  return out;
}

/** New moons (elongation = 0) between two instants. */
export function newMoons(from: Date, to: Date): Date[] {
  const out: Date[] = [];
  let t = from;
  for (;;) {
    const r = Astronomy.SearchMoonPhase(0, t, 40);
    if (!r || r.date >= to) break;
    out.push(r.date);
    t = addDays(r.date, 1);
  }
  return out;
}
