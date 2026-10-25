import { FormStatus, Honeypot } from '@/components/FormStatus';
import { CITIES } from '@/lib/cities';
import { SITE } from '@/lib/site';

export const metadata = { title: 'Join and contact' };

export default async function Page({ searchParams }: { searchParams: Promise<{ thanks?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <article className="prose">
      <h1 id="signup">Join the mailing list</h1>
      <p>Hear when dates are verified for the year, when the printed calendar is available, and about new features.</p>
      <FormStatus sp={sp} thanks="Thank you — you’re on the list." />
      <form className="signup" method="post" action="/api/signup">
        <Honeypot />
        <div><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" maxLength={120} /></div>
        <div><label htmlFor="email">Email *</label><input id="email" name="email" type="email" required autoComplete="email" maxLength={254} /></div>
        <div>
          <label htmlFor="city">City</label>
          <select id="city" name="city" defaultValue="">
            <option value="" disabled>Choose…</option>
            {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            <option value="other-nz">Other NZ</option><option value="overseas">Outside NZ</option>
          </select>
        </div>
        <label className="check"><input type="checkbox" name="interest_print" /> I’m interested in the printed calendar</label>
        <label className="check"><input type="checkbox" name="interest_app" /> I’d like festival reminders</label>
        <p className="small muted">We only use your details to send Hindu Calendar NZ updates. Every email has an unsubscribe link. <a href="/privacy">Privacy</a></p>
        <button className="btn btn-primary" type="submit">Sign up</button>
      </form>
      <h2>Contact</h2>
      <p>For corrections to a date or time, please use the <a href="/corrections#report">corrections form</a>. For sponsorship, see <a href="/sponsors">Sponsors</a>.</p>
      <ul>
        <li>Email: <a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
        <li>Phone: <a href={SITE.phoneHref}>{SITE.phone}</a></li>
      </ul>
      <p className="small muted">We aim to reply within two working days.</p>
    </article>
  );
}
