export const metadata = { title: 'Privacy' };

export default function Page() {
  return (
    <article className="prose">
      <h1>Privacy</h1>
      <p className="small muted">Last updated 26 October 2026</p>
      <p>Hindu Calendar NZ respects your privacy and follows the New Zealand Privacy Act 2020. This page explains what we collect and why.</p>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Mailing list:</strong> your email, and optionally your name, city and interests, when you sign up.</li>
        <li><strong>Account (optional):</strong> your email address and your preferences (city, tradition, which reminders you want).</li>
        <li><strong>Phone reminders:</strong> if you turn them on, your browser gives us a technical address to send notifications to, plus your chosen city and reminder settings. We don’t receive your phone number.</li>
        <li><strong>Forms:</strong> what you send us in correction, temple-listing and sponsorship forms.</li>
        <li><strong>Usage:</strong> privacy-friendly, anonymous page statistics (Vercel Web Analytics — no cookies, no individual tracking).</li>
        <li>Your chosen city is remembered in a small cookie on your device so pages open for the right city.</li>
      </ul>
      <h2>How we use it</h2>
      <p>Only to run Hindu Calendar NZ: sending the updates and reminders you asked for, answering your messages, and improving the calendar. We never sell or rent your information, and sponsors never receive it.</p>
      <h2>Where it is stored</h2>
      <p>
        Our database is hosted by Supabase in Tokyo, Japan, and the website runs on Vercel’s servers, which may process requests in the
        United States. Both are reputable providers bound by contract to protect your information. By using these features you agree to
        your information being stored with them overseas.
      </p>
      <h2>Your choices</h2>
      <ul>
        <li>Every email has an unsubscribe link.</li>
        <li>Turn off phone reminders at any time on the <a href="/reminders">Reminders</a> page.</li>
        <li>Delete your saved preferences from your <a href="/account">Account</a> page.</li>
        <li>You can ask to see, correct or delete any information we hold about you: <a href="mailto:hello@hinducalendar.co.nz">hello@hinducalendar.co.nz</a>.</li>
      </ul>
      <p>If you have a concern we can’t resolve, you can contact the Office of the Privacy Commissioner (privacy.org.nz).</p>
    </article>
  );
}
