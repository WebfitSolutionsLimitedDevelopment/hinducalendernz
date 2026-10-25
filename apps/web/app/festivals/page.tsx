import Link from 'next/link';
import { getFestivals, fmtDate, monthName, YEAR } from '@/lib/data';
import { StatusBadge } from '@/components/StatusBadge';

export const metadata = { title: `Hindu festivals ${YEAR} in New Zealand` };

export default async function FestivalsPage() {
  const festivals = await getFestivals();
  const byMonth = new Map<number, typeof festivals>();
  for (const f of festivals) {
    const m = Number(f.date.slice(5, 7));
    byMonth.set(m, [...(byMonth.get(m) ?? []), f]);
  }
  return (
    <>
      <h1>Festivals and vrats {YEAR}</h1>
      <p className="muted prose">Dates are for Auckland. Select a festival for its basis, timing and tradition notes.</p>
      {festivals.length === 0 && <p>Festival dates will be published here once they have been reviewed. <Link href="/contact">Get notified</Link>.</p>}
      {[...byMonth.entries()].map(([m, list]) => (
        <section key={m}>
          <h2>{monthName(m)}</h2>
          <ul className="list card">
            {list.map((f) => (
              <li key={f.id}>
                <span><Link href={`/festivals/${f.slug}`}>{f.name}</Link> <span className="muted small">· {f.tradition}</span></span>
                <span className="small">{fmtDate(f.date, { weekday: true })} <StatusBadge status={f.status} /></span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
