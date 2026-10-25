// Data access layer for the website. Phase 1 reads static JSON files generated
// by the engine and approved editorially. A database-backed store (e.g. Supabase/
// Postgres) can implement the same CalendarStore interface in a later phase
// without changing any page code.

export type EditorialStatus = 'DRAFT' | 'CALCULATED' | 'REVIEWED' | 'APPROVED' | 'PUBLISHED';

export interface DayRecord {
  date: string;
  location: string;
  sunrise: string; sunset: string;
  moonrise: string | null; moonset: string | null;
  tithi: { number: number; paksha: 'Shukla' | 'Krishna'; name: string; endsAt: string | null };
  kshayaTithi: DayRecord['tithi'] | null;
  nakshatra: { number: number; name: string; endsAt: string | null };
  masa: { amanta: string; purnimanta: string; adhika: boolean };
  sunRashi: string;
}

export interface FestivalRecord {
  id: string;
  name: string;
  altNames: string[];
  tradition: string;
  date: string;
  basis: string;
  timing: Record<string, string | null>;
  flags: string[];
  status: EditorialStatus;
  method: string;
  /** Editorial fields, filled from the content sheet. */
  slug?: string;
  summary?: string;
  guidance?: string;
  reviewer?: string;
  reviewedAt?: string;
}

export interface HolidayRecord { date: string; name: string; kind: 'public' | 'regional' | 'school'; endDate?: string; note?: string; source: string }
export interface MoonPhaseRecord { phase: string; time: string }

export interface CalendarStore {
  days(year: number, location: string): Promise<DayRecord[]>;
  festivals(year: number, location: string, opts?: { publicOnly?: boolean }): Promise<FestivalRecord[]>;
  moonPhases(year: number, location: string): Promise<MoonPhaseRecord[]>;
  holidays(year: number): Promise<HolidayRecord[]>;
}

/** Only these statuses may ever be shown to the public as final guidance. */
export const PUBLIC_STATUSES: EditorialStatus[] = ['APPROVED', 'PUBLISHED'];

export function isPublic(f: Pick<FestivalRecord, 'status'>) {
  return PUBLIC_STATUSES.includes(f.status);
}

/** Phase 1 store: JSON files under data/<year>/<location>/. */
export class JsonFileStore implements CalendarStore {
  constructor(private read: (path: string) => Promise<unknown>) {}
  async days(year: number, location: string) {
    return (await this.read(`${year}/${location}/days.json`)) as DayRecord[];
  }
  async festivals(year: number, location: string, opts: { publicOnly?: boolean } = {}) {
    const all = (await this.read(`${year}/${location}/festivals.json`)) as FestivalRecord[];
    return opts.publicOnly ? all.filter(isPublic) : all;
  }
  async moonPhases(year: number, location: string) {
    return (await this.read(`${year}/${location}/moon-phases.json`)) as MoonPhaseRecord[];
  }
  async holidays(year: number) {
    return (await this.read(`${year}/holidays.json`)) as HolidayRecord[];
  }
}
