'use client';
import { usePathname, useRouter } from 'next/navigation';
import { CITIES, isCity } from '@/lib/cities';

/** Remembers the visitor's city (cookie) and swaps the city segment in city-specific URLs. */
export function CityPicker({ value, label = 'City' }: { value: string; label?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <label className="city-picker">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => {
          const city = e.target.value;
          document.cookie = `city=${city}; path=/; max-age=${60 * 60 * 24 * 400}; samesite=lax`;
          try { localStorage.setItem('city', city); } catch {}
          const parts = pathname.split('/');
          if ((parts[1] === 'calendar' || parts[1] === 'festivals') && isCity(parts[2])) {
            parts[2] = city;
            router.push(parts.join('/'));
          } else {
            router.refresh();
          }
        }}
      >
        {CITIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
    </label>
  );
}
