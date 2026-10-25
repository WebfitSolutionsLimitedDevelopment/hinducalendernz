export * from './constants.ts';
export * from './astro.ts';
export * from './panchang.ts';
export * from './festivals.ts';
export { DEFAULT_RULES } from './rules.ts';

import type { Location } from './astro.ts';

export const LOCATIONS: Record<string, Location> = {
  auckland: { id: 'auckland', name: 'Auckland, New Zealand', latitude: -36.8485, longitude: 174.7633, elevation: 0, timeZone: 'Pacific/Auckland' },
  wellington: { id: 'wellington', name: 'Wellington, New Zealand', latitude: -41.2865, longitude: 174.7762, elevation: 0, timeZone: 'Pacific/Auckland' },
  christchurch: { id: 'christchurch', name: 'Christchurch, New Zealand', latitude: -43.5321, longitude: 172.6362, elevation: 0, timeZone: 'Pacific/Auckland' },
};
