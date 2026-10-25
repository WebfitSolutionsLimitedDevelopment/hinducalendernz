'use client';
import { useEffect, useState } from 'react';

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

/** "Install app" button (Android/desktop Chrome) or Add-to-Home-Screen steps (iPhone/iPad). */
export function InstallApp() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => { window.removeEventListener('beforeinstallprompt', onPrompt); window.removeEventListener('appinstalled', onInstalled); };
  }, []);

  if (installed) return <p className="flag ok">The app is installed on this device.</p>;
  if (evt) {
    return (
      <button className="btn btn-primary" type="button" onClick={async () => { await evt.prompt(); await evt.userChoice; setEvt(null); }}>
        Install the app
      </button>
    );
  }
  if (ios) {
    return (
      <ol className="small">
        <li>Open this page in <strong>Safari</strong>.</li>
        <li>Tap the <strong>Share</strong> button (square with an arrow).</li>
        <li>Choose <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</li>
        <li>Open Hindu Calendar from your home screen to turn on reminders.</li>
      </ol>
    );
  }
  return <p className="small muted">In Chrome or Edge, use the browser menu → <strong>Install app</strong> / <strong>Add to Home screen</strong>.</p>;
}
