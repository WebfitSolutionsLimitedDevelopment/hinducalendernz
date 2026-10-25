import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CITIES, YEARS, isCity, isYear, cityLabel } from '@/lib/cities';
import { monthName } from '@/lib/format';
import { CityPicker } from '@/components/CityPicker';

export const dynamicParams = false;
export const generateStaticParams = () => CITIES.flatMap((c) => YEARS.map((y) => ({ city: c.id, year: String(y) })));

export async function generateMetadata({ params }: { params: Promise<{ city: string; year: string }> }) {
  const { city, year } = await params;
  return { title: `${year} Hindu calendar — ${cityLabel(city)}` };
}

export default async function YearPage({ params }: { params: Promise<{ city: string; year: string }> }) {
  const { city, year } = await params;
  if (!isCity(city) || !isYear(Number(year))) notFound();
  return (
    <>
      <div className="title-row">
        <h1>{year} Hindu calendar</h1>
        <CityPicker value={city} />
      </div>
      <p className="ref">Timings for {cityLabel(city)}, including daylight saving.</p>
      <div className="months" style={{ marginTop: 20 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <Link key={i} href={`/calendar/${city}/${year}/${i + 1}`}>{monthName(i + 1)}</Link>
        ))}
      </div>
      <p className="small" style={{ marginTop: 20 }}>
        Other years: {YEARS.filter((y) => String(y) !== year).map((y, i) => (
          <span key={y}>{i > 0 && ' · '}<Link href={`/calendar/${city}/${y}`}>{y}</Link></span>
        ))}
      </p>
    </>
  );
}
