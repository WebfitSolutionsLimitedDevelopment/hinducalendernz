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

/** The 27 nitya yogas (Sun + Moon sidereal longitude, 13°20' each), index 0 = Vishkambha. */
export const YOGA_NAMES = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula',
  'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan',
  'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti',
] as const;

/** Karana for a half-tithi index 0..59 within the lunar month (0 = first half of Shukla Pratipada). */
export function karanaName(i: number): string {
  if (i === 0) return 'Kimstughna';
  if (i >= 57) return ['Shakuni', 'Chatushpada', 'Naga'][i - 57];
  return ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti'][(i - 1) % 7];
}

export const MOON_QUARTER_NAMES = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'] as const;

export type Paksha = 'Shukla' | 'Krishna';

/** Tithi number 1..30 → display name. 15 = Purnima, 30 = Amavasya. */
export function tithiName(n: number): { paksha: Paksha; number: number; name: string } {
  const paksha: Paksha = n <= 15 ? 'Shukla' : 'Krishna';
  const k = ((n - 1) % 15) + 1;
  const name = k === 15 ? (paksha === 'Shukla' ? 'Purnima' : 'Amavasya') : TITHI_NAMES[k - 1];
  return { paksha, number: k, name };
}
