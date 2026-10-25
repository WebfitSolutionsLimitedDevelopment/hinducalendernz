import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  YEAR, CITY_LABEL, showCalculated, getDays, getFestivals, getHolidays, getMoonPhases,
  monthName, fmtTime, fmtDate,
} from '@/lib/data';

export const generateStaticParams = () =>
  Array.from({ length: 12 }, (_, i) => ({ year: String(YEAR), month: String(i + 1) }));
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ year: string; month: string }> }) {
  const { year, month } = await params;
  return { title: `${monthName(Number(month))} ${year} Hindu calendar — Auckland` };
}

const DOW = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default async function MonthPage({ params }: { params: Promise<{ year: string; month: string }> }) {
  const { year, month } = await params;
  const m = Number(month);
  if (Number(year) !== YEAR || !(m >= 1 && m <= 12)) notFound();
  const prefix = `${year}-${String(m).padStart(2, '0')}-`;

  const [days, festivals, holidays, moons] = await Promise.all([getDays(), getFestivals(), getHolidays(), getMoonPhases()]);
  const monthDays = days.filter((d) => d.date.startsWith(prefix));

  const rows = monthDays.map((d) => {
    const fest = festivals.filter((f) => f.date === d.date);
    const hol = holidays.filter((h) => h.kind !== 'school' && h.date === d.date);
    const school = holidays.some((h) => h.kind === 'school' && h.date <= d.date && d.date <= (h.endDate ?? h.date));
    const moon = moons.filter((p) => p.time.startsWith(d.date));
    return { d, fest, hol, school, moon };
  });

  const firstDow = (new Date(Date.UTC(YEAR, m - 1, 1)).getUTCDay() + 6) % 7; // Monday = 0
  const blanks = Array.from({ length: firstDow });
  const trailing = Array.from({ length: (7 - ((firstDow + rows.length) % 7)) % 7 });

  return (
    <>
      <div className="month-nav">
        {m > 1 ? <Link href={`/calendar/${year}/${m - 1}`}>← {monthName(m - 1)}</Link> : <span />}
        <h1 style={{ margin: 0 }}>{monthName(m)} {year}</h1>
        {m < 12 ? <Link href={`/calendar/${year}/${m + 1}`}>{monthName(m + 1)} →</Link> : <span />}
      </div>
      <p className="ref">
        Reference city: <strong>{CITY_LABEL}</strong>. {showCalculated ? 'Tithi shown is the tithi at local sunrise.' : ''} Times include daylight saving.
      </p>

      <div className="cal" role="table" aria-label={`${monthName(m)} ${year}`}>
        {DOW.map((d) => <div key={d} className="dow" role="columnheader">{d}</div>)}
        {blanks.map((_, i) => <div key={`b${i}`} className="cell empty" aria-hidden="true" />)}
        {rows.map(({ d, fest, hol, school, moon }) => (
          <div key={d.date} role="cell" className={`cell ${hol.length ? 'holiday' : school ? 'school' : ''}`}>
            <div className="num">{Number(d.date.slice(8))}</div>
            {showCalculated && <div className="tithi">{d.tithi.paksha === 'Shukla' ? 'S' : 'K'} {d.tithi.name}</div>}
            {hol.map((h) => <div key={h.name} className="hol">{h.name}</div>)}
            {fest.map((f) => <div key={f.id} className="fest"><Link href={`/festivals/${f.slug}`}>{f.name}</Link></div>)}
            {moon.map((p) => <div key={p.time} className="moon">{p.phase} {fmtTime(p.time)}</div>)}
          </div>
        ))}
        {trailing.map((_, i) => <div key={`t${i}`} className="cell empty" aria-hidden="true" />)}
      </div>

      <div className="agenda">
        {rows.filter((r) => r.fest.length || r.hol.length || r.moon.length || showCalculated).map(({ d, fest, hol, school, moon }) => (
          <div key={d.date} className={`day ${hol.length ? 'holiday' : school ? 'school' : ''}`}>
            <div className="d">{fmtDate(d.date, { weekday: true })}</div>
            {showCalculated && <div className="tithi small">{d.tithi.paksha} {d.tithi.name} · sunrise {fmtTime(d.sunrise)}</div>}
            {hol.map((h) => <div key={h.name} className="hol">{h.name}</div>)}
            {fest.map((f) => <div key={f.id}><Link href={`/festivals/${f.slug}`}>{f.name}</Link></div>)}
            {moon.map((p) => <div key={p.time} className="muted small">{p.phase} {fmtTime(p.time)}</div>)}
          </div>
        ))}
      </div>

      <div className="legend">
        <span className="l-hol">Public holiday</span>
        <span className="l-sch">School holidays (individual schools may vary)</span>
      </div>
    </>
  );
}
