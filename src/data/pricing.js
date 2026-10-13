// All prices live here. Edit this file to change packages or add-ons.

export const BUILD_FEE = 325;

export const packages = [
  {
    id: 'basic',
    name: 'Basic',
    monthly: 80,
    bestFor: 'Getting your business online, fast',
    tagline: 'A sharp, professional site that makes a great first impression and gets the phone ringing.',
    features: [
      'Up to 3 pages',
      'Custom mobile-first design',
      'Contact form to your inbox',
      'Hosting, SSL & domain connection',
      'Security updates & backups',
      '30 min of edits each month',
      'Email support',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    monthly: 120,
    featured: true,
    bestFor: 'Growing businesses ready to stand out',
    tagline: 'More pages, more room to show off your work, and the tools to get found on Google.',
    features: [
      'Up to 6 pages',
      'Everything in Basic',
      'Photo gallery or blog',
      'SEO setup to help you get found',
      'Google Analytics',
      '1 hour of edits each month',
      'Faster support response',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    monthly: 200,
    bestFor: 'Bigger sites that do real work',
    tagline: 'Dashboards, customer accounts, online checkout. A website that runs part of your business.',
    features: [
      '7+ pages',
      'Everything in Standard',
      'Dashboards or customer portals',
      'Customer checkout & online payments',
      'Third-party integrations',
      '2 hours of edits each month',
      'Priority support',
    ],
  },
];

// Comparison table on the Packages page. true = included, false = not included, string = value.
export const comparison = [
  { label: 'One-time build fee', values: [`$${BUILD_FEE}`, `$${BUILD_FEE}`, `$${BUILD_FEE}`] },
  { label: 'Monthly', values: ['$80/mo', '$120/mo', '$200/mo'] },
  { label: 'Pages', values: ['Up to 3', 'Up to 6', '7+'] },
  { label: 'Custom mobile-first design', values: [true, true, true] },
  { label: 'Contact form', values: [true, true, true] },
  { label: 'Hosting, SSL & domain', values: [true, true, true] },
  { label: 'Security updates & backups', values: [true, true, true] },
  { label: 'Photo gallery or blog', values: [false, true, true] },
  { label: 'SEO setup', values: [false, true, true] },
  { label: 'Google Analytics', values: [false, true, true] },
  { label: 'Dashboards or customer portals', values: [false, false, true] },
  { label: 'Online checkout & payments', values: [false, false, true] },
  { label: 'Third-party integrations', values: [false, false, true] },
  { label: 'Monthly edit time', values: ['30 min', '1 hour', '2 hours'] },
  { label: 'Support', values: ['Email', 'Faster response', 'Priority'] },
];

export const addOns = [
  { name: 'Extra page', price: '$40', unit: 'per page', desc: 'Add pages beyond what your package includes.' },
  { name: 'Copywriting', price: '$50', unit: 'per page', desc: 'We write words that sell, so you don\'t have to.' },
  { name: 'Advanced SEO setup', price: '$150', unit: 'one-time', desc: 'Keyword research, Search Console setup, and page-by-page tuning.' },
  { name: 'Business email setup', price: '$40', unit: 'one-time', desc: 'Professional email at your own domain (you@yourbusiness.com).' },
  { name: 'Online booking', price: '+$25', unit: 'per month', desc: 'Let customers book appointments right from your site, 24/7.' },
  { name: 'Rush delivery', price: '$100', unit: 'one-time', desc: 'Jump the line and launch in about one week.' },
  { name: 'Extra edit time', price: '$50', unit: 'per hour', desc: 'More changes than your monthly edit time covers.' },
];
