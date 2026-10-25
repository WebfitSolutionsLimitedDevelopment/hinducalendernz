import { cityName } from '@/lib/cities';

/** Subscribe to a city's festival feed in Google, Apple or Outlook calendars. */
export function AddToCalendar({ city }: { city: string }) {
  const site = (process.env.SITE_URL ?? 'https://www.hinducalendar.co.nz').replace(/\/$/, '');
  const host = site.replace(/^https?:\/\//, '');
  const feed = (all: boolean) => `${host}/ics/${city}${all ? '-all' : ''}.ics`;
  const google = (all: boolean) => `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(`webcal://${feed(all)}`)}`;
  return (
    <div className="card add-cal">
      <h3 style={{ marginTop: 0 }}>Add festivals to your own calendar</h3>
      <p className="small muted">Subscribe once and {cityName(city)} festival dates appear in your phone or computer calendar, updating automatically.</p>
      <div className="actions" style={{ marginTop: 8 }}>
        <a className="btn btn-primary" href={google(false)} target="_blank" rel="noopener">Google Calendar</a>
        <a className="btn btn-ghost" href={`webcal://${feed(false)}`}>Apple / Outlook</a>
      </div>
      <p className="small" style={{ marginTop: 12 }}>
        Include every Ekadashi and monthly vrat: <a href={google(true)} target="_blank" rel="noopener">Google</a> · <a href={`webcal://${feed(true)}`}>Apple / Outlook</a> · <a href={`${site}/ics/${city}-all.ics`}>download file</a>
      </p>
    </div>
  );
}
