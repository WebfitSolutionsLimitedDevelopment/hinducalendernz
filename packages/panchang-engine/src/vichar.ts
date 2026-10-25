/**
 * Panchang "vichar" periods and yogas — Bhadra, Gandmool, Panchak, Surya nakshatra,
 * Sarvartha/Amrit Siddhi, Ravi, Dwipushkar/Tripushkar, Chaughadiya, and Vivah muhurat candidates.
 * All instants are computed for a location; callers format them in local time.
 */
import * as Astronomy from 'astronomy-engine';
import { Location, elongation, moonSidereal, sunSidereal, searchAngle, addDays } from './astro.ts';
import { solarDay, localDate, nextDate } from './panchang.ts';

export interface Span { start: Date; end: Date }
const NAK = 360 / 27;

/** Consecutive segments of the angle f (each `step` degrees wide) covering [from, to). `backDays` must exceed one segment's length. */
function segments(f: (t: Date) => number, step: number, from: Date, to: Date, stepHours: number, backDays: number): { index: number; start: Date; end: Date }[] {
  const out: { index: number; start: Date; end: Date }[] = [];
  const n = Math.round(360 / step);
  let idx = Math.floor(f(from) / step) % n;
  let start = searchAngle(f, idx * step, addDays(from, -backDays), stepHours, backDays + 5);
  while (start < to) {
    const nextIdx = (idx + 1) % n;
    const end = searchAngle(f, nextIdx * step, new Date(start.getTime() + 1000), stepHours, 400);
    out.push({ index: idx, start, end });
    idx = nextIdx; start = end;
  }
  return out;
}

/** Moon's nakshatra spans (index 1..27). */
export function moonNakshatras(from: Date, to: Date) {
  return segments(moonSidereal, NAK, from, to, 3, 1.5).map((s) => ({ nakshatra: s.index + 1, start: s.start, end: s.end }));
}
/** Sun's nakshatra spans (index 1..27). */
export function sunNakshatras(from: Date, to: Date) {
  return segments(sunSidereal, NAK, from, to, 24, 16).map((s) => ({ nakshatra: s.index + 1, start: s.start, end: s.end }));
}
/** Karana spans (0..59 within the lunar month: 0 Kimstughna, 1..56 movable, 57 Shakuni, 58 Chatushpada, 59 Naga). */
export function karanas(from: Date, to: Date) {
  return segments(elongation, 6, from, to, 2, 0.9).map((s) => ({ karana: s.index, start: s.start, end: s.end }));
}

/** Bhadra = Vishti karana (every 7th movable karana). */
export function bhadra(from: Date, to: Date): Span[] {
  return karanas(from, to).filter((k) => k.karana >= 1 && k.karana <= 56 && (k.karana - 1) % 7 === 6).map(({ start, end }) => ({ start, end }));
}

const merge = (xs: Span[]) => {
  const out: Span[] = [];
  for (const x of xs) {
    const last = out[out.length - 1];
    if (last && Math.abs(last.end.getTime() - x.start.getTime()) < 120_000) last.end = x.end; else out.push({ ...x });
  }
  return out;
};

/** Gandmool: Moon in Ashwini, Ashlesha, Magha, Jyeshtha, Mula or Revati (junction pairs merged). */
export function gandmool(from: Date, to: Date) {
  const G = new Set([1, 9, 10, 18, 19, 27]);
  const spans = moonNakshatras(from, to).filter((s) => G.has(s.nakshatra));
  const out: { start: Date; end: Date; first: number; last: number }[] = [];
  for (const s of spans) {
    const last = out[out.length - 1];
    if (last && Math.abs(last.end.getTime() - s.start.getTime()) < 120_000) { last.end = s.end; last.last = s.nakshatra; }
    else out.push({ start: s.start, end: s.end, first: s.nakshatra, last: s.nakshatra });
  }
  return out;
}

