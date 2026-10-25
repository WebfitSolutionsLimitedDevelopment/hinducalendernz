import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { MODE } from '@/lib/data';
import { RegisterSW } from '@/components/RegisterSW';
import { InstallPrompt } from '@/components/InstallPrompt';
import { SITE } from '@/lib/site';

const rozha = localFont({ src: './fonts/RozhaOne.woff2', variable: '--font-rozha', display: 'swap' });
const outfit = localFont({
  src: [{ path: './fonts/Outfit-400.woff2', weight: '400' }, { path: './fonts/Outfit-600.woff2', weight: '600' }],
  variable: '--font-outfit', display: 'swap',
});
const tiro = localFont({ src: './fonts/TiroDevanagari.woff2', variable: '--font-tiro', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? 'https://hinducalendar.co.nz'),
  title: { default: 'Hindu Calendar NZ — Hindu festivals and dates for New Zealand', template: '%s · Hindu Calendar NZ' },
  description: 'Hindu festival dates, tithi and puja timings calculated for Auckland, Wellington, Christchurch and other NZ cities, alongside NZ public and school holidays.',
  applicationName: 'Hindu Calendar NZ',
  appleWebApp: { capable: true, title: 'Hindu Calendar', statusBarStyle: 'default' },
  openGraph: { type: 'website', siteName: 'Hindu Calendar NZ', locale: 'en_NZ', images: ['/icons/og.png'] },
  robots: MODE === 'preview' ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = { themeColor: '#6E1A2A', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" className={`${rozha.variable} ${outfit.variable} ${tiro.variable}`}>
      <body>
        <a className="skip" href="#main">Skip to content</a>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="brand" aria-label="Hindu Calendar NZ home">
              <img src="/brand/logo-horizontal.svg" alt="Hindu Calendar — हिन्दू पंचांग — New Zealand" width={300} height={86} />
            </Link>
            <nav className="nav" aria-label="Main">
              <Link href="/calendar">Calendar</Link>
              <Link href="/festivals">Festivals</Link>
              <Link href="/e-calendar">E-Calendar</Link>
              <Link href="/temples">Temples</Link>
              <Link href="/reminders">Reminders</Link>
              <Link href="/account">Account</Link>
            </nav>
          </div>
        </header>
        {MODE === 'preview' && (
          <div className="banner" role="note">
            <div className="wrap">
              <strong>Internal preview.</strong> Dates and times are calculated and have not yet been reviewed. Not for ritual reliance.
            </div>
          </div>
        )}
        {MODE === 'calculated' && (
          <div className="banner banner-soft" role="note">
            <div className="wrap">
              Dates and times are calculated for each NZ city and are being reviewed. <Link href="/corrections">How we verify</Link>.
            </div>
          </div>
        )}
        <main id="main"><div className="wrap">{children}</div></main>
        <footer className="site-footer">
          <div className="wrap cols">
            <div>
              <strong>Hindu Calendar NZ</strong><br />
              Festival dates and timings for New Zealand cities.<br />
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a> · <a href={SITE.phoneHref}>{SITE.phone}</a><br />
              © {new Date().getFullYear()} Hindu Calendar NZ
            </div>
            <nav aria-label="Footer" className="footer-links">
              <Link href="/how-hindu-dates-work">How dates work</Link>
              <Link href="/how-to-use">How to use</Link>
              <Link href="/corrections">Corrections</Link>
              <Link href="/sponsors">Sponsors</Link>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
          </div>
          <div className="wrap powered">
            Powered by{' '}
            <a href="https://www.webfitt.com" target="_blank" rel="noopener">Webfit Solutions Limited</a>
          </div>
        </footer>
        <RegisterSW />
        <InstallPrompt />
        <Analytics />
      </body>
    </html>
  );
}
