import { DateTime } from 'luxon';
import { Location, addMinutes, moonSidereal, sunSidereal } from './astro.ts';
import { MASA_NAMES, RASHI_NAMES, NAKSHATRA_NAMES, type Paksha } from './constants.ts';
import {
  Lunation, lunations, tithiInterval, solarDay, localDate, localISO, nextDate,
  sankrantis, nakshatraAt,
} from './panchang.ts';

/** Part of the day in which the tithi must prevail (karmakala). */
export type Kala =
  | 'sunrise' | 'arunodaya' | 'purvahna' | 'madhyahna' | 'aparahna' | 'sunset' | 'pradosh' | 'nishita' | 'moonrise';

export interface TithiRule {
  kind: 'tithi'; id: string; name: string; altNames?: string[]; tradition: string;
  masa: number; paksha: Paksha; tithi: number; kala: Kala; tie?: 'first' | 'second';
}
export interface SankrantiRule { kind: 'sankranti'; id: string; name: string; altNames?: string[]; tradition: string; rashi: number }
export interface NakshatraRule { kind: 'nakshatra'; id: string; name: string; altNames?: string[]; tradition: string; solarRashi: number; nakshatra: number }
export interface RelativeRule { kind: 'relative'; id: string; name: string; altNames?: string[]; tradition: string; of: string; days: number }
export interface MonthlyRule { kind: 'monthly'; id: string; name: string; tradition: string; paksha: Paksha; tithi: number; kala: Kala }
export type FestivalRule = TithiRule | SankrantiRule | NakshatraRule | RelativeRule | MonthlyRule;

export type Status = 'CALCULATED'; // DRAFT/REVIEWED/APPROVED/PUBLISHED are set editorially, never by the engine

export interface FestivalResult {
  id: string;
  name: string;
  altNames: string[];
  tradition: string;
  date: string;               // local civil observance date
  basis: string;              // human-readable rule
  timing: Record<string, string | null>;
  flags: string[];            // TIE, FALLBACK, ADHIKA etc. — need reviewer attention
  status: Status;
  method: string;
}

const METHOD = 'webfit-panchang-engine; geocentric Moon–Sun elongation (astronomy-engine); local sunrise/sunset with refraction; Lahiri ayanamsa for nakshatra/sankranti';

// ---------- karmakala windows ----------

function window(kala: Kala, iso: string, loc: Location): { start: Date; end: Date } | null {
  const sd = solarDay(iso, loc);
  const day = sd.sunset.getTime() - sd.sunrise.getTime();
  const at = (ms: number) => new Date(ms);
  switch (kala) {
    case 'sunrise': return { start: sd.sunrise, end: sd.sunrise };
    case 'arunodaya': { const a = addMinutes(sd.sunrise, -96); return { start: a, end: a }; }
    case 'sunset': return { start: sd.sunset, end: sd.sunset };
    case 'purvahna': return { start: sd.sunrise, end: at(sd.sunrise.getTime() + day / 2) };
    case 'madhyahna': return { start: at(sd.sunrise.getTime() + (2 * day) / 5), end: at(sd.sunrise.getTime() + (3 * day) / 5) };
    case 'aparahna': return { start: at(sd.sunrise.getTime() + (3 * day) / 5), end: at(sd.sunrise.getTime() + (4 * day) / 5) };
    case 'pradosh': return { start: sd.sunset, end: addMinutes(sd.sunset, 144) };
    case 'nishita': {
      const mid = (sd.sunset.getTime() + sd.nextSunrise.getTime()) / 2;
      return { start: at(mid - 24 * 60_000), end: at(mid + 24 * 60_000) };
    }
    case 'moonrise': return sd.moonrise ? { start: sd.moonrise, end: sd.moonrise } : null;
  }
}

function coverage(w: { start: Date; end: Date } | null, iv: { start: Date; end: Date }): number {
  if (!w) return 0;
  const ws = w.start.getTime(), we = w.end.getTime();
  if (ws === we) return ws >= iv.start.getTime() && ws < iv.end.getTime() ? 1 : 0;
  const o = Math.min(we, iv.end.getTime()) - Math.max(ws, iv.start.getTime());
  return Math.max(0, o) / (we - ws);
}

