import { InstallApp } from '@/components/InstallApp';
import { DeviceReminders } from '@/components/ReminderSettings';

export const metadata = { title: 'Festival reminders and the Hindu Calendar app' };

export default function Page() {
  return (
    <article className="prose">
      <h1>Reminders and the app</h1>
      <p className="lead">Put Hindu Calendar on your phone’s home screen — it opens like an app, works offline, and can remind you before festivals and fasts.</p>

      <h2>1. Add it to your home screen</h2>
      <InstallApp />

      <h2>2. Turn on reminders</h2>
      <p className="small muted">Reminders are sent to this device only. No account needed. For email reminders, <a href="/account">create an account</a>.</p>
      <DeviceReminders />

      <h2>What you’ll get</h2>
      <p>A short notification such as <em>“Diwali / Lakshmi Puja is tomorrow, Sun 8 Nov — 8:01 pm to 10:25 pm in Auckland.”</em> Tap it to open the festival page.</p>
    </article>
  );
}
