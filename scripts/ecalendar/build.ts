/**
 * E-calendar builder — wall-calendar pages in the Thakur Prasad layout (format used with written consent).
 *
 *   npx tsx scripts/ecalendar/build.ts [--city auckland] [--from 2026-10] [--to 2027-12]
 *
 * Writes:
 *   apps/web/public/ecalendar/<city>/pNN.jpg + manifest.json   (watermarked, for the website flipbook)
 *   apps/web/private/ecalendar/<city>-<from>-<to>.pdf           (clean, for signed-in download / print)
 *
 * Monthly artwork: drop an image at apps/web/public/ecalendar/art/YYYY-MM.(jpg|png|webp) to replace the
 * generated art panel. Back pages: a file at content/ecalendar/back/YYYY-MM.html replaces the default back page.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import QRCode from 'qrcode';
import { chromium } from 'playwright';
import {
  tithiHi, pakshaHi, pakshaShort, NAKSHATRA_HI, MASA_HI, RASHI, RASHI_HI, RASHI_EN, RASHI_GLYPH,
  MONTH_HI, MONTH_EN, WEEK_HI, WEEK_EN, WEEK_COLOURS, festivalHi, SUN_GOCHAR, DEITY, MONTH_DEITY,
} from './lexicon';
import { guidanceFor } from '../../apps/web/lib/guidance';
import { topicFor } from './topics';
import {
  LOCATIONS, localMidnight, localISO, bhadra, gandmool, panchak, sunNakshatras, dayYogas, vivahCandidates,
  type Span,
} from '../../packages/panchang-engine/src/index.ts';

const ROOT = resolve(__dirname, '..', '..');
const arg = (k: string, d: string) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const CITY = arg('city', 'auckland');
const FROM = arg('from', '2026-10');
const TO = arg('to', '2027-12');
const SITE = 'https://www.hinducalendar.co.nz';
const CITIES = ['auckland', 'hamilton', 'tauranga', 'wellington', 'palmerston-north', 'christchurch', 'dunedin'];
const CITY_NAME: Record<string, string> = { auckland: 'Auckland', hamilton: 'Hamilton', tauranga: 'Tauranga', wellington: 'Wellington', 'palmerston-north': 'Palmerston North', christchurch: 'Christchurch', dunedin: 'Dunedin' };
const CITY_HI: Record<string, string> = { auckland: 'ऑकलैंड', hamilton: 'हैमिल्टन', tauranga: 'टौरंगा', wellington: 'वेलिंगटन', 'palmerston-north': 'पामर्स्टन नॉर्थ', christchurch: 'क्राइस्टचर्च', dunedin: 'ड्यूनेडिन' };

// ---------- data ----------
type Day = { date: string; sunrise: string; sunset: string; moonrise: string | null; tithi: { number: number; paksha: string; name: string; endsAt: string }; kshayaTithi: { number: number; paksha: string } | null; nakshatra: { number: number; name: string; endsAt: string }; masa: { amanta: string; purnimanta: string; adhika: boolean }; sunRashi: string };
type Fest = { id: string; name: string; date: string; category: string; timing: Record<string, string | null>; tradition: string };
type Hol = { date: string; name: string; kind: string };
const read = (p: string) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const cache = new Map<string, unknown>();
const memo = <T>(k: string, f: () => T): T => (cache.has(k) ? (cache.get(k) as T) : (cache.set(k, f()), cache.get(k) as T));
const days = (y: number, c = CITY) => memo(`d${y}${c}`, () => read(`data/${y}/${c}/days.json`) as Day[]);
const fests = (y: number, c = CITY) => memo(`f${y}${c}`, () => read(`data/${y}/${c}/festivals.json`) as Fest[]);
const moons = (y: number) => memo(`m${y}`, () => read(`data/${y}/${CITY}/moon-phases.json`) as { phase: string; time: string }[]);
const CITY_REGION: Record<string, string> = { auckland: 'auckland', hamilton: 'auckland', tauranga: 'auckland', wellington: 'wellington', 'palmerston-north': 'wellington', christchurch: 'canterbury', dunedin: 'otago' };
/** NZ public holidays, school holidays, and only this city's regional anniversary day. */
const hols = (y: number) => memo(`h${y}`, () => (read(`data/${y}/holidays.json`) as (Hol & { region?: string })[]).filter((h) => h.kind !== 'regional' || h.region === CITY_REGION[CITY]));

const pad = (n: number) => String(n).padStart(2, '0');
const ym = (y: number, m: number) => `${y}-${pad(m)}`;
const inMonth = (iso: string, y: number, m: number) => iso.startsWith(ym(y, m));
const hhmm = (t?: string | null) => (t ? t.slice(11, 16) : '—');
const dnum = (iso: string) => Number(iso.slice(8, 10));
const dim = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const wday = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const short = (s: string, n: number) => (s.length <= n ? s : s.slice(0, s.lastIndexOf(' ', n)) + '…');
const firstSentences = (s: string, n: number) => { const p = s.split(/(?<=\.)\s+/); let out = ''; for (const x of p) { if ((out + x).length > n && out) break; out += (out ? ' ' : '') + x; } return out; };
const prev = (y: number, m: number) => (m === 1 ? [y - 1, 12] : [y, m - 1]);
const next = (y: number, m: number) => (m === 12 ? [y + 1, 1] : [y, m + 1]);

// ---------- vichar (Bhadra, Mool, Panchak, Surya nakshatra, yogas) ----------
const LOC = LOCATIONS[CITY];
const APPROVED: { vivah?: boolean } = existsSync(join(ROOT, 'content/ecalendar/approved.json')) ? JSON.parse(readFileSync(join(ROOT, 'content/ecalendar/approved.json'), 'utf8')) : {};
/** "ता.6 प्रा. 6:39" — civil date in NZ with a Hindi part-of-day label. */
function tHi(d: Date) {
  const iso = localISO(d, LOC)!;
  const day = Number(iso.slice(8, 10)), h = Number(iso.slice(11, 13)), mi = iso.slice(14, 16);
  const part = h < 4 ? 'रात' : h < 8 ? 'प्रातः' : h < 16 ? 'दिन' : h < 19 ? 'सायं' : 'रात';
  return `ता.${day} ${part} ${(h % 12) || 12}:${mi}`;
}
const spanHi = (s: Span) => `${tHi(s.start)} से ${tHi(s.end).replace(/^ता\.\d+ /, (x) => (localISO(s.start, LOC)!.slice(8, 10) === localISO(s.end, LOC)!.slice(8, 10) ? '' : x))} तक`;
const YOGA_HI: Record<string, string> = { sarvartha: 'सर्वार्थ सिद्धि', amrit: 'अमृत सिद्धि', ravi: 'रवि योग', dwipushkar: 'द्विपुष्कर', tripushkar: 'त्रिपुष्कर' };
const SUN_NAK_HI = NAKSHATRA_HI;

function vichar(y: number, m: number) {
  const a = localMidnight(`${ym(y, m)}-01`, LOC);
  const [ny, nm] = next(y, m);
  const b = localMidnight(`${ym(ny, nm)}-01`, LOC);
  const inM = (s: Span) => s.start < b && s.end > a;
  const startsInM = (d: Date) => d >= a && d < b;
  const bh = bhadra(a, b).filter(inM);
  const mool = gandmool(a, b).filter(inM);
  const pan = panchak(a, b).filter(inM);
  const sun = sunNakshatras(a, b).filter((x) => startsInM(x.start));
  const yogas = dayYogas(`${ym(y, m)}-01`, `${ym(y, m)}-${pad(dim(y, m))}`, LOC);
  const yd: Record<string, number[]> = {};
  for (const yg of yogas) (yd[yg.kind] ??= []).includes(dnum(yg.date)) || yd[yg.kind].push(dnum(yg.date));
  let vivah: number[] = [];
  if (APPROVED.vivah) vivah = [...new Set(vivahCandidates(`${ym(y, m)}-01`, `${ym(y, m)}-${pad(dim(y, m))}`, LOC, chaturmas(y)).map((v) => dnum(v.date)))];
  return { bh, mool, pan, sun, yd, yogas, vivah };
}
/** Devshayani → Devutthana Ekadashi of a year (Chaturmas), from the calculated festivals. */
function chaturmas(y: number): Span[] {
  const f = fests(y);
  const s = f.find((x) => x.id.startsWith('ekadashi-devshayani')), e = f.find((x) => x.id.startsWith('ekadashi-devutthana'));
  return s && e ? [{ start: localMidnight(s.date, LOC), end: localMidnight(e.date, LOC) }] : [];
}

