// Plain-English festival guidance shown on festival pages.
// General descriptions only; family and regional customs vary, and the page says so.
export type Guidance = { about: string; observe: string; timing?: string };

const G: Record<string, Guidance> = {
  'makar-sankranti': {
    about: 'Makar Sankranti marks the Sun’s entry into Makara (Capricorn) in the sidereal zodiac — one of the few Hindu festivals set by the Sun rather than the Moon. It celebrates the harvest and the start of Uttarayan, the Sun’s northward journey.',
    observe: 'Families take an early bath, offer prayers to Surya, share sesame-and-jaggery sweets (til-gul) and give to those in need. It is celebrated as Pongal in Tamil Nadu, Uttarayan (with kite flying) in Gujarat and Maghi in Punjab.',
    timing: 'The sankranti moment is when the Sun crosses into Makara. If it falls after local sunset, the observance moves to the next day.',
  },
  lohri: {
    about: 'Lohri is a Punjabi winter festival held on the eve of Makar Sankranti, celebrating the end of the coldest days and the harvest of rabi crops.',
    observe: 'Families and friends gather around a bonfire in the evening, offering sesame, peanuts, popcorn and jaggery to the fire, singing traditional songs and dancing bhangra and giddha. A first Lohri for a newborn or newlyweds is especially celebrated.',
    timing: 'Many families keep Lohri on 13 January by custom; check your community’s date.',
  },
  bhogi: {
    about: 'Bhogi is the first day of the Pongal and Sankranti festivities in Tamil Nadu, Andhra Pradesh and Telangana.',
    observe: 'Old belongings are discarded and a bonfire is lit at dawn, symbolising letting go of the old and welcoming the new. Homes are cleaned and decorated with kolam or rangoli.',
  },
  thaipusam: {
    about: 'Thaipusam honours Lord Murugan and falls in the Tamil month of Thai when the Pusam (Pushya) nakshatra is prominent, usually near the full moon.',
    observe: 'Devotees fast, pray at Murugan temples and many carry a kavadi — an offering borne on the shoulders — as an act of devotion and thanksgiving.',
  },
  'vasant-panchami': {
    about: 'Vasant Panchami welcomes spring and is dedicated to Goddess Saraswati, the goddess of knowledge, music and the arts.',
    observe: 'Families wear yellow, offer yellow flowers and sweets, and place books, pens and instruments before Saraswati for blessing. It is a traditional day for children to begin learning to write (Vidyarambham).',
    timing: 'The puja is performed in the first half of the day (purvahna) while Panchami tithi is current.',
  },
  'ratha-saptami': {
    about: 'Ratha Saptami celebrates Surya, the Sun god, and is traditionally regarded as his birthday — the day his chariot turns northward.',
    observe: 'Devotees take a bath at sunrise, offer arghya (water) to the Sun and recite Surya prayers such as the Aditya Hridayam.',
  },
  'maha-shivaratri': {
    about: 'Maha Shivaratri, “the great night of Shiva”, is one of the most important nights in the Hindu year, dedicated to Lord Shiva.',
    observe: 'Devotees fast through the day, keep vigil through the night, chant “Om Namah Shivaya” and offer water, milk and bilva leaves to the Shiva linga across the four watches (prahars) of the night.',
    timing: 'The key time is Nishita Kaal — around local midnight — when Chaturdashi tithi must be current. The date shown is the evening on which that night begins.',
  },
  'holika-dahan': {
    about: 'Holika Dahan, the night before Holi, recalls the story of Prahlad, whose devotion to Vishnu protected him while the demoness Holika perished in the fire.',
    observe: 'Communities light a bonfire after sunset, walk around it and offer grains, coconut and new crops, praying for the triumph of good over evil.',
    timing: 'The fire is lit in the evening (pradosh) while Purnima is current. Some traditions avoid the Bhadra period; check with your temple for the exact time.',
  },
  holi: {
    about: 'Holi, the festival of colours, celebrates spring, love and the victory of good over evil.',
    observe: 'Friends and families play with coloured powder and water, share sweets such as gujiya and thandai, and visit one another. In New Zealand many community Holi events are held on the nearest weekend.',
  },
  ugadi: {
    about: 'Ugadi (Telugu and Kannada) and Gudi Padwa (Marathi) mark the Hindu lunar new year on the first day of Chaitra. Chaitra Navratri begins on the same day.',
    observe: 'Homes are cleaned and decorated; Maharashtrian families raise a gudi (decorated pole) and Telugu and Kannada families share Ugadi pachadi, a dish of six tastes representing life’s experiences. The new year’s Panchang is traditionally read.',
  },
  'ram-navami': {
    about: 'Ram Navami celebrates the birth of Lord Rama on the ninth day (Navami) of the bright half of Chaitra, concluding Chaitra Navratri.',
    observe: 'Devotees fast, read or recite the Ramayana, sing bhajans and offer prayers at midday — the traditional time of Rama’s birth.',
    timing: 'The puja window shown is the midday period (madhyahna) while Navami tithi is current.',
  },
  'hanuman-jayanti': {
    about: 'Hanuman Jayanti celebrates the birth of Lord Hanuman, symbol of strength, courage and devotion to Rama. North Indian traditions observe it on Chaitra Purnima; South Indian dates differ.',
    observe: 'Devotees visit Hanuman temples, recite the Hanuman Chalisa and offer sindoor, flowers and sweets.',
  },
  'mesha-sankranti': {
    about: 'Mesha Sankranti is the Sun’s entry into Mesha (Aries) and marks the solar new year in many regions — Puthandu (Tamil New Year), Vishu (Kerala), Baisakhi/Vaisakhi (Punjab) and Pohela Boishakh (Bengal).',
    observe: 'Customs vary: Vishu begins with the Vishukkani (an auspicious first sight), Puthandu with a festive meal, and Vaisakhi with harvest celebrations and gurdwara and temple visits.',
    timing: 'Regional rules for which day to observe differ when the sankranti falls near sunset or midnight; check with your community.',
  },
  'akshaya-tritiya': {
    about: 'Akshaya Tritiya — “the never-diminishing third” — is considered one of the most auspicious days of the year for beginnings.',
    observe: 'Families pray to Vishnu and Lakshmi, give to charity, and many choose the day to start ventures or buy gold.',
  },
  'guru-purnima': {
    about: 'Guru Purnima, on the full moon of Ashadha, honours teachers and spiritual guides. It is also remembered as the birthday of Sage Vyasa.',
    observe: 'Students and devotees offer thanks and prayers to their gurus, visit ashrams and temples, and many observe a fast.',
  },
  'nag-panchami': {
    about: 'Nag Panchami honours the serpent deities (nagas), who are associated with protection and with Lord Shiva.',
    observe: 'Devotees offer milk, flowers and prayers to naga images or anthills, and many avoid digging the earth on this day.',
  },
  'raksha-bandhan': {
    about: 'Raksha Bandhan celebrates the bond between brothers and sisters on the full moon of Shravana.',
    observe: 'Sisters tie a rakhi on their brothers’ wrists and pray for their wellbeing; brothers give gifts and a promise of protection. Families living apart often send rakhis by post.',
    timing: 'The rakhi is traditionally tied in the afternoon (aparahna) while Purnima is current, avoiding the Bhadra period.',
  },
  'krishna-janmashtami': {
    about: 'Krishna Janmashtami celebrates the birth of Lord Krishna on the eighth day (Ashtami) of the waning moon, traditionally at midnight.',
    observe: 'Devotees fast through the day, sing bhajans, decorate a cradle for baby Krishna and celebrate at midnight before breaking the fast. Dahi Handi is held in Maharashtra the following day.',
    timing: 'The key time is the midnight period (Nishita) while Ashtami is current. ISKCON and some Vaishnava communities may observe on a different day.',
  },
  'ganesh-chaturthi': {
    about: 'Ganesh Chaturthi celebrates the birth of Lord Ganesha, remover of obstacles and patron of new beginnings.',
    observe: 'Families install a Ganesha murti at home or in the community, offer modak and durva grass, and worship him for one and a half to eleven days before immersion (visarjan). Avoiding the sight of the moon on this night is a common custom.',
    timing: 'The Ganesha puja is traditionally performed at midday (madhyahna).',
  },
  'anant-chaturdashi': {
    about: 'Anant Chaturdashi honours Lord Vishnu in his infinite (Anant) form and marks the end of the Ganeshotsav festival.',
    observe: 'Ganesha murtis installed for the full festival are immersed with processions; many also tie an Anant thread after Vishnu puja.',
  },
  onam: {
    about: 'Onam is Kerala’s harvest festival, welcoming the legendary King Mahabali, who is said to visit his people each year.',
    observe: 'Families make pookalam (flower carpets), wear new clothes and share the Onam sadya, a feast served on a banana leaf. The main day is Thiruvonam.',
  },
  'sharad-navratri': {
    about: 'Sharad Navratri — “nine nights” — is dedicated to the Goddess in her nine forms (Navadurga) and is the most widely celebrated Navratri of the year.',
    observe: 'Many families install a kalash (Ghatasthapana) on the first day, fast or eat sattvic food, and worship a different form of Durga each day. Gujarati communities celebrate with garba and dandiya; Bengali communities with Durga Puja; South Indian families with Golu.',
    timing: 'Ghatasthapana is done in the morning on the first day while Pratipada is current.',
  },
  'durga-ashtami': {
    about: 'Durga Ashtami, the eighth day of Navratri, is one of its most important days, especially in Bengali Durga Puja.',
    observe: 'Devotees perform Durga puja, and many honour young girls as forms of the Goddess (Kanya Puja) on Ashtami or Navami.',
  },
  'maha-navami': {
    about: 'Maha Navami, the ninth day of Navratri, concludes the nine nights of worship of the Goddess.',
    observe: 'Families perform Navami puja and Kanya Puja; in South India Ayudha Puja honours tools, books and instruments of one’s work.',
  },
  dussehra: {
    about: 'Dussehra (Vijayadashami) celebrates the victory of good over evil — Rama’s victory over Ravana and Durga’s victory over Mahishasura.',
    observe: 'In North India effigies of Ravana are burned; elsewhere families worship the Goddess, and it is a traditional day to begin learning or new work.',
    timing: 'The Vijay Muhurat falls in the afternoon (aparahna) while Dashami is current.',
  },
  'sharad-purnima': {
    about: 'Sharad Purnima, the full moon of Ashwin, is associated with Goddess Lakshmi and is said to be the night the moon shines with all sixteen kalas.',
    observe: 'Families keep vigil, worship Lakshmi (Kojagara Puja in Bengal and Odisha) and leave kheer in the moonlight to be shared the next morning.',
  },
  'karva-chauth': {
    about: 'Karva Chauth is observed mainly by married women in North India, who fast for the wellbeing and long life of their husbands.',
    observe: 'Women fast from sunrise without food or water, gather for the evening Karva Chauth katha and puja, and break the fast after sighting the moon.',
    timing: 'The fast ends at local moonrise — shown here for your city. Moonrise in New Zealand is very different from India.',
  },
  dhanteras: {
    about: 'Dhanteras opens the five days of Diwali. It honours Lord Dhanvantari, the god of health, and Goddess Lakshmi and Kubera, associated with prosperity.',
    observe: 'Families clean and light their homes, buy new utensils or gold and silver, and perform Lakshmi–Kubera puja in the evening. Yama Deepam, a lamp for Yama, is lit at the doorstep.',
    timing: 'The puja is done in the evening (pradosh) while Trayodashi is current.',
  },
  'naraka-chaturdashi': {
    about: 'Naraka Chaturdashi (Choti Diwali) recalls Krishna’s victory over the demon Narakasura.',
    observe: 'Many families take an early oil bath (abhyanga snan) before sunrise and light lamps in the evening. In South India this is the main day of Deepavali.',
    timing: 'The ritual bath is taken before sunrise while Chaturdashi is current.',
  },
  diwali: {
    about: 'Diwali (Deepavali), the festival of lights, celebrates the triumph of light over darkness. Lakshmi Puja, the main worship of Goddess Lakshmi, is performed on the Amavasya (new moon) evening.',
    observe: 'Homes are cleaned and decorated with diyas, rangoli and lights; families perform Lakshmi and Ganesha puja in the evening, share sweets and visit friends. New Zealand community Diwali festivals are usually held on nearby weekends.',
    timing: 'Lakshmi Puja is performed after sunset (pradosh) while Amavasya is current. The window shown is calculated from your city’s sunset — it is not the Indian time converted.',
  },
  'govardhan-puja': {
    about: 'Govardhan Puja, the day after Diwali, recalls Krishna lifting Govardhan hill to shelter the people of Vrindavan. It is also the Gujarati New Year.',
    observe: 'Families prepare Annakut — a “mountain” of many dishes — as an offering to Krishna. Gujarati families exchange new-year greetings (Saal Mubarak).',
  },
  'bhai-dooj': {
    about: 'Bhai Dooj (Bhau Beej) celebrates the bond between brothers and sisters and closes the Diwali festival.',
    observe: 'Sisters perform aarti and apply a tilak to their brothers and pray for their long life; brothers give gifts in return.',
    timing: 'The tilak ceremony is traditionally done in the afternoon (aparahna).',
  },
  'chhath-puja': {
    about: 'Chhath Puja is dedicated to Surya and Chhathi Maiya and is observed especially by families from Bihar, Jharkhand and eastern Uttar Pradesh.',
    observe: 'Over four days devotees keep a strict fast and offer arghya to the setting Sun on Shashthi and the rising Sun the next morning, standing in water. In New Zealand communities gather at beaches, rivers and lakes.',
    timing: 'The date shown is the evening arghya (Shashthi) — at your city’s sunset. The morning arghya is at sunrise the following day.',
  },
  'kartika-purnima': {
    about: 'Kartika Purnima, the full moon of Kartika, is celebrated as Dev Deepawali — the Diwali of the gods — and is sacred in many traditions.',
    observe: 'Devotees take a holy bath, light lamps and offer prayers; Sikh communities mark Guru Nanak Jayanti around this time.',
  },
  'sakat-chauth': {
    about: 'Sakat Chauth (Lambodara Sankashti) is a fast dedicated to Lord Ganesha, kept mainly by mothers for the wellbeing of their children.',
    observe: 'Women fast through the day, offer til (sesame) sweets to Ganesha and break the fast after sighting the moon.',
    timing: 'The fast ends at local moonrise, shown here for your city.',
  },
};

const EKADASHI: Guidance = {
  about: 'Ekadashi, the eleventh lunar day of each fortnight, is sacred to Lord Vishnu. There are 24 Ekadashis in a year, each with its own name and story.',
  observe: 'Devotees fast — some completely, many avoiding grains and beans — pray to Vishnu and spend the day in devotion. The fast is broken the next morning during the parana window.',
  timing: 'Smarta and Vaishnava (ISKCON) communities sometimes fast on different days; both dates are shown when they differ. Break the fast within the parana window shown.',
};

const SANKASHTI: Guidance = {
  about: 'Sankashti Chaturthi, the fourth day of the waning moon each month, is a fast dedicated to Lord Ganesha, the remover of obstacles.',
  observe: 'Devotees fast through the day, worship Ganesha in the evening and break the fast after sighting the moon.',
  timing: 'The fast ends at local moonrise, shown here for your city.',
};

export function guidanceFor(f: { id: string; name: string; category?: string }): Guidance | null {
  if (G[f.id]) return G[f.id];
  if (f.name.includes('Ekadashi')) return EKADASHI;
  if (f.id.startsWith('sankashti')) return SANKASHTI;
  return null;
}
