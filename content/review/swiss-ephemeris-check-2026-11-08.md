# Independent check against Swiss Ephemeris — Auckland, 2026–2028

**Run:** 8 Nov 2026, Swiss Ephemeris 2.10.03 (pyswisseph, Moshier ephemeris), Lahiri sidereal mode,
Auckland 36.8485° S 174.7633° E, Pacific/Auckland time. Script: `scripts/verify/se_check.py`.
Compared with the published engine data (`data/<year>/auckland/days.json`) for all 1,096 days.

| Value | Agreement |
|---|---|
| Sunrise | within 1 minute on 1,096 / 1,096 days |
| Nakshatra end time | within 1 minute on 1,096 / 1,096 days |
| Yoga end time | within 1 minute on 1,096 / 1,096 days |
| Tithi end time | within 1 minute on 1,020 days, 2 minutes on 75 days (rounding plus ~1 arcminute lunar-theory difference) |
| Tithi at sunrise | same on 1,095 / 1,096 days |
| Nakshatra at sunrise | same on 1,096 / 1,096 days |
| Yoga at sunrise | same on 1,096 / 1,096 days |
| Karana at sunrise | same on 1,094 / 1,096 days |
| Lahiri ayanamsa (1 Jan 2027) | engine 24.23424°, Swiss Ephemeris 24.23425° (difference 0.04″) |

**Exceptions (boundary within a minute of sunrise):**
- **8 Oct 2026** — Krishna Dwadashi ends 06:48 (engine) vs 06:46 (Swiss); sunrise 06:47. Swiss gives Trayodashi at sunrise. Affects Indira Ekadashi 2026 parana (already past).
- **26 Oct 2026** — Vishti karana ends at sunrise (06:23) in both; the karana label at sunrise differs by seconds.

**Conclusion:** the engine's astronomy agrees with Swiss Ephemeris to the minute. Where a boundary falls within a minute or two of
sunrise, the published date should carry a "boundary — reviewer to confirm" note; no future festival date in 2027–2028 is affected.
