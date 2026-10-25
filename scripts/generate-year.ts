// Usage:
//   npx tsx scripts/generate-year.ts --year 2027 --city auckland
//   npx tsx scripts/generate-year.ts --all          (every city, years 2026–2028)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DateTime } from 'luxon';
import {
  LOCATIONS, DEFAULT_RULES, calculateFestivals, dailyPanchang, lunations,
  moonQuarters, sankrantis, localISO, nextDate, MOON_QUARTER_NAMES, type Location,
} from '../packages/panchang-engine/src/index.ts';

const MAJOR = new Set([
  'makar-sankranti', 'lohri', 'thaipusam', 'vasant-panchami', 'maha-shivaratri', 'holika-dahan', 'holi', 'ugadi',
  'ram-navami', 'hanuman-jayanti', 'mesha-sankranti', 'akshaya-tritiya', 'guru-purnima', 'raksha-bandhan',
  'krishna-janmashtami', 'ganesh-chaturthi', 'onam', 'sharad-navratri', 'durga-ashtami', 'dussehra',
  'karva-chauth', 'dhanteras', 'naraka-chaturdashi', 'diwali', 'govardhan-puja', 'bhai-dooj', 'chhath-puja',
]);
const category = (id: string, name: string) =>
  MAJOR.has(id) ? 'major' : name.includes('Ekadashi') ? 'ekadashi' : id.startsWith('sankashti') ? 'monthly' : 'observance';

const arg = (k: string, d: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};

function generate(year: number, loc: Location) {
  const from = DateTime.fromObject({ year, month: 1, day: 1 }, { zone: loc.timeZone }).toJSDate();
  const to = DateTime.fromObject({ year: year + 1, month: 1, day: 1 }, { zone: loc.timeZone }).toJSDate();
  const lunas = lunations(new Date(from.getTime() - 40 * 864e5), new Date(to.getTime() + 40 * 864e5));
  const days = [];
  for (let d = `${year}-01-01`; d.startsWith(`${year}-`); d = nextDate(d)) days.push(dailyPanchang(d, loc, lunas));
  const festivals = calculateFestivals(year, loc, DEFAULT_RULES).map((f) => ({ ...f, category: category(f.id, f.name) }));
  const moon = moonQuarters(from, to).map((q) => ({ phase: MOON_QUARTER_NAMES[q.quarter], time: localISO(q.time, loc)! }));
  const sk = sankrantis(from, to, loc);
  const out = join('data', String(year), loc.id);
  mkdirSync(out, { recursive: true });
  const write = (f: string, v: unknown) => writeFileSync(join(out, f), JSON.stringify(v) + '\n');
  write('meta.json', {
    generatedAt: new Date().toISOString(), year, location: loc,
    engine: '@webfit/panchang-engine 0.2.0', status: 'CALCULATED — not reviewed',
  });
  write('days.json', days);
  write('festivals.json', festivals);
  write('moon-phases.json', moon);
  write('sankrantis.json', sk);
  console.log(`${loc.name} ${year}: ${days.length} days, ${festivals.length} festivals`);
}

if (process.argv.includes('--all')) {
  for (const year of [2026, 2027, 2028]) for (const loc of Object.values(LOCATIONS)) generate(year, loc);
} else {
  const loc = LOCATIONS[arg('city', 'auckland')];
  if (!loc) throw new Error('unknown city');
  generate(Number(arg('year', '2027')), loc);
}