/** Panchak: Moon from the second half of Dhanishta to the end of Revati (sidereal 300°–360°). */
export function panchak(from: Date, to: Date): Span[] {
  const out: Span[] = [];
  let t = addDays(from, -3);
  while (t < to) {
    const start = searchAngle(moonSidereal, 300, t, 3, 40);
    const end = searchAngle(moonSidereal, 0, start, 3, 40);
    if (end > from && start < to) out.push({ start, end });
    t = new Date(end.getTime() + 60_000);
  }
  return out;
}

// ---------- day yogas ----------
// Weekday 0 = Sunday. Nakshatra numbers 1..27.
export const SARVARTHA: Record<number, number[]> = {
  0: [13, 19, 21, 12, 26, 8, 1], 1: [22, 4, 5, 8, 17], 2: [1, 26, 3, 9], 3: [4, 17, 13, 3, 5],
  4: [27, 17, 1, 7, 8], 5: [27, 17, 1, 7, 22], 6: [22, 4, 15],
};
export const AMRIT: Record<number, number> = { 0: 13, 1: 5, 2: 1, 3: 17, 4: 8, 5: 27, 6: 4 };
const DWIPADA = new Set([5, 14, 23]);
const TRIPADA = new Set([3, 7, 12, 16, 21, 25]);
const BHADRA_TITHI = new Set([2, 7, 12, 17, 22, 27]);

export interface DayYoga { kind: 'sarvartha' | 'amrit' | 'ravi' | 'dwipushkar' | 'tripushkar'; date: string; start: Date; end: Date }

const overlap = (a: Span, b: Span): Span | null => {
  const s = a.start > b.start ? a.start : b.start, e = a.end < b.end ? a.end : b.end;
  return s < e ? { start: s, end: e } : null;
};

/** Tithi spans (1..30). */
export function tithis(from: Date, to: Date) {
  return segments(elongation, 12, from, to, 6, 1.4).map((s) => ({ tithi: s.index + 1, start: s.start, end: s.end }));
}

export function dayYogas(fromDate: string, toDate: string, loc: Location): DayYoga[] {
  const out: DayYoga[] = [];
  const first = solarDay(fromDate, loc).sunrise, last = solarDay(toDate, loc).nextSunrise;
  const nks = moonNakshatras(addDays(first, -2), addDays(last, 2));
  const sunNks = sunNakshatras(addDays(first, -20), addDays(last, 2));
  const tts = tithis(addDays(first, -2), addDays(last, 2));
  for (let d = fromDate; d <= toDate; d = nextDate(d)) {
    const sd = solarDay(d, loc);
    const day: Span = { start: sd.sunrise, end: sd.nextSunrise };
    const wd = new Date(d + 'T12:00Z').getUTCDay();
    for (const n of nks) {
      const o = overlap(day, n);
      if (!o) continue;
      if (SARVARTHA[wd].includes(n.nakshatra)) out.push({ kind: 'sarvartha', date: d, ...o });
      if (AMRIT[wd] === n.nakshatra) out.push({ kind: 'amrit', date: d, ...o });
      const sn = sunNks.find((s) => s.start <= o.start && o.start < s.end);
      if (sn) {
        const count = ((n.nakshatra - sn.nakshatra + 27) % 27) + 1;
        if ([4, 6, 9, 10, 13, 20].includes(count)) out.push({ kind: 'ravi', date: d, ...o });
      }
      if ([0, 2, 6].includes(wd) && (DWIPADA.has(n.nakshatra) || TRIPADA.has(n.nakshatra))) {
        for (const t of tts) {
          if (!BHADRA_TITHI.has(t.tithi)) continue;
          const o2 = overlap(o, t);
          if (o2) out.push({ kind: DWIPADA.has(n.nakshatra) ? 'dwipushkar' : 'tripushkar', date: d, ...o2 });
        }
      }
    }
  }
  return out;
}

