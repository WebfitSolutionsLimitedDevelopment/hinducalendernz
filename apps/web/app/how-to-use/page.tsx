import Link from 'next/link';
export const metadata = { title: 'How to use this calendar' };

// Adapted from the founder's "Purpose and Guide" (Sept 2026). Draft — pending founder approval.
export default function Page() {
  return (
    <article className="prose">
      <h1>How to use this calendar</h1>
      <ol>
        <li><strong>Choose your city.</strong> Timings are calculated separately for Auckland, Hamilton, Tauranga, Wellington, Palmerston North, Christchurch and Dunedin. If you live elsewhere, pick the nearest city.</li>
        <li><strong>Find the festival or fast</strong> on the month view. Read the tradition label and any alternative date that applies to your household.</li>
        <li><strong>Open the festival page</strong> for its timing window. The tithi shown on each day is the one at sunrise — it does not last until midnight and does not decide every festival on its own.</li>
        <li><strong>Check what the time is for</strong> — starting a puja, fasting, breaking a fast (parana) or waiting for moonrise. These are different and can fall on different dates.</li>
        <li><strong>Use the public and school holidays</strong> to plan leave, childcare and preparation. Confirm your school’s own start and finish dates, and check temple or community event dates separately.</li>
      </ol>
      <h2>Ritual date vs community celebration</h2>
      <p>A temple or association may hold a celebration on a convenient weekend. That is useful to know, but it is not always the ritual observance date. We label the two separately.</p>
      <h2>Personal ceremonies</h2>
      <p>Weddings, griha pravesh, naming and similar ceremonies need advice for your family and tradition. This calendar does not suggest personal muhurat.</p>
      <p><Link href="/how-hindu-dates-work">Why NZ dates can differ →</Link></p>
    </article>
  );
}
