'use client';
import { useEffect } from 'react';

/** Registers the service worker (offline pages + reminder notifications). */
export function RegisterSW() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
    }
  }, []);
  return null;
}