function candidateDates(iv: { start: Date; end: Date }, loc: Location): string[] {
  const a = localDate(iv.start, loc), b = localDate(iv.end, loc);
  const out = [nextDate(a, -1), a];
  let d = a;
  while (d < b) { d = nextDate(d); out.push(d); }
  out.push(nextDate(b));
  return [...new Set(out)];
}

/** Choose the civil day on which the tithi prevails during the karmakala. */
function resolveTithiDay(iv: { start: Date; end: Date }, kala: Kala, tie: 'first' | 'second', loc: Location) {
  const scored = candidateDates(iv, loc).map((d) => ({ d, c: coverage(window(kala, d, loc), iv) }));
  const flags: string[] = [];
  const full = scored.filter((s) => s.c >= 0.999);
  let pick: string;
  if (full.length >= 2) {
    flags.push(`TIE: tithi covers the ${kala} window on ${full.map((f) => f.d).join(' and ')}; rule picked ${tie}`);
    pick = tie === 'first' ? full[0].d : full[full.length - 1].d;
  } else {
    const best = [...scored].sort((x, y) => y.c - x.c)[0];
    if (best.c > 0) {
      pick = best.d;
      if (best.c < 0.999) flags.push(`PARTIAL: tithi covers ${(best.c * 100).toFixed(0)}% of the ${kala} window`);
    } else {
      // Tithi never touches the window (kshaya). Use the Hindu day (sunrise→sunrise) holding most of it.
      const byDay = scored.map(({ d }) => {
        const sd = solarDay(d, loc);
        return { d, c: coverage({ start: sd.sunrise, end: sd.nextSunrise }, iv) };
      }).sort((x, y) => y.c - x.c);
      pick = byDay[0].d;
      flags.push(`FALLBACK: tithi does not touch the ${kala} window on any day (kshaya); placed on the day containing most of it`);
    }
  }
  return { date: pick, flags };
}

const tithiNo = (paksha: Paksha, t: number) => (paksha === 'Shukla' ? t : 15 + t);
const tithiLabel = (paksha: Paksha, t: number) =>
  `${paksha} ${t === 15 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : ['Pratipada','Dwitiya','Tritiya','Chaturthi','Panchami','Shashthi','Saptami','Ashtami','Navami','Dashami','Ekadashi','Dwadashi','Trayodashi','Chaturdashi'][t - 1]}`;
const masaLabel = (masa: number, paksha: Paksha) =>
  paksha === 'Krishna'
    ? `${MASA_NAMES[masa]} (amanta) / ${MASA_NAMES[(masa + 1) % 12]} (purnimanta)`
    : MASA_NAMES[masa];

// ---------- Ekadashi ----------

const EKADASHI: Record<string, string> = {
  '0-Shukla': 'Kamada Ekadashi', '0-Krishna': 'Varuthini Ekadashi',
  '1-Shukla': 'Mohini Ekadashi', '1-Krishna': 'Apara Ekadashi',
  '2-Shukla': 'Nirjala Ekadashi', '2-Krishna': 'Yogini Ekadashi',
  '3-Shukla': 'Devshayani Ekadashi', '3-Krishna': 'Kamika Ekadashi',
  '4-Shukla': 'Shravana Putrada Ekadashi', '4-Krishna': 'Aja Ekadashi',
  '5-Shukla': 'Parsva Ekadashi', '5-Krishna': 'Indira Ekadashi',
  '6-Shukla': 'Papankusha Ekadashi', '6-Krishna': 'Rama Ekadashi',
  '7-Shukla': 'Devutthana Ekadashi', '7-Krishna': 'Utpanna Ekadashi',
  '8-Shukla': 'Mokshada Ekadashi', '8-Krishna': 'Saphala Ekadashi',
  '9-Shukla': 'Pausha Putrada Ekadashi', '9-Krishna': 'Shattila Ekadashi',
  '10-Shukla': 'Jaya Ekadashi', '10-Krishna': 'Vijaya Ekadashi',
  '11-Shukla': 'Amalaki Ekadashi', '11-Krishna': 'Papamochani Ekadashi',
};

