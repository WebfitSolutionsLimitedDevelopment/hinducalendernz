'use client';
import { useEffect, useState } from 'react';
import { browserDb } from '@/lib/supabase-browser';

type Page = { label: string; kind: string };

/** Downloads for signed-in members (free introductory offer): whole PDF, all pages as JPG (ZIP), or one page as JPG. */
export function EcalDownload({ city, pages }: { city: string; pages: Page[] }) {
  const db = browserDb();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState('');
  const [page, setPage] = useState(() => String(Math.max(0, pages.findIndex((p) => p.kind === 'front'))));

  useEffect(() => {
    if (!db) { setSignedIn(false); return; }
    db.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = db.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, [db]);

  if (signedIn === null) return <p className="muted small">Checking your sign-in…</p>;
  if (!signedIn) {
    return (
      <div className="dl-card">
        <p><strong>Download free:</strong> the full calendar as a print-ready PDF, or any month as a sharp, zoomable JPG picture.</p>
        <p className="actions">
          <a className="btn btn-primary" href="/account?next=/e-calendar" onClick={() => { try { localStorage.setItem('afterSignIn', '/e-calendar'); } catch {} }}>
            Sign in free to download
          </a>
          <span className="small muted"> No password — we email you a sign-in link.</span>
        </p>
      </div>
    );
  }

  const get = async (key: string, query: string) => {
    setBusy(key); setMsg('');
    try {
      const { data } = await db!.auth.getSession();
      const r = await fetch(`/api/ecalendar/download?city=${city}&${query}`, { method: 'POST', headers: { authorization: `Bearer ${data.session?.access_token ?? ''}` } });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.url) { location.href = j.url; setMsg('Your download is starting…'); }
      else if (r.status === 401) setMsg('Please sign in again to download.');
      else setMsg('Sorry — the download isn’t available right now. Please try again shortly or email info@webfitt.co.nz.');
    } finally { setBusy(''); }
  };

  return (
    <div className="dl-card">
      <p><strong>Your free downloads</strong> — no watermark, full quality.</p>
      <div className="dl-grid">
        <div>
          <h3>Whole calendar · PDF</h3>
          <p className="small muted">All pages, A4, ready to print.</p>
          <button type="button" className="btn btn-primary" disabled={!!busy} onClick={() => get('pdf', 'format=pdf')}>{busy === 'pdf' ? 'Preparing…' : 'Download PDF'}</button>
        </div>
        <div>
          <h3>All pages · JPG</h3>
          <p className="small muted">Every page as a sharp picture, in one ZIP file. Best for phones and zooming in.</p>
          <button type="button" className="btn btn-primary" disabled={!!busy} onClick={() => get('zip', 'format=zip')}>{busy === 'zip' ? 'Preparing — this can take a moment…' : 'Download all JPGs (ZIP)'}</button>
        </div>
        <div>
          <h3>One page · JPG</h3>
          <p className="small muted">Just the month you want.</p>
          <select aria-label="Choose a page" value={page} onChange={(e) => setPage(e.target.value)}>
            {pages.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
          </select>
          <button type="button" className="btn btn-ghost" disabled={!!busy} onClick={() => get('jpg', `format=jpg&page=${page}`)}>{busy === 'jpg' ? 'Preparing…' : 'Download this page'}</button>
        </div>
      </div>
      {msg && <p className="small" role="status">{msg}</p>}
    </div>
  );
}
