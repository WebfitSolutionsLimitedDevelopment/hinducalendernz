import { redirect, notFound } from 'next/navigation';
import { isCity, currentYear } from '@/lib/cities';

export default async function CityIndex({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  if (!isCity(city)) notFound();
  redirect(`/calendar/${city}/${currentYear()}`);
}
