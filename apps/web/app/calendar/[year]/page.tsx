import Link from 'next/link';
import { notFound } from 'next/navigation';
import { YEAR, monthName, CITY_LABEL } from '@/lib/data';

export const generateStaticParams = () => [{ year: String(YEAR) }];
export const dynamicParams = false;

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  if (Number(year) !== YEAR) notFound();
  return (
    <>
      <h1>{year} calendar</h1>
      <p className="ref">Reference city: {CITY_LABEL}. Times include NZ daylight saving.</p>
      <div className="months" style={{ marginTop: 20 }}>
        {Array.from({ length: 12 }, (_, i) => (
          <Link key={i} href={`/calendar/${year}/${i + 1}`}>{monthName(i + 1)}</Link>
        ))}
      </div>
    </>
  );
}
