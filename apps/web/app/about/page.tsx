export const metadata = { title: 'About' };

export default function Page() {
  return (
    <article className="prose">
      <h1>About Hindu Calendar NZ</h1>
      <p className="lead">A Hindu calendar made for life in New Zealand.</p>
      <p>
        Hindu Calendar NZ brings religious observance and everyday New Zealand planning into one place. It helps families see when a
        festival falls locally, find the relevant puja or fasting guidance, and plan around school, work and community commitments.
      </p>
      <p>
        It is for Hindu households across New Zealand — established families and recent migrants, older readers who prefer print and
        younger people who want to understand the dates they observe — with traditions from India, Nepal, Fiji, Sri Lanka and the wider diaspora.
      </p>
      <h2>Our story</h2>
      <p className="muted">[Founder story — to be supplied by Sanika Sathe Sain.]</p>
      <h2>Who is behind it</h2>
      <p>Hindu Calendar NZ was founded by Sanika Sathe Sain and is built and run in partnership with Webfit Solutions Limited, a New Zealand technology company.</p>
      <h2>What’s here</h2>
      <ul>
        <li>Festival dates and timings for Auckland, Hamilton, Tauranga, Wellington, Palmerston North, Christchurch and Dunedin.</li>
        <li>NZ public and school holidays on the same calendar.</li>
        <li>Reminders on your phone or by email.</li>
        <li>A directory of Hindu temples and community organisations.</li>
      </ul>
    </article>
  );
}
