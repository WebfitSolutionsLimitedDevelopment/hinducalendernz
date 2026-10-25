export const metadata = { title: 'Offline' };

export default function Page() {
  return (
    <article className="prose">
      <h1>You’re offline</h1>
      <p>This page hasn’t been saved on your device yet. Pages you have opened before — such as this month’s calendar — are available offline.</p>
      <p><a href="/calendar">Open the calendar</a></p>
    </article>
  );
}
