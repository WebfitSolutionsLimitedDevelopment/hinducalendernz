// Hindi (Devanagari) vocabulary for the e-calendar.

export const TITHI_HI = [
  'प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी',
  'नवमी', 'दशमी', 'एकादशी', 'द्वादशी', 'त्रयोदशी', 'चतुर्दशी',
];
/** Engine numbers tithis 1–15 within each paksha; Krishna 15 is Amavasya. */
export const tithiHi = (n: number, paksha: string) => (n % 15 === 0 ? (paksha === 'Shukla' && n === 15 ? 'पूर्णिमा' : 'अमावस्या') : TITHI_HI[(n - 1) % 15]);
export const pakshaHi = (p: string) => (p === 'Shukla' ? 'शुक्ल' : 'कृष्ण');
export const pakshaShort = (p: string) => (p === 'Shukla' ? 'शु.' : 'कृ.');

export const NAKSHATRA_HI = [
  'अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा',
  'मघा', 'पू. फाल्गुनी', 'उ. फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाती', 'विशाखा', 'अनुराधा', 'ज्येष्ठा',
  'मूल', 'पू. षाढ़ा', 'उ. षाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पू. भाद्रपद', 'उ. भाद्रपद', 'रेवती',
];

export const MASA_HI: Record<string, string> = {
  Chaitra: 'चैत्र', Vaishakha: 'वैशाख', Jyeshtha: 'ज्येष्ठ', Ashadha: 'आषाढ़', Shravana: 'श्रावण',
  Bhadrapada: 'भाद्रपद', Ashwin: 'आश्विन', Kartika: 'कार्तिक', Margashirsha: 'मार्गशीर्ष',
  Pausha: 'पौष', Magha: 'माघ', Phalguna: 'फाल्गुन',
};

export const RASHI = ['Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya', 'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena'];
export const RASHI_HI = ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'];
export const RASHI_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const RASHI_GLYPH = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export const MONTH_HI = ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
export const MONTH_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEK_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
export const WEEK_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const WEEK_COLOURS = ['#C8102E', '#6B4E9B', '#C0392B', '#1F7A3A', '#D4952A', '#2E6DB4', '#3A3A3A'];

/** Hindi names for festivals, keyed by festival id (dated ids are matched by their prefix). */
export const FESTIVAL_HI: Record<string, string> = {
  'sharad-navratri': 'शारदीय नवरात्र आरंभ', 'durga-ashtami': 'दुर्गा अष्टमी', 'maha-navami': 'महानवमी',
  dussehra: 'दशहरा (विजयादशमी)', 'sharad-purnima': 'शरद पूर्णिमा', 'karva-chauth': 'करवा चौथ',
  dhanteras: 'धनतेरस', diwali: 'दीपावली (लक्ष्मी पूजा)', 'naraka-chaturdashi': 'नरक चतुर्दशी',
  'govardhan-puja': 'गोवर्धन पूजा', 'bhai-dooj': 'भाई दूज', 'chhath-puja': 'छठ पूजा',
  'kartika-purnima': 'कार्तिक पूर्णिमा', bhogi: 'भोगी', lohri: 'लोहड़ी', 'makar-sankranti': 'मकर संक्रांति',
  thaipusam: 'थाईपूसम', 'sakat-chauth': 'सकट चौथ', 'vasant-panchami': 'वसंत पंचमी', 'ratha-saptami': 'रथ सप्तमी',
  'maha-shivaratri': 'महाशिवरात्रि', 'holika-dahan': 'होलिका दहन', holi: 'होली', ugadi: 'उगादि / गुड़ी पड़वा',
  'mesha-sankranti': 'मेष संक्रांति', 'ram-navami': 'राम नवमी', 'hanuman-jayanti': 'हनुमान जयंती',
  'akshaya-tritiya': 'अक्षय तृतीया', 'guru-purnima': 'गुरु पूर्णिमा', 'nag-panchami': 'नाग पंचमी',
  'raksha-bandhan': 'रक्षा बंधन', 'krishna-janmashtami': 'श्रीकृष्ण जन्माष्टमी', 'ganesh-chaturthi': 'गणेश चतुर्थी',
  onam: 'ओणम', 'anant-chaturdashi': 'अनंत चतुर्दशी', 'chaitra-navratri': 'चैत्र नवरात्र आरंभ',
  'vat-savitri': 'वट सावित्री', 'hartalika-teej': 'हरतालिका तीज', 'hariyali-teej': 'हरियाली तीज',
  'sankashti-chaturthi': 'संकष्टी चतुर्थी',
};

