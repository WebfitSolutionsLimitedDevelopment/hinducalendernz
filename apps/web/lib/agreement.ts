// Co-founder agreement offered by Webfit Solutions Limited for the Hindu Calendar NZ venture.
// The text below is what the signer sees and what is written into the signed PDF. Changing it requires a new VERSION.

export const AGREEMENT_VERSION = '2026-11-08-v1';
export const AGREEMENT_TITLE = 'Hindu Calendar NZ — Co-founder, Confidentiality and Intellectual Property Agreement';

/** Private signing links. The token is the only way to reach the page; keep it out of public listings. */
export const INVITES: Record<string, { party: string; role: string }> = {
  obD3sUMEmxtydEzPDVvy4n4r: { party: 'Sanika Sathe Sain', role: 'Co-founder (editorial and community)' },
};

export const OFFEROR = {
  name: 'Webfit Solutions Limited',
  desc: 'a New Zealand limited liability company',
  signatory: 'Sangita Gupta and Ravi Gupta, for Webfit Solutions Limited',
  email: 'info@webfitt.co.nz',
  web: 'www.webfitt.com',
};

/** Plain-English summary shown above the full terms. It is a summary only; the clauses govern. */
export const SUMMARY: string[] = [
  'Net profit from Hindu Calendar NZ is shared 50/50 between Webfit and you, after operating expenses.',
  'Both parties keep each other’s confidential information confidential (mutual).',
  'You keep ownership of the material you created before the venture (your pre-existing material).',
  'Webfit owns the technology and platform it builds and pays for — the software, panchang engine, website, app, database, data, designs, brand and domain — and makes it available to the venture for as long as the venture runs.',
  'Webfit continues to pay the hosting, database, domain and software costs and recovers them from revenue before profit is shared. Webfit does not charge for its development time unless agreed in writing.',
  'Either party may leave on 60 days’ notice. If you leave, you receive your share of profit up to your exit date; the platform, domain, brand and data stay with Webfit.',
];

export type Section = { h: string; p: string[] };

