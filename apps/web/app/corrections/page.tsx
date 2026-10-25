import Link from 'next/link';
export const metadata = { title: 'Corrections and verification' };

export default function Page() {
  return (
    <article className="prose">
      <h1>Corrections and verification</h1>
      <p>Every date and time on this site shows its review status, so you can see how much to rely on it.</p>
      <table className="timing">
        <tbody>
          <tr><th scope="row">Calculated</th><td>Worked out for Auckland from astronomical data and the festival’s rule. Not yet checked by a reviewer.</td></tr>
          <tr><th scope="row">Reviewed</th><td>Checked by our nominated Panchang reviewer.</td></tr>
          <tr><th scope="row">Verified</th><td>Reviewed and approved for publication. Shows the date it was last reviewed.</td></tr>
        </tbody>
      </table>
      <h2>How dates are calculated</h2>
      <p>
        We calculate tithi from the angle between the Sun and Moon, and sunrise, sunset and moonrise for Auckland’s coordinates and time
        zone. Each festival’s rule says which part of the day matters (sunrise, evening, midnight, moonrise). We do not republish other
        calendars’ data.
      </p>
      <h2>Report a correction</h2>
      <p>If you think a date or time is wrong, please <Link href="/contact">contact us</Link> with the festival, the date you expected and your tradition or source. Corrections are dated and listed here; we never silently change a published date.</p>
      <h2>Corrections log</h2>
      <p className="muted">No corrections yet.</p>
    </article>
  );
}