function monthDays(y: number, m: number) { return days(y).filter((d) => inMonth(d.date, y, m)); }
function monthFests(y: number, m: number, c = CITY) { return fests(y, c).filter((f) => inMonth(f.date, y, m)); }
function monthHols(y: number, m: number) { return hols(y).filter((h) => inMonth(h.date, y, m)); }

/** Ugadi (Chaitra Shukla Pratipada) of a year, from the calculated festivals. */
function ugadi(y: number) { return fests(y).find((f) => f.id === 'ugadi')?.date ?? `${y}-04-01`; }
function samvat(y: number, m: number) {
  const mid = `${ym(y, m)}-15`;
  const after = mid >= ugadi(y);
  return { vikram: after ? y + 57 : y + 56, shaka: after ? y - 78 : y - 79, kali: after ? y + 3101 : y + 3100 };
}
/** New Zealand season (southern hemisphere) for a month. */
const nzSeason = (m: number): [string, string] => (m >= 3 && m <= 5 ? ['शरद (पतझड़)', 'Autumn'] : m >= 6 && m <= 8 ? ['शीत ऋतु', 'Winter'] : m >= 9 && m <= 11 ? ['वसंत ऋतु', 'Spring'] : ['ग्रीष्म ऋतु', 'Summer']);
/** "NZDT", "NZST", or the daylight-saving change within the month, read from the calculated sunrise offsets. */
function tzLabel(md: Day[]) {
  const z = (d: Day) => (d.sunrise.endsWith('+13:00') ? 'NZDT' : d.sunrise.endsWith('+12:00') ? 'NZST' : d.sunrise.slice(16));
  const ch = md.find((d, i) => i > 0 && z(d) !== z(md[i - 1]));
  return ch ? `${z(md[0])} → ${z(ch)} from ${dnum(ch.date)} ${MONTH_EN[Number(ch.date.slice(5, 7)) - 1].slice(0, 3)} (daylight saving ${z(ch) === 'NZDT' ? 'starts' : 'ends'})` : z(md[0]);
}
const RITU: Record<string, [string, string]> = {
  Chaitra: ['वसंत', 'Vasant'], Vaishakha: ['वसंत', 'Vasant'], Jyeshtha: ['ग्रीष्म', 'Grishma'], Ashadha: ['ग्रीष्म', 'Grishma'],
  Shravana: ['वर्षा', 'Varsha'], Bhadrapada: ['वर्षा', 'Varsha'], Ashwin: ['शरद', 'Sharad'], Kartika: ['शरद', 'Sharad'],
  Margashirsha: ['हेमंत', 'Hemant'], Pausha: ['हेमंत', 'Hemant'], Magha: ['शिशिर', 'Shishir'], Phalguna: ['शिशिर', 'Shishir'],
};

// ---------- pieces ----------
const fontDir = join(__dirname, 'fonts');
const CSS = `
@font-face{font-family:Outfit;src:url(file://${fontDir}/Outfit400.woff2);font-weight:400}
@font-face{font-family:Outfit;src:url(file://${fontDir}/Outfit600.woff2);font-weight:600}
@font-face{font-family:Outfit;src:url(file://${fontDir}/Outfit800.woff2);font-weight:800}
@font-face{font-family:Rozha;src:url(file://${fontDir}/RozhaLatin.woff2);unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:Rozha;src:url(file://${fontDir}/RozhaDeva.woff2);unicode-range:U+0900-097F,U+1CD0-1CFF,U+200C-200D,U+20B9,U+25CC,U+A830-A83F,U+A8E0-A8FF}
@font-face{font-family:Tiro;src:url(file://${fontDir}/TiroDeva.woff2)}
:root{--maroon:#8E1B2E;--red:#D0102E;--gold:#F0A500;--leaf:#1E8A3E;--cream:#FFFBF2;--ink:#221410;--line:#F0D9A8;--muted:#5E4636}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#ddd}
body{font-family:Outfit,Tiro,sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.hi{font-family:Tiro,Outfit,serif}
.page{width:1240px;height:1754px;position:relative;overflow:hidden;background:var(--cream);page-break-after:always;break-after:page}
.wm{display:none}
body.watermark .wm{display:block;position:absolute;inset:0;pointer-events:none;z-index:50;
  background-image:url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='520' height='300'><text x='20' y='170' transform='rotate(-28 260 150)' font-family='Arial' font-size='30' font-weight='700' fill='rgba(142,27,46,0.085)'>hinducalendar.co.nz · PREVIEW</text></svg>`)}")}
