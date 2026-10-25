import { publicDb } from '@/lib/supabase-server';

type Sponsor = { id: string; name: string; tier: string; website: string | null; logo_url: string | null; blurb: string | null };

export async function getActiveSponsors(): Promise<Sponsor[]> {
  const db = publicDb();
  if (!db) return [];
  const { data } = await db.from('sponsors').select('id,name,tier,website,logo_url,blurb').order('tier');
  return (data as Sponsor[] | null) ?? [];
}

/** Sponsor strip — visually separate from religious content (sponsors never affect dates). */
export async function Sponsors({ heading = 'Supported by' }: { heading?: string }) {
  const sponsors = await getActiveSponsors();
  if (sponsors.length === 0) return null;
  return (
    <aside className="sponsors" aria-label="Sponsors">
      <p className="sponsors-h">{heading}</p>
      <ul>
        {sponsors.map((s) => (
          <li key={s.id}>
            <a href={s.website ?? '#'} target="_blank" rel="noopener sponsored">
              {s.logo_url ? <img src={s.logo_url} alt={s.name} height={40} /> : <span>{s.name}</span>}
            </a>
          </li>
        ))}
      </ul>
      <p className="small muted">Sponsors support this community service and have no say over festival dates or guidance.</p>
    </aside>
  );
}
