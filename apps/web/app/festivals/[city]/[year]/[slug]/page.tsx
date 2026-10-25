import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  CITIES, YEARS, isCity, isYear, cityLabel, cityName, MODE,
  getFestivals, getFestival, fmtDate, fmtTime, fmtTimeOn,
} from '@/lib/data';
import { StatusBadge } from '@/components/StatusBadge';
import { CityPicker } from '@/components/CityPicker';
import { guidanceFor } from '@/lib/guidance';
import { SITE } from '@/lib/site';
import { googleAddLink } from '@/lib/ics';
import { Share } from '@/components/Share';

export const dynamicParams = false;
export async function generateStaticParams() {
  const out: { city: string; year: string; slug: string }[] = [];
  for (const c of CITIES) for (const y of YEARS) for (const f of await getFestivals(y, c.id)) out.push({ city: c.id, year: String(y), slug: f.slug });
  return out;
}

type P = { params: Promise<{ city: string; year: string; slug: string }> };

export async function generateMetadata({ params }: P) {
  const { city, year, slug } = await params;
  const f = await getFestival(Number(year), city, slug);
  return f ? {
    title: `${f.name} ${year} in ${cityName(city)} — date and timing`,
    description: `${f.name} ${year}: ${fmtDate(f.date, { weekday: true })} in ${cityLabel(city)}. ${guidanceFor(f)?.about.split('. ')[0] ?? 'Timing window, basis and tradition notes'}.`,
  } : {};
}

const LABELS: Record<string, string> = {
  tithiStart: 'Tithi begins', tithiEnd: 'Tithi ends',
  windowStart: 'Observance window begins', windowEnd: 'Observance window ends',
  moonrise: 'Moonrise', sankrantiMoment: 'Sankranti (solar ingress)',
  paranaStart: 'Parana (break fast) from', paranaEnd: 'Parana until', dwadashiEnd: 'Dwadashi ends',
};

/** The single most useful time for the comparison table. */
function keyTime(f: { timing: Record<string, string | null> }) {
  const t = f.timing;
  if (t.windowStart) return `${fmtTime(t.windowStart)} – ${fmtTime(t.windowEnd)}`;
  if (t.moonrise) return `Moonrise ${fmtTime(t.moonrise)}`;
  if (t.paranaStart) return `Parana ${fmtTime(t.paranaStart)} – ${fmtTime(t.paranaEnd)}`;
  return '—';
}

export default async function FestivalPage({ params }: P) {
  const { city, year, slug } = await params;
  if (!isCity(city) || !isYear(Number(year))) notFound();
  const f = await getFestival(Number(year), city, slug);
  if (!f) notFound();
  const g = guidanceFor(f);
  const rows = Object.entries(f.timing).filter(([k, v]) => LABELS[k] && v);
  const others = (await Promise.all(CITIES.map(async (c) => ({ c, f: await getFestival(Number(year), c.id, slug) })))).filter((x) => x.f);

  return (
    <article className="prose">
      <p className="small"><Link href={`/festivals/${city}/${year}`}>← All festivals {year}</Link></p>
      <h1>{f.name}</h1>
      {f.altNames.length > 0 && <p className="muted">Also known as {f.altNames.join(', ')}</p>}
      <p><StatusBadge status={f.status} />{f.reviewer && <span className="small muted"> · Reviewed by {f.reviewer}</span>}</p>

      <h2>{fmtDate(f.date, { weekday: true })}</h2>
      <div className="title-row">
        <p className="ref" style={{ margin: 0 }}>Observance date and times for {cityLabel(city)}.</p>
        <CityPicker value={city} label="Show for" />
      </div>

      {rows.length > 0 && (
        <table className="timing">
          <tbody>
            {rows.map(([k, v]) => <tr key={k}><th scope="row">{LABELS[k]}</th><td>{fmtTimeOn(v, f.date)}</td></tr>)}
            {f.timing.vaishnavaDate && f.timing.vaishnavaDate !== f.date && (
              <tr><th scope="row">Vaishnava fasting date</th><td>{fmtDate(f.timing.vaishnavaDate, { weekday: true })}</td></tr>
            )}
          </tbody>
        </table>
      )}

      {g && (
        <>
          <h3>About {f.name.split(' / ')[0].replace(/ \(.*\)$/, '')}</h3>
          <p>{f.guidance ?? g.about}</p>
          <h3>How it is observed</h3>
          <p>{g.observe}</p>
          {g.timing && <p className="small"><strong>About the time shown:</strong> {g.timing}</p>}
        </>
      )}

      <p className="actions">
        <a className="btn btn-primary" href={googleAddLink(f, city, process.env.SITE_URL ?? 'https://www.hinducalendar.co.nz')} target="_blank" rel="noopener">Add to Google Calendar</a>
        <a className="btn btn-ghost" href="/reminders">Remind me</a>
      </p>
      <Share url={`${process.env.SITE_URL ?? 'https://www.hinducalendar.co.nz'}/festivals/${city}/${year}/${slug}`} text={`${f.name} ${year} in ${cityName(city)}: ${fmtDate(f.date, { weekday: true })}`} />

      <h3>Calendar basis</h3>
      <p>{f.basis}</p>
      <p className="muted small">Tradition: {f.tradition}. Customs differ between regions and families — follow your family tradition or temple where it differs.</p>

      {others.length > 1 && (
        <>
          <h3>Across New Zealand</h3>
          <table className="timing">
            <thead><tr><th>City</th><th>Date</th><th>Time</th></tr></thead>
            <tbody>
              {others.map(({ c, f: o }) => (
                <tr key={c.id} className={c.id === city ? 'current' : ''}>
                  <td><Link href={`/festivals/${c.id}/${year}/${slug}`}>{c.name}</Link></td>
                  <td>{fmtDate(o!.date, { short: true, weekday: true })}</td>
                  <td>{keyTime(o!)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {MODE === 'preview' && f.flags.length > 0 && (
        <>
          <h3>Reviewer notes</h3>
          {f.flags.map((x) => <div key={x} className="flag">{x}</div>)}
        </>
      )}

      <p className="small muted" style={{ marginTop: 32 }}>
        <Link href="/reminders">Get a reminder before festivals</Link> · Spotted a problem? <Link href="/corrections">Report a correction</Link>.
      </p>
    </article>
  );
}
