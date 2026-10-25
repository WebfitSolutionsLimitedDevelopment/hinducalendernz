import { redirect } from 'next/navigation';
import { preferredCity, currentYear, todayNZ } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function CalendarIndex() {
  const city = await preferredCity();
  const year = currentYear();
  const today = todayNZ();
  const month = Number(today.slice(0, 4)) === year ? Number(today.slice(5, 7)) : 1;
  redirect(`/calendar/${city}/${year}/${month}`);
}
