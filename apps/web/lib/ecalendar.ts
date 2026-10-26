import 'server-only';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export type EcalManifest = {
  city: string; cityName: string; from: string; to: string; width: number; height: number; pdf: string; jpgDir?: string; generatedAt: string;
  pages: { src: string; label: string; kind: string; hd?: string }[];
};

/** Pricing: the 2026 edition is free (introductory offer). Set ECALENDAR_PRICE_NZD later to charge. */
export const ECAL_PRICE_NZD = Number(process.env.ECALENDAR_PRICE_NZD ?? 0);

function dir(...p: string[]) {
  for (const base of [/*turbopackIgnore: true*/ process.cwd(), join(/*turbopackIgnore: true*/ process.cwd(), 'apps', 'web')]) {
    const f = join(/*turbopackIgnore: true*/ base, ...p);
    if (existsSync(f)) return f;
  }
  return null;
}

export function ecalManifest(city = 'auckland'): EcalManifest | null {
  const f = dir('public', 'ecalendar', city, 'manifest.json');
  return f ? JSON.parse(readFileSync(/*turbopackIgnore: true*/ f, 'utf8')) : null;
}

export function ecalPdfPath(name: string) {
  return dir('private', 'ecalendar', name);
}
