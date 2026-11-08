import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'How we calculate the panchang',
  description: 'The astronomy, reference settings and festival rules behind Hindu Calendar NZ — calculated for each New Zealand city, not shifted from Indian dates.',
};

const CITIES = [
  ['Auckland', '36.8485° S', '174.7633° E'], ['Hamilton', '37.7870° S', '175.2793° E'], ['Tauranga', '37.6878° S', '176.1651° E'],
  ['Wellington', '41.2865° S', '174.7762° E'], ['Palmerston North', '40.3523° S', '175.6082° E'], ['Christchurch', '43.5321° S', '172.6362° E'],
  ['Dunedin', '45.8788° S', '170.5028° E'],
];

const KALA: [string, string, string][] = [
  ['Sunrise (udaya)', 'The tithi current at local sunrise', 'Most vrat days, Ekadashi (Smarta), Nag Panchami, Hanuman Jayanti, Kajari Teej'],
  ['Arunodaya', 'About 96 minutes before sunrise', 'Naraka Chaturdashi (Abhyanga snan)'],
  ['Purvahna', 'The first half of the daytime', 'Vasant Panchami'],
  ['Madhyahna', 'Third fifth of the daytime (midday)', 'Ram Navami, Ganesh Chaturthi, Ganga Saptami, Sita Navami'],
  ['Aparahna', 'Fourth fifth of the daytime', 'Dussehra, Raksha Bandhan, Bhai Dooj'],
  ['Pradosh', 'About 2 hours 24 minutes after sunset', 'Diwali Lakshmi Puja, Dhanteras, Holika Dahan, Sharad Purnima'],
  ['Nishita', 'The 48 minutes around the midpoint of the night', 'Krishna Janmashtami, Maha Shivaratri'],
  ['Moonrise', 'The tithi current at local moonrise', 'Karva Chauth, Sankashti Chaturthi'],
  ['Sunset', 'The tithi current at local sunset', 'Chhath Puja (evening arghya)'],
  ['Solar ingress', 'The moment the Sun enters a sidereal sign; moved to the next day if after sunset', 'Makar Sankranti, Mesha Sankranti'],
];

