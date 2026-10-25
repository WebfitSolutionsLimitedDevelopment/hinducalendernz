import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata = { title: 'About Hindu Calendar NZ' };

export default function Page() {
  return (
    <article className="prose">
      <h1>About Hindu Calendar NZ</h1>
      <p className="lead">Your Hindu festivals, important dates and traditions — made relevant to life in New Zealand.</p>

      <h2>Why we started</h2>
      <p>
        Hindu families in New Zealand often rely on calendars and timings published for Indian cities. But a festival’s date and
        puja time depend on where you are: sunrise, sunset and moonrise in Auckland or Dunedin are hours apart from Delhi or Chennai, and
        New Zealand is ahead of India by six and a half or seven and a half hours. Simply converting an Indian time can put a puja window
        after midnight, or on the wrong day.
      </p>
      <p>
        {SITE.founder} saw that families needed one clear, local reference — festival dates and timings worked out for their own city,
        alongside the public holidays and school terms that shape everyday family life here. Hindu Calendar NZ was created to fill that gap.
      </p>

      <h2>What we do</h2>
      <ul>
        <li><strong>Calculated for your city.</strong> Dates and timings for Auckland, Hamilton, Tauranga, Wellington, Palmerston North, Christchurch and Dunedin, including daylight saving.</li>
        <li><strong>Tradition aware.</strong> Where Smarta and Vaishnava, or North and South Indian, practice differs, we show the difference rather than choosing for you.</li>
        <li><strong>Practical.</strong> NZ public and school holidays on the same calendar, so you can plan leave, school and puja together.</li>
        <li><strong>On your phone.</strong> Add the calendar to your home screen and get <Link href="/reminders">reminders</Link> before festivals and fasts.</li>
        <li><strong>Community.</strong> A <Link href="/temples">directory</Link> of Hindu temples and community organisations across the country.</li>
      </ul>

      <h2>Who it’s for</h2>
      <p>
        Hindu households across New Zealand — established families and recent migrants, older readers who prefer print, and younger people
        who want to understand the dates they observe — with traditions from India, Nepal, Fiji, Sri Lanka and the wider diaspora. Temples,
        community groups, schools and employers use it as a planning reference too.
      </p>

      <h2>How we make sure it’s right</h2>
      <p>
        Every date is calculated from astronomical data for the city concerned and the festival’s traditional rule, then reviewed by our
        editor, {SITE.reviewer}. Each entry shows its review status, and corrections are published openly. Read more about
        our <Link href="/corrections">verification and corrections</Link> and <Link href="/how-hindu-dates-work">how Hindu dates work</Link>.
      </p>

      <h2>Who we are</h2>
      <p>
        Hindu Calendar NZ was founded by {SITE.founder}, who leads the calendar’s content, editorial standards and community relationships.
        The platform is built and operated in partnership with <a href={SITE.operatorUrl} target="_blank" rel="noopener">{SITE.operator}</a>,
        a New Zealand technology company, which leads technology, product and digital operations.
      </p>

      <h2>Coming next</h2>
      <p>A printed household calendar, more cities, and richer festival guides. <Link href="/contact">Join the mailing list</Link> to hear first, or <Link href="/sponsors">support the project</Link>.</p>

      <h2>Contact</h2>
      <p>Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call <a href={SITE.phoneHref}>{SITE.phone}</a>.</p>
    </article>
  );
}
