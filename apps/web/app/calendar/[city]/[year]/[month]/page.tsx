import { holidayApplies } from '@/lib/cities';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CITIES, YEARS, isCity, isYear, cityLabel, showCalculated,
  getDays, getFestivals, getHolidays, getMoonPhases, monthName, fmtTime, fmtDate,
} from '@/lib/data';
import { CityPicker } from '@/components/CityPicker';

export const dynamicParams = false;
export const generateStaticParams = () =>
  CITIES.flatMap((c) => YEARS.flatMap((y) => Array.from({ length: 12 }, (_, i) => ({ city: c.id, year: String(y), month: String(i + 1) }))));

type P = { params: Promise<{ city: string; year: string; month: string }> };

export async function generateMetadata({ params }: P) {
  const { city, year, month } = await params;
  return {
    title: `${monthName(Number(month))} ${year} Hindu calendar — ${cityLabel(city)}`,
    description: `Hindu festivals, tithi, NZ public and school holidays for ${monthName(Number(month))} ${year}, calculated for ${cityLabel(city)}.`,
  };
}

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default async function MonthPage({ params }: P) {
  const { city, year: ys, month: ms } = await params;
  const year = Number(ys), m = Number(ms);
  if (!isCity(city) || !isYear(year) || !(m >= 1 && m <= 12)) notFound();
  const prefix = `${year}-${String(m).padStart(2, '0')}-`;

  const [days, festivals, holidays, moons] = await Promise.all([getDays(year, city), getFestivals(year, city), getHolidays(year), getMoonPhases(year, city)]);
  const rows = days.filter((d) => d.date.startsWith(prefix)).map((d) => ({
    d,
    fest: festivals.filter((f) => f.date === d.date),
    hol: holidays.filter((h) => h.kind !== 'school' && h.date === d.date && holidayApplies(h, city)),
    school: holidays.some((h) => h.kind === 'school' && h.date <= d.date && d.date <= (h.endDate ?? h.date)),
    moon: moons.filter((p) => p.time.startsWith(d.date)),
  }));

  const firstDow = (new Date(Date.UTC(year, m - 1, 1)).getUTCDay() + 6) % 7;
  const trailing = (7 - ((firstDow + rows.length) % 7)) % 7;
  const prev = m > 1 ? { y: year, m: m - 1 } : isYear(year - 1) ? { y: year - 1, m: 12 } : null;
  const next = m < 12 ? { y: year, m: m + 1 } : isYear(year + 1) ? { y: year + 1, m: 1 } : null;
  const hasSchool = holidays.some((h) => h.kind === 'school');

  return (
    <>
      <div className="month-nav">
        {prev ? <Link href={`/calendar/${city}/${prev.y}/${prev.m}`}>← {monthName(prev.m)}</Link> : <span />}
        <h1 style={{ margin: 0 }}>{monthName(m)} {year}</h1>
        {next ? <Link href={`/calendar/${city}/${next.y}/${next.m}`}>{monthName(next.m)} →</Link> : <span />}
      </div>
      <div className="title-row">
        <p className="ref" style={{ margin: 0 }}>
          Timings for <strong>{cityLabel(city)}</strong>{showCalculated ? '. Tithi shown is the tithi at local sunrise' : ''}. Daylight saving included.
        </p>
        <CityPicker value={city} />
      </div>

      <div className="cal" role="table" aria-label={`${monthName(m)} ${year}, ${cityLabel(city)}`}>
        {DOW.map((d) => <div key={d} className="dow" role="columnheader">{d}</div>)}
        {Array.from({ length: firstDow }, (_, i) => <div key={`b${i}`} className="cell empty" aria-hidden="true" />)}
        {rows.map(({ d, fest, hol, school, moon }) => (
          <div key={d.date} role="cell" className={`cell ${hol.length ? 'holiday' : school ? 'school' : ''}`}>
            <div className="num">{Number(d.date.slice(8))}</div>
            {showCalculated && <div className="tithi">{d.tithi.paksha === 'Shukla' ? 'S' : 'K'} {d.tithi.name}</div>}
            {hol.map((h) => <div key={h.name} className="hol">{h.name}</div>)}
            {fest.map((f) => <div key={f.id} className={`fest ${f.category === 'major' ? 'major' : ''}`}><Link href={`/festivals/${city}/${year}/${f.slug}`}>{f.name}</Link></div>)}
            {moon.map((p) => <div key={p.time} className="moon">{p.phase} {fmtTime(p.time)}</div>)}
          </div>
        ))}
        {Array.from({ length: trailing }, (_, i) => <div key={`t${i}`} className="cell empty" aria-hidden="true" />)}
      </div>

      <div className="agenda">
        {rows.filter((r) => r.fest.length || r.hol.length || r.moon.length || showCalculated).map(({ d, fest, hol, school, moon }) => (
          <div key={d.date} className={`day ${hol.length ? 'holiday' : school ? 'school' : ''}`}>
            <div className="d">{fmtDate(d.date, { weekday: true })}</div>
            {showCalculated && <div className="tithi small">{d.tithi.paksha} {d.tithi.name} · sunrise {fmtTime(d.sunrise)} · sunset {fmtTime(d.sunset)}</div>}
            {hol.map((h) => <div key={h.name} className="hol">{h.name}</div>)}
            {fest.map((f) => <div key={f.id}><Link href={`/festivals/${city}/${year}/${f.slug}`}>{f.name}</Link></div>)}
            {moon.map((p) => <div key={p.time} className="muted small">{p.phase} {fmtTime(p.time)}</div>)}
          </div>
        ))}
      </div>

      <div className="legend">
        <span className="l-hol">Public holiday</span>
        {hasSchool && <span className="l-sch">School holidays (individual schools may vary)</span>}
        {!hasSchool && <span className="muted">School holidays for {year} will be added once confirmed.</span>}
      </div>
    </>
  );
}
