import { redirect } from 'next/navigation';
import { YEAR } from '@/lib/data';
export default function CalendarIndex() { redirect(`/calendar/${YEAR}`); }
