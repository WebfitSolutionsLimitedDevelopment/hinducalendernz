import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import './globals.css';
import { MODE, CITY_LABEL } from '@/lib/data';

const rozha = localFont({ src: './fonts/RozhaOne.woff2', variable: '--font-rozha', display: 'swap' });
const outfit = localFont({
  src: [{ path: './fonts/Outfit-400.woff2', weight: '400' }, { path: './fonts/Outfit-600.woff2', weight: '600' }],
  variable: '--font-outfit', display: 'swap',
});
const tiro = localFont({ src: './fonts/TiroDevanagari.woff2', variable: '--font-tiro', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://hinducalendar.co.nz'),
  title: { default: 'Hindu Calendar NZ — Hindu festivals and dates for New Zealand', template: '%s · Hindu Calendar NZ' },
  description: 'Hindu festival dates, tithi and observance guidance calculated for New Zealand, alongside NZ public and school holidays.',
  robots: MODE === 'preview' ? { index: false, follow: false } : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" className={`${rozha.variable} ${outfit.variable} ${tiro.variable}`}>
      <body>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="brand" aria-label="Hindu Calendar NZ home">
              <img src="/brand/logo-horizontal.svg" alt="Hindu Calendar — हिन्दू पंचांग — New Zealand" width={300} height={86} />
            </Link>
            <nav className="nav" aria-label="Main">
              <Link href="/calendar/2027">Calendar</Link>
              <Link href="/festivals">Festivals</Link>
              <Link href="/how-hindu-dates-work">How dates work</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Join</Link>
            </nav>
          </div>
        </header>
        {MODE === 'preview' && (
          <div className="banner" role="note">
            <div className="wrap">
              <strong>Internal preview.</strong> Dates and times shown are calculated for {CITY_LABEL} and have not yet been reviewed. Not for ritual reliance.
            </div>
          </div>
        )}
        <main><div className="wrap">{children}</div></main>
        <footer className="site-footer">
          <div className="wrap cols">
            <div>
              <strong>Hindu Calendar NZ</strong><br />
              Reference city for timings: {CITY_LABEL}.<br />
              © {new Date().getFullYear()} Hindu Calendar NZ
            </div>
            <nav aria-label="Footer">
              <Link href="/how-to-use">How to use</Link> · <Link href="/corrections">Corrections &amp; verification</Link> · <Link href="/privacy">Privacy</Link> · <Link href="/contact">Contact</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
