/**
 * Reference topics for the back of each month (lower half). Original Hindu Calendar NZ text, written
 * for families in New Zealand; tables are classical data or calculated for the edition's city.
 */
import * as Astronomy from 'astronomy-engine';
import {
  type Location, localISO, localMidnight, solarDay, tithis, dayYogas, chaughadiyaNames, isAsta, addDays,
} from '../../packages/panchang-engine/src/index.ts';
import { NAKSHATRA_HI, RASHI_HI, MONTH_HI, MONTH_EN, WEEK_HI, festivalHi } from './lexicon';

export type Ctx = {
  loc: Location; cityName: string;
  fests: (y: number) => { id: string; name: string; date: string; category: string }[];
  sankrantis: (y: number) => { rashi: string; moment: string }[];
};

const pad = (n: number) => String(n).padStart(2, '0');
const dHi = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTH_HI[Number(iso.slice(5, 7)) - 1]}`;
const dEn = (iso: string) => `${Number(iso.slice(8, 10))} ${MONTH_EN[Number(iso.slice(5, 7)) - 1].slice(0, 3)}`;
const tm = (d: Date, loc: Location) => localISO(d, loc)!.slice(11, 16);
const day = (d: Date, loc: Location) => localISO(d, loc)!.slice(0, 10);
const T = (title: string, en: string, body: string) => `<div class="topic"><h2 class="tp"><span class="hi">${title}</span><small>${en}</small></h2><div class="tb fit">${body}</div></div>`;
const cols = (n: number, html: string) => `<div style="column-count:${n};column-gap:22px">${html}</div>`;

// ---------- classical data ----------
const NAMAKSHAR = ['चू चे चो ला', 'ली लू ले लो', 'अ इ उ ए', 'ओ वा वी वू', 'वे वो का की', 'कू घ ङ छ', 'के को ह ही', 'हु हे हो डा', 'डी डू डे डो', 'मा मी मू मे', 'मो टा टी टू', 'टे टो पा पी', 'पू ष ण ठ', 'पे पो रा री', 'रू रे रो ता', 'ती तू ते तो', 'ना नी नू ने', 'नो या यी यू', 'ये यो भा भी', 'भू धा फा ढा', 'भे भो जा जी', 'खी खू खे खो', 'गा गी गू गे', 'गो सा सी सू', 'से सो दा दी', 'दू थ झ ञ', 'दे दो चा ची'];
const LORD = ['केतु', 'शुक्र', 'सूर्य', 'चंद्र', 'मंगल', 'राहु', 'गुरु', 'शनि', 'बुध'];
const GANA_LIST = ['देव', 'मनुष्य', 'राक्षस', 'मनुष्य', 'देव', 'मनुष्य', 'देव', 'देव', 'राक्षस', 'राक्षस', 'मनुष्य', 'मनुष्य', 'देव', 'राक्षस', 'देव', 'राक्षस', 'देव', 'राक्षस', 'राक्षस', 'मनुष्य', 'मनुष्य', 'देव', 'राक्षस', 'राक्षस', 'मनुष्य', 'मनुष्य', 'देव'];
const NADI = ['आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य', 'अन्त्य', 'मध्य', 'आदि', 'आदि', 'मध्य', 'अन्त्य'];
const YONI = ['अश्व', 'गज', 'मेष', 'सर्प', 'सर्प', 'श्वान', 'मार्जार', 'मेष', 'मार्जार', 'मूषक', 'मूषक', 'गौ', 'महिष', 'व्याघ्र', 'महिष', 'व्याघ्र', 'मृग', 'मृग', 'श्वान', 'वानर', 'नकुल', 'वानर', 'सिंह', 'अश्व', 'सिंह', 'गौ', 'गज'];
/** Rashi of each nakshatra pada (1..4) → index 0..11. 9 padas per rashi. */
const padaRashi = (nak: number, pada: number) => Math.floor(((nak - 1) * 4 + (pada - 1)) / 9);

function nakshatraTable(withSyllables: boolean) {
  const rows = NAKSHATRA_HI.map((n, i) => {
    const r1 = padaRashi(i + 1, 1), r4 = padaRashi(i + 1, 4);
    const rashi = r1 === r4 ? RASHI_HI[r1] : `${RASHI_HI[r1]}/${RASHI_HI[r4]}`;
    return `<tr><td><b>${i + 1}. ${n}</b></td>${withSyllables ? `<td class="big">${NAMAKSHAR[i]}</td>` : ''}<td>${rashi}</td><td>${LORD[i % 9]}</td><td>${GANA_LIST[i]}</td><td>${NADI[i]}</td><td>${YONI[i]}</td></tr>`;
  }).join('');
  const head = `<tr><th>नक्षत्र</th>${withSyllables ? '<th>अक्षर</th>' : ''}<th>राशि</th><th>स्वामी</th><th>गण</th><th>नाड़ी</th><th>योनि</th></tr>`;
  const all = rows.split('</tr>').filter(Boolean).map((r) => r + '</tr>');
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px"><table class="tt hi ref">${head}${all.slice(0, 14).join('')}</table><table class="tt hi ref">${head}${all.slice(14).join('')}</table></div>`;
}

