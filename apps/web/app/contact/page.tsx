export const metadata = { title: 'Join and contact' };

export default function Page() {
  return (
    <article className="prose">
      <h1>Join the launch list</h1>
      <p>Be the first to know when the 2027 calendar is verified and when the printed edition is available.</p>
      <form className="signup" method="post" action="/api/signup">
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
        <button className="btn btn-primary" type="submit">Sign up</button>
      </form>
      <h2>Corrections and feedback</h2>
      <p>Tell us about a date, time or spelling you think is wrong, using the form above or our contact email. [Contact email to be confirmed.]</p>
    </article>
  );
}
