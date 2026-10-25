'use client';
import { useEffect, useState } from 'react';
import { CITIES, isCity } from '@/lib/cities';
import { browserDb } from '@/lib/supabase-browser';

export type Prefs = {
  city: string; tradition: 'smarta' | 'vaishnava';
  remind_major: boolean; remind_ekadashi: boolean; remind_sankashti: boolean; days_before: number;
};

export const DEFAULT_PREFS: Prefs = { city: 'auckland', tradition: 'smarta', remind_major: true, remind_ekadashi: false, remind_sankashti: false, days_before: 1 };

export function PrefsFields({ value, onChange }: { value: Prefs; onChange: (p: Prefs) => void }) {
  const set = <K extends keyof Prefs>(k: K, v: Prefs[K]) => onChange({ ...value, [k]: v });
  return (
    <>
      <div>
        <label htmlFor="p-city">City</label>
        <select id="p-city" value={value.city} onChange={(e) => set('city', e.target.value)}>
          {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="p-trad">Ekadashi tradition</label>
        <select id="p-trad" value={value.tradition} onChange={(e) => set('tradition', e.target.value as Prefs['tradition'])}>
          <option value="smarta">Smarta (most families)</option>
          <option value="vaishnava">Vaishnava / ISKCON</option>
        </select>
      </div>
      <fieldset>
        <legend>Remind me about</legend>
        <label className="check"><input type="checkbox" checked={value.remind_major} onChange={(e) => set('remind_major', e.target.checked)} /> Major festivals (Diwali, Holi, Navratri, Janmashtami…)</label>
        <label className="check"><input type="checkbox" checked={value.remind_ekadashi} onChange={(e) => set('remind_ekadashi', e.target.checked)} /> Every Ekadashi fast, with parana time</label>
        <label className="check"><input type="checkbox" checked={value.remind_sankashti} onChange={(e) => set('remind_sankashti', e.target.checked)} /> Sankashti Chaturthi, with moonrise</label>
      </fieldset>
      <div>
        <label htmlFor="p-days">When</label>
        <select id="p-days" value={value.days_before} onChange={(e) => set('days_before', Number(e.target.value))}>
          <option value={0}>On the morning of the day</option>
          <option value={1}>The day before</option>
          <option value={2}>Two days before</option>
          <option value={7}>A week before</option>
        </select>
      </div>
    </>
  );
}

const b64ToBytes = (b64: string) => {
  const s = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};

type State = 'loading' | 'unsupported' | 'ios-install' | 'off' | 'on' | 'denied';

/** Turn reminder notifications on/off for this device. Works without an account. */
export function DeviceReminders() {
  const [state, setState] = useState<State>('loading');
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = localStorage.getItem('reminderPrefs');
        const city = localStorage.getItem('city') ?? document.cookie.match(/(?:^|; )city=([^;]+)/)?.[1];
        setPrefs({ ...DEFAULT_PREFS, ...(saved ? JSON.parse(saved) : {}), ...(!saved && isCity(city) ? { city } : {}) });
      } catch {}
      const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
      const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        setState(ios && !standalone ? 'ios-install' : 'unsupported');
        return;
      }
      if (Notification.permission === 'denied') return setState('denied');
      const reg = await navigator.serviceWorker.ready;
      setState((await reg.pushManager.getSubscription()) ? 'on' : 'off');
    })();
  }, []);

  async function save(subscribe: boolean) {
    setBusy(true); setMsg('');
    try {
      const db = browserDb();
      const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!db || !key) throw new Error('Reminders are not switched on for this site yet.');
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (subscribe && !sub) {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') { setState(perm === 'denied' ? 'denied' : 'off'); return; }
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(key) });
      }
      if (!sub) return;
      const j = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
      const { error } = await db.rpc('save_push_subscription', {
        p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_city: prefs.city, p_tradition: prefs.tradition,
        p_major: prefs.remind_major, p_ekadashi: prefs.remind_ekadashi, p_sankashti: prefs.remind_sankashti, p_days_before: prefs.days_before,
      });
      if (error) throw new Error(error.message);
      localStorage.setItem('reminderPrefs', JSON.stringify(prefs));
      setState('on');
      setMsg('Saved. You’ll get reminders on this device.');
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Something went wrong.');
    } finally { setBusy(false); }
  }

  async function turnOff() {
    setBusy(true); setMsg('');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await browserDb()?.rpc('delete_push_subscription', { p_endpoint: sub.endpoint });
        await sub.unsubscribe();
      }
      setState('off'); setMsg('Reminders turned off on this device.');
    } finally { setBusy(false); }
  }

  async function test() {
    setBusy(true); setMsg('');
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      const r = await fetch('/api/push/test', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(sub) });
      setMsg(r.ok ? 'Test notification sent — it should appear in a few seconds.' : 'Could not send a test notification.');
    } finally { setBusy(false); }
  }

  if (state === 'loading') return <p className="muted">Checking this device…</p>;
  if (state === 'ios-install') return <p className="flag">On iPhone and iPad, first add Hindu Calendar to your Home Screen (steps above), then open it from there to turn on reminders.</p>;
  if (state === 'unsupported') return <p className="flag">This browser doesn’t support reminder notifications. Try Chrome, Edge, Firefox or Safari, or sign up for <a href="/account">email reminders</a>.</p>;
  if (state === 'denied') return <p className="flag">Notifications are blocked for this site. Allow them in your browser or phone settings, then reload this page.</p>;

  return (
    <form className="signup" onSubmit={(e) => { e.preventDefault(); save(true); }}>
      <PrefsFields value={prefs} onChange={setPrefs} />
      <div className="actions" style={{ marginTop: 4 }}>
        <button className="btn btn-primary" type="submit" disabled={busy}>{state === 'on' ? 'Save settings' : 'Turn on reminders'}</button>
        {state === 'on' && <button className="btn btn-ghost" type="button" onClick={test} disabled={busy}>Send a test</button>}
        {state === 'on' && <button className="btn btn-ghost" type="button" onClick={turnOff} disabled={busy}>Turn off</button>}
      </div>
      {msg && <p className="small" role="status">{msg}</p>}
    </form>
  );
}
