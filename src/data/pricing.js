// All prices live here. Edit this file to change packages or add-ons.

export const BUILD_FEE = 325;

export const packages = [
  {
    id: 'outpost',
    name: 'Outpost',
    level: 'Basic',
    monthly: 80,
    tagline: 'A clean, simple site that gets you found and gets you calls.',
    features: [
      'Up to 3 pages',
      'Mobile-friendly design',
      'Contact form',
      'Hosting, SSL & domain connection',
      'Security updates & backups',
      '30 min of edits each month',
      'Email support',
    ],
  },
  {
    id: 'homestead',
    name: 'Homestead',
    level: 'Standard',
    monthly: 120,
    featured: true,
    tagline: 'More room to show off your work and grow your business.',
    features: [
      'Up to 6 pages',
      'Everything in Outpost',
      'Photo gallery or blog',
      'Basic SEO setup',
      'Google Analytics',
      '1 hour of edits each month',
      'Faster support response',
    ],
  },
  {
    id: 'frontier',
    name: 'Frontier',
    level: 'Complex',
    monthly: 200,
    tagline: 'For bigger sites with dashboards, accounts, or online sales.',
    features: [
      '7+ pages',
      'Everything in Homestead',
      'Dashboards or customer portals',
      'Customer checkout & online payments',
      'Third-party integrations',
      '2 hours of edits each month',
      'Priority support',
    ],
  },
];

export const addOns = [
  { name: 'Extra page', price: '$40', unit: 'per page', desc: 'Add pages beyond what your package includes.' },
  { name: 'Copywriting', price: '$50', unit: 'per page', desc: 'We write the words for you, so you don\'t have to.' },
  { name: 'Advanced SEO setup', price: '$150', unit: 'one-time', desc: 'Keyword research, search console setup, and page-by-page tuning.' },
  { name: 'Business email setup', price: '$40', unit: 'one-time', desc: 'Professional email at your own domain (you@yourbusiness.com).' },
  { name: 'Online booking', price: '+$25', unit: 'per month', desc: 'Let customers book appointments right from your site.' },
  { name: 'Rush delivery', price: '$100', unit: 'one-time', desc: 'Jump the line and launch in about one week.' },
  { name: 'Extra edit time', price: '$50', unit: 'per hour', desc: 'More changes than your monthly edit time covers.' },
];