body.watermark .wm::after{content:'Preview copy — sign in free at hinducalendar.co.nz to download the full-quality calendar';position:absolute;left:0;right:0;bottom:0;background:rgba(110,26,42,.92);color:#fff;font:600 20px Outfit;text-align:center;padding:9px}
/* header */
.hd{height:150px;background:linear-gradient(180deg,#E0262F,#A3142E);color:#fff;display:flex;align-items:center;padding:0 26px;gap:18px;border-bottom:6px solid var(--gold)}
.hd .logo{width:92px;height:92px;background:var(--cream);border-radius:50%;display:grid;place-items:center;flex:none;box-shadow:0 0 0 4px var(--gold)}
.hd .logo img{width:74px}
.hd .brand{flex:none;width:250px;line-height:1.05}
.hd .brand b{font:400 40px Rozha;display:block;color:#FFE7A8}
.hd .brand span{font:600 17px Outfit;letter-spacing:.06em;text-transform:uppercase}
.hd .mon{flex:1;text-align:center;line-height:1}
.hd .mon .h{font:400 72px Rozha;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.25)}
.hd .mon .e{font:800 26px Outfit;letter-spacing:.35em;color:#FFE7A8;margin-top:4px}
.hd .yr{flex:none;background:#FFD54A;color:var(--maroon);font:400 66px Rozha;padding:6px 22px 0;border-radius:10px;border:4px solid #fff;line-height:1.15}
.sub{display:flex;justify-content:space-between;align-items:center;padding:8px 26px;background:#FFE7A6;border-bottom:2px solid var(--gold);font-size:19px;color:var(--maroon)}
.sub b{font-weight:600}
.body{display:grid;grid-template-columns:238px 1fr 262px;gap:12px;padding:12px 14px 0;height:1226px}
.col{display:flex;flex-direction:column;gap:10px;min-height:0}
.box{border:2px solid var(--maroon);border-radius:8px;background:#fff;overflow:hidden}
.box > h3{background:var(--maroon);color:#fff;font:400 22px Rozha;padding:5px 10px 2px;display:flex;justify-content:space-between;align-items:baseline}
.box > h3 small{font:600 13px Outfit;letter-spacing:.06em;text-transform:uppercase;color:#FFE7A8}
/* left: milk & paper */
table.rec{width:100%;border-collapse:collapse;font-size:14px}
table.rec td,table.rec th{border:1px solid #E7D6B6;height:22.6px;text-align:center}
table.rec th{background:#FBEFD5;font-weight:600;font-size:13px}
table.rec td.n{width:28px;color:var(--muted);font-weight:600}
.lines{padding:4px 10px}
.lines div{border-bottom:1px dashed #C9B48E;height:30px}
.moons{padding:6px 10px;font-size:15.5px}
.moons div{display:flex;justify-content:space-between;padding:3px 0;border-bottom:1px dotted #E2CFA9}
/* centre */
.top{display:grid;grid-template-columns:1fr 196px 1fr;gap:8px;height:262px}
.sv{display:flex;flex-direction:column;gap:8px}
.sv div{flex:1;border:2px solid var(--gold);border-radius:8px;background:#FFF8E6;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;line-height:1.1}
.sv .t{font:400 19px Rozha;color:var(--maroon)}
.sv .v{font:400 38px Rozha;color:var(--red)}
.sv .s{font:600 11.5px Outfit;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.art{border-radius:10px;overflow:hidden;border:3px solid var(--gold);position:relative}
.art img.photo{width:100%;height:100%;object-fit:cover;object-position:top;display:block;filter:saturate(1.3) contrast(1.08) brightness(1.06)}
.grid{margin-top:10px;display:grid;border:2px solid var(--maroon);border-radius:8px;overflow:hidden;background:#fff}
.grid .wl{display:flex;flex-direction:column;justify-content:center;align-items:center;color:#fff;line-height:1.1;border-bottom:1px solid rgba(255,255,255,.4)}
.grid .wl b{font:400 22px Rozha}
.grid .wl span{font:600 12px Outfit;letter-spacing:.08em;text-transform:uppercase;opacity:.9}
.c{border-left:1px solid #E7D6B6;border-bottom:1px solid #E7D6B6;padding:4px 6px;position:relative;overflow:hidden}
.c.empty{background:repeating-linear-gradient(45deg,#FBF5EA,#FBF5EA 6px,#F6EBD5 6px,#F6EBD5 12px)}
.c .n{font:400 42px Rozha;line-height:.95}
.c .tn{position:absolute;right:6px;top:4px;text-align:right;font-size:14px;line-height:1.15}
.c .tn b{display:block;font:400 19px Rozha}
.c{font-size:14px}
.c .ti{font-size:.93em;color:var(--muted);line-height:1.2;margin-top:2px}
.c .fe{font-size:1em;color:var(--red);font-weight:600;line-height:1.15;margin-top:2px}
.c .ho{font-size:.86em;color:var(--leaf);font-weight:600;line-height:1.15;margin-top:1px}
.c.sun .n,.c.hol .n{color:var(--red)}
.c.fest{background:#FFF0C2}
.c .mp{position:absolute;right:6px;bottom:4px;font-size:18px}
table.ss{width:100%;border-collapse:collapse;margin-top:10px;font-size:13px;background:#fff;border:2px solid var(--maroon)}
table.ss td,table.ss th{border:1px solid #E7D6B6;text-align:center;padding:1.5px 0}
table.ss th{background:var(--maroon);color:#fff;font-weight:600;width:76px;font-size:12.5px}
table.ss tr.dt td{font-weight:800;background:#FBEFD5}
/* right */
.fl{padding:4px 9px;font-size:15.5px;overflow:hidden}
.fl div{display:grid;grid-template-columns:30px 1fr;gap:5px;padding:2.5px 0;border-bottom:1px dotted #E2CFA9;line-height:1.15}
.fl div:last-child{border:0}
.fl .d{font-family:Rozha;font-size:1.5em;color:var(--red);text-align:center}
.fl .nm{font-size:1em;font-weight:600;color:var(--maroon)}
.fl .en{font-size:.78em;color:var(--muted)}
.rf{padding:1px 8px;font-size:12.5px}
.rf div{display:grid;grid-template-columns:24px 1fr;gap:4px;padding:2px 0;border-bottom:1px dotted #E2CFA9;line-height:1.12}
.rf div:last-child{border:0}
.rf .g{font-size:18px;text-align:center;line-height:1.1}
.rf b{font:400 16px Rozha;color:var(--maroon)}
.rf .good b{color:var(--leaf)}
.rf .care .g{color:var(--red)}
.rf .good .g{color:var(--leaf)}
.rf .mixed .g{color:var(--gold)}
.rf p{font-size:13px}
.note{font-size:11.5px;color:var(--muted);padding:3px 9px 6px;line-height:1.25}
/* bottom */
.bot{position:absolute;left:14px;right:14px;bottom:62px;height:258px;display:grid;grid-template-columns:330px 1fr 330px;gap:12px}
.mini{border:2px solid var(--maroon);border-radius:8px;background:#fff;padding:6px 10px}
.mini h4{font:400 22px Rozha;color:var(--maroon);display:flex;justify-content:space-between}
.mini h4 small{font:600 13px Outfit;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);padding-top:6px}
.mini table{width:100%;border-collapse:collapse;font-size:15px;text-align:center}
.mini th{font-size:12px;color:var(--muted);font-weight:600;padding:2px 0}
.mini td{height:28px}
.mini td.s{color:var(--red)}
.mini td.f{font-weight:800;color:#fff;background:var(--gold);border-radius:50%}
.mini td.h{font-weight:800;color:var(--red)}
.spon{border:3px dashed var(--gold);border-radius:12px;background:linear-gradient(135deg,#FFF8E6,#FCEBC6);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:6px;overflow:hidden}
.spon img{max-width:100%;max-height:100%;object-fit:contain}
.spon .a{font:400 40px Rozha;color:var(--maroon)}
.spon .b{font:800 20px Outfit;letter-spacing:.12em;text-transform:uppercase;color:var(--red)}
.spon .c2{font-size:17px;color:var(--muted)}
.ft{position:absolute;left:0;right:0;bottom:0;height:52px;background:var(--maroon);color:#fff;display:flex;justify-content:space-between;align-items:center;padding:0 26px;font-size:16px;border-top:4px solid var(--gold)}
.ft b{color:#FFE7A8}

table.rec td,table.rec th{height:19.5px}
.bl{padding:4px 8px;font-size:13px;line-height:1.3;max-height:300px;overflow:hidden}
.bl div{border-bottom:1px dotted #E2CFA9;padding:1.5px 0}
.vb{background:#FFF8E6;padding:5px 6px;overflow:hidden;font-size:13px}
.vb2{padding:4px 6px;font-size:13px;overflow:hidden}
.ib{margin-bottom:5px}
.ib h5{font:400 1.2em Rozha;color:#fff;background:#2E6B3A;border-radius:4px;padding:1px 6px 0;margin-bottom:2px}
.ib div{font-size:1em;line-height:1.28}
.ib i{font-style:normal;color:var(--muted)}
.c .bd{display:block;font-size:11px;color:#fff;background:#8B5A2B;border-radius:3px;padding:0 3px;margin-top:2px;text-align:center}
.box{flex-shrink:0}
/* back page */
.bk .upper{display:grid;grid-template-columns:1fr 360px;gap:18px;padding:16px 26px 0;height:790px}
.bk .upper > .fit{overflow:hidden;font-size:15.5px}
.bk .side{display:flex;flex-direction:column;gap:10px;overflow:hidden;font-size:15px}
.bk .fg p{font-size:1em;line-height:1.36}
.bk .fg .h b{font-size:1.5em}.bk .fg .h span{font-size:1.15em}.bk .fg .h em{font-size:.9em}
.bk .fg .o{color:var(--muted)}
.topic{position:absolute;left:26px;right:26px;top:936px;bottom:66px;border:3px double var(--maroon);border-radius:12px;background:#fff;padding:10px 18px 12px;display:flex;flex-direction:column}
.topic .tp{font:400 30px Rozha;color:var(--maroon);border-bottom:3px solid var(--gold);margin:0 0 8px;padding-bottom:2px;display:flex;justify-content:space-between;align-items:baseline}
.topic .tp small{font:600 14px Outfit;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.topic .tb{flex:1;min-height:0;overflow:hidden;font-size:21px;line-height:1.45}
.topic .tb p{margin:0 0 .5em}.topic .tb h4{font:400 1.25em Rozha;color:var(--red);margin:.4em 0 .1em}
.topic .tb ol{padding-left:1.3em}.topic .tb li{margin-bottom:.35em}
.topic .tb .small{font-size:.85em;color:var(--muted)}
table.ref{font-size:.92em;margin-bottom:.5em;width:100%}
table.ref td.big{font-size:1.1em;font-weight:600;color:var(--red)}
table.cg td{text-align:center}table.cg td.g{background:#E3F1E0}table.cg td.b{background:#FBE3E3}table.cg td.m{background:#FFF3D6}

.bk{padding:0 0 70px}
.bk .hd2{height:110px;background:linear-gradient(180deg,#E0262F,#A3142E);color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 30px;border-bottom:6px solid var(--gold)}
.bk .hd2 .t{font:400 50px Rozha;color:#FFE7A8}
.bk .hd2 .s{font:600 20px Outfit;letter-spacing:.12em;text-transform:uppercase}
.bk .wrap{display:grid;grid-template-columns:1fr 400px;gap:20px;padding:20px 26px 0;height:calc(1754px - 110px - 6px - 70px - 20px)}
.bk h2{font:400 32px Rozha;color:var(--maroon);border-bottom:3px solid var(--gold);padding-bottom:2px;margin:4px 0 10px}
.bk h2 small{font:600 15px Outfit;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-left:10px}
.fg{margin-bottom:12px;break-inside:avoid}
.fg .h{display:flex;align-items:baseline;gap:10px}
.fg .h b{font:400 25px Rozha;color:var(--red)}
.fg .h span{font-weight:800;font-size:19px;color:var(--maroon)}
.fg .h em{font-style:normal;margin-left:auto;font-size:15px;color:var(--muted);white-space:nowrap}
.fg p{font-size:15.5px;line-height:1.38}
.fg p.o{color:var(--muted)}
table.tt{width:100%;border-collapse:collapse;font-size:14.5px;margin-bottom:14px;background:#fff}
table.tt th,table.tt td{border:1px solid #E2CFA9;padding:4px 6px;text-align:left}
table.tt th{background:#FBEFD5;font-weight:600}
.side{display:flex;flex-direction:column;gap:14px}
.card{border:2px solid var(--maroon);border-radius:10px;background:#fff;padding:12px 14px}
.card h3{font:400 24px Rozha;color:var(--maroon);margin-bottom:6px}
.card p,.card li{font-size:15px;line-height:1.4}
.card ul{padding-left:18px}
.qr{display:flex;gap:12px;align-items:center}
.qr svg{width:150px;height:150px;flex:none}
`;

const LOGO = `file://${join(ROOT, 'apps/web/public/brand/symbol.svg')}`;

function header(y: number, m: number, md: Day[]) {
  const masas = [...new Set(md.map((d) => d.masa.amanta + (d.masa.adhika ? '*' : '')))];
  const masaHi = masas.map((x) => (x.endsWith('*') ? 'अधिक ' : '') + MASA_HI[x.replace('*', '')]).join(' – ');
  const masaEn = masas.map((x) => (x.endsWith('*') ? 'Adhika ' : '') + x.replace('*', '')).join(' – ');
  const pur = [...new Set(md.map((d) => d.masa.purnimanta))].map((x) => MASA_HI[x]).join(' – ');
  return `
  <div class="hd">
    <div class="logo"><img src="${LOGO}" alt=""></div>
    <div class="brand"><b class="hi">हिन्दू पंचांग</b><span>Hindu Calendar NZ</span></div>
    <div class="mon"><div class="h">${MONTH_HI[m - 1]}</div><div class="e">${MONTH_EN[m - 1].toUpperCase()}</div></div>
    <div class="yr">${y}</div>
  </div>
  <div class="sub"><span class="hi"><b>${masaHi}</b> (अमांत) · ${pur} (पूर्णिमांत)</span><span>${masaEn} · <b>${CITY_NAME[CITY]} edition</b> · times ${tzLabel(md)}</span></div>`;
}

function artSVG(key: string) {
  const d = DEITY[key];
  const [a, b] = d.hue;
  const petals = (r: number, n: number, len: number, w: number, fill: string, op: number, rot = 0) =>
    Array.from({ length: n }, (_, i) => `<ellipse cx="0" cy="${-r}" rx="${w}" ry="${len}" fill="${fill}" opacity="${op}" transform="rotate(${(360 / n) * i + rot})"/>`).join('');
  const dots = (r: number, n: number, s: number, fill: string) => Array.from({ length: n }, (_, i) => { const t = (2 * Math.PI * i) / n; return `<circle cx="${(r * Math.cos(t)).toFixed(1)}" cy="${(r * Math.sin(t)).toFixed(1)}" r="${s}" fill="${fill}"/>`; }).join('');
  const [l1, l2] = d.shloka.split('\n');
  return `<svg viewBox="0 0 420 330" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs><radialGradient id="g${key}" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="${b}"/><stop offset=".45" stop-color="${a}"/><stop offset="1" stop-color="#2A0A12"/></radialGradient></defs>
  <rect width="420" height="330" fill="url(#g${key})"/>
  <g transform="translate(210 132)">
    ${petals(118, 32, 26, 7, '#FFE7A8', 0.18)}
    ${petals(96, 24, 26, 10, '#FFD54A', 0.35, 7.5)}
    ${dots(120, 48, 2.2, '#FFE7A8')}
    ${petals(72, 16, 22, 11, '#fff', 0.55)}
    ${petals(60, 16, 18, 9, b, 0.95, 11.25)}
    <circle r="54" fill="#FBF5EA" stroke="${b}" stroke-width="4"/>
    <circle r="46" fill="none" stroke="${a}" stroke-width="1.5" stroke-dasharray="3 3"/>
    <text y="22" text-anchor="middle" font-family="Rozha" font-size="66" fill="${a}">ॐ</text>
  </g>
  <rect x="0" y="246" width="420" height="84" fill="rgba(30,6,12,.55)"/>
  <text x="210" y="276" text-anchor="middle" font-family="Rozha" font-size="30" fill="#FFE7A8">${d.hi}</text>
  <text x="210" y="298" text-anchor="middle" font-family="Tiro" font-size="12.5" fill="#fff">${esc(l1)}</text>
  <text x="210" y="316" text-anchor="middle" font-family="Tiro" font-size="12.5" fill="#fff">${esc(l2)}</text>
</svg>`;
}

function art(y: number, m: number) {
  for (const ext of ['jpg', 'png', 'webp']) {
    const p = join(ROOT, `apps/web/public/ecalendar/art/${ym(y, m)}.${ext}`);
    if (existsSync(p)) return `<img class="photo" src="file://${p}" alt="${esc(DEITY[MONTH_DEITY[ym(y, m)] ?? 'Ganesha'].en)}">`;
  }
  return artSVG(MONTH_DEITY[ym(y, m)] ?? 'Ganesha');
}

function moonPhaseMap(y: number, m: number) {
  const out: Record<number, string> = {};
  for (const p of moons(y)) if (inMonth(p.time, y, m)) out[dnum(p.time)] = p.phase === 'Full Moon' ? '○' : p.phase === 'New Moon' ? '●' : p.phase === 'First Quarter' ? '◑' : '◐'; // as seen from the southern hemisphere: waxing Moon lit on the left
  return out;
}

type Vichar = ReturnType<typeof vichar>;

/** Small Thakur Prasad-style info boxes (Mool, Panchak, Surya nakshatra, yogas, vivah). */
function infoPanels(v: Vichar) {
  const box = (t: string, body: string) => `<div class="ib"><h5 class="hi">${t}</h5><div class="hi">${body}</div></div>`;
  const nk = (n: number) => NAKSHATRA_HI[n - 1];
  const out: string[] = [];
  if (v.mool.length) out.push(box('मूल विचार', v.mool.map((x) => `${spanHi(x)} <i>(${nk(x.first)}${x.last !== x.first ? '–' + nk(x.last) : ''})</i>`).join('<br>')));
  if (v.pan.length) out.push(box('पंचक विचार', v.pan.map(spanHi).join('<br>')));
  if (v.sun.length) out.push(box('सूर्य नक्षत्र', v.sun.map((x) => `${tHi(x.start)} से ${nk(x.nakshatra)}`).join('<br>')));
  const yl = (['sarvartha', 'amrit', 'dwipushkar', 'tripushkar'] as const).filter((k) => v.yd[k]?.length).map((k) => `<b>${YOGA_HI[k]}:</b> ${v.yd[k].join(', ')}`);
  if (yl.length) out.push(box('शुभ योग (तारीख)', yl.join('<br>')));
  if (v.vivah.length) out.push(box('विवाह मुहूर्त', `ता. ${v.vivah.join(', ')}`));
  return out;
}

function grid(y: number, m: number, md: Day[], mf: Fest[], mh: Hol[], v: Vichar) {
  const n = dim(y, m), w0 = wday(y, m, 1);
  const cols = Math.ceil((w0 + n) / 7);
  const mp = moonPhaseMap(y, m);
  const rowH = 111;
  const cells: string[] = [];
  const at = (r: number, c: number, span = 1) => `grid-row:${r + 1}/span ${span};grid-column:${c + 2}`;
  for (let r = 0; r < 7; r++) {
    cells.push(`<div class="wl" style="grid-row:${r + 1};grid-column:1;background:${WEEK_COLOURS[r]}"><b>${WEEK_HI[r].replace('वार', '')}</b><span>${WEEK_EN[r].slice(0, 3)}</span></div>`);
    for (let c = 0; c < cols; c++) {
      const d = c * 7 + r - w0 + 1;
      if (d < 1 || d > n) continue;
      const day = md[d - 1];
      const iso = `${ym(y, m)}-${pad(d)}`;
      const fs = mf.filter((f) => f.date === iso).sort((a, b) => (a.category === 'major' ? -1 : 1) - (b.category === 'major' ? -1 : 1));
      const hs = mh.filter((h) => h.date === iso && h.kind !== 'school');
      const t = day.tithi;
      const tnum = t.number > 15 ? t.number - 15 : t.number;
      const k = day.kshayaTithi ? `/${day.kshayaTithi.number > 15 ? day.kshayaTithi.number - 15 : day.kshayaTithi.number}` : '';
      const bh = v.bh.some((x) => localISO(x.start, LOC)!.startsWith(iso) || localISO(x.end, LOC)!.startsWith(iso));
      const cls = ['c', r === 0 && 'sun', hs.some((h) => h.kind === 'public') && 'hol', fs.length && 'fest fit'].filter(Boolean).join(' ');
      cells.push(`<div class="${cls}" style="${at(r, c)}">
        <div class="n">${d}</div>
        <div class="tn hi"><b style="color:${t.paksha === 'Shukla' ? '#B3122E' : '#3A3A3A'}">${pakshaShort(t.paksha)} ${t.paksha === 'Krishna' && tnum === 15 ? 30 : tnum}${k}</b>${bh ? '<span class="bd">भद्रा</span>' : ''}</div>
        <div class="ti hi">${tithiHi(t.number, t.paksha)} ${hhmm(t.endsAt)}<br>${NAKSHATRA_HI[day.nakshatra.number - 1]} ${hhmm(day.nakshatra.endsAt)}</div>
        ${fs.slice(0, 2).map((f) => `<div class="fe hi">${short(festivalHi(f).replace(/ \(.*\)/, ''), 24)}</div>`).join('')}
        ${hs.slice(0, 1).map((h) => `<div class="ho">${short(h.name, 26)}</div>`).join('')}
        ${mp[d] ? `<div class="mp">${mp[d]}</div>` : ''}
      </div>`);
    }
  }
  // Empty cells: leading block (first column, top) and trailing block (last column, bottom) hold the info boxes.
  const lead = w0, trail = cols * 7 - w0 - n;
  const panels = infoPanels(v);
  const blocks: { r: number; c: number; h: number }[] = [];
  if (lead) blocks.push({ r: 0, c: 0, h: lead });
  if (trail) blocks.push({ r: 7 - trail, c: cols - 1, h: trail });
  blocks.sort((a, b) => b.h - a.h);
  let rest: string[] = [];
  if (blocks.length === 2 && blocks[1].h >= 2 && panels.length > 1) {
    const split = Math.max(1, Math.round(panels.length * blocks[0].h / (blocks[0].h + blocks[1].h)));
    cells.push(`<div class="c vb fit" style="${at(blocks[0].r, blocks[0].c, blocks[0].h)}">${panels.slice(0, split).join('')}</div>`);
    cells.push(`<div class="c vb fit" style="${at(blocks[1].r, blocks[1].c, blocks[1].h)}">${panels.slice(split).join('')}</div>`);
  } else if (blocks.length && blocks[0].h >= 3) {
    cells.push(`<div class="c vb fit" style="${at(blocks[0].r, blocks[0].c, blocks[0].h)}">${panels.join('')}</div>`);
    if (blocks[1]) cells.push(`<div class="c empty" style="${at(blocks[1].r, blocks[1].c, blocks[1].h)}"></div>`);
  } else {
    rest = panels;
    for (const b of blocks) cells.push(`<div class="c empty" style="${at(b.r, b.c, b.h)}"></div>`);
  }
  return { html: `<div class="grid" style="grid-template-columns:76px repeat(${cols},1fr);grid-template-rows:repeat(7,${rowH}px)">${cells.join('')}</div>`, rest };
}

// Cells are emitted row by row (weekday), so the CSS grid flows across weeks correctly.

function sunTable(md: Day[]) {
  const half = (a: Day[]) => `
    <tr class="dt"><th>दिनांक</th>${a.map((d) => `<td>${dnum(d.date)}</td>`).join('')}</tr>
    <tr><th>सूर्योदय ↑</th>${a.map((d) => `<td>${hhmm(d.sunrise)}</td>`).join('')}</tr>
    <tr><th>सूर्यास्त ↓</th>${a.map((d) => `<td>${hhmm(d.sunset)}</td>`).join('')}</tr>`;
  const a = md.slice(0, 16), b = md.slice(16);
  while (b.length < 16) b.push(null as unknown as Day);
  return `<table class="ss hi">${half(a)}${half(b.filter(Boolean))}</table>`;
}

function mini(y: number, m: number, label: string) {
  const n = dim(y, m), w0 = wday(y, m, 1);
  let fset = new Set<number>(), hset = new Set<number>();
  try { fset = new Set(monthFests(y, m).filter((f) => f.category === 'major' || f.category === 'ekadashi').map((f) => dnum(f.date))); hset = new Set(monthHols(y, m).filter((h) => h.kind === 'public').map((h) => dnum(h.date))); } catch { /* year not generated */ }
  const rows: string[] = [];
  let cells: string[] = Array(w0).fill('<td></td>');
  for (let d = 1; d <= n; d++) {
    const w = (w0 + d - 1) % 7;
    cells.push(`<td class="${fset.has(d) ? 'f' : hset.has(d) ? 'h' : w === 0 ? 's' : ''}">${d}</td>`);
    if (w === 6) { rows.push(`<tr>${cells.join('')}</tr>`); cells = []; }
  }
  if (cells.length) rows.push(`<tr>${cells.join('')}${'<td></td>'.repeat(7 - cells.length)}</tr>`);
  return `<div class="mini"><h4><span class="hi">${MONTH_HI[m - 1]} ${y}</span><small>${label} · ${MONTH_EN[m - 1]}</small></h4>
    <table><tr>${['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'].map((x) => `<th class="hi">${x}</th>`).join('')}</tr>${rows.join('')}</table></div>`;
}

function sponsor(y: number, m: number) {
  for (const ext of ['png', 'jpg', 'webp', 'svg']) {
    const p = join(ROOT, `apps/web/public/ecalendar/sponsors/${ym(y, m)}.${ext}`);
    if (existsSync(p)) return `<div class="spon"><img src="file://${p}" alt=""></div>`;
  }
  return `<div class="spon"><div class="a hi">आपका विज्ञापन यहाँ</div><div class="b">Your business here</div><div class="c2">Reach Hindu families across New Zealand every month.<br>info@webfitt.co.nz · 022 129 9323</div></div>`;
}

function front(y: number, m: number) {
  const md = monthDays(y, m), mf = monthFests(y, m), mh = monthHols(y, m);
  const sv = samvat(y, m);
  const midRashi = md[14].sunRashi;
  const ri = RASHI.indexOf(midRashi);
  const ingress = md.find((d, i) => i > 0 && d.sunRashi !== md[i - 1].sunRashi);
  const ayana = ri >= 9 || ri <= 2 ? ['उत्तरायण', 'Uttarayana'] : ['दक्षिणायन', 'Dakshinayana'];
  const ritu = RITU[md[14].masa.amanta];
  const listF = mf.filter((f) => !(f.category === 'monthly' && mf.length > 11)).slice(0, 12);
  const [py, pm] = prev(y, m), [ny, nm] = next(y, m);
  const moonList = moons(y).filter((p) => inMonth(p.time, y, m) && /Full|New/.test(p.phase));
  const v = vichar(y, m);
  const g = grid(y, m, md, mf, mh, v);

  const milkRows = Array.from({ length: 16 }, (_, i) => `<tr><td class="n">${i + 1}</td><td></td><td class="n">${i + 17 <= 31 ? i + 17 : ''}</td><td></td></tr>`).join('');
  const paperRows = Array.from({ length: 4 }, (_, r) => `<tr>${Array.from({ length: 8 }, (_, c) => { const d = r * 8 + c + 1; return `<td style="font-size:11px;color:#9a8670">${d <= 31 ? d : ''}</td>`; }).join('')}</tr>`).join('');

  return `<section class="page front">
  ${header(y, m, md)}
  <div class="body">
    <div class="col">
      <div class="box"><h3><span class="hi">दूध का हिसाब</span><small>Milk</small></h3>
        <table class="rec"><tr><th>ता.</th><th>मात्रा</th><th>ता.</th><th>मात्रा</th></tr>${milkRows}</table></div>
      <div class="box"><h3><span class="hi">अख़बार</span><small>Paper</small></h3><table class="rec">${paperRows}</table></div>
      <div class="box"><h3><span class="hi">चंद्र दर्शन</span><small>Moon</small></h3>
        <div class="moons hi">${moonList.map((p) => `<div><span>${p.phase === 'Full Moon' ? '○ पूर्णिमा' : '● अमावस्या'} ${dnum(p.time)}</span><span>${hhmm(p.time)}</span></div>`).join('')}
        ${ingress ? `<div><span>☉ ${RASHI_HI[RASHI.indexOf(ingress.sunRashi)]} संक्रांति</span><span>${dnum(ingress.date)} ${MONTH_EN[m - 1].slice(0, 3)}</span></div>` : ''}</div></div>
      <div class="box"><h3><span class="hi">भद्रा विचार</span><small>Bhadra</small></h3>
        <div class="bl hi fit">${v.bh.map((x) => `<div>${spanHi(x)}</div>`).join('')}</div></div>
      ${g.rest.length ? `<div class="box vb2 fit">${g.rest.join('')}</div>` : ''}
      <div class="box" style="flex:1;min-height:0"><h3><span class="hi">आवश्यक कार्य</span><small>Notes</small></h3>
        <div class="lines">${'<div></div>'.repeat(12)}</div></div>
    </div>

    <div class="col" style="gap:0">
      <div class="top">
        <div class="sv"><div><span class="t hi">विक्रम संवत्</span><span class="v">${sv.vikram}</span><span class="s">Vikram Samvat</span></div>
          <div><span class="t hi">शक संवत्</span><span class="v">${sv.shaka}</span><span class="s">Shaka Samvat</span></div></div>
        <div class="art">${art(y, m)}</div>
        <div class="sv"><div><span class="t hi">कलियुगाब्द</span><span class="v">${sv.kali}</span><span class="s">Kali Yuga</span></div>
          <div><span class="t hi">न्यूज़ीलैंड ऋतु</span><span class="v" style="font-size:30px">${nzSeason(m)[0]}</span><span class="s">NZ ${nzSeason(m)[1]} · ${ayana[1]}</span></div></div>
      </div>
      ${g.html}
      ${sunTable(md)}
    </div>

    <div class="col">
      <div class="box"><h3><span class="hi">व्रत-त्योहार</span><small>Festivals</small></h3>
        <div class="fl fit" style="max-height:560px">${[
          ...listF.map((f) => ({ d: f.date, h: `<div><span class="d">${dnum(f.date)}</span><span><span class="nm hi">${festivalHi(f)}</span><br><span class="en">${esc(f.name)}</span></span></div>` })),
          ...mh.map((h) => ({ d: h.date, h: `<div><span class="d" style="color:var(--leaf)">${dnum(h.date)}</span><span><span class="nm" style="font-size:.9em;color:var(--leaf)">${esc(h.name)}</span><br><span class="en">${h.kind === 'school' ? 'NZ school holidays begin' : h.kind === 'regional' ? 'Regional anniversary day' : 'NZ public holiday'}</span></span></div>` })),
        ].sort((a, b) => a.d.localeCompare(b.d)).map((x) => x.h).join('')}</div></div>
      <div class="box" style="flex:1"><h3><span class="hi">राशिफल</span><small>Rashifal</small></h3>
        <div class="note hi">सूर्य ${RASHI_HI[ri]} राशि में (${RASHI_EN[ri]}) — अपनी चंद्र राशि का फल देखें</div>
        <div class="rf">${RASHI.map((_, i) => { const h = ((ri - i + 12) % 12); const g = SUN_GOCHAR[h]; return `<div class="${g.tone}"><span class="g">${RASHI_GLYPH[i]}</span><span><b>${RASHI_HI[i]}</b> <span class="hi">${g.hi}</span></span></div>`; }).join('')}</div></div>
    </div>
  </div>

  <div class="bot">${mini(py, pm, 'Previous')}${sponsor(y, m)}${mini(ny, nm, 'Next')}</div>
  <div class="ft"><span><b>Hindu Calendar NZ</b> · हिन्दू पंचांग · hinducalendar.co.nz</span><span>Calculated for ${CITY_NAME[CITY]} · Powered by <b>Webfit Solutions Limited</b></span></div>
  <div class="wm"></div>
</section>`;
}

function keyTime(f: Fest) {
  const t = f.timing;
  if (t.windowStart) return `${hhmm(t.windowStart)}–${hhmm(t.windowEnd)}`;
  if (t.moonrise) return `Moonrise ${hhmm(t.moonrise)}`;
  if (t.sankrantiMoment) return `Sankranti ${hhmm(t.sankrantiMoment)}`;
  return '';
}
const dshort = (iso: string) => `${WEEK_EN[new Date(iso + 'T00:00Z').getUTCDay()].slice(0, 3)} ${dnum(iso)} ${MONTH_EN[Number(iso.slice(5, 7)) - 1].slice(0, 3)}`;

async function back(y: number, m: number) {
  const custom = join(ROOT, `content/ecalendar/back/${ym(y, m)}.html`);
  const mf = monthFests(y, m), mh = monthHols(y, m);
  const url = `${SITE}/calendar/${CITY}/${y}/${m}`;
  const qr = await QRCode.toString(url, { type: 'svg', margin: 0, color: { dark: '#6E1A2A', light: '#ffffff' } });
  const head = `<div class="hd2"><div><div class="t hi">${MONTH_HI[m - 1]} ${y} · उपयोगी जानकारी</div><div class="s">${MONTH_EN[m - 1]} ${y} · Useful information</div></div><img src="${LOGO}" style="width:80px;background:#FBF5EA;border-radius:50%;padding:6px;box-shadow:0 0 0 4px #D4952A" alt=""></div>`;
  const foot = `<div class="ft"><span><b>Hindu Calendar NZ</b> · hinducalendar.co.nz</span><span>Powered by <b>Webfit Solutions Limited</b></span></div><div class="wm"></div>`;
  if (existsSync(custom)) return `<section class="page bk">${head}<div style="padding:20px 26px">${readFileSync(custom, 'utf8')}</div>${foot}</section>`;

  const guided = mf.filter((f) => f.category === 'major' || f.category === 'observance').map((f) => ({ f, g: guidanceFor(f) })).filter((x) => x.g);
  const budget = guided.length > 6 ? 120 : guided.length > 3 ? 220 : 400;
  const ek = mf.filter((f) => f.category === 'ekadashi');
  const majors = mf.filter((f) => f.category === 'major' && keyTime(f)).slice(0, 3);
  const cityRows = majors.map((f) => {
    const cells = CITIES.map((c) => { const o = fests(y, c).find((x) => x.id === f.id); return o ? `${dnum(o.date) !== dnum(f.date) ? dshort(o.date) + ' ' : ''}${keyTime(o)}` : '—'; });
    return `<tr><td><b class="hi">${festivalHi(f)}</b><br>${dshort(f.date)}</td>${cells.map((x) => `<td>${x}</td>`).join('')}</tr>`;
  }).join('');
  const topic = topicFor(ym(y, m), {
    loc: LOC, cityName: CITY_NAME[CITY],
    fests: (yy) => fests(yy),
    sankrantis: (yy) => memo(`s${yy}`, () => read(`data/${yy}/${CITY}/sankrantis.json`)),
  });

  return `<section class="page bk">${head}
  <div class="upper">
    <div class="fit">
      <h2><span class="hi">इस माह के पर्व</span><small>Festivals this month</small></h2>
      ${guided.length ? guided.map(({ f, g }) => `<div class="fg"><div class="h"><b class="hi">${festivalHi(f)}</b><span>${esc(f.name)}</span><em>${dshort(f.date)}${keyTime(f) ? ' · ' + keyTime(f) : ''}</em></div>
        <p>${esc(firstSentences(g!.about, budget))}${guided.length > 7 ? '' : ` <span class="o">${esc(firstSentences(g!.observe, budget))}</span>`}</p></div>`).join('') : '<p class="fg">A quieter month for major festivals — a good time for regular puja, Ekadashi vrat and Sankashti.</p>'}
      ${majors.length ? `<h2><span class="hi">शहरवार समय</span><small>Puja times across NZ</small></h2>
        <table class="tt" style="font-size:.85em"><tr><th>Festival</th>${CITIES.map((c) => `<th>${CITY_NAME[c].replace('Palmerston North', 'Palm. Nth')}</th>`).join('')}</tr>${cityRows}</table>` : ''}
    </div>
    <div class="side fit">
      ${ek.length ? `<div class="card"><h3><span class="hi">एकादशी व पारण</span></h3>
        <table class="tt"><tr><th>Ekadashi</th><th>Fast</th><th>Parana</th></tr>
        ${ek.map((f) => `<tr><td class="hi">${festivalHi(f)}</td><td>${dshort(f.date)}${f.timing.vaishnavaDate && f.timing.vaishnavaDate !== f.date ? `<br><small>Vaishnava ${dshort(f.timing.vaishnavaDate)}</small>` : ''}</td><td>${f.timing.paranaDate ? dshort(f.timing.paranaDate) + '<br>' : ''}${hhmm(f.timing.paranaStart)}–${hhmm(f.timing.paranaEnd)}</td></tr>`).join('')}</table></div>` : ''}
      <div class="card"><h3>NZ holidays · <span class="hi">अवकाश</span></h3>
        ${mh.length ? `<ul>${mh.map((h) => `<li><b>${dshort(h.date)}</b> — ${esc(h.name)}${h.kind === 'school' ? ' (begin)' : ''}</li>`).join('')}</ul>` : '<p>No public holidays this month.</p>'}</div>
      <div class="card"><div class="qr">${qr}<p>This month online, times for your city and free festival reminders.<br><b>hinducalendar.co.nz</b></p></div></div>
    </div>
  </div>
  ${topic ?? ''}
  ${foot}</section>`;
}

async function cover(from: string, to: string) {
  const [fy, fm] = from.split('-').map(Number), [ty, tm] = to.split('-').map(Number);
  const qr = await QRCode.toString(SITE, { type: 'svg', margin: 0, color: { dark: '#6E1A2A', light: '#FBF5EA' } });
  return `<section class="page" style="background:radial-gradient(circle at 50% 38%,#FFD54A 0,#D4952A 18%,#9B1B30 46%,#4A0E1C 100%);color:#fff;text-align:center">
    <div style="position:absolute;inset:40px;border:4px solid #FFE7A8;border-radius:24px"></div>
    <div style="position:absolute;inset:56px;border:1.5px solid rgba(255,231,168,.6);border-radius:16px"></div>
    <div style="padding-top:200px"><div style="width:300px;height:300px;margin:0 auto;background:#FBF5EA;border-radius:50%;display:grid;place-items:center;box-shadow:0 0 0 10px #FFE7A8,0 20px 60px rgba(0,0,0,.4)"><img src="${LOGO}" style="width:230px" alt=""></div></div>
    <div class="hi" style="font:400 120px Rozha;color:#FFE7A8;margin-top:70px;text-shadow:0 5px 0 rgba(0,0,0,.25)">हिन्दू पंचांग</div>
    <div style="font:800 46px Outfit;letter-spacing:.3em;margin-top:10px">HINDU CALENDAR NZ</div>
    <div style="display:inline-block;background:#FFD54A;color:#6E1A2A;font:400 80px Rozha;padding:14px 50px 0;border-radius:16px;border:5px solid #fff;margin-top:50px">${fy}–${String(ty).slice(2)}</div>
    <div style="font:600 30px Outfit;margin-top:34px">${MONTH_EN[fm - 1]} ${fy} – ${MONTH_EN[tm - 1]} ${ty} · ${CITY_NAME[CITY]} edition</div>
    <div class="hi" style="font-size:28px;margin-top:10px;color:#FFE7A8">${CITY_HI[CITY]} के लिए गणना · तिथि, नक्षत्र, व्रत-त्योहार, सूर्योदय-सूर्यास्त</div>
    <div style="position:absolute;bottom:110px;left:0;right:0;display:flex;justify-content:center;align-items:center;gap:24px">
      <div style="width:140px;height:140px;background:#FBF5EA;padding:10px;border-radius:12px">${qr.replace('<svg', '<svg width="120" height="120"')}</div>
      <div style="text-align:left;font-size:22px;line-height:1.5">Festival dates and puja times<br>for every NZ city, with reminders:<br><b style="color:#FFE7A8;font-size:28px">hinducalendar.co.nz</b></div></div>
    <div style="position:absolute;bottom:62px;left:0;right:0;font-size:18px;opacity:.9">Powered by Webfit Solutions Limited</div>
    <div class="wm"></div></section>`;
}

function insideCover(months: [number, number][]) {
  return `<section class="page bk">
  <div class="hd2"><div><div class="t hi">इस कैलेंडर के बारे में</div><div class="s">How to read this calendar</div></div><img src="${LOGO}" style="width:80px;background:#FBF5EA;border-radius:50%;padding:6px;box-shadow:0 0 0 4px #D4952A" alt=""></div>
  <div style="padding:30px 60px;font-size:20px;line-height:1.55">
    <h2 style="font:400 38px Rozha;color:var(--maroon)">Namaste, Kia ora 🙏</h2>
    <p style="margin:10px 0 20px">This calendar follows the much-loved Indian wall-calendar layout — but every date and time in it is calculated for <b>${CITY_NAME[CITY]}, New Zealand</b>. Because New Zealand is 6½–7½ hours ahead of India, a tithi often begins and ends on a different local day here, so some festivals fall a day earlier or later than on calendars printed for India.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
      <div class="card"><h3>Each date box</h3><ul>
        <li><b>Big number</b> — the date. Red for Sundays and NZ public holidays.</li>
        <li><b class="hi">शु. / कृ.</b> — Shukla (waxing) or Krishna (waning) paksha and tithi number at sunrise. 15 = Purnima, 30 = Amavasya.</li>
        <li><b>Second line</b> — tithi name and the time it ends, then the nakshatra.</li>
        <li><b style="color:var(--red)">Red text</b> — festivals and vrat. ○ full moon · ● new moon · ◑ first quarter · ◐ last quarter (drawn as the Moon looks from New Zealand).</li></ul></div>
      <div class="card"><h3>Around the page</h3><ul>
        <li><b>Top</b> — Hindu months (amanta and purnimanta), Vikram and Shaka Samvat, ayana and the NZ season.</li>
        <li><b>Left</b> — milk and newspaper record, moon and sankranti times, notes.</li>
        <li><b>Right</b> — vrat-tyohar list, rashifal (Sun's transit by Moon sign) and NZ holidays.</li>
        <li><b>Below the grid</b> — sunrise and sunset for every day, in NZ time (NZDT in summer, NZST in winter; the header shows when daylight saving changes).</li>
        <li><b>Season</b> — the New Zealand season. Indian ritu names follow India's seasons, which are the reverse of ours, so we show the season you actually see outside.</li>
        <li><b>Back of each month</b> — festival guide, Ekadashi parana, times across NZ cities.</li></ul></div>
    </div>
    <div class="card" style="margin-top:20px"><h3>Months in this edition</h3><p>${months.map(([y, m]) => `${MONTH_EN[m - 1]} ${y}`).join(' · ')}</p></div>
    <div class="card" style="margin-top:20px"><h3>Customs vary</h3><p>Dates follow widely used North Indian (amanta/purnimanta) conventions with Smarta and Vaishnava Ekadashi shown where they differ. Families and temples may keep different customs — follow your tradition where it differs. Spotted something? Tell us at hinducalendar.co.nz/corrections, email info@webfitt.co.nz or call 022 129 9323.</p></div>
    <div class="card" style="margin-top:20px"><h3>Advertise with us</h3><p>Each month has space for a business or community sponsor, seen by Hindu families across New Zealand all month. Contact info@webfitt.co.nz · 022 129 9323.</p></div>
  </div>
  <div class="ft"><span><b>Hindu Calendar NZ</b> · hinducalendar.co.nz</span><span>Powered by <b>Webfit Solutions Limited</b></span></div><div class="wm"></div></section>`;
}

function backCover() {
  return `<section class="page" style="background:linear-gradient(180deg,#6E1A2A,#3E0D18);color:#fff;text-align:center">
    <div style="position:absolute;inset:40px;border:4px solid #D4952A;border-radius:24px"></div>
    <div style="padding-top:330px"><img src="${LOGO}" style="width:200px;background:#FBF5EA;border-radius:50%;padding:20px;box-shadow:0 0 0 8px #D4952A" alt=""></div>
    <div class="hi" style="font:400 80px Rozha;color:#FFE7A8;margin-top:50px">शुभमस्तु</div>
    <div style="font-size:26px;margin-top:20px;line-height:1.6">Hindu Calendar NZ<br>hinducalendar.co.nz · info@webfitt.co.nz · 022 129 9323</div>
    <div style="font-size:20px;margin-top:60px;opacity:.85;line-height:1.6;padding:0 160px">Dates and times are calculated for each New Zealand city by the Hindu Calendar NZ panchang engine. Spotted something? Report it at hinducalendar.co.nz/corrections.</div>
    <div style="position:absolute;bottom:90px;left:0;right:0;font-size:22px">Powered by <b style="color:#FFE7A8">Webfit Solutions Limited</b> · webfitt.com</div>
    <div class="wm"></div></section>`;
}

// ---------- build ----------
async function main() {
  const months: [number, number][] = [];
  for (let [y, m] = FROM.split('-').map(Number); ym(y, m) <= TO; [y, m] = next(y, m)) months.push([y, m]);
  const pages: { html: string; label: string; kind: string }[] = [];
  pages.push({ html: await cover(FROM, TO), label: 'Cover', kind: 'cover' });
  pages.push({ html: insideCover(months), label: 'How to read this calendar', kind: 'intro' });
  for (const [y, m] of months) {
    pages.push({ html: front(y, m), label: `${MONTH_EN[m - 1]} ${y}`, kind: 'front' });
    pages.push({ html: await back(y, m), label: `${MONTH_EN[m - 1]} ${y} — useful information`, kind: 'back' });
  }
  pages.push({ html: backCover(), label: 'Back cover', kind: 'cover' });
  if (pages.length % 2) pages.splice(pages.length - 1, 0, { html: insideCover(months).replace('इस कैलेंडर के बारे में', 'टिप्पणी'), label: 'Notes', kind: 'intro' });

  // Vivah muhurat candidates for editorial review (shown on pages only once content/ecalendar/approved.json has "vivah": true).
  {
    const [ty, tm] = TO.split('-').map(Number);
    const ex = [...chaturmas(2026), ...chaturmas(2027)];
    const rows = vivahCandidates(`${FROM}-01`, `${TO}-${pad(dim(ty, tm))}`, LOC, ex);
    const dir = join(ROOT, 'content/ecalendar/review');
    mkdirSync(dir, { recursive: true });
    const csv = ['date,weekday,window_start,window_end,nakshatra,tithi,approved(Y/N),reviewer_note',
      ...rows.map((r) => [r.date, WEEK_EN[new Date(r.date + 'T12:00Z').getUTCDay()], localISO(r.start, LOC), localISO(r.end, LOC), NAKSHATRA_HI[r.nakshatra - 1], `${r.tithi > 15 ? 'Krishna' : 'Shukla'} ${r.tithi > 15 ? r.tithi - 15 : r.tithi}`, '', ''].join(','))];
    writeFileSync(join(dir, `vivah-candidates-${CITY}-${FROM}-${TO}.csv`), '\ufeff' + csv.join('\n'));
    console.log(`Vivah candidates: ${rows.length} windows on ${new Set(rows.map((r) => r.date)).size} dates`);
  }

  const doc = `<!doctype html><html lang="hi"><head><meta charset="utf-8"><style>${CSS}</style></head><body>${pages.map((p) => p.html).join('\n')}</body></html>`;
  const tmp = join(tmpdir(), `ecal-${CITY}.html`);
  writeFileSync(tmp, doc);

  const outImg = join(ROOT, `apps/web/public/ecalendar/${CITY}`);
  rmSync(outImg, { recursive: true, force: true });
  mkdirSync(outImg, { recursive: true });
  const outPdfDir = join(ROOT, 'apps/web/private/ecalendar');
  mkdirSync(outPdfDir, { recursive: true });

  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  /** Load the document at a given pixel density and run the layout passes (back-page split, auto-fit). */
  const prepare = async (dsf: number) => {
    const page = await browser.newPage({ viewport: { width: 1240, height: 1754 }, deviceScaleFactor: dsf });
    await page.goto(`file://${tmp}`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    // Back pages: size the upper (month) section to its content, give the rest to the reference topic.
    await page.evaluate(() => {
      document.querySelectorAll<HTMLElement>('section.bk').forEach((sec) => {
        const up = sec.querySelector<HTMLElement>('.upper'), tp = sec.querySelector<HTMLElement>('.topic');
        if (!up || !tp) return;
        up.style.height = 'auto';
        const kids = [...up.children] as HTMLElement[];
        kids.forEach((k) => (k.style.height = 'auto'));
        const natural = Math.max(...kids.map((k) => k.scrollHeight)) + 16;
        const h = Math.max(330, Math.min(900, natural));
        up.style.height = h + 'px';
        kids.forEach((k) => (k.style.height = (h - 16) + 'px'));
        tp.style.top = (up.offsetTop + h + 14) + 'px';
      });
    });
    // Shrink text in fixed-size boxes until it fits; report anything that still overflows.
    const overflow = await page.evaluate(() => {
      const bad: string[] = [];
      document.querySelectorAll<HTMLElement>('.fit').forEach((el) => {
        let fs = parseFloat(getComputedStyle(el).fontSize);
        while (el.scrollHeight > el.clientHeight + 1 && fs > 8.5) { fs -= 0.25; el.style.fontSize = fs + 'px'; }
        if (el.scrollHeight > el.clientHeight + 1) bad.push((el.closest('section')?.querySelector('.mon .e, .hd2 .s')?.textContent ?? '?') + ': ' + el.className);
      });
      return bad;
    });
    if (overflow.length) console.warn('Still overflowing:', overflow);
    return page;
  };

  // 1) Clean PDF (A4, vector) for signed-in download and print.
  const page = await prepare(1);
  const pdfName = `${CITY}-${FROM}-${TO}.pdf`;
  await page.emulateMedia({ media: 'print' });
  await page.pdf({ path: join(outPdfDir, pdfName), format: 'A4', scale: 794 / 1240, margin: { top: 0, right: 0, bottom: 0, left: 0 }, printBackground: true, preferCSSPageSize: false });
  await page.emulateMedia({ media: 'screen' });

  // 2) Watermarked images for the website flipbook (1240 px wide).
  await page.evaluate(() => document.body.classList.add('watermark'));
  const els = await page.$$('section.page');
  const jpgDir = join(outPdfDir, `${CITY}-jpg`);
  rmSync(jpgDir, { recursive: true, force: true });
  mkdirSync(jpgDir, { recursive: true });
  const manifest = { city: CITY, cityName: CITY_NAME[CITY], from: FROM, to: TO, width: 1240, height: 1754, pdf: pdfName, jpgDir: `${CITY}-jpg`, generatedAt: new Date().toISOString(), pages: [] as { src: string; label: string; kind: string; hd: string }[] };
  for (let i = 0; i < els.length; i++) {
    const file = `p${pad(i)}.jpg`;
    await els[i].screenshot({ path: join(outImg, file), type: 'jpeg', quality: 82 });
    const slug = pages[i].label.replace(/ — useful information/, ' back').replace(/[^A-Za-z0-9]+/g, '-').replace(/-$/, '');
    manifest.pages.push({ src: `/ecalendar/${CITY}/${file}`, label: pages[i].label, kind: pages[i].kind, hd: `${pad(i)}-${slug}.jpg` });
  }
  await page.close();

  // 3) Clean high-resolution JPGs (2480 × 3508 = A4 at 300 dpi) for signed-in download.
  const hd = await prepare(2);
  const hels = await hd.$$('section.page');
  for (let i = 0; i < hels.length; i++) await hels[i].screenshot({ path: join(jpgDir, manifest.pages[i].hd), type: 'jpeg', quality: 86 });
  await hd.close();
  writeFileSync(join(outImg, 'manifest.json'), JSON.stringify(manifest, null, 1));
  await browser.close();
  console.log(`Built ${els.length} pages → public/ecalendar/${CITY}/, private/ecalendar/${pdfName}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
