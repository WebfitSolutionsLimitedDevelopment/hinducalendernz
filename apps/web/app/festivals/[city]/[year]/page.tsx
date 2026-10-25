import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CITIES, YEARS, isCity, isYear, cityLabel, cityName, getFestivals, fmtDate, monthName } from '@/lib/data';
import { StatusBadge } from '@/components/StatusBadge';
import { CityPicker } from '@/components/CityPicker';
import { AddToCalendar } from '@/components/AddToCalendar';

export const dynamicParams = false;
export const generateStaticParams = () => CITIES.flatMap((c) => YEARS.map((y) => ({ city: c.id, year: String(y) })));

type P = { params: Promise<{ city: string; year: string }> };

export async function generateMetadata({ params }: P) {
  const { city, year } = await params;
  return { title: `Hindu festivals ${year} in ${cityName(city)}`, description: `Dates of Hindu festivals and vrats in ${year} for ${cityLabel(city)}.` };
}

const GROUPS = [
  { key: 'major', label: 'Major festivals' },
  { key: 'all', label: 'All observances' },
];

export default async function FestivalsPage({ params }: P) {
  const { city, year } = await params;
  if (!isCity(city) || !isYear(Number(year))) notFound();
  const festivals = await getFestivals(Number(year), city);
  const major = festivals.filter((f) => f.category === 'major');
  const byMonth = new Map<number, typeof festivals>();
  for (const f of festivals) {
    const m = Number(f.date.slice(5, 7));
    byMonth.set(m, [...(byMonth.get(m) ?? []), f]);
  }
  const row = (f: (typeof festivals)[number]) => (
    <li key={f.id}>
      <span><Link href={`/festivals/${city}/${year}/${f.slug}`}>{f.name}</Link> <span className="muted small">· {f.tradition}</span></span>
      <span className="small">{fmtDate(f.date, { weekday: true })} <StatusBadge status={f.status} /></span>
    </li>
  );
  return (
    <>
      <div className="title-row">
        <h1>Hindu festivals {year}</h1>
        <CityPicker value={city} />
      </div>
      <p className="muted prose">Observance dates for {cityLabel(city)}. Select a festival for its timing window, basis and tradition notes.</p>
      {festivals.length === 0 && <p>Festival dates will be published here once they have been reviewed. <Link href="/contact">Get notified</Link>.</p>}
      {festivals.length > 0 && <AddToCalendar city={city} />}
      {major.length > 0 && (
        <section>
          <h2>{GROUPS[0].label}</h2>
          <ul className="list card">{major.map(row)}</ul>
        </section>
      )}
      {festivals.length > 0 && <h2>{GROUPS[1].label}</h2>}
      {[...byMonth.entries()].map(([m, list]) => (
        <section key={m}>
          <h3>{monthName(m)}</h3>
          <ul className="list card">{list.map(row)}</ul>
        </section>
      ))}
      <p className="small" style={{ marginTop: 24 }}>
        Other years: {YEARS.filter((y) => String(y) !== year).map((y, i) => (
          <span key={y}>{i > 0 && ' · '}<Link href={`/festivals/${city}/${y}`}>{y}</Link></span>
        ))}
      </p>
    </>
  );
}
