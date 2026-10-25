import { getActiveSponsors } from '@/components/Sponsors';
import { FormStatus, Honeypot } from '@/components/FormStatus';

export const metadata = { title: 'Sponsors and partners' };
export const revalidate = 600;

export default async function Page({ searchParams }: { searchParams: Promise<{ thanks?: string; error?: string }> }) {
  const sp = await searchParams;
  const sponsors = await getActiveSponsors();
  return (
    <article className="prose">
      <h1>Sponsors and partners</h1>
      <p className="lead">Hindu Calendar NZ is a free community resource. Sponsors help keep it that way.</p>
      {sponsors.length > 0 ? (
        <div className="grid" style={{ margin: '16px 0 32px' }}>
          {sponsors.map((s) => (
            <div className="card" key={s.id}>
              {s.logo_url && <img src={s.logo_url} alt="" height={48} />}
              <h3 style={{ marginTop: 8 }}>{s.website ? <a href={s.website} target="_blank" rel="noopener sponsored">{s.name}</a> : s.name}</h3>
              {s.blurb && <p className="small muted">{s.blurb}</p>}
            </div>
          ))}
        </div>
      ) : <p className="muted">Our first sponsors are coming soon.</p>}
      <h2>Our editorial promise</h2>
      <p>Sponsors are always clearly labelled and kept separate from religious content. A sponsor never decides a festival date, timing, guidance or correction.</p>
      <h2>Sponsorship options</h2>
      <ul>
        <li><strong>Principal sponsor</strong> — recognition across the website and the printed calendar.</li>
        <li><strong>Festival sponsor</strong> — recognition on a major festival page (e.g. Diwali, Navratri, Holi).</li>
        <li><strong>Community supporter</strong> — listing on this page.</li>
      </ul>
      <h2 id="enquire">Enquire about sponsorship</h2>
      <FormStatus sp={sp} thanks="Thank you — we’ll be in touch shortly." />
      <form className="signup" method="post" action="/api/sponsor">
        <Honeypot name="website_confirm" />
        <div><label htmlFor="business">Business or organisation *</label><input id="business" name="business" required minLength={2} maxLength={150} /></div>
        <div><label htmlFor="contact_name">Your name</label><input id="contact_name" name="contact_name" maxLength={120} /></div>
        <div><label htmlFor="email">Email *</label><input id="email" name="email" type="email" required maxLength={254} /></div>
        <div><label htmlFor="phone">Phone</label><input id="phone" name="phone" maxLength={40} /></div>
        <div><label htmlFor="interest">What are you interested in?</label><textarea id="interest" name="interest" rows={4} maxLength={1000} /></div>
        <button className="btn btn-primary" type="submit">Send enquiry</button>
      </form>
    </article>
  );
}
