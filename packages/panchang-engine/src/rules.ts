import type { FestivalRule } from './festivals.ts';

// Masa indices are AMANTA (0 = Chaitra … 11 = Phalguna). For Krishna paksha,
// the purnimanta (North Indian) month name is the next month.
// These are general calendrical conventions; tradition-specific variants
// are surfaced as flags for the religious reviewer rather than decided here.
export const DEFAULT_RULES: FestivalRule[] = [
  // Chaitra
  { kind: 'tithi', id: 'ugadi', name: 'Ugadi / Gudi Padwa', altNames: ['Hindu New Year', 'Chaitra Navratri begins', 'Cheti Chand (regional)'], tradition: 'Pan-Hindu / Telugu / Kannada / Marathi', masa: 0, paksha: 'Shukla', tithi: 1, kala: 'sunrise' },
  { kind: 'tithi', id: 'ram-navami', name: 'Ram Navami', altNames: ['Rama Navami'], tradition: 'Pan-Hindu', masa: 0, paksha: 'Shukla', tithi: 9, kala: 'madhyahna' },
  { kind: 'tithi', id: 'hanuman-jayanti', name: 'Hanuman Jayanti', tradition: 'North Indian (dates differ in South India)', masa: 0, paksha: 'Shukla', tithi: 15, kala: 'sunrise' },
  // Vaishakha
  { kind: 'tithi', id: 'akshaya-tritiya', name: 'Akshaya Tritiya', tradition: 'Pan-Hindu', masa: 1, paksha: 'Shukla', tithi: 3, kala: 'sunrise' },
  // Ashadha
  { kind: 'tithi', id: 'guru-purnima', name: 'Guru Purnima', tradition: 'Pan-Hindu', masa: 3, paksha: 'Shukla', tithi: 15, kala: 'sunrise' },
  // Shravana
  { kind: 'tithi', id: 'nag-panchami', name: 'Nag Panchami', tradition: 'Pan-Hindu', masa: 4, paksha: 'Shukla', tithi: 5, kala: 'sunrise' },
  { kind: 'tithi', id: 'raksha-bandhan', name: 'Raksha Bandhan', tradition: 'North Indian', masa: 4, paksha: 'Shukla', tithi: 15, kala: 'aparahna' },
  { kind: 'tithi', id: 'krishna-janmashtami', name: 'Krishna Janmashtami', altNames: ['Gokulashtami'], tradition: 'Smarta (Vaishnava date may differ)', masa: 4, paksha: 'Krishna', tithi: 8, kala: 'nishita' },
  // Bhadrapada
  { kind: 'tithi', id: 'ganesh-chaturthi', name: 'Ganesh Chaturthi', altNames: ['Vinayaka Chaturthi'], tradition: 'Pan-Hindu', masa: 5, paksha: 'Shukla', tithi: 4, kala: 'madhyahna' },
  { kind: 'tithi', id: 'anant-chaturdashi', name: 'Anant Chaturdashi', altNames: ['Ganesh Visarjan'], tradition: 'Pan-Hindu / Marathi', masa: 5, paksha: 'Shukla', tithi: 14, kala: 'sunrise' },
  // Ashwin
  { kind: 'tithi', id: 'sharad-navratri', name: 'Sharad Navratri begins', altNames: ['Ghatasthapana'], tradition: 'Pan-Hindu', masa: 6, paksha: 'Shukla', tithi: 1, kala: 'sunrise' },
  { kind: 'tithi', id: 'durga-ashtami', name: 'Durga Ashtami', tradition: 'Pan-Hindu / Bengali', masa: 6, paksha: 'Shukla', tithi: 8, kala: 'sunrise' },
  { kind: 'tithi', id: 'maha-navami', name: 'Maha Navami', tradition: 'Pan-Hindu', masa: 6, paksha: 'Shukla', tithi: 9, kala: 'sunrise' },
  { kind: 'tithi', id: 'dussehra', name: 'Dussehra', altNames: ['Vijayadashami'], tradition: 'Pan-Hindu', masa: 6, paksha: 'Shukla', tithi: 10, kala: 'aparahna' },
  { kind: 'tithi', id: 'sharad-purnima', name: 'Sharad Purnima', altNames: ['Kojagara Puja'], tradition: 'Pan-Hindu', masa: 6, paksha: 'Shukla', tithi: 15, kala: 'pradosh' },
  { kind: 'tithi', id: 'karva-chauth', name: 'Karva Chauth', altNames: ['Karwa Chauth'], tradition: 'North Indian', masa: 6, paksha: 'Krishna', tithi: 4, kala: 'moonrise' },
  { kind: 'tithi', id: 'dhanteras', name: 'Dhanteras', altNames: ['Dhantrayodashi'], tradition: 'Pan-Hindu', masa: 6, paksha: 'Krishna', tithi: 13, kala: 'pradosh' },
  { kind: 'tithi', id: 'naraka-chaturdashi', name: 'Naraka Chaturdashi', altNames: ['Choti Diwali', 'Kali Chaudas'], tradition: 'Pan-Hindu', masa: 6, paksha: 'Krishna', tithi: 14, kala: 'arunodaya' },
  { kind: 'tithi', id: 'diwali', name: 'Diwali / Lakshmi Puja', altNames: ['Deepavali', 'Badi Diwali'], tradition: 'Pan-Hindu', masa: 6, paksha: 'Krishna', tithi: 15, kala: 'pradosh', tie: 'second' },
  // Kartika
  { kind: 'tithi', id: 'govardhan-puja', name: 'Govardhan Puja', altNames: ['Annakut', 'Gujarati New Year'], tradition: 'North Indian / Gujarati', masa: 7, paksha: 'Shukla', tithi: 1, kala: 'sunrise' },
  { kind: 'tithi', id: 'bhai-dooj', name: 'Bhai Dooj', altNames: ['Bhau Beej'], tradition: 'North Indian / Marathi', masa: 7, paksha: 'Shukla', tithi: 2, kala: 'aparahna' },
  { kind: 'tithi', id: 'chhath-puja', name: 'Chhath Puja (evening arghya)', tradition: 'Bihari / Purvanchali', masa: 7, paksha: 'Shukla', tithi: 6, kala: 'sunset' },
  { kind: 'tithi', id: 'kartika-purnima', name: 'Kartika Purnima', altNames: ['Dev Deepawali'], tradition: 'Pan-Hindu', masa: 7, paksha: 'Shukla', tithi: 15, kala: 'sunrise' },
  // Pausha / Magha / Phalguna
  { kind: 'tithi', id: 'sakat-chauth', name: 'Sakat Chauth', altNames: ['Lambodara Sankashti'], tradition: 'North Indian', masa: 9, paksha: 'Krishna', tithi: 4, kala: 'moonrise' },
  { kind: 'tithi', id: 'vasant-panchami', name: 'Vasant Panchami', altNames: ['Saraswati Puja'], tradition: 'Pan-Hindu / Bengali', masa: 10, paksha: 'Shukla', tithi: 5, kala: 'purvahna' },
  { kind: 'tithi', id: 'ratha-saptami', name: 'Ratha Saptami', tradition: 'Pan-Hindu / South Indian', masa: 10, paksha: 'Shukla', tithi: 7, kala: 'sunrise' },
  { kind: 'tithi', id: 'maha-shivaratri', name: 'Maha Shivaratri', tradition: 'Pan-Hindu', masa: 10, paksha: 'Krishna', tithi: 14, kala: 'nishita' },
  { kind: 'tithi', id: 'holika-dahan', name: 'Holika Dahan', tradition: 'North Indian', masa: 11, paksha: 'Shukla', tithi: 15, kala: 'pradosh' },
  { kind: 'relative', id: 'holi', name: 'Holi', altNames: ['Rangwali Holi', 'Dhulandi'], tradition: 'Pan-Hindu', of: 'holika-dahan', days: 1 },
  // Solar
  { kind: 'sankranti', id: 'makar-sankranti', name: 'Makar Sankranti', altNames: ['Pongal', 'Uttarayan', 'Maghi'], tradition: 'Pan-Hindu / Tamil / Gujarati / Punjabi', rashi: 9 },
  { kind: 'relative', id: 'lohri', name: 'Lohri', tradition: 'Punjabi', of: 'makar-sankranti', days: -1 },
  { kind: 'relative', id: 'bhogi', name: 'Bhogi', tradition: 'Tamil / Telugu', of: 'makar-sankranti', days: -1 },
  { kind: 'sankranti', id: 'mesha-sankranti', name: 'Mesha Sankranti', altNames: ['Puthandu (Tamil New Year)', 'Vishu', 'Baisakhi / Vaisakhi', 'Pohela Boishakh (regional rule differs)'], tradition: 'Tamil / Malayali / Punjabi / Bengali / Odia', rashi: 0 },
  { kind: 'nakshatra', id: 'thaipusam', name: 'Thaipusam', tradition: 'Tamil', solarRashi: 9, nakshatra: 8 },
  { kind: 'nakshatra', id: 'onam', name: 'Onam (Thiruvonam)', tradition: 'Malayali', solarRashi: 4, nakshatra: 22 },
  // Monthly
  { kind: 'monthly', id: 'sankashti-chaturthi', name: 'Sankashti Chaturthi', tradition: 'Pan-Hindu / Marathi', paksha: 'Krishna', tithi: 4, kala: 'moonrise' },
];
