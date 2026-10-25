# Hindu Calendar NZ

Monorepo for hinducalendar.co.nz.

```
packages/
  panchang-engine/   Location-aware Panchang calculation engine (Webfit Solutions Limited)
  calendar-data/     Data access layer used by the website (JSON now, database later)
scripts/
  generate-year.ts   Generates a year of data for a city
data/<year>/<city>/  Generated output (status CALCULATED — not reviewed)
apps/web/            Website (Next.js) — to be added
```

## Generate data

```bash
npm install
npx tsx scripts/generate-year.ts --year 2027 --city auckland
npm test
```

Output in `data/2027/auckland/`:

| File | Contents |
|---|---|
| `days.json` | Every civil date: sunrise, sunset, moonrise/set, tithi at sunrise (+ end time), kshaya tithi, nakshatra, amanta/purnimanta month, adhika flag, sun rashi |
| `festivals.json` | Festival and vrat dates with rule basis, timing windows, Ekadashi parana and reviewer flags |
| `moon-phases.json` | Principal moon phases, local time |
| `sankrantis.json` | Solar ingresses with observed date |

## How dates are calculated

- **Tithi**: geocentric Moon–Sun elongation ÷ 12° (astronomy-engine, MIT). Independent of ayanamsa.
- **Sunrise/sunset/moonrise**: local horizon, upper limb, standard refraction, for the city's coordinates; times in the city's IANA zone (NZ daylight saving handled automatically).
- **Months**: amanta (new moon to new moon), named by the sidereal sun sign at the starting new moon; adhika month when no sankranti falls inside it. Purnimanta names provided for Krishna paksha.
- **Nakshatra / sankranti**: sidereal positions using a Lahiri ayanamsa approximation (±0.01°, a few minutes on sankranti times).
- **Festivals**: each rule names a lunar month, paksha, tithi and the part of the day (*karmakala*) in which the tithi must prevail — sunrise, purvahna, madhyahna, aparahna, sunset, pradosh, nishita or moonrise. Ties, partial coverage and kshaya cases are **flagged, not hidden**.
- **Ekadashi**: Smarta date = Ekadashi at sunrise; Vaishnava date via the Dashami-viddha (arunodaya) rule; parana after Hari Vasara within pratahkala and before Dwadashi ends.

## Editorial status — important

The engine only ever produces `CALCULATED`. Moving a record to `REVIEWED`, `APPROVED` or `PUBLISHED` is an editorial decision made by the nominated religious reviewer. The website must only present `APPROVED`/`PUBLISHED` records as final guidance (`isPublic()` in `calendar-data`).

## Database (later phase)

All page code reads through the `CalendarStore` interface in `packages/calendar-data`. Phase 1 uses `JsonFileStore`. A Postgres/Supabase store can implement the same interface when user accounts, reminders, more cities or sponsor management are added.

## Ownership

`packages/panchang-engine` is general-purpose technology of Webfit Solutions Limited and contains no project-specific editorial material. Editorial content, approved datasets and branding for Hindu Calendar NZ are handled under the parties' Heads of Agreement.

Confidential third-party material (e.g. draft calendars supplied by other parties) must not be committed to this repository — keep it in `private/` (git-ignored).
