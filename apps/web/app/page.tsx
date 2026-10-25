import Link from 'next/link';
import { getFestivals, fmtDate, CITY_LABEL, showCalculated } from '@/lib/data';
import { StatusBadge } from '@/components/StatusBadge';

const MAJOR = ['makar-sankranti', 'maha-shivaratri', 'holi', 'ugadi', 'ram-navami', 'raksha-bandhan', 'krishna-janmashtami', 'ganesh-chaturthi', 'sharad-navratri', 'dussehra', 'karva-chauth', 'diwali', 'chhath-puja'];

export default async function Home() {
  const festivals = (await getFestivals()).filter((f) => MAJOR.includes(f.id));
  return (
    <>
      <section className="hero">
        <div>
          <h1>Hindu festivals and dates, worked out for New Zealand</h1>
          <p className="deva" lang="hi">हिन्दू पंचांग</p>
          <p className="lead">
            Festival dates, tithi and fasting times calculated for {CITY_LABEL} — not copied from an Indian city —
            shown alongside NZ public and school holidays.
          </p>
          <div className="actions">
            <Link className="btn btn-primary" href="/calendar/2027">View the 2027 Auckland calendar</Link>
            <Link className="btn btn-ghost" href="/how-hindu-dates-work">Why NZ dates can differ</Link>
          </div>
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Major festivals 2027</h2>
          {festivals.length === 0 ? (
            <p className="muted">Festival dates will appear here once they have been reviewed. <Link href="/contact">Get notified</Link>.</p>
          ) : (
            <ul className="list">
              {festivals.map((f) => (
                <li key={f.id}>
                  <Link href={`/festivals/${f.slug}`}>{f.name}</Link>
                  <span className="muted small">{fmtDate(f.date, { weekday: true })}</span>
                </li>
              ))}
            </ul>
          )}
          {showCalculated && festivals.length > 0 && <p className="small"><StatusBadge status="CALCULATED" /> awaiting review</p>}
        </div>
      </section>

      <section className="grid" style={{ marginTop: 40 }}>
        <div className="card">
          <h3>Calculated locally</h3>
          <p className="muted">Sunrise, sunset and moonrise differ between Auckland and India. Each date is worked out from local conditions, not by adding hours.</p>
        </div>
        <div className="card">
          <h3>Tradition aware</h3>
          <p className="muted">Where Smarta and Vaishnava, or North and South Indian, observances differ, we say so rather than picking one for everyone.</p>
        </div>
        <div className="card">
          <h3>Practical for NZ families</h3>
          <p className="muted">Public holidays and school holidays sit on the same calendar, so you can plan leave, school and puja together.</p>
        </div>
        <div className="card">
          <h3>Open about verification</h3>
          <p className="muted">Every date shows whether it has been reviewed. <Link href="/corrections">How we check and correct</Link>.</p>
        </div>
      </section>
    </>
  );
}