const GRAHA = [
  ['सूर्य', 'रविवार', 'लाल / केसरिया', 'माणिक्य', 'गेहूँ, गुड़, ताँबा, लाल वस्त्र', 'ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः', '7,000'],
  ['चंद्र', 'सोमवार', 'सफ़ेद', 'मोती', 'चावल, दूध, चाँदी, सफ़ेद वस्त्र', 'ॐ श्रां श्रीं श्रौं सः चंद्रमसे नमः', '11,000'],
  ['मंगल', 'मंगलवार', 'लाल', 'मूँगा', 'मसूर दाल, गुड़, लाल वस्त्र', 'ॐ क्रां क्रीं क्रौं सः भौमाय नमः', '10,000'],
  ['बुध', 'बुधवार', 'हरा', 'पन्ना', 'मूँग, हरा वस्त्र, हरी सब्ज़ी', 'ॐ ब्रां ब्रीं ब्रौं सः बुधाय नमः', '9,000'],
  ['गुरु', 'गुरुवार', 'पीला', 'पुखराज', 'चने की दाल, हल्दी, पीला वस्त्र, पुस्तकें', 'ॐ ग्रां ग्रीं ग्रौं सः गुरवे नमः', '19,000'],
  ['शुक्र', 'शुक्रवार', 'सफ़ेद / गुलाबी', 'हीरा / ओपल', 'चावल, मिश्री, घी, सुगंध', 'ॐ द्रां द्रीं द्रौं सः शुक्राय नमः', '16,000'],
  ['शनि', 'शनिवार', 'काला / नीला', 'नीलम', 'काले तिल, सरसों का तेल, उड़द, कंबल', 'ॐ प्रां प्रीं प्रौं सः शनैश्चराय नमः', '23,000'],
  ['राहु', 'शनिवार', 'नीला / भूरा', 'गोमेद', 'तिल, नारियल, कंबल', 'ॐ भ्रां भ्रीं भ्रौं सः राहवे नमः', '18,000'],
  ['केतु', 'मंगलवार', 'धूसर / चितकबरा', 'लहसुनिया', 'तिल, कंबल, सप्तधान्य', 'ॐ स्रां स्रीं स्रौं सः केतवे नमः', '17,000'],
];

const JYOTIRLINGA = [
  ['सोमनाथ', 'प्रभास पाटन, गुजरात', 'बारह में प्रथम; अरब सागर के तट पर।'],
  ['मल्लिकार्जुन', 'श्रीशैलम्, आंध्र प्रदेश', 'कृष्णा नदी के पास श्रीशैल पर्वत पर।'],
  ['महाकालेश्वर', 'उज्जैन, मध्य प्रदेश', 'दक्षिणमुखी ज्योतिर्लिंग; भस्म आरती प्रसिद्ध।'],
  ['ओंकारेश्वर', 'खंडवा, मध्य प्रदेश', 'नर्मदा नदी के ॐ आकार के द्वीप पर।'],
  ['केदारनाथ', 'रुद्रप्रयाग, उत्तराखंड', 'हिमालय में; मंदिर वर्ष में लगभग छह माह खुलता है।'],
  ['भीमाशंकर', 'पुणे, महाराष्ट्र', 'सह्याद्रि पर्वत में, भीमा नदी का उद्गम।'],
  ['काशी विश्वनाथ', 'वाराणसी, उत्तर प्रदेश', 'गंगा तट पर, काशी के अधिष्ठाता।'],
  ['त्र्यंबकेश्वर', 'नासिक, महाराष्ट्र', 'गोदावरी नदी के उद्गम के पास।'],
  ['वैद्यनाथ', 'देवघर, झारखंड', 'श्रावण में काँवड़ यात्रा का प्रमुख स्थान।'],
  ['नागेश्वर', 'द्वारका, गुजरात', 'द्वारका के पास; नागों के ईश्वर।'],
  ['रामेश्वरम्', 'रामनाथपुरम्, तमिलनाडु', 'श्रीराम द्वारा स्थापित; चार धाम में एक।'],
  ['घृष्णेश्वर', 'छत्रपति संभाजीनगर, महाराष्ट्र', 'एलोरा गुफाओं के पास; बारहवाँ ज्योतिर्लिंग।'],
];

// ---------- calculated helpers ----------
function astaSpans(body: 'Jupiter' | 'Venus', fromIso: string, toIso: string, loc: Location) {
  const out: { start: string; end: string }[] = [];
  let cur: { start: string; end: string } | null = null;
  for (let t = localMidnight(fromIso, loc); day(t, loc) <= toIso; t = addDays(t, 1)) {
    const a = isAsta(body, addDays(t, 0.5));
    const d = day(t, loc);
    if (a && !cur) cur = { start: d, end: d };
    else if (a && cur) cur.end = d;
    else if (!a && cur) { out.push(cur); cur = null; }
  }
  if (cur) out.push(cur);
  return out;
}

