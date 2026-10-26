import type { Metadata } from 'next';
import Link from 'next/link';
import { ecalManifest, ECAL_PRICE_NZD } from '@/lib/ecalendar';
import { Flipbook } from '@/components/Flipbook';
import { EcalDownload } from '@/components/EcalDownload';

export const metadata: Metadata = {
  title: 'E-Calendar 2026–27 — Hindu wall calendar for New Zealand',
  description: 'Flip through the Hindu Calendar NZ e-calendar: tithi, nakshatra, vrat-tyohar, rashifal and sunrise–sunset for every day, calculated for New Zealand. Free PDF download for members.',
};

export default function ECalendarPage() {
  const m = ecalManifest('auckland');
  if (!m) return <article className="prose"><h1>E-Calendar</h1><p>The e-calendar is being prepared. Please check back soon.</p></article>;
  return (
    <article>
      <div className="prose">
        <h1>E-Calendar {m.from.slice(0, 4)}–{m.to.slice(2, 4)} <span className="hi" style={{ fontFamily: 'var(--font-tiro)' }}>· हिन्दू पंचांग</span></h1>
        <p>
          The traditional Hindu wall calendar, made for New Zealand. Each month shows the tithi and nakshatra for every day, vrat and festivals,
          rashifal, sunrise and sunset, and NZ holidays — all calculated for {m.cityName}. Turn the page to see the back of each month,
          with a festival guide, Ekadashi parana times and puja times across New Zealand cities.
        </p>
        <p><strong>{ECAL_PRICE_NZD > 0 ? `Full-quality PDF: NZ$${ECAL_PRICE_NZD}.` : 'Free for this edition — introductory offer.'}</strong> Sign in to download the print-ready PDF, or any page as a sharp JPG you can zoom into — without the preview watermark.</p>
        <EcalDownload city={m.city} pages={m.pages.map((p) => ({ label: p.label, kind: p.kind }))} />
      </div>
      <Flipbook pages={m.pages} width={m.width} height={m.height} />
      <div className="prose">
        <p className="small muted">
          Times are for {m.cityName}. For another city, see the <Link href="/calendar">online calendar</Link>, which shows every NZ city.
          Want your business on a month page? See <Link href="/sponsors">sponsorship</Link>. Calendar layout used with the written permission of Thakur Prasad Calendar. Deity paintings by Raja Ravi Varma and the Ravi Varma Press (public domain, via Wikimedia Commons).
        </p>
      </div>
    </article>
  );
}
