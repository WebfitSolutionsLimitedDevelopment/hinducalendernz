import { publicDb } from '@/lib/supabase-server';

export const metadata = { title: 'Unsubscribe', robots: { index: false } };
export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams;
  let ok = false;
  if (t && /^[0-9a-f-]{36}$/i.test(t)) {
    const db = publicDb();
    const r = db ? await db.rpc('unsubscribe_signup', { p_token: t }) : null;
    ok = r?.data === true;
  }
  return (
    <article className="prose">
      <h1>Unsubscribe</h1>
      {ok
        ? <p>You’ve been removed from the Hindu Calendar NZ mailing list. You won’t receive further emails.</p>
        : <p>This unsubscribe link isn’t valid or has expired. Email <a href="mailto:info@webfitt.co.nz">info@webfitt.co.nz</a> and we’ll remove you straight away.</p>}
      <p className="small muted">Festival reminders on your phone are managed on the <a href="/reminders">Reminders</a> page.</p>
    </article>
  );
}
