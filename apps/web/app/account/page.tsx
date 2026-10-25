'use client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { browserDb } from '@/lib/supabase-browser';
import { PrefsFields, DEFAULT_PREFS, type Prefs } from '@/components/ReminderSettings';

type Profile = Prefs & { email_reminders: boolean };

export default function AccountPage() {
  const db = browserDb();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<Profile>({ ...DEFAULT_PREFS, email_reminders: true });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Your account · Hindu Calendar NZ';
    if (!db) { setUser(null); return; }
    db.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      // Return to the page that sent the visitor here to sign in (e.g. the e-calendar download).
      try {
        const next = new URLSearchParams(location.search).get('next') ?? localStorage.getItem('afterSignIn');
        if (next && !data.user) localStorage.setItem('afterSignIn', next);
        if (data.user && next && next.startsWith('/') && !next.startsWith('//')) { localStorage.removeItem('afterSignIn'); location.replace(next); }
      } catch {}
    });
    const { data: sub } = db.auth.onAuthStateChange((_e, s) => {
      setUser(s?.user ?? null);
      try {
        const next = localStorage.getItem('afterSignIn');
        if (s?.user && next && next.startsWith('/') && !next.startsWith('//')) { localStorage.removeItem('afterSignIn'); location.replace(next); }
      } catch {}
    });
    return () => sub.subscription.unsubscribe();
  }, [db]);

  useEffect(() => {
    if (!db || !user) return;
    db.from('profiles').select('*').eq('id', user.id).maybeSingle().then(({ data }) => {
      if (data) setProfile({ ...DEFAULT_PREFS, ...data });
    });
  }, [db, user]);

  if (!db) return <article className="prose"><h1>Your account</h1><p className="muted">Sign-in is temporarily unavailable. Please try again later.</p></article>;
  if (user === undefined) return <article className="prose"><h1>Your account</h1><p className="muted">Loading…</p></article>;

  if (!user) {
    return (
      <article className="prose">
        <h1>Sign in</h1>
        <p>Save your city and tradition, and get festival reminders by email. We’ll email you a sign-in link — no password needed.</p>
        <form className="signup" onSubmit={async (e) => {
          e.preventDefault(); setBusy(true); setMsg('');
          const { error } = await db.auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${location.origin}/account` } });
          setBusy(false);
          setMsg(error ? `Could not send the link: ${error.message}` : 'Check your email for a sign-in link (it can take a minute — check spam too).');
        }}>
          <div><label htmlFor="email">Email</label><input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></div>
          <button className="btn btn-primary" disabled={busy} type="submit">Email me a sign-in link</button>
          {msg && <p className="small" role="status">{msg}</p>}
        </form>
        <p className="small muted">Just want reminders on your phone? You don’t need an account — see <a href="/reminders">Reminders</a>.</p>
      </article>
    );
  }

  return (
    <article className="prose">
      <h1>Your account</h1>
      <p className="muted">Signed in as {user.email}</p>
      <form className="signup" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setMsg('');
        const { error } = await db.from('profiles').upsert({ id: user.id, ...profile, updated_at: new Date().toISOString() });
        document.cookie = `city=${profile.city}; path=/; max-age=${60 * 60 * 24 * 400}; samesite=lax`;
        try { localStorage.setItem('city', profile.city); } catch {}
        setBusy(false);
        setMsg(error ? `Could not save: ${error.message}` : 'Saved.');
      }}>
        <PrefsFields value={profile} onChange={(p) => setProfile({ ...profile, ...p })} />
        <label className="check"><input type="checkbox" checked={profile.email_reminders} onChange={(e) => setProfile({ ...profile, email_reminders: e.target.checked })} /> Email me these reminders</label>
        <button className="btn btn-primary" disabled={busy} type="submit">Save</button>
        {msg && <p className="small" role="status">{msg}</p>}
      </form>
      <p className="small">Phone notifications are set per device on the <a href="/reminders">Reminders</a> page.</p>
      <div className="actions">
        <button className="btn btn-ghost" type="button" onClick={() => db.auth.signOut()}>Sign out</button>
        <button className="btn btn-ghost" type="button" onClick={async () => {
          if (!confirm('Delete your saved preferences and stop email reminders?')) return;
          await db.from('profiles').delete().eq('id', user.id);
          await db.auth.signOut();
        }}>Delete my data</button>
      </div>
      <p className="small muted">To remove your sign-in email completely, email <a href="mailto:info@webfitt.co.nz">info@webfitt.co.nz</a>.</p>
    </article>
  );
}
