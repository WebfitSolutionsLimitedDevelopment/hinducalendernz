// Reference names. Spellings follow common English transliteration;
// final public spellings are an editorial decision.

export const TITHI_NAMES = [
  'Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami',
  'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami',
  'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi',
] as const;

/** Lunar months, amanta convention, index 0 = Chaitra. */
export const MASA_NAMES = [
  'Chaitra', 'Vaishakha', 'Jyeshtha', 'Ashadha', 'Shravana', 'Bhadrapada',
  'Ashwin', 'Kartika', 'Margashirsha', 'Pausha', 'Magha', 'Phalguna',
] as const;

/** Sidereal zodiac signs, index 0 = Mesha (Aries). */
export const RASHI_NAMES = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
] as const;

export const NAKSHATRA_NAMES = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati',
] as const;

export const MOON_QUARTER_NAMES = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'] as const;

export type Paksha = 'Shukla' | 'Krishna';

/** Tithi number 1..30 → display name. 15 = Purnima, 30 = Amavasya. */
export function tithiName(n: number): { paksha: Paksha; number: number; name: string } {
  const paksha: Paksha = n <= 15 ? 'Shukla' : 'Krishna';
  const k = ((n - 1) % 15) + 1;
  const name = k === 15 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : TITHI_NAMES[k - 1];
  return { paksha, number: k, name };
}
