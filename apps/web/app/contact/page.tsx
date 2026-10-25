export const metadata = { title: 'Join and contact' };

const MSG: Record<string, string> = {
  email: 'Please enter a valid email address.',
  closed: 'Sign-ups are not open yet — please try again soon.',
  save: 'Sorry, we could not save your sign-up. Please try again.',
};

export default async function Page({ searchParams }: { searchParams: Promise<{ thanks?: string; error?: string }> }) {
  const sp = await searchParams;
  return (
    <article className="prose">
      <h1>Join the launch list</h1>
      {sp.thanks && <p className="flag" role="status">Thank you — you’re on the list.</p>}
      {sp.error && <p className="flag" role="alert">{MSG[sp.error] ?? MSG.save}</p>}
      <p>Be the first to know when the 2027 calendar is verified and when the printed edition is available.</p>
      <form className="signup" method="post" action="/api/signup">
        <div style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
        <div><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" /></div>
        <div><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
        <div>
          <label htmlFor="city">City</label>
          <select id="city" name="city" defaultValue="">
            <option value="" disabled>Choose…</option>
            <option>Auckland</option><option>Hamilton</option><option>Wellington</option><option>Christchurch</option><option>Other NZ</option><option>Outside NZ</option>
          </select>
        </div>
        <div>
          <label><input type="checkbox" name="interest_print" style={{ width: 'auto', minHeight: 0 }} /> I’m interested in the printed calendar</label>
        </div>
        <div>
          <label><input type="checkbox" name="interest_app" style={{ width: 'auto', minHeight: 0 }} /> I’d like festival reminders / an app</label>
        </div>
        <p className="small muted">We’ll only use your details to send Hindu Calendar NZ updates. <a href="/privacy">Privacy</a></p>
        <button className="btn btn-primary" type="submit">Sign up</button>
      </form>
      <h2>Corrections and feedback</h2>
      <p>Tell us about a date, time or spelling you think is wrong, using the form above or our contact email. [Contact email to be confirmed.]</p>
    </article>
  );
}