// ---------- chaughadiya ----------
export const CHAUGHADIYA = ['Udveg', 'Char', 'Labh', 'Amrit', 'Kaal', 'Shubh', 'Rog'] as const;
const DAY_START = [0, 3, 6, 2, 5, 1, 4]; // Sun..Sat → index into CHAUGHADIYA
/** Names of the 8 day and 8 night chaughadiyas for a weekday (0 = Sunday). */
export function chaughadiyaNames(weekday: number) {
  const d0 = DAY_START[weekday];
  const day = Array.from({ length: 8 }, (_, i) => CHAUGHADIYA[(d0 + i) % 7]);
  const n0 = (d0 + 5) % 7;
  const night = Array.from({ length: 8 }, (_, i) => CHAUGHADIYA[(n0 - 2 * i + 70) % 7]);
  return { day, night };
}

// ---------- vivah muhurat (candidates for editorial review) ----------
const VIVAH_NAK = new Set([4, 5, 10, 12, 13, 15, 17, 19, 21, 26, 27]);
const VIVAH_SUN_RASHI = new Set([0, 1, 2, 7, 9, 10]); // Mesha, Vrishabha, Mithuna, Vrishchika, Makara, Kumbha
const RIKTA = new Set([4, 9, 14, 19, 24, 29, 30]);

/** Jupiter or Venus too close to the Sun to be visible (combust/asta). */
export function isAsta(body: 'Jupiter' | 'Venus', t: Date) {
  const deg = Astronomy.AngleFromSun(body === 'Jupiter' ? Astronomy.Body.Jupiter : Astronomy.Body.Venus, t);
  return deg < (body === 'Jupiter' ? 11 : 10);
}

export interface VivahCandidate { date: string; start: Date; end: Date; nakshatra: number; tithi: number; notes: string[] }

/**
 * Conservative North Indian vivah muhurat candidates: Sun in an approved rashi, no Chaturmas
 * (pass Devshayani→Devutthana spans in `exclude`), Guru and Shukra not asta, approved nakshatra,
 * no rikta tithi or Amavasya, not Tuesday, outside Bhadra. For pandit review — never auto-published.
 */
export function vivahCandidates(fromDate: string, toDate: string, loc: Location, exclude: Span[] = []): VivahCandidate[] {
  const out: VivahCandidate[] = [];
  const first = solarDay(fromDate, loc).sunrise, last = solarDay(toDate, loc).nextSunrise;
  const nks = moonNakshatras(addDays(first, -2), addDays(last, 2)).filter((n) => VIVAH_NAK.has(n.nakshatra));
  const tts = tithis(addDays(first, -2), addDays(last, 2)).filter((t) => !RIKTA.has(t.tithi));
  const bh = bhadra(addDays(first, -2), addDays(last, 2));
  for (let d = fromDate; d <= toDate; d = nextDate(d)) {
    const sd = solarDay(d, loc);
    const wd = new Date(d + 'T12:00Z').getUTCDay();
    if (wd === 2) continue;
    const day: Span = { start: sd.sunrise, end: sd.nextSunrise };
    const mid = new Date((day.start.getTime() + day.end.getTime()) / 2);
    if (!VIVAH_SUN_RASHI.has(Math.floor(sunSidereal(mid) / 30))) continue;
    if (exclude.some((x) => x.start <= mid && mid < x.end)) continue;
    if (isAsta('Jupiter', mid) || isAsta('Venus', mid)) continue;
    for (const n of nks) {
      const o = overlap(day, n);
      if (!o) continue;
      for (const t of tts) {
        let w = overlap(o, t);
        if (!w) continue;
        // trim out Bhadra; keep the longest clean piece
        for (const b of bh) {
          const ob = overlap(w, b);
          if (!ob) continue;
          const before = ob.start > w.start ? { start: w.start, end: ob.start } : null;
          const after = ob.end < w.end ? { start: ob.end, end: w.end } : null;
          const len = (s: Span | null) => (s ? s.end.getTime() - s.start.getTime() : 0);
          w = len(before) >= len(after) ? before : after;
          if (!w) break;
        }
        if (w && w.end.getTime() - w.start.getTime() >= 60 * 60_000) out.push({ date: d, start: w.start, end: w.end, nakshatra: n.nakshatra, tithi: t.tithi, notes: [] });
      }
    }
  }
  return out;
}

export { localDate };
