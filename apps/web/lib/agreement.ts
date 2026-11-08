// Co-founder agreement offered by Webfit Solutions Limited for the Hindu Calendar NZ venture.
// The text below is what the signer sees and what is written into the signed PDF. Changing it requires a new VERSION.

export const AGREEMENT_VERSION = '2026-11-08-v2';
export const AGREEMENT_TITLE = 'Hindu Calendar NZ — Co-founder Agreement';

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

export type Section = { h: string; p: string[] };

export const SECTIONS: Section[] = [
  {
    h: '1. Parties and purpose',
    p: [
      'This Agreement is made between Webfit Solutions Limited ("Webfit") and the Co-founder named in the signature section (together, the "Parties").',
      'The Parties are working together to create and operate Hindu Calendar NZ, a Hindu calendar, website and related products for New Zealand (the "Venture").',
    ],
  },
  {
    h: '2. Confidentiality',
    p: [
      'Each Party will keep confidential all non-public information received from the other Party in connection with the Venture, and will use it only for the Venture. This does not apply to information that is publicly available or that must be disclosed by law. This obligation continues for five years after the Venture ends.',
    ],
  },
  {
    h: '3. Intellectual property',
    p: [
      '3.1 Each Party retains ownership of the material it brings to the Venture and grants the Venture a royalty-free licence to use it for the Venture.',
      '3.2 The technology, software, website, applications, data, designs, branding, domain names and accounts developed, provided or funded by Webfit for the Venture (the "Platform") are owned by Webfit and are made available for the exclusive use of the Venture while it operates.',
      '3.3 Content contributed by the Co-founder for publication on the Platform may continue to be used as part of the Platform, with the Co-founder\'s name removed on request.',
    ],
  },
  {
    h: '4. Profit sharing',
    p: [
      '4.1 The net profit of the Venture is shared equally (50/50) between the Parties.',
      '4.2 Net profit is the revenue of the Venture less its operating expenses, including hosting, software, domain, marketing and other running costs. Operating expenses paid by a Party are repaid from revenue before profit is shared.',
      '4.3 Development, design and other services provided by either Party are contributed without charge unless agreed otherwise in writing.',
      '4.4 New expenses above NZ$200 per month require the written approval of both Parties.',
      '4.5 Webfit maintains the Venture\'s accounts and provides a quarterly statement of revenue, expenses and profit. Profit is paid within 30 days of each statement.',
    ],
  },
  {
    h: '5. Roles',
    p: [
      'Webfit leads technology, operations and the Platform. The Co-founder leads editorial direction, religious review and community engagement. Budgets, pricing and new products are agreed jointly.',
    ],
  },
  {
    h: '6. Term and exit',
    p: [
      '6.1 This Agreement begins on signing. The 2027 calendar year is a pilot, and the Parties will review the Venture together by 31 October 2027.',
      '6.2 Either Party may leave the Venture by giving 60 days\' written notice.',
      '6.3 On exit, the departing Party receives its share of net profit up to the exit date, and the Platform continues with Webfit so that the Venture\'s products and users are not disrupted.',
    ],
  },
  {
    h: '7. Fair dealing',
    p: [
      'For 12 months after leaving the Venture, each Party agrees not to use the other Party\'s confidential information to create a competing product, or to approach the Venture\'s sponsors, partners or subscribers on behalf of a competing product.',
    ],
  },
  {
    h: '8. General',
    p: [
      '8.1 This Agreement is a profit-sharing arrangement and does not create a legal partnership or employment relationship.',
      '8.2 This Agreement replaces previous non-disclosure agreements and discussions between the Parties about the Venture. Changes must be agreed in writing, which may be by email.',
      '8.3 This Agreement is governed by New Zealand law. The Parties will resolve any disagreement through discussion and, if needed, mediation in Auckland.',
      '8.4 The Co-founder signs this Agreement electronically by typing their full name and confirming acceptance. The Parties agree that this is a valid signature under the Contract and Commercial Law Act 2017.',
    ],
  },
];

export function agreementText(): string {
  return [AGREEMENT_TITLE, `Version ${AGREEMENT_VERSION}`, ...SECTIONS.flatMap((s) => [s.h, ...s.p])].join('\n');
}