export const SECTIONS: Section[] = [
  {
    h: '1. Parties and purpose',
    p: [
      'This agreement is between Webfit Solutions Limited, a New Zealand limited liability company ("Webfit"), and the person who signs it below (the "Co-founder"). Together they are the "Parties".',
      'The Parties wish to work together on Hindu Calendar NZ, a calendar, website, app and related products giving Hindu festival dates, panchang information and puja timings calculated for New Zealand (the "Venture"). This agreement records how they will share confidential information, who owns what, how profit is shared and what happens if either Party leaves.',
    ],
  },
  {
    h: '2. Definitions',
    p: [
      '"Confidential Information" means non-public information disclosed by one Party to the other in connection with the Venture, including business plans, pricing, costs, user and subscriber data, source code, algorithms, calculation methods, data sets, designs, drafts and the terms of this agreement. It does not include information that is or becomes public other than through a breach of this agreement, that the receiving Party already lawfully held, or that is independently developed without use of the other Party\'s information.',
      '"Platform" means everything Webfit designs, develops, builds, configures, hosts or pays for in connection with the Venture, whether before or after the date of this agreement, including: the panchang calculation engine and all software, source code, scripts, websites, web and mobile applications, application programming interfaces and tools; databases, database structures and all data generated, calculated, compiled or collected by them (including calendar data, festival data and user, subscriber and sponsor records); e-calendar layouts, templates, page designs, artwork selection and print files; the Hindu Calendar NZ name, logo (Kalash design), visual identity and other branding; the domain name hinducalendar.co.nz and any other domains, email, hosting, cloud, analytics, social-media and other accounts created for the Venture; and all improvements, updates and derivatives of any of them.',
      '"Co-founder Pre-existing Material" means documents and material created by the Co-founder before 18 October 2026 and provided to Webfit, including the Purpose and Guide document, the 2027 NZ Hindu Calendar draft and source spreadsheet, and the founder story.',
      '"Contributions" means text, guidance, review comments, corrections, ideas and other material the Co-founder provides for the Venture after the date of this agreement.',
      '"Revenue" means all money received by the Venture, including e-calendar and print sales, sponsorship, advertising, subscriptions, donations designated to the Venture and licence fees. "Operating Expenses" means the reasonable costs of running the Venture, including hosting, database, domain, email, software, payment processing, printing, marketing, reviewer and contributor fees and taxes on Revenue.',
    ],
  },
  {
    h: '3. Confidentiality (mutual)',
    p: [
      'Each Party will keep the other Party\'s Confidential Information confidential, use it only for the Venture, and disclose it only to its directors, employees, contractors and professional advisers who need to know it and are bound by equivalent obligations.',
      'A Party may disclose Confidential Information where required by law or a court, after giving the other Party prompt notice where lawful.',
      'On written request, or when a Party leaves the Venture, each Party will return or destroy the other Party\'s Confidential Information, except copies it must keep by law. These obligations continue for five years after the Venture ends, and indefinitely for source code, algorithms and user data.',
    ],
  },
  {
    h: '4. Ownership of intellectual property',
    p: [
      '4.1 Co-founder Pre-existing Material remains owned by the Co-founder. The Co-founder grants Webfit and the Venture a non-exclusive, royalty-free licence to use, adapt and publish it for the Venture for so long as the Venture operates.',
      '4.2 Webfit owns the Platform and all intellectual property rights in it, including any rights that arise from work done before the date of this agreement. To the extent any right in the Platform would otherwise vest in the Co-founder, the Co-founder assigns it to Webfit on creation. The Co-founder will not register or claim any domain name, trade mark, business name, company name or social-media account using "Hindu Calendar NZ" or a confusingly similar name.',
      '4.3 Webfit grants the Venture the exclusive right to use the Platform for a Hindu calendar for New Zealand for so long as the Venture operates under this agreement.',
      '4.4 The Co-founder grants Webfit a perpetual, irrevocable, worldwide, royalty-free licence to use, adapt and publish Contributions as part of the Platform, including after the Co-founder leaves. On request after leaving, Webfit will remove the Co-founder\'s name from Contributions and will not present the Co-founder as a current reviewer or founder. The Co-founder consents, under the Copyright Act 1994, to acts that would otherwise infringe moral rights in Contributions, to the extent needed for that use.',
      '4.5 Each Party confirms that material it provides is its own or properly licensed, and does not infringe anyone else\'s rights.',
    ],
  },
  {
    h: '5. Profit share and costs',
    p: [
      '5.1 Net Profit is Revenue less Operating Expenses. Net Profit is shared 50% to Webfit and 50% to the Co-founder.',
      '5.2 Webfit will continue to provide and pay for the hosting, database, domain, email and software services needed to run the Platform. Those costs, and any other Operating Expenses paid by a Party with the other\'s approval, are repaid to the Party that paid them out of Revenue before Net Profit is calculated. Any shortfall carries forward to later periods; neither Party has to repay the other personally.',
      '5.3 Webfit\'s development, design and maintenance time is provided without charge to the Venture unless the Parties agree otherwise in writing. Voluntary contributions by either Party do not change the profit share and are not reimbursable unless agreed in writing beforehand.',
      '5.4 New expenses of more than NZ$200 in any month, other than the running costs in clause 5.2, need the written (including email) approval of both Parties.',
      '5.5 Webfit will hold the Venture\'s payment and revenue accounts, keep records and provide the Co-founder with a statement of Revenue, Operating Expenses and Net Profit each quarter. Net Profit is paid within 30 days of each statement. The Co-founder may review the supporting records once a year on reasonable notice.',
      '5.6 Each Party is responsible for its own tax on amounts it receives.',
    ],
  },
  {
    h: '6. Roles and decisions',
    p: [
      'Webfit is responsible for the Platform, technology, calculations, hosting, security, data, accounts and day-to-day operation. The Co-founder is responsible for editorial direction, religious and community review, coordination of reviewers and contributors, community engagement and publicity.',
      'Decisions on technology, design, data and operations are made by Webfit. Decisions on editorial and religious content are made by the Co-founder, but Webfit may decline to publish anything it reasonably considers unlawful, inaccurate, unsafe or harmful to the Venture. Budgets, pricing and new products are agreed by both Parties.',
    ],
  },
  {
    h: '7. Term and leaving the Venture',
    p: [
      '7.1 This agreement starts when the Co-founder signs it and continues until ended under this clause. The 2027 calendar year is treated as a pilot; the Parties will review the Venture by 31 October 2027.',
      '7.2 Either Party may leave the Venture by giving 60 days\' written notice. Either Party may end this agreement immediately by notice if the other commits a material breach that is not remedied within 30 days of notice.',
      '7.3 When the Co-founder leaves or this agreement ends: (a) the Co-founder is paid its share of Net Profit up to the exit date, and has no further right to Revenue or Net Profit; (b) the Platform, domain names, brand, data, accounts and goodwill remain with Webfit, which may continue to operate Hindu Calendar NZ or any similar product, with no payment for goodwill or buy-out; (c) the licence in clause 4.1 ends 90 days after exit, except for Co-founder Pre-existing Material already incorporated into published products, which may continue to be used; and (d) clauses 3, 4.2, 4.4, 8, 9 and 10 continue.',
      '7.4 If Webfit decides to stop the Venture, Webfit will offer the Co-founder the first opportunity to negotiate a licence of the Platform on commercial terms.',
    ],
  },
  {
    h: '8. Non-solicitation and fair competition',
    p: [
      'For 12 months after leaving the Venture, the Co-founder will not (a) use Confidential Information or the Platform to build or help build a competing Hindu calendar product for New Zealand, or (b) solicit the Venture\'s sponsors, advertisers, reviewers or subscribers away from the Venture. Nothing in this clause stops the Co-founder from community, religious or editorial work that does not use Confidential Information.',
    ],
  },
  {
    h: '9. Liability',
    p: [
      'The Platform is provided as is. Neither Party is liable to the other for indirect or consequential loss or loss of profit. Webfit\'s total liability to the Co-founder under this agreement is limited to the Co-founder\'s share of Net Profit paid or payable in the 12 months before the claim. Nothing limits liability for fraud or for breach of clause 3.',
    ],
  },
  {
    h: '10. Relationship of the Parties',
    p: [
      'This agreement is a contractual profit-share arrangement. It does not create a partnership, joint venture entity, employment or agency, and neither Party may bind the other or incur debts in the other\'s name without written authority.',
    ],
  },
  {
    h: '11. Previous documents',
    p: [
      'This agreement replaces the Webfit non-disclosure agreement version 2026-10-18-v2 and records the Parties\' heads of agreement for the Venture. It supersedes earlier discussions and emails on the same subjects, including the email of 10 September 2026, to the extent they are inconsistent. Changes must be in writing and accepted by both Parties (an exchange of emails is enough).',
    ],
  },
  {
    h: '12. Disputes and governing law',
    p: [
      'The Parties will first try to resolve any dispute by good-faith discussion and then, if not resolved within 20 working days, by mediation in Auckland. This agreement is governed by New Zealand law and the Parties submit to the jurisdiction of the New Zealand courts.',
    ],
  },
  {
    h: '13. Electronic signature',
    p: [
      'The Co-founder signs this agreement electronically by typing their full name, ticking the acceptance box and submitting the form. The Parties agree that this is a valid signature under Part 4 of the Contract and Commercial Law Act 2017. The signed record — including the agreement identifier, the signer\'s name and email address, the date and time, the IP address and device information, and a SHA-256 fingerprint of this text — is evidence of acceptance. Webfit accepts the agreement by offering it for signature and confirms its acceptance by email once the Co-founder has signed.',
    ],
  },
];

export function agreementText(): string {
  return [AGREEMENT_TITLE, `Version ${AGREEMENT_VERSION}`, ...SECTIONS.flatMap((s) => [s.h, ...s.p])].join('\n');
}