function eclipses(fromIso: string, toIso: string, loc: Location) {
  const obs = new Astronomy.Observer(loc.latitude, loc.longitude, loc.elevation);
  const start = localMidnight(fromIso, loc), end = localMidnight(toIso, loc);
  const out: { date: string; hi: string; en: string; visible: boolean; detail: string }[] = [];
  const KIND: Record<string, [string, string]> = { penumbral: ['उपच्छाया चंद्र ग्रहण', 'Penumbral lunar eclipse'], partial: ['खंडग्रास चंद्र ग्रहण', 'Partial lunar eclipse'], total: ['खग्रास (पूर्ण) चंद्र ग्रहण', 'Total lunar eclipse'] };
  for (let e = Astronomy.SearchLunarEclipse(start); e.peak.date < end; e = Astronomy.NextLunarEclipse(e.peak)) {
    const hor = Astronomy.Horizon(e.peak, obs, ...(() => { const eq = Astronomy.Equator(Astronomy.Body.Moon, e.peak, obs, true, true); return [eq.ra, eq.dec] as [number, number]; })(), 'normal');
    const [hi, en] = KIND[e.kind];
    const half = (e.kind === 'penumbral' ? e.sd_penum : e.sd_partial) / (24 * 60);
    const s = new Date(e.peak.date.getTime() - half * 864e5), f = new Date(e.peak.date.getTime() + half * 864e5);
    out.push({ date: day(e.peak.date, loc), hi, en, visible: hor.altitude > 0 && e.kind !== 'penumbral', detail: `${tm(s, loc)}–${tm(f, loc)}, मध्य ${tm(e.peak.date, loc)}` });
  }
  for (let e = Astronomy.SearchLocalSolarEclipse(start, obs); e.peak.time.date < end; e = Astronomy.NextLocalSolarEclipse(e.peak.time, obs)) {
    const visible = e.peak.altitude > 0;
    out.push({ date: day(e.peak.time.date, loc), hi: e.kind === 'total' ? 'खग्रास सूर्य ग्रहण' : e.kind === 'annular' ? 'कंकणाकृति सूर्य ग्रहण' : 'खंडग्रास सूर्य ग्रहण', en: `Solar eclipse (${e.kind} here)`, visible, detail: `${tm(e.partial_begin.time.date, loc)}–${tm(e.partial_end.time.date, loc)}, ${Math.round(e.obscuration * 100)}% ढका` });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** Shraddha dates: the tithi current at aparahna (4th fifth of the day) on each date. */
function shraddha(purnimaIso: string, amavasyaIso: string, loc: Location) {
  const out: { tithi: string; date: string }[] = [];
  const names = ['पूर्णिमा', 'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी', 'सर्वपितृ अमावस्या'];
  const seen = new Map<number, string>();
  const a = localMidnight(purnimaIso, loc), b = addDays(localMidnight(amavasyaIso, loc), 1.5);
  const ts = tithis(addDays(a, -1), b);
  for (let t = a; day(t, loc) <= amavasyaIso; t = addDays(t, 1)) {
    const sd = solarDay(day(t, loc), loc);
    const len = sd.sunset.getTime() - sd.sunrise.getTime();
    const mid = new Date(sd.sunrise.getTime() + len * 0.7);
    const tt = ts.find((x) => x.start <= mid && mid < x.end);
    if (!tt) continue;
    const k = tt.tithi === 15 ? 0 : tt.tithi === 30 ? 15 : tt.tithi - 15;
    if (k >= 0 && k <= 15 && !seen.has(k)) seen.set(k, day(t, loc));
  }
  for (let k = 0; k <= 15; k++) out.push({ tithi: names[k], date: seen.get(k) ?? '' });
  return out;
}

// ---------- topics by month ----------
export function topicFor(key: string, c: Ctx): string | null {
  const L = c.loc;
  switch (key) {
    case '2026-10': return T('पंचांग कैसे पढ़ें', 'Reading the panchang', cols(2, `
      <p><b>तिथि</b> — चंद्रमा और सूर्य के बीच हर 12° के अंतर से एक तिथि बनती है। एक चांद्र मास में 30 तिथियाँ होती हैं: शुक्ल पक्ष में प्रतिपदा से पूर्णिमा (1–15) और कृष्ण पक्ष में प्रतिपदा से अमावस्या। अमावस्या को 30 लिखते हैं।</p>
      <p><b>पक्ष</b> — अमावस्या के बाद चंद्रमा बढ़ता है: <b>शुक्ल पक्ष (सुदी)</b>। पूर्णिमा के बाद घटता है: <b>कृष्ण पक्ष (बदी)</b>।</p>
      <p><b>मास</b> — चैत्र, वैशाख, ज्येष्ठ, आषाढ़, श्रावण, भाद्रपद, आश्विन, कार्तिक, मार्गशीर्ष, पौष, माघ, फाल्गुन। <b>अमांत</b> पद्धति में मास अमावस्या को समाप्त होता है (गुजरात, महाराष्ट्र, दक्षिण भारत); <b>पूर्णिमांत</b> में पूर्णिमा को (उत्तर भारत)। इस कैलेंडर में दोनों दिए गए हैं।</p>
      <p><b>नक्षत्र</b> — चंद्रमा 27 नक्षत्रों से होकर लगभग 27⅓ दिन में आकाश का चक्कर पूरा करता है। तारीख के खाने में सूर्योदय के समय का नक्षत्र और उसके समाप्त होने का समय दिया है।</p>
      <p><b>स्मार्त और वैष्णव</b> — एकादशी कभी-कभी दो दिन पड़ती है। स्मार्त परंपरा पहले दिन और वैष्णव (इस्कॉन आदि) परंपरा दूसरे दिन व्रत रखती है। पीछे के पृष्ठ पर दोनों तिथियाँ दी गई हैं।</p>
      <p><b>न्यूज़ीलैंड में तिथि अलग क्यों?</b> — तिथि एक ही क्षण में पूरी पृथ्वी पर बदलती है, पर न्यूज़ीलैंड भारत से 6½–7½ घंटे आगे है। इसलिए यहाँ सूर्योदय पर कई बार दूसरी तिथि होती है और त्योहार एक दिन पहले या बाद में पड़ता है। इस कैलेंडर की हर तिथि और समय ${c.cityName} के लिए गणना किए गए हैं।</p>
      <p><b>समय कैसे पढ़ें</b> — प्रातः (4–8 बजे), दिन (8–16), सायं (16–19), रात (19–4)। "ता.6 रात 1:11" का अर्थ है 6 तारीख़ की आधी रात के बाद 1:11 बजे।</p>
      <p><b>भद्रा, मूल, पंचक</b> — भद्रा (विष्टि करण) में शुभ कार्य टाले जाते हैं; मूल (गंडमूल) नक्षत्र में जन्म हो तो शांति कराई जाती है; पंचक में लकड़ी इकट्ठा करना, छत डालना, दक्षिण यात्रा जैसे कार्य टाले जाते हैं। सामने के पृष्ठ पर इनके समय दिए हैं।</p>`));

    case '2026-11': return T('नवग्रह शांति', 'The nine grahas — day, colour, daan and beej mantra', `
      <table class="tt hi ref"><tr><th>ग्रह</th><th>वार</th><th>रंग</th><th>रत्न*</th><th>दान</th><th>बीज मंत्र</th><th>जप संख्या</th></tr>
      ${GRAHA.map((g) => `<tr><td><b>${g[0]}</b></td><td>${g[1]}</td><td>${g[2]}</td><td>${g[3]}</td><td>${g[4]}</td><td>${g[5]}</td><td>${g[6]}</td></tr>`).join('')}</table>
      <p class="hi">कलियुग में जप संख्या का चार गुना करने की परंपरा है। ग्रह शांति के लिए उस ग्रह के वार को व्रत, दान और मंत्र-जप किया जाता है।</p>
      <p class="hi small">* रत्न अपनी कुंडली देखकर योग्य ज्योतिषी की सलाह से ही धारण करें। दान सामग्री न्यूज़ीलैंड में मंदिर, फ़ूड बैंक या ज़रूरतमंद परिवारों को दी जा सकती है।</p>`);

    case '2026-12': return T('नामाक्षर चक्र', 'First letter of the name by birth nakshatra', `
      ${nakshatraTable(true)}
      <p class="hi small">जन्म नक्षत्र के जिस चरण (पाद) में जन्म हो, उसी क्रम के अक्षर से नाम रखा जाता है — जैसे अश्विनी के चार चरण: चू, चे, चो, ला। जन्म का सही नक्षत्र-चरण जन्म समय और स्थान से निकलता है।</p>`);

    case '2027-01': return T('अष्टकूट गुण मिलान', 'Kundli matching — the eight kootas', cols(2, `
      <table class="tt hi ref"><tr><th>कूट</th><th>गुण</th><th>क्या देखता है</th></tr>
      <tr><td>वर्ण</td><td>1</td><td>स्वभाव व कार्यशैली</td></tr><tr><td>वश्य</td><td>2</td><td>आपसी आकर्षण व प्रभाव</td></tr>
      <tr><td>तारा</td><td>3</td><td>भाग्य व स्वास्थ्य</td></tr><tr><td>योनि</td><td>4</td><td>स्वभाव व अनुकूलता</td></tr>
      <tr><td>ग्रह मैत्री</td><td>5</td><td>राशि स्वामियों की मित्रता</td></tr><tr><td>गण</td><td>6</td><td>देव / मनुष्य / राक्षस स्वभाव</td></tr>
      <tr><td>भकूट</td><td>7</td><td>दोनों राशियों का आपसी स्थान</td></tr><tr><td>नाड़ी</td><td>8</td><td>आदि / मध्य / अन्त्य नाड़ी</td></tr>
      <tr><td><b>कुल</b></td><td><b>36</b></td><td>18 से अधिक गुण मिलने पर मिलान सामान्यतः शुभ माना जाता है।</td></tr></table>
      <p><b>गण</b> — एक ही गण सबसे अनुकूल; देव–मनुष्य सामान्य; राक्षस के साथ अन्य गण कम अनुकूल।</p>
      <p><b>नाड़ी</b> — वर-कन्या की एक ही नाड़ी हो तो नाड़ी दोष (0 गुण) माना जाता है; भिन्न नाड़ी शुभ।</p>
      <p><b>भकूट</b> — दोनों राशियाँ एक-दूसरे से 6/8, 9/5 या 2/12 स्थान पर हों तो भकूट दोष माना जाता है।</p>
      <p><b>मंगल दोष</b> — लग्न या चंद्र से 1, 4, 7, 8, 12वें भाव में मंगल हो तो मांगलिक माना जाता है; दोनों मांगलिक हों तो दोष का परिहार माना जाता है।</p>
      <p>अपने नक्षत्र के गण, नाड़ी और योनि दिसंबर के पृष्ठ की तालिका में देखें। पूरा कुंडली मिलान जन्म समय सहित योग्य ज्योतिषी से कराएँ।</p>`));

    case '2027-02': {
      const y = 2027;
      const f = c.fests(y);
      const holi = f.find((x) => x.id === 'holika-dahan')?.date ?? '';
      const ss = c.sankrantis(y);
      const dhanuPrev = c.sankrantis(y - 1).find((s) => s.rashi === 'Dhanu')?.moment.slice(0, 10) ?? '';
      const makara = ss.find((s) => s.rashi === 'Makara')?.moment.slice(0, 10) ?? '';
      const meena = ss.find((s) => s.rashi === 'Meena')?.moment.slice(0, 10) ?? '';
      const mesha = ss.find((s) => s.rashi === 'Mesha')?.moment.slice(0, 10) ?? '';
      const dhanu = ss.find((s) => s.rashi === 'Dhanu')?.moment.slice(0, 10) ?? '';
      const dev1 = f.find((x) => x.id.startsWith('ekadashi-devshayani'))?.date ?? '';
      const dev2 = f.find((x) => x.id.startsWith('ekadashi-devutthana'))?.date ?? '';
      const holaStart = holi ? (() => { const ts = tithis(addDays(localMidnight(holi, L), -10), localMidnight(holi, L)); const a = ts.find((t) => t.tithi === 8); return a ? day(a.start, L) : ''; })() : '';
      const guru = astaSpans('Jupiter', '2027-01-01', '2027-12-31', L), shukra = astaSpans('Venus', '2027-01-01', '2027-12-31', L);
      const rng = (a: string, b: string) => `${dHi(a)} – ${dHi(b)}`;
      return T('शुभ कार्यों में वर्जित समय 2027', 'When auspicious ceremonies are avoided — 2027, NZ dates', cols(2, `
        <p><b>खरमास</b> — सूर्य धनु या मीन राशि में हो तो विवाह, गृह प्रवेश, मुंडन आदि नहीं किए जाते।<br>
        धनु: ${rng(dhanuPrev, makara)} · मीन: ${rng(meena, mesha)} · धनु: ${dHi(dhanu)} से।</p>
        <p><b>होलाष्टक</b> — फाल्गुन शुक्ल अष्टमी से होलिका दहन तक: ${holaStart ? rng(holaStart, holi) : '—'}।</p>
        <p><b>चातुर्मास</b> — देवशयनी एकादशी से देवउठनी एकादशी तक देवता शयन करते हैं; विवाह, उपनयन, गृहारंभ आदि नहीं होते: ${rng(dev1, dev2)}।</p>
        <p><b>गुरु अस्त</b> — ${guru.map((s) => rng(s.start, s.end)).join('; ') || '—'}।<br><b>शुक्र अस्त</b> — ${shukra.map((s) => rng(s.start, s.end)).join('; ') || '—'}।<br>गुरु या शुक्र अस्त हों तो विवाह आदि मांगलिक कार्य वर्जित माने जाते हैं।</p>
        <p><b>भद्रा</b> — शुभ कार्य भद्रा में नहीं किए जाते; हर माह के सामने के पृष्ठ पर भद्रा के समय दिए हैं।</p>
        <p><b>चार अबूझ मुहूर्त</b> — चैत्र शुक्ल प्रतिपदा, अक्षय तृतीया, विजयादशमी और दीपावली को बिना पंचांग देखे शुभ कार्य किए जाते हैं (कुछ परंपराओं में देवउठनी एकादशी भी)।</p>
        <p class="small">ग्रहों के अस्त की गणना सूर्य से कोणीय दूरी (गुरु 11°, शुक्र 10°) से की गई है। मुहूर्त के लिए अपने पुरोहित से पुष्टि करें।</p>`));
    }

    case '2027-03': {
      const W = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
      const NM: Record<string, string> = { Udveg: 'उद्वेग', Char: 'चर', Labh: 'लाभ', Amrit: 'अमृत', Kaal: 'काल', Shubh: 'शुभ', Rog: 'रोग' };
      const cls = (n: string) => (['Amrit', 'Shubh', 'Labh'].includes(n) ? 'g' : n === 'Char' ? 'm' : 'b');
      const tbl = (k: 'day' | 'night') => `<table class="tt hi ref cg"><tr><th>${k === 'day' ? 'दिन' : 'रात'}</th>${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<th>${i}</th>`).join('')}</tr>${W.map((w, i) => `<tr><td><b>${w}</b></td>${chaughadiyaNames(i)[k].map((n) => `<td class="${cls(n)}">${NM[n]}</td>`).join('')}</tr>`).join('')}</table>`;
      const sd = solarDay('2027-03-21', L);
      const dl = (sd.sunset.getTime() - sd.sunrise.getTime()) / 8 / 60000;
      return T('चौघड़िया मुहूर्त', 'Choghadiya — good and bad periods of the day', `${cols(2, tbl('day') + tbl('night'))}
        <p class="hi">सूर्योदय से सूर्यास्त तक के समय को 8 बराबर भागों में बाँटें — यही दिन के चौघड़िया हैं; सूर्यास्त से अगले सूर्योदय तक के 8 भाग रात के। <b style="color:#2E6B3A">अमृत, शुभ, लाभ</b> उत्तम; <b style="color:#B7791F">चर</b> यात्रा के लिए ठीक; <b style="color:#B3122E">रोग, काल, उद्वेग</b> टालें।
        उदाहरण: ${c.cityName} में 21 मार्च 2027 को सूर्योदय ${tm(sd.sunrise, L)}, सूर्यास्त ${tm(sd.sunset, L)} — हर चौघड़िया लगभग ${Math.round(dl)} मिनट का। न्यूज़ीलैंड में गर्मी में दिन लंबे होते हैं, इसलिए दिन के चौघड़िया भी लंबे होते हैं।</p>`);
    }

    case '2027-04': {
      const ys = dayYogas('2027-01-01', '2027-12-31', L);
      const by = (k: string) => {
        const m = new Map<number, number[]>();
        for (const y of ys.filter((x) => x.kind === k)) { const mo = Number(y.date.slice(5, 7)); const d = Number(y.date.slice(8, 10)); const a = m.get(mo) ?? []; if (!a.includes(d)) a.push(d); m.set(mo, a); }
        return [...m.entries()].map(([mo, ds]) => `<b>${MONTH_HI[mo - 1]}:</b> ${ds.join(', ')}`).join(' · ');
      };
      return T('शुभ योग 2027', `Auspicious yogas in 2027 — dates for ${c.cityName}`, `
        <p class="hi">इन योगों में आरंभ किए कार्य सफल माने जाते हैं। योग सूर्योदय से अगले सूर्योदय के बीच किसी समय बनता है; सटीक समय के लिए पुरोहित या हमारी वेबसाइट देखें।</p>
        <h4 class="hi">सर्वार्थ सिद्धि योग <small>(वार + नक्षत्र)</small></h4><p class="hi">${by('sarvartha')}</p>
        <h4 class="hi">अमृत सिद्धि योग</h4><p class="hi">${by('amrit')}</p>
        <h4 class="hi">द्विपुष्कर योग <small>(लाभ-हानि दो गुना)</small></h4><p class="hi">${by('dwipushkar')}</p>
        <h4 class="hi">त्रिपुष्कर योग <small>(लाभ-हानि तीन गुना)</small></h4><p class="hi">${by('tripushkar')}</p>
        <p class="hi small">गणना: सर्वार्थ सिद्धि व अमृत सिद्धि — वार व नक्षत्र का योग; द्वि/त्रिपुष्कर — रवि/मंगल/शनि, भद्रा तिथि (2, 7, 12) तथा द्विपाद/त्रिपाद नक्षत्र का एक साथ होना।</p>`);
    }

    case '2027-05': return T('वास्तु — घर के लिए मूल बातें', 'Vastu basics for New Zealand homes', cols(2, `
      <ol class="hi">
      <li>पूजा का स्थान ईशान कोण (उत्तर-पूर्व) में सबसे शुभ माना जाता है; पूजा करते समय मुख पूर्व या उत्तर की ओर हो।</li>
      <li>रसोई आग्नेय कोण (दक्षिण-पूर्व) में और खाना बनाते समय मुख पूर्व की ओर हो।</li>
      <li>मुख्य शयनकक्ष नैऋत्य कोण (दक्षिण-पश्चिम) में; सोते समय सिर दक्षिण या पूर्व की ओर।</li>
      <li>घर का उत्तर-पूर्व भाग हल्का, खुला और साफ़ रखें; भारी सामान दक्षिण-पश्चिम में।</li>
      <li>मुख्य द्वार साफ़, रोशन और बाधा-रहित हो; द्वार के ठीक सामने खंभा या कूड़ादान न हो।</li>
      <li>शौचालय उत्तर-पूर्व कोने में न हो; उसका दरवाज़ा बंद रखें।</li>
      <li>पूजा घर में टूटी या खंडित मूर्ति न रखें; मूर्तियाँ छोटी और संख्या में सीमित रखें।</li>
      <li>तुलसी का पौधा पूर्व या उत्तर में लगाएँ; न्यूज़ीलैंड की सर्दी में उसे घर के भीतर धूप वाली खिड़की पर रखें।</li>
      <li>सीढ़ियाँ दक्षिण या पश्चिम भाग में और घड़ी की दिशा में चढ़ती हों।</li>
      <li>पानी की टंकी/नल उत्तर-पूर्व में शुभ; टपकते नल तुरंत ठीक कराएँ।</li>
      <li>दिशाएँ कंपास से लें — दक्षिणी गोलार्ध में भी पूर्व वही है जहाँ सूर्य उगता है, पर यहाँ दोपहर का सूर्य उत्तर में होता है, इसलिए धूप वाले कमरे उत्तर की ओर होते हैं।</li>
      <li>किराये के घर में बड़े बदलाव की जगह साफ़-सफ़ाई, रोशनी, पौधे और पूजा स्थान की सही दिशा से शुरुआत करें।</li>
      </ol>`));

    case '2027-06': return T('पूजा के सामान्य नियम', 'Everyday puja — good practice at home', cols(2, `
      <ol class="hi">
      <li>पूजा से पहले स्नान करें और स्वच्छ वस्त्र पहनें; पूजा आसन पर बैठकर करें, सीधे फ़र्श पर नहीं।</li>
      <li>घी का दीपक देवता के दाईं ओर और तेल का दीपक बाईं ओर रखें।</li>
      <li>आरती में भगवान विष्णु के चरणों की चार बार, नाभि की दो बार, मुख की एक बार और फिर पूरे विग्रह की सात बार आरती उतारें।</li>
      <li>परिक्रमा: देवी की एक, सूर्य की सात, गणेश की तीन, विष्णु की चार और शिव की आधी परिक्रमा की परंपरा है।</li>
      <li>पुष्प, पत्र और फल जिस रूप में उगते हैं उसी रूप में (सीधे) चढ़ाएँ।</li>
      <li>घर के मंदिर में दो शिवलिंग, तीन गणेश या दो शंख एक साथ रखने से बचें।</li>
      <li>पूजा के बाद बचे फूल व सामग्री को बहते जल में डालने के बजाय न्यूज़ीलैंड में बगीचे की मिट्टी में दबा दें या खाद में डालें — नदी-समुद्र में सामग्री डालना यहाँ नियम-विरुद्ध हो सकता है।</li>
      <li>दीपक या धूप कभी बिना देखरेख न छोड़ें; स्मोक अलार्म के पास धूप न जलाएँ।</li>
      <li>प्रसाद पहले भगवान को अर्पित करें, फिर परिवार व अतिथियों में बाँटें।</li>
      <li>मंत्र-जप तुलसी, रुद्राक्ष या चंदन की माला से; माला के सुमेरु को पार न करें, वहीं से वापस घुमाएँ।</li>
      </ol>`));

    case '2027-07': return T('द्वादश ज्योतिर्लिंग', 'The twelve Jyotirlingas of Shiva', `
      <p class="hi">श्रावण मास शिव उपासना का मास है। पुराणों के अनुसार भगवान शिव बारह स्थानों पर ज्योति स्वरूप में विराजमान हैं — इनके दर्शन और नाम-स्मरण का बड़ा महत्व है।</p>
      <table class="tt hi ref"><tr><th>#</th><th>ज्योतिर्लिंग</th><th>स्थान</th><th>विशेषता</th></tr>
      ${JYOTIRLINGA.map((j, i) => `<tr><td>${i + 1}</td><td><b>${j[0]}</b></td><td>${j[1]}</td><td>${j[2]}</td></tr>`).join('')}</table>
      <p class="hi small">सौराष्ट्रे सोमनाथं च श्रीशैले मल्लिकार्जुनम्। उज्जयिन्यां महाकालमोङ्कारममलेश्वरम्॥ — द्वादश ज्योतिर्लिंग स्तोत्र का आरंभ।</p>`);

    case '2027-08': {
      const f = c.fests(2027);
      const anant = f.find((x) => x.id === 'anant-chaturdashi')?.date ?? '2027-09-15';
      const navr = f.find((x) => x.id === 'sharad-navratri')?.date ?? '2027-10-01';
      const sh = shraddha(new Date(new Date(anant + 'T12:00Z').getTime() + 864e5).toISOString().slice(0, 10), new Date(new Date(navr + 'T12:00Z').getTime() - 864e5).toISOString().slice(0, 10), L);
      return T('पितृ पक्ष 2027 — श्राद्ध तिथियाँ', `Pitru Paksha 2027 — shraddha dates for ${c.cityName}`, `
        <p class="hi">भाद्रपद पूर्णिमा से आश्विन अमावस्या तक के सोलह दिन पितरों को समर्पित हैं। जिस तिथि को पूर्वज का देहांत हुआ हो, उसी तिथि को उनका श्राद्ध किया जाता है। तिथि याद न हो तो सर्वपितृ अमावस्या को श्राद्ध करें।</p>
        ${cols(2, `<table class="tt hi ref"><tr><th>श्राद्ध</th><th>तारीख़ (${c.cityName})</th></tr>${sh.map((x) => `<tr><td>${x.tithi}</td><td>${x.date ? `${dHi(x.date)} (${WEEK_HI[new Date(x.date + 'T12:00Z').getUTCDay()]})` : 'क्षय — पुरोहित से पूछें'}</td></tr>`).join('')}</table>`)}
        <p class="hi small">तिथि अपराह्न काल (दिन का चौथा पंचमांश) में व्याप्त तिथि के आधार पर दी गई है। न्यूज़ीलैंड में तर्पण के लिए घर पर स्वच्छ पात्र में जल, काले तिल और कुश का प्रयोग करें; ब्राह्मण भोजन या मंदिर/फ़ूड बैंक में दान करें।</p>`);
    }

    case '2027-09': {
      const es = eclipses('2027-01-01', '2028-12-31', L);
      return T('ग्रहण 2027–28', `Eclipses 2027–28 — as seen from ${c.cityName}`, `
        <table class="tt hi ref"><tr><th>तारीख़</th><th>ग्रहण</th><th>${c.cityName} से</th><th>समय (NZ)</th></tr>
        ${es.map((e) => `<tr><td>${dHi(e.date)} ${e.date.slice(0, 4)}</td><td>${e.hi}<br><small>${e.en}</small></td><td>${e.visible ? '<b style="color:#2E6B3A">दिखेगा</b>' : 'नहीं दिखेगा'}</td><td>${e.visible ? e.detail : '—'}</td></tr>`).join('')}</table>
        <p class="hi"><b>सूतक</b> — केवल उसी ग्रहण का सूतक माना जाता है जो अपने स्थान से दिखाई दे। सूर्य ग्रहण में ग्रहण से 12 घंटे और चंद्र ग्रहण में 9 घंटे पहले सूतक आरंभ होता है; बालक, वृद्ध और रोगी के लिए नियम शिथिल हैं। उपच्छाया ग्रहण का सूतक नहीं माना जाता।</p>
        <p class="hi small">ग्रहण काल में मंत्र-जप, ग्रहण समाप्ति पर स्नान और दान की परंपरा है। सूर्य ग्रहण को कभी भी नंगी आँखों से न देखें।</p>`);
    }

    case '2027-10': return T('दीपावली पूजन सामग्री व क्रम', 'Diwali puja — what you need and the order', cols(2, `
      <p><b>सामग्री</b> — लक्ष्मी-गणेश की मूर्ति या चित्र, लाल वस्त्र, चौकी, कलश, आम के पत्ते, नारियल, रोली, मौली, अक्षत (चावल), हल्दी, सिंदूर, फूल-माला, कमल या गुलाब, धूप, दीपक, घी/तेल, रुई की बत्ती, कपूर, पान-सुपारी, लौंग-इलायची, खील-बताशे, मिठाई, फल, पंचामृत, गंगाजल (या स्वच्छ जल), सिक्के, बही-खाता या लैपटॉप (व्यापारियों के लिए)।</p>
      <p><b>क्रम</b> — 1. स्थान शुद्धि व चौकी पर लाल वस्त्र। 2. कलश स्थापना। 3. गणेश पूजन। 4. लक्ष्मी पूजन — आवाहन, स्नान, वस्त्र, तिलक, पुष्प, धूप, दीप, नैवेद्य। 5. कुबेर और बही-खाता पूजन। 6. आरती — "ॐ जय लक्ष्मी माता"। 7. घर भर में दीपक। 8. प्रसाद वितरण।</p>
      <p><b>मुहूर्त</b> — लक्ष्मी पूजा प्रदोष काल में स्थिर लग्न (वृषभ) के समय सबसे शुभ मानी जाती है। ${c.cityName} का समय सामने के पृष्ठ व वेबसाइट पर दिया है।</p>
      <p><b>न्यूज़ीलैंड में सुरक्षा</b> — पटाखे केवल नियत दिनों में बिकते हैं और कई परिषदें सार्वजनिक स्थानों पर इन्हें प्रतिबंधित करती हैं; दीयों को पर्दों से दूर रखें और बच्चों पर नज़र रखें।</p>`));

    case '2027-11': {
      const f = c.fests(2028).filter((x) => x.category === 'ekadashi');
      return T('एकादशी 2028', `Ekadashi dates in 2028 — ${c.cityName}`, `
        ${cols(3, `<table class="tt hi ref"><tr><th>तारीख़</th><th>एकादशी</th></tr>${f.map((x) => `<tr><td>${dHi(x.date)}</td><td>${festivalHi(x)}</td></tr>`).join('')}</table>`)}
        <p class="hi"><b>व्रत नियम</b> — दशमी की रात से सात्विक भोजन; एकादशी को अन्न (विशेषकर चावल) का त्याग, फलाहार या निर्जल व्रत अपनी क्षमता अनुसार; द्वादशी को पारण समय में व्रत खोलें। गर्भवती, रोगी व बुज़ुर्ग अपने स्वास्थ्य के अनुसार व्रत रखें।</p>
        <p class="hi small">वैष्णव तिथि अलग होने पर, और हर एकादशी का पारण समय, हमारी वेबसाइट पर देखें।</p>`);
    }

    case '2027-12': {
      const f = c.fests(2028).filter((x) => x.category === 'major');
      return T('2028 के प्रमुख त्योहार', `Major festivals in 2028 — ${c.cityName}`, `
        ${cols(3, `<table class="tt hi ref"><tr><th>तारीख़</th><th>त्योहार</th></tr>${f.map((x) => `<tr><td>${dHi(x.date)} <small>(${dEn(x.date)})</small></td><td>${festivalHi(x)}</td></tr>`).join('')}</table>`)}
        <p class="hi">2028 का पूरा कैलेंडर, हर शहर के समय और त्योहार रिमाइंडर <b>hinducalendar.co.nz</b> पर। अगले वर्ष का ई-कैलेंडर पाने के लिए वेबसाइट पर साइन अप करें।</p>`);
    }
  }
  return null;
}
