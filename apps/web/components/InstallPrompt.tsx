'use client';
import { useEffect, useState } from 'react';

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> };

const KEY = 'installPromptDismissedAt';
const SNOOZE_DAYS = 14;

function recentlyDismissed() {
  try {
    const t = Number(localStorage.getItem(KEY) ?? 0);
    return Date.now() - t < SNOOZE_DAYS * 864e5;
  } catch { return false; }
}

/**
 * "Install the app" pop-up.
 * Android / Chrome / Edge: one tap opens the browser's own install dialog.
 * iPhone / iPad (Safari): shows the Share → Add to Home Screen steps (Apple doesn't allow a one-tap install).
 * Hidden once installed, and for 14 days after "Not now".
 */
export function InstallPrompt() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [mode, setMode] = useState<'hidden' | 'android' | 'ios'>('hidden');
  const [iosSteps, setIosSteps] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (standalone || recentlyDismissed()) return;
    const ua = navigator.userAgent;
    const isIos = /iphone|ipad|ipod/i.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document);
    const isSafari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvt(e as BIPEvent);
      setTimeout(() => setMode('android'), 2500);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    const onInstalled = () => setMode('hidden');
    window.addEventListener('appinstalled', onInstalled);

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIos && isSafari) timer = setTimeout(() => setMode('ios'), 2500);

    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const dismiss = () => {
    try { localStorage.setItem(KEY, String(Date.now())); } catch {}
    setMode('hidden');
  };

  if (mode === 'hidden') return null;

  return (
    <div className="install-pop" role="dialog" aria-modal="false" aria-labelledby="install-title">
      <img src="/icons/icon-192.png" alt="" width={56} height={56} className="install-icon" />
      <div className="install-body">
        <p id="install-title" className="install-title">Install Hindu Calendar</p>
        {mode === 'android' && (
          <p className="install-text">Add it to your home screen — opens like an app, works offline and can remind you before festivals.</p>
        )}
        {mode === 'ios' && !iosSteps && (
          <p className="install-text">Add it to your Home Screen — opens like an app and can remind you before festivals.</p>
        )}
        {mode === 'ios' && iosSteps && (
          <ol className="install-steps">
            <li>Tap the <strong>Share</strong> button <ShareIcon /> at the bottom (or top) of Safari.</li>
            <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
            <li>Tap <strong>Add</strong>. The Hindu Calendar icon appears on your Home Screen.</li>
          </ol>
        )}
        <div className="install-actions">
          {mode === 'android' && evt && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={async () => {
                await evt.prompt();
                const { outcome } = await evt.userChoice;
                setEvt(null);
                if (outcome === 'accepted') setMode('hidden'); else dismiss();
              }}
            >
              Install app
            </button>
          )}
          {mode === 'ios' && !iosSteps && (
            <button type="button" className="btn btn-primary" onClick={() => setIosSteps(true)}>Show me how</button>
          )}
          <button type="button" className="btn btn-ghost" onClick={dismiss}>{iosSteps ? 'Done' : 'Not now'}</button>
        </div>
      </div>
      <button type="button" className="install-close" aria-label="Close" onClick={dismiss}>×</button>
    </div>
  );
}

function ShareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-label="Share" role="img" style={{ verticalAlign: '-2px' }}>
      <path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
  );
}
