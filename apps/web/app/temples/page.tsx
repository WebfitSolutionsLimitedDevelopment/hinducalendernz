import { publicDb } from '@/lib/supabase-server';
import { FormStatus, Honeypot } from '@/components/FormStatus';
import { CITIES } from '@/lib/cities';

export const metadata = { title: 'Hindu temples and community organisations in New Zealand' };
export const revalidate = 600;

type Temple = { id: string; name: string; city: string; address: string | null; website: string | null; phone: string | null; traditions: string | null; description: string | null; kind: string; verified_at: string | null };

export default async function Page({ searchParams }: { searchParams: Promise<{ thanks?: string; error?: string }> }) {
  const sp = await searchParams;
  const db = publicDb();
  const { data } = db ? await db.from('temples').select('id,name,city,address,website,phone,traditions,description,kind,verified_at').order('city').order('name') : { data: [] };
  const temples = (data as Temple[] | null) ?? [];
  const order: string[] = CITIES.map((c) => c.name);
  const rank = (c: string) => (order.includes(c) ? order.indexOf(c) : 99);
  const cities = [...new Set(temples.map((t) => t.city))].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

  return (
    <>
      <h1>Temples and community organisations</h1>
      <p className="lead">Hindu temples, mandirs and community groups around New Zealand.</p>
      <p className="small muted prose">
        Listings are being confirmed with each temple. If a detail is missing or wrong — or your temple or association isn’t listed —
        please <a href="#suggest">tell us</a>. Check opening hours and event dates with the temple directly.
      </p>
      {temples.length === 0 && <p className="muted">The directory is being prepared.</p>}
      {cities.map((city) => (
        <section key={city}>
          <h2>{city}</h2>
          <div className="grid">
            {temples.filter((t) => t.city === city).map((t) => (
              <div className="card" key={t.id}>
                <h3 style={{ marginTop: 0 }}>{t.name}</h3>
                {t.address && <p className="small" style={{ margin: 0 }}>{t.address}</p>}
                {t.traditions && <p className="small muted">{t.traditions}</p>}
                {t.description && <p className="small">{t.description}</p>}
                <p className="small">
                  {t.website && <a href={t.website} target="_blank" rel="noopener">Website</a>}
                  {t.website && t.phone && ' · '}
                  {t.phone && <a href={`tel:${t.phone.replace(/\s/g, '')}`}>{t.phone}</a>}
                </p>
                {!t.verified_at && <p className="small muted">Details being confirmed</p>}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="prose">
        <h2 id="suggest">Add or update a listing</h2>
        <FormStatus sp={sp} thanks="Thank you — we’ll check the details and add it to the directory." />
        <form className="signup" method="post" action="/api/temples">
          <Honeypot name="website_confirm" />
          <div><label htmlFor="name">Temple or organisation name *</label><input id="name" name="name" required minLength={2} maxLength={150} /></div>
          <div>
            <label htmlFor="city">City *</label>
            <input id="city" name="city" required list="city-list" maxLength={60} />
            <datalist id="city-list">{CITIES.map((c) => <option key={c.id} value={c.name} />)}</datalist>
          </div>
          <div><label htmlFor="address">Address</label><input id="address" name="address" maxLength={300} /></div>
          <div><label htmlFor="website">Website</label><input id="website" name="website" type="url" placeholder="https://" maxLength={300} /></div>
          <div><label htmlFor="phone">Phone</label><input id="phone" name="phone" maxLength={40} /></div>
          <div><label htmlFor="traditions">Tradition / main deities</label><input id="traditions" name="traditions" maxLength={200} /></div>
          <div><label htmlFor="notes">Anything else (correction, opening hours…)</label><textarea id="notes" name="notes" rows={3} maxLength={1000} /></div>
          <div><label htmlFor="submitter_email">Your email (so we can check details)</label><input id="submitter_email" name="submitter_email" type="email" maxLength={254} /></div>
          <button className="btn btn-primary" type="submit">Send</button>
        </form>
      </section>
    </>
  );
}
