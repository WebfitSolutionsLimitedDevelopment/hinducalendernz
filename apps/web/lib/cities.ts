// Shared by server and client code (no server-only imports here).
export const CITIES = [
  { id: 'auckland', name: 'Auckland' },
  { id: 'hamilton', name: 'Hamilton' },
  { id: 'tauranga', name: 'Tauranga' },
  { id: 'wellington', name: 'Wellington' },
  { id: 'palmerston-north', name: 'Palmerston North' },
  { id: 'christchurch', name: 'Christchurch' },
  { id: 'dunedin', name: 'Dunedin' },
] as const;

export type CityId = (typeof CITIES)[number]['id'];
export const DEFAULT_CITY: CityId = 'auckland';
export const YEARS = [2026, 2027, 2028] as const;

export const isCity = (c: string | undefined | null): c is CityId => !!c && CITIES.some((x) => x.id === c);
export const cityName = (c: string) => CITIES.find((x) => x.id === c)?.name ?? c;
export const cityLabel = (c: string) => `${cityName(c)}, New Zealand`;
export const isYear = (y: number) => (YEARS as readonly number[]).includes(y);

/** Today's date in New Zealand as YYYY-MM-DD. */
export function todayNZ(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Pacific/Auckland', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Current year, clamped to the years we have data for. */
export function currentYear(): number {
  const y = Number(todayNZ().slice(0, 4));
  return Math.min(Math.max(y, YEARS[0]), YEARS[YEARS.length - 1]);
}

/** Which regional anniversary day each city observes (Waikato and Bay of Plenty follow Auckland; Manawatū follows Wellington). */
export const CITY_REGION: Record<string, string> = {
  auckland: 'auckland', hamilton: 'auckland', tauranga: 'auckland',
  wellington: 'wellington', 'palmerston-north': 'wellington', christchurch: 'canterbury', dunedin: 'otago',
};
export const holidayApplies = (h: { kind: string; region?: string }, city: string) => h.kind !== 'regional' || h.region === CITY_REGION[city];