export const EKADASHI_HI: Record<string, string> = {
  Saphala: 'सफला', 'Pausha Putrada': 'पौष पुत्रदा', Shattila: 'षटतिला', Jaya: 'जया', Vijaya: 'विजया',
  Amalaki: 'आमलकी', Papamochani: 'पापमोचनी', Kamada: 'कामदा', Varuthini: 'वरूथिनी', Mohini: 'मोहिनी',
  Apara: 'अपरा', Nirjala: 'निर्जला', Yogini: 'योगिनी', Devshayani: 'देवशयनी', Kamika: 'कामिका',
  'Shravana Putrada': 'श्रावण पुत्रदा', Aja: 'अजा', Parsva: 'पार्श्व (परिवर्तिनी)', Indira: 'इन्दिरा',
  Papankusha: 'पापांकुशा', Rama: 'रमा', Devutthana: 'देवउठनी (प्रबोधिनी)', Utpanna: 'उत्पन्ना',
  Mokshada: 'मोक्षदा', Padmini: 'पद्मिनी', Parama: 'परमा',
};

export function festivalHi(f: { id: string; name: string }): string {
  if (f.id.startsWith('ekadashi-')) {
    const k = f.name.replace(/ Ekadashi.*$/, '');
    return `${EKADASHI_HI[k] ?? k} एकादशी`;
  }
  const key = Object.keys(FESTIVAL_HI).find((k) => f.id === k || f.id.startsWith(k + '-'));
  return key ? FESTIVAL_HI[key] : f.name;
}

/** Devanagari digits, used sparingly for the Samvat boxes. */
export const toDeva = (n: number | string) => String(n).replace(/\d/g, (d) => '०१२३४५६७८९'[Number(d)]);

/**
 * Monthly rashifal from the Sun's transit (gochar), counted as a house from each rashi.
 * Classical rule: the Sun gives good results in the 3rd, 6th, 10th and 11th houses from the Moon sign.
 */
export const SUN_GOCHAR: { hi: string; en: string; tone: 'good' | 'mixed' | 'care' }[] = [
  /* 1 */ { hi: 'स्वास्थ्य व क्रोध पर संयम रखें, यात्रा में सावधानी।', en: 'Pace yourself; mind health and temper.', tone: 'care' },
  /* 2 */ { hi: 'खर्च बढ़ सकता है, वाणी में मधुरता रखें।', en: 'Watch spending and words at home.', tone: 'care' },
  /* 3 */ { hi: 'साहस व पराक्रम बढ़ेगा, कार्यों में सफलता।', en: 'Courage and effort pay off.', tone: 'good' },
  /* 4 */ { hi: 'घर-परिवार में ध्यान दें, मन अशांत रह सकता है।', en: 'Give time to home and family.', tone: 'mixed' },
  /* 5 */ { hi: 'संतान व पढ़ाई पर ध्यान, निर्णय सोच-समझकर लें।', en: 'Decide carefully; focus on studies.', tone: 'mixed' },
  /* 6 */ { hi: 'शत्रुओं पर विजय, रोग से मुक्ति, कार्य सिद्धि।', en: 'Obstacles clear; good for work.', tone: 'good' },
  /* 7 */ { hi: 'साझेदारी व दांपत्य में धैर्य रखें।', en: 'Patience in partnerships.', tone: 'care' },
  /* 8 */ { hi: 'अनावश्यक जोखिम से बचें, स्वास्थ्य का ध्यान।', en: 'Avoid risks; look after your health.', tone: 'care' },
  /* 9 */ { hi: 'धर्म-कर्म में रुचि, बड़ों से मतभेद न करें।', en: 'Good for prayer; respect elders’ views.', tone: 'mixed' },
  /* 10 */ { hi: 'कार्यक्षेत्र में उन्नति, मान-सम्मान बढ़ेगा।', en: 'Progress and recognition at work.', tone: 'good' },
  /* 11 */ { hi: 'आय में वृद्धि, मनोकामना पूर्ण होगी।', en: 'Gains and wishes fulfilled.', tone: 'good' },
  /* 12 */ { hi: 'व्यय अधिक, विश्राम व ध्यान लाभदायक।', en: 'Higher expenses; rest and reflect.', tone: 'care' },
];

