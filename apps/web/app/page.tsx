import Link from 'next/link';
import {
  preferredCity, upcomingFestivals, getDays, cityLabel, cityName, todayNZ, currentYear,
  fmtDate, fmtTime, showCalculated,
} from '@/lib/data';
import { CityPicker } from '@/components/CityPicker';
import { StatusBadge } from '@/components/StatusBadge';
import { Sponsors } from '@/components/Sponsors';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const city = await preferredCity();
  const today = todayNZ();
  const year = currentYear();
  const [upcoming, days] = await Promise.all([
    upcomingFestivals(city, 90, (f) => f.category === 'major'),
    Number(today.slice(0, 4)) === year ? getDays(year, city) : Promise.resolve([]),
  ]);
  const todayRec = days.find((d) => d.date === today);
  const next = upcoming.slice(0, 8);

  return (
    <>
      <section className="hero">
        <div>
          <h1>Hindu festivals and dates, worked out for New Zealand</h1>
          <p className="deva" lang="hi">हिन्दू पंचांग</p>
          <p className="lead">
            Festival dates, tithi and puja timings calculated for your NZ city — not copied from an Indian city —
            alongside NZ public and school holidays.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href="/calendar">Open the calendar</Link>
            <Link className="btn btn-ghost" href="/reminders">Get festival reminders</Link>
          </div>
        </div>
        <div className="card">
          <div className="title-row">
            <h2 style={{ margin: 0 }}>Coming up</h2>
            <CityPicker value={city} />
          </div>
          {todayRec && showCalculated && (
            <p className="today-box small">
              <strong>Today in {cityName(city)}:</strong> {todayRec.tithi.paksha} {todayRec.tithi.name}
              {todayRec.tithi.endsAt ? ` until ${fmtTime(todayRec.tithi.endsAt)}` : ''} · sunrise {fmtTime(todayRec.sunrise)} · sunset {fmtTime(todayRec.sunset)}
            </p>
          )}
          {next.length === 0 ? (
            <p className="muted">Festival dates will appear here once reviewed. <Link href="/contact">Get notified</Link>.</p>
          ) : (
            <ul className="list">
              {next.map((f) => (
                <li key={f.id + f.date}>
                  <Link href={`/festivals/${city}/${f.date.slice(0, 4)}/${f.slug}`}>{f.name}</Link>
                  <span className="muted small">{fmtDate(f.date, { weekday: true, short: true })}</span>
                </li>
              ))}
            </ul>
          )}
          {showCalculated && next.length > 0 && <p className="small"><StatusBadge status="CALCULATED" /> for {cityLabel(city)}</p>}
        </div>
      </section>

      <section className="grid" style={{ marginTop: 40 }}>
        <div className="card">
          <h3>Calculated for your city</h3>
          <p className="muted">Auckland, Hamilton, Tauranga, Wellington, Palmerston North, Christchurch and Dunedin each have their own sunrise, sunset and moonrise — so their timings differ.</p>
        </div>
        <div className="card">
          <h3>Reminders on your phone</h3>
          <p className="muted">Add the calendar to your home screen and get a reminder the day before festivals and fasts. <Link href="/reminders">Set up reminders</Link>.</p>
        </div>
        <div className="card">
          <h3>Practical for NZ families</h3>
          <p className="muted">Public and school holidays sit on the same calendar, so you can plan leave, school and puja together.</p>
        </div>
        <div className="card">
          <h3>Temples near you</h3>
          <p className="muted">Find Hindu temples and community organisations around New Zealand. <Link href="/temples">Browse the directory</Link>.</p>
        </div>
      </section>

      <Sponsors />
    </>
  );
}
