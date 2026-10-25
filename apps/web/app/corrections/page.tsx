import { FormStatus, Honeypot } from '@/components/FormStatus';
import { CITIES } from '@/lib/cities';

export const metadata = { title: 'Corrections and verification' };

export default async function Page({ searchParams }: { searchParams: Promise<{ thanks?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <article className="prose">
      <h1>Corrections and verification</h1>
      <p>Every date and time shows its review status, so you can see how much to rely on it.</p>
      <table className="timing">
        <tbody>
          <tr><th scope="row">Calculated – not yet reviewed</th><td>Worked out for the city from astronomical data and the festival’s traditional rule. Not yet checked by a reviewer.</td></tr>
          <tr><th scope="row">Reviewed</th><td>Checked by our nominated Panchang reviewer.</td></tr>
          <tr><th scope="row">Verified</th><td>Reviewed and approved for publication.</td></tr>
        </tbody>
      </table>
      <h2>How dates are calculated</h2>
      <p>
        Tithi comes from the angle between the Sun and Moon. Sunrise, sunset and moonrise are calculated for each city’s coordinates and
        New Zealand time, including daylight saving. Each festival’s rule says which part of the day matters — sunrise, the evening
        (pradosh), midnight (nishita) or moonrise. Where traditions differ (for example Smarta and Vaishnava Ekadashi), we show both.
        We do not copy other calendars’ data.
      </p>
      <h2 id="report">Report a correction</h2>
      <p>Tell us the festival, the date or time you expected and your tradition or source. Corrections are dated and listed below — we never silently change a published date.</p>
      <FormStatus sp={sp} thanks="Thank you — we’ll review this and update the corrections log." />
      <form className="signup" method="post" action="/api/corrections">
        <Honeypot />
        <div>
          <label htmlFor="city">City</label>
          <select id="city" name="city" defaultValue="">
            <option value="">Any / not sure</option>
            {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div><label htmlFor="festival">Festival or date</label><input id="festival" name="festival" maxLength={150} /></div>
        <div><label htmlFor="expected">What you expected</label><input id="expected" name="expected" maxLength={300} /></div>
        <div><label htmlFor="message">Details and source *</label><textarea id="message" name="message" required minLength={3} maxLength={2000} rows={5} /></div>
        <div><label htmlFor="email">Your email (optional, if you’d like a reply)</label><input id="email" name="email" type="email" maxLength={254} /></div>
        <button className="btn btn-primary" type="submit">Send correction</button>
      </form>
      <h2>Corrections log</h2>
      <p className="muted">No corrections yet.</p>
    </article>
  );
}
