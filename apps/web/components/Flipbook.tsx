'use client';
import { useEffect, useRef, useState } from 'react';

type Page = { src: string; label: string; kind: string };

/** Page-turning flipbook of the e-calendar. Fronts are on the right; turning a month shows its back. */
export function Flipbook({ pages, width, height }: { pages: Page[]; width: number; height: number }) {
  const host = useRef<HTMLDivElement>(null);
  const book = useRef<import('page-flip').PageFlip | null>(null);
  const [idx, setIdx] = useState(0);
  const [portrait, setPortrait] = useState(false);

  useEffect(() => {
    let alive = true;
    import('page-flip').then(({ PageFlip }) => {
      if (!alive || !host.current) return;
      const pf = new PageFlip(host.current, {
        width: Math.round(width / 2), height: Math.round(height / 2), size: 'stretch',
        minWidth: 280, maxWidth: 900, minHeight: 396, maxHeight: 1273,
        showCover: true, maxShadowOpacity: 0.45, mobileScrollSupport: true, usePortrait: true, flippingTime: 700,
      });
      pf.loadFromImages(pages.map((p) => p.src));
      pf.on('flip', (e) => setIdx(Number(e.data)));
      pf.on('changeOrientation', (e) => setPortrait(e.data === 'portrait'));
      pf.on('init', () => setPortrait(pf.getOrientation() === 'portrait'));
      book.current = pf;
      const start = Number(new URLSearchParams(location.search).get('p'));
      if (start > 0) pf.turnToPage(Math.min(start, pages.length - 1));
    });
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') book.current?.flipNext();
      if (e.key === 'ArrowLeft') book.current?.flipPrev();
    };
    window.addEventListener('keydown', key);
    return () => { alive = false; window.removeEventListener('keydown', key); book.current?.destroy(); book.current = null; };
  }, [pages, width, height]);

  const fronts = pages.map((p, i) => ({ ...p, i })).filter((p) => p.kind === 'front');
  const visible = portrait || idx === 0 || idx === pages.length - 1 ? [idx] : [idx, idx + 1].filter((i) => i < pages.length);
  const label = visible.map((i) => pages[i]?.label).filter(Boolean).join('  ·  ');

  return (
    <div className="flip">
      <div className="flip-bar">
        <button type="button" className="btn btn-ghost" onClick={() => book.current?.flipPrev()} disabled={idx === 0} aria-label="Previous page">‹ Prev</button>
        <select aria-label="Go to month" value="" onChange={(e) => { const n = Number(e.target.value); if (!Number.isNaN(n)) book.current?.flip(n); }}>
          <option value="">Go to month…</option>
          {fronts.map((p) => <option key={p.i} value={p.i}>{p.label}</option>)}
        </select>
        <button type="button" className="btn btn-ghost" onClick={() => book.current?.flipNext()} disabled={idx >= pages.length - (portrait ? 1 : 2)} aria-label="Next page">Next ›</button>
      </div>
      <p className="flip-label" aria-live="polite">{label}</p>
      <div className="flip-stage"><div ref={host} /></div>
      <p className="small muted flip-zoom">
        Zoom in:{' '}
        {visible.map((i) => <a key={i} href={pages[i].src} target="_blank" rel="noopener">{pages[i].label} ↗</a>).reduce<React.ReactNode[]>((a, x, k) => (k ? [...a, ' · ', x] : [x]), [])}
        {' '}· Use ← → keys or swipe to turn pages.
      </p>
    </div>
  );
}