function ekadashi(l: Lunation, paksha: Paksha, loc: Location): FestivalResult {
  const n = tithiNo(paksha, 11);
  const iv = tithiInterval(l, n);
  const dw = tithiInterval(l, n + 1);
  const flags: string[] = [];
  const dates = candidateDates(iv, loc);
  const sunriseDays = dates.filter((d) => coverage(window('sunrise', d, loc), iv) === 1);
  let smarta: string;
  if (sunriseDays.length === 0) {
    smarta = resolveTithiDay(iv, 'sunrise', 'first', loc).date;
    flags.push('KSHAYA: Ekadashi does not include any sunrise');
  } else {
    smarta = sunriseDays[0];
    if (sunriseDays.length > 1) flags.push(`VRIDDHI: Ekadashi spans sunrise on ${sunriseDays.join(' and ')}; Smarta date is the first`);
  }
  // Vaishnava (ISKCON-style) rule: Dashami touching arunodaya makes the day "viddha" — fast moves to next day.
  const aruno = window('arunodaya', smarta, loc)!.start;
  const vaishnava = iv.start > aruno || sunriseDays.length > 1 ? nextDate(smarta) : smarta;
  if (vaishnava !== smarta) flags.push(`VAISHNAVA: Dashami-viddha rule places the Vaishnava fast on ${vaishnava}`);
  // Parana (breaking the fast) on the following day, after Hari Vasara, within pratahkala, before Dwadashi ends.
  const p = solarDay(nextDate(smarta), loc);
  const day = p.sunset.getTime() - p.sunrise.getTime();
  const hariVasaraEnd = new Date(dw.start.getTime() + (dw.end.getTime() - dw.start.getTime()) / 4);
  const pStart = new Date(Math.max(p.sunrise.getTime(), hariVasaraEnd.getTime()));
  let pEnd = new Date(Math.min(dw.end.getTime(), p.sunrise.getTime() + day / 5));
  if (pEnd <= pStart) {
    pEnd = new Date(pStart.getTime() + day / 5);
    flags.push('PARANA: Dwadashi ends before/at sunrise on parana day — window needs reviewer confirmation');
  }
  const masaName = l.adhika ? `Adhika ${MASA_NAMES[l.masa]}` : MASA_NAMES[l.masa];
  const name = l.adhika ? (paksha === 'Shukla' ? 'Padmini Ekadashi' : 'Parama Ekadashi') : EKADASHI[`${l.masa}-${paksha}`];
  if (l.adhika) flags.push('ADHIKA: falls in an intercalary month');
  return {
    id: `ekadashi-${name.toLowerCase().replace(/[^a-z]+/g, '-')}-${smarta}`,
    name, altNames: [], tradition: 'Pan-Hindu (Smarta date); Vaishnava date in flags',
    date: smarta,
    basis: `${masaLabel(l.masa, paksha).replace(MASA_NAMES[l.masa], masaName)} ${tithiLabel(paksha, 11)} at sunrise`,
    timing: {
      tithiStart: localISO(iv.start, loc), tithiEnd: localISO(iv.end, loc),
      vaishnavaDate: vaishnava,
      paranaDate: nextDate(smarta), paranaStart: localISO(pStart, loc), paranaEnd: localISO(pEnd, loc),
      dwadashiEnd: localISO(dw.end, loc),
    },
    flags, status: 'CALCULATED', method: METHOD,
  };
}

// ---------- main ----------