export default function Page() {
  return (
    <article className="prose">
      <h1>How we calculate the panchang</h1>
      <p className="lead">
        Every date and time on Hindu Calendar NZ is calculated from the actual positions of the Sun and Moon, for each New Zealand city
        and in New Zealand time. We never take a date published for India and move it by a day.
      </p>

      <h2>The five elements (panchanga)</h2>
      <table className="timing">
        <thead><tr><th>Element</th><th>How it is calculated</th></tr></thead>
        <tbody>
          <tr><th scope="row">Tithi</th><td>The angle between the Moon and the Sun along the ecliptic, divided into 30 steps of 12°. Shukla Paksha is tithis 1–15 (ending at Purnima), Krishna Paksha 16–30 (ending at Amavasya). Tithi does not depend on the ayanamsa.</td></tr>
          <tr><th scope="row">Nakshatra</th><td>The Moon’s sidereal longitude divided into 27 lunar mansions of 13°20′.</td></tr>
          <tr><th scope="row">Yoga</th><td>The sum of the sidereal longitudes of the Sun and the Moon, divided into 27 steps of 13°20′ (Vishkambha to Vaidhriti).</td></tr>
          <tr><th scope="row">Karana</th><td>Half a tithi — 6° of Sun–Moon separation. Sixty karanas in a lunar month: Kimstughna, seven movable karanas repeating eight times (Bava to Vishti), then Shakuni, Chatushpada and Naga. Vishti karana is shown as Bhadra.</td></tr>
          <tr><th scope="row">Vaara</th><td>The weekday, reckoned from local sunrise to the next sunrise.</td></tr>
        </tbody>
      </table>
      <p>For each day we show the element current at local sunrise and the time it ends. When a tithi begins and ends between two sunrises (a kshaya tithi), both are shown.</p>

      <h2>Reference settings</h2>
      <ul>
        <li><strong>Astronomy:</strong> positions of the Sun and Moon from the open-source <em>astronomy-engine</em> library (based on VSOP87 and established lunar theory), accurate to about one arcminute. Our calculated Moon phases agree with published tables to within a minute.</li>
        <li><strong>Ayanamsa:</strong> Lahiri (Chitrapaksha), 23.8571° at J2000.0, advancing at 50.288″ a year — the standard used by the Government of India’s Rashtriya Panchang. It affects nakshatra, yoga, sankranti and the names of lunar months, not tithi.</li>
        <li><strong>Lunar months:</strong> amanta (new Moon to new Moon) is calculated first; a lunar month with no solar ingress is adhika (intercalary). The purnimanta name is shown alongside, because North Indian festivals are usually described that way.</li>
        <li><strong>Sunrise and sunset:</strong> calculated for each city, when the upper edge of the Sun crosses the horizon, allowing for standard atmospheric refraction.</li>
        <li><strong>Time zone:</strong> New Zealand Standard Time (UTC+12) and Daylight Time (UTC+13), with the official changeover dates. All times are rounded to the minute.</li>
      </ul>
      <table className="timing">
        <thead><tr><th>City</th><th>Latitude</th><th>Longitude</th></tr></thead>
        <tbody>{CITIES.map(([c, la, lo]) => <tr key={c}><td>{c}</td><td>{la}</td><td>{lo}</td></tr>)}</tbody>
      </table>

      <h2>Festival rules</h2>
      <p>
        A festival date depends on the lunar month, the paksha and the tithi — and on <strong>which part of the day</strong> the tithi
        must prevail (the karmakala). If the tithi covers that period on two days, or on neither, we apply the traditional tie rule and flag
        the festival for review.
      </p>
      <table className="timing">
        <thead><tr><th>Period</th><th>Meaning</th><th>Examples</th></tr></thead>
        <tbody>{KALA.map(([a, b, c]) => <tr key={a}><th scope="row">{a}</th><td>{b}</td><td>{c}</td></tr>)}</tbody>
      </table>
      <h3>Ekadashi</h3>
      <ul>
        <li><strong>Smarta:</strong> the day Ekadashi is current at sunrise.</li>
        <li><strong>Vaishnava:</strong> if Dashami is still current at arunodaya (about 96 minutes before sunrise), the fast moves to the next day. Both dates are shown when they differ.</li>
        <li><strong>Parana (breaking the fast):</strong> on Dwadashi, after Hari Vasara (the first quarter of Dwadashi), within the first fifth of the day and before Dwadashi ends. If Hari Vasara leaves too little of that period, parana moves to after midday.</li>
      </ul>
      <p className="small muted">Traditions differ — for example ISKCON’s Janmashtami also considers Rohini nakshatra, and South Indian dates for some festivals follow the solar month. Where we know a tradition differs, the festival page says so.</p>

      <h2>Checking and review</h2>
      <ol>
        <li><strong>Astronomical check</strong> — our results are cross-checked against Swiss Ephemeris, the reference library used by most panchang software. For Auckland 2026–2028 (1,096 days), sunrise, nakshatra and yoga end times agree within one minute on every day, tithi end times within two minutes, and the tithi, nakshatra, yoga and karana at sunrise agree on all but two days — both cases where a boundary falls within a minute of sunrise.</li>
        <li><strong>Observance review</strong> — festival rules and dates are reviewed by our editor, {SITE.reviewer}, with advice from qualified religious scholars.</li>
        <li><strong>Public corrections</strong> — anyone can <Link href="/corrections">report a correction</Link>; accepted corrections are published.</li>
      </ol>
      <p>
        Each festival shows its status: <em>Calculated</em>, <em>Reviewed</em> or <em>Approved</em>. Families and temples may follow different
        customs; please follow your own tradition where it differs. Questions about the method: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </article>
  );
}
