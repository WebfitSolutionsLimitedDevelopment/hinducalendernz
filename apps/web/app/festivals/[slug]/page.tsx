import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getFestivals, getFestival, fmtDate, fmtTimeOn, CITY_LABEL, showCalculated } from '@/lib/data';
import { StatusBadge } from '@/components/StatusBadge';

export const dynamicParams = false;
export async function generateStaticParams() {
  return (await getFestivals()).map((f) => ({ slug: f.slug! }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const f = await getFestival((await params).slug);
  return f ? { title: `${f.name} ${f.date.slice(0, 4)} — Auckland date and timing` } : {};
}

const LABELS: Record<string, string> = {
  tithiStart: 'Tithi begins', tithiEnd: 'Tithi ends',
  windowStart: 'Observance window begins', windowEnd: 'Observance window ends',
  moonrise: 'Moonrise', sankrantiMoment: 'Sankranti (solar ingress)',
  paranaStart: 'Parana (break fast) from', paranaEnd: 'Parana until', dwadashiEnd: 'Dwadashi ends',
};

export default async function FestivalPage({ params }: { params: Promise<{ slug: string }> }) {
  const f = await getFestival((await params).slug);
  if (!f) notFound();
  const rows = Object.entries(f.timing).filter(([k, v]) => LABELS[k] && v);
  return (
    <article className="prose">
      <p className="small"><Link href="/festivals">← All festivals</Link></p>
      <h1>{f.name}</h1>
      {f.altNames.length > 0 && <p className="muted">Also known as {f.altNames.join(', ')}</p>}
      <p><StatusBadge status={f.status} /></p>

      <h2>{fmtDate(f.date, { weekday: true })}</h2>
      <p className="ref">Observance date for {CITY_LABEL}. Other NZ cities may differ where exact timing matters.</p>

      {rows.length > 0 && (
        <table className="timing">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}><th scope="row">{LABELS[k]}</th><td>{fmtTimeOn(v, f.date)}</td></tr>
            ))}
            {f.timing.vaishnavaDate && f.timing.vaishnavaDate !== f.date && (
              <tr><th scope="row">Vaishnava fasting date</th><td>{fmtDate(f.timing.vaishnavaDate, { weekday: true })}</td></tr>
            )}
          </tbody>
        </table>
      )}

      <h3>Basis</h3>
      <p>{f.basis}</p>
      <p className="muted small">Tradition: {f.tradition}</p>

      {f.guidance ? (
        <>
          <h3>About this observance</h3>
          <p>{f.guidance}</p>
        </>
      ) : (
        <p className="muted">Explanation and observance guidance coming soon.</p>
      )}

      {showCalculated && f.flags.length > 0 && (
        <>
          <h3>Reviewer notes</h3>
          {f.flags.map((x) => <div key={x} className="flag">{x}</div>)}
        </>
      )}

      <p className="small muted" style={{ marginTop: 32 }}>
        Spotted a problem? <Link href="/corrections">Report a correction</Link>.
      </p>
    </article>
  );
}
