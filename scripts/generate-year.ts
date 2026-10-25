// Usage: npx tsx scripts/generate-year.ts --year 2027 --city auckland
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DateTime } from 'luxon';
import {
  LOCATIONS, DEFAULT_RULES, calculateFestivals, dailyPanchang, lunations,
  moonQuarters, sankrantis, localISO, nextDate, MOON_QUARTER_NAMES,
} from '../packages/panchang-engine/src/index.ts';

const arg = (k: string, d: string) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > 0 ? process.argv[i + 1] : d;
};
const year = Number(arg('year', '2027'));
const loc = LOCATIONS[arg('city', 'auckland')];
if (!loc) throw new Error('unknown city');

const from = DateTime.fromObject({ year, month: 1, day: 1 }, { zone: loc.timeZone }).toJSDate();
const to = DateTime.fromObject({ year: year + 1, month: 1, day: 1 }, { zone: loc.timeZone }).toJSDate();
const lunas = lunations(new Date(from.getTime() - 40 * 864e5), new Date(to.getTime() + 40 * 864e5));

const t0 = Date.now();
const days = [];
for (let d = `${year}-01-01`; d.startsWith(`${year}-`); d = nextDate(d)) days.push(dailyPanchang(d, loc, lunas));
const festivals = calculateFestivals(year, loc, DEFAULT_RULES);
const moon = moonQuarters(from, to).map((q) => ({ phase: MOON_QUARTER_NAMES[q.quarter], time: localISO(q.time, loc)! }));
const sk = sankrantis(from, to, loc);

const out = join('data', String(year), loc.id);
mkdirSync(out, { recursive: true });
const meta = {
  generatedAt: new Date().toISOString(), year, location: loc,
  engine: '@webfit/panchang-engine 0.1.0', status: 'CALCULATED — not reviewed; not for publication as final guidance',
};
const write = (f: string, v: unknown) => writeFileSync(join(out, f), JSON.stringify(v, null, 1) + '\n');
write('meta.json', meta);
write('days.json', days);
write('festivals.json', festivals);
write('moon-phases.json', moon);
write('sankrantis.json', sk);
console.log(`${loc.name} ${year}: ${days.length} days, ${festivals.length} festivals, ${moon.length} moon phases, ${sk.length} sankrantis in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