export function calculateFestivals(year: number, loc: Location, rules: FestivalRule[]): FestivalResult[] {
  const from = DateTime.fromObject({ year, month: 1, day: 1 }, { zone: loc.timeZone }).toJSDate();
  const to = DateTime.fromObject({ year: year + 1, month: 1, day: 1 }, { zone: loc.timeZone }).toJSDate();
  const lunas = lunations(new Date(from.getTime() - 40 * 864e5), new Date(to.getTime() + 40 * 864e5));
  const inYear = (d: string) => d.startsWith(`${year}-`);
  const out: FestivalResult[] = [];
  const sks = sankrantis(new Date(from.getTime() - 40 * 864e5), new Date(to.getTime() + 40 * 864e5), loc);

  for (const r of rules) {
    if (r.kind === 'tithi' || r.kind === 'monthly') {
      const targets = lunas.filter((l) => !l.adhika && (r.kind === 'monthly' || l.masa === r.masa));
      for (const l of targets) {
        const iv = tithiInterval(l, tithiNo(r.paksha, r.tithi));
        const { date, flags } = resolveTithiDay(iv, r.kala, r.kind === 'tithi' ? r.tie ?? 'first' : 'first', loc);
        if (!inYear(date)) continue;
        const w = window(r.kala, date, loc);
        const timing: Record<string, string | null> = {
          tithiStart: localISO(iv.start, loc), tithiEnd: localISO(iv.end, loc),
        };
        if (r.kala === 'moonrise') timing.moonrise = localISO(solarDay(date, loc).moonrise, loc);
        else if (w && w.start.getTime() !== w.end.getTime()) {
          timing.windowStart = localISO(new Date(Math.max(w.start.getTime(), iv.start.getTime())), loc);
          timing.windowEnd = localISO(new Date(Math.min(w.end.getTime(), iv.end.getTime())), loc);
        }
        out.push({
          id: r.kind === 'monthly' ? `${r.id}-${date}` : r.id,
          name: r.kind === 'monthly' ? `${r.name} (${MASA_NAMES[r.paksha === 'Krishna' ? (l.masa + 1) % 12 : l.masa]})` : r.name,
          altNames: 'altNames' in r ? r.altNames ?? [] : [],
          tradition: r.tradition, date,
          basis: `${masaLabel(l.masa, r.paksha)} ${tithiLabel(r.paksha, r.tithi)}; tithi prevailing at ${r.kala}`,
          timing, flags, status: 'CALCULATED', method: METHOD,
        });
      }
    } else if (r.kind === 'sankranti') {
      for (const s of sks.filter((s) => s.index === r.rashi && inYear(s.observedDate))) {
        out.push({
          id: r.id, name: r.name, altNames: r.altNames ?? [], tradition: r.tradition, date: s.observedDate,
          basis: `Sun enters sidereal ${RASHI_NAMES[r.rashi]} (sankranti); moved to next day if after local sunset`,
          timing: { sankrantiMoment: s.moment }, flags: [], status: 'CALCULATED', method: METHOD,
        });
      }
    } else if (r.kind === 'nakshatra') {
      for (let d = `${year}-01-01`; inYear(d); d = nextDate(d)) {
        const sr = solarDay(d, loc).sunrise;
        if (Math.floor(sunSidereal(sr) / 30) !== r.solarRashi) continue;
        if (nakshatraAt(sr) !== r.nakshatra) continue;
        out.push({
          id: r.id, name: r.name, altNames: r.altNames ?? [], tradition: r.tradition, date: d,
          basis: `${NAKSHATRA_NAMES[r.nakshatra - 1]} nakshatra at sunrise in solar month ${RASHI_NAMES[r.solarRashi]}`,
          timing: { moonSiderealAtSunrise: moonSidereal(sr).toFixed(2) }, flags: [], status: 'CALCULATED', method: METHOD,
        });
        break; // first qualifying day; reviewer to confirm regional rule
      }
    }
  }
  for (const r of rules) {
    if (r.kind !== 'relative') continue;
    for (const base of out.filter((f) => f.id === r.of)) {
      const date = nextDate(base.date, r.days);
      if (!inYear(date)) continue;
      out.push({
        id: r.id, name: r.name, altNames: r.altNames ?? [], tradition: r.tradition, date,
        basis: `${r.days > 0 ? r.days + ' day(s) after' : -r.days + ' day(s) before'} ${base.name}`,
        timing: {}, flags: [], status: 'CALCULATED', method: METHOD,
      });
    }
  }
  for (const l of lunas) {
    for (const p of ['Shukla', 'Krishna'] as const) {
      const e = ekadashi(l, p, loc);
      if (inYear(e.date)) out.push(e);
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
}
