'use client';
import { useEffect, useState } from 'react';
import { browserDb } from '@/lib/supabase-browser';

/** Download button: free for signed-in members (introductory offer). */
export function EcalDownload({ city }: { city: string }) {
  const db = browserDb();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!db) { setSignedIn(false); return; }
    db.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = db.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, [db]);

  if (signedIn === null) return <p className="muted small">Checking your sign-in…</p>;
  if (!signedIn) {
    return (
      <p className="actions">
        <a className="btn btn-primary" href="/account?next=/e-calendar" onClick={() => { try { localStorage.setItem('afterSignIn', '/e-calendar'); } catch {} }}>
          Sign in free to download the PDF
        </a>
        <span className="small muted"> No password — we email you a sign-in link.</span>
      </p>
    );
  }
  return (
    <p className="actions">
      <button
        type="button" className="btn btn-primary" disabled={busy}
        onClick={async () => {
          setBusy(true); setMsg('');
          try {
            const { data } = await db!.auth.getSession();
            const r = await fetch(`/api/ecalendar/download?city=${city}`, { method: 'POST', headers: { authorization: `Bearer ${data.session?.access_token ?? ''}` } });
            const j = await r.json().catch(() => ({}));
            if (r.ok && j.url) { location.href = j.url; setMsg('Your download is starting…'); }
            else if (r.status === 401) setMsg('Please sign in again to download.');
            else setMsg('Sorry — the download isn’t available right now. Please try again shortly or email info@webfitt.co.nz.');
          } finally { setBusy(false); }
        }}
      >
        {busy ? 'Preparing…' : 'Download full-quality PDF (free)'}
      </button>
      {msg && <span className="small muted" role="status"> {msg}</span>}
    </p>
  );
}
