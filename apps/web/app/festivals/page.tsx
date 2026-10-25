import { redirect } from 'next/navigation';
import { preferredCity, currentYear } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function FestivalsIndex() {
  redirect(`/festivals/${await preferredCity()}/${currentYear()}`);
}