/** Presiding deity for each month page (artwork panel + shloka). */
export const DEITY: Record<string, { hi: string; en: string; shloka: string; meaning: string; hue: [string, string] }> = {
  Durga: { hi: 'माँ दुर्गा', en: 'Maa Durga', shloka: 'या देवी सर्वभूतेषु शक्तिरूपेण संस्थिता।\nनमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः॥', meaning: 'Salutations to the Goddess who dwells in all beings as strength.', hue: ['#B3122E', '#F2A541'] },
  Lakshmi: { hi: 'माँ लक्ष्मी', en: 'Maa Lakshmi', shloka: 'ॐ श्रीं ह्रीं श्रीं कमले कमलालये प्रसीद प्रसीद।\nॐ श्रीं ह्रीं श्रीं महालक्ष्म्यै नमः॥', meaning: 'Salutations to Mahalakshmi, who dwells in the lotus.', hue: ['#C2185B', '#F6C344'] },
  Krishna: { hi: 'श्रीकृष्ण', en: 'Shri Krishna', shloka: 'वसुदेवसुतं देवं कंसचाणूरमर्दनम्।\nदेवकीपरमानन्दं कृष्णं वन्दे जगद्गुरुम्॥', meaning: 'I bow to Krishna, son of Vasudeva, teacher of the world.', hue: ['#1F4E9A', '#F2C14E'] },
  Surya: { hi: 'सूर्यदेव', en: 'Surya Dev', shloka: 'जपाकुसुमसंकाशं काश्यपेयं महाद्युतिम्।\nतमोऽरिं सर्वपापघ्नं प्रणतोऽस्मि दिवाकरम्॥', meaning: 'I bow to the Sun, radiant as the hibiscus, dispeller of darkness.', hue: ['#D84315', '#FFD54F'] },
  Saraswati: { hi: 'माँ सरस्वती', en: 'Maa Saraswati', shloka: 'या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता।\nया वीणावरदण्डमण्डितकरा या श्वेतपद्मासना॥', meaning: 'She who is white as jasmine and the moon, holding the veena.', hue: ['#2E7D8C', '#F4E3A1'] },
  Shiva: { hi: 'भगवान शिव', en: 'Bhagwan Shiva', shloka: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम्।\nउर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्॥', meaning: 'The Maha Mrityunjaya mantra — for health and freedom from fear.', hue: ['#283C63', '#8FB8DE'] },
  Rama: { hi: 'श्रीराम', en: 'Shri Ram', shloka: 'श्रीराम राम रघुनन्दन राम राम।\nश्रीराम राम भरताग्रज राम राम॥', meaning: 'Rama, joy of the Raghu clan, elder brother of Bharata.', hue: ['#2E5E3A', '#F2B134'] },
  Vishnu: { hi: 'भगवान विष्णु', en: 'Bhagwan Vishnu', shloka: 'शान्ताकारं भुजगशयनं पद्मनाभं सुरेशम्।\nविश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्॥', meaning: 'Peaceful Vishnu, resting on the serpent, support of the universe.', hue: ['#1B3A7A', '#F5C542'] },
  Guru: { hi: 'श्री दत्तात्रेय', en: 'Shri Dattatreya · Adi Guru', shloka: 'गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः।\nगुरुः साक्षात् परब्रह्म तस्मै श्रीगुरवे नमः॥', meaning: 'The Guru is Brahma, Vishnu and Shiva; salutations to the Guru.', hue: ['#8A4B0F', '#F3D27A'] },
  Ganesha: { hi: 'श्री गणेश', en: 'Shri Ganesh', shloka: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥', meaning: 'O Ganesha, remove all obstacles from my work, always.', hue: ['#C2410C', '#FCD34D'] },
  Hanuman: { hi: 'श्री हनुमान', en: 'Shri Hanuman', shloka: 'मनोजवं मारुततुल्यवेगं जितेन्द्रियं बुद्धिमतां वरिष्ठम्।\nवातात्मजं वानरयूथमुख्यं श्रीरामदूतं शरणं प्रपद्ये॥', meaning: 'I take refuge in Hanuman, swift as the mind, messenger of Rama.', hue: ['#B4380E', '#F7B733'] },
};

/** Which deity heads each month (YYYY-MM). */
export const MONTH_DEITY: Record<string, keyof typeof DEITY> = {
  '2026-10': 'Durga', '2026-11': 'Lakshmi', '2026-12': 'Krishna',
  '2027-01': 'Surya', '2027-02': 'Saraswati', '2027-03': 'Shiva', '2027-04': 'Rama',
  '2027-05': 'Hanuman', '2027-06': 'Vishnu', '2027-07': 'Guru', '2027-08': 'Krishna',
  '2027-09': 'Ganesha', '2027-10': 'Durga', '2027-11': 'Lakshmi', '2027-12': 'Vishnu',
};
