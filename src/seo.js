// Per-page SEO: titles, descriptions, share images, and schema.org structured data.
// Used by the build-time prerender (scripts/prerender.mjs) and by <Seo /> on client navigation.
import { CONTACT_EMAIL } from './config.js';
import { faqs } from './data/faqs.js';
import { addOns, BUILD_FEE, packages } from './data/pricing.js';

export const SITE = {
  name: 'Frontier Web Systems',
  url: 'https://frontierwebsystems.com',
  logo: 'https://frontierwebsystems.com/logo.png',
};

// Social share images (1200×630, absolute URLs). `default` is used site-wide unless a page overrides it.
// Regenerate the per-page images with `node scripts/og-images.mjs` after changing prices.
const IMAGES = {
  default: {
    url: `${SITE.url}/og-image.png`,
    alt: `Frontier Web Systems: custom websites for small businesses. $${BUILD_FEE} to build, from $${packages[0].monthly}/mo.`,
  },
  packages: {
    url: `${SITE.url}/og-packages.png`,
    alt: `Frontier Web Systems website packages: Basic $${packages[0].monthly}/mo, Standard $${packages[1].monthly}/mo, Premium $${packages[2].monthly}/mo.`,
  },
  contact: {
    url: `${SITE.url}/og-contact.png`,
    alt: 'Get a free website quote from Frontier Web Systems. We reply within one business day.',
  },
};
SITE.image = IMAGES.default.url;

// Titles: 50–60 characters, main keyword first, brand last.
// Descriptions: 140–160 characters, written like an ad with a call to action.
export const pages = {
  '/': {
    title: 'Small Business Web Design & Hosting | Frontier Web Systems',
    description: `Custom small business websites built for $${BUILD_FEE}, then plans from $${packages[0].monthly}/mo with hosting, SSL, updates, and edits. No contract. Get your free quote today.`,
    image: IMAGES.default,
  },
  '/packages': {
    title: `Website Design Packages From $${packages[0].monthly}/mo | Frontier Web Systems`,
    description: `Compare Basic ($${packages[0].monthly}/mo), Standard ($${packages[1].monthly}/mo), and Premium ($${packages[2].monthly}/mo) website plans. One $${BUILD_FEE} build fee, hosting and support included. Pick yours today.`,
    image: IMAGES.packages,
  },
  '/contact': {
    title: 'Free Small Business Website Quote | Frontier Web Systems',
    description: 'Tell us about your business and get a free, no-obligation website quote within one business day. Custom design, hosting, and support. Start now.',
    image: IMAGES.contact,
  },
  '/404': {
    title: 'Page Not Found | Frontier Web Systems',
    description: 'The page you are looking for does not exist or has moved. Browse our small business website packages or request a free quote instead.',
    image: IMAGES.default,
    noindex: true,
  },
};

// Pages listed in sitemap.xml, with relative priority.
export const sitemap = [
  { path: '/', priority: '1.0', changefreq: 'monthly' },
  { path: '/packages', priority: '0.9', changefreq: 'monthly' },
  { path: '/contact', priority: '0.8', changefreq: 'yearly' },
];

export function pageUrl(path) {
  return path === '/' ? `${SITE.url}/` : `${SITE.url}${path}`;
}

const orgId = `${SITE.url}/#organization`;

// TODO(owner): If you serve a specific local area, replace areaServed with your city/region, e.g.
//   areaServed: [{ '@type': 'City', name: 'Your City, ST' }],
// and add an `address` (PostalAddress) if you have a public business address. Until then this
// says "United States", which fits a business serving clients remotely/nationwide.
// TODO(owner): Add a public phone number as `telephone: '+1-XXX-XXX-XXXX'` (and show it on the site).
// TODO(owner): Add your social/business profile URLs to `sameAs` (Google Business Profile,
//   Facebook, Instagram, LinkedIn, …) once they exist. Link them from the site footer too.
const organization = {
  '@type': 'ProfessionalService',
  '@id': orgId,
  name: SITE.name,
  alternateName: 'FWS',
  url: `${SITE.url}/`,
  logo: { '@type': 'ImageObject', '@id': `${SITE.url}/#logo`, url: SITE.logo, width: 600, height: 600, caption: SITE.name },
  image: SITE.image,
  email: CONTACT_EMAIL,
  description: 'Custom website design, development, hosting, and ongoing maintenance for small businesses.',
  priceRange: `$${packages[0].monthly}-$${packages[2].monthly}/mo`,
  areaServed: { '@type': 'Country', name: 'United States' },
  sameAs: [],
  knowsAbout: [
    'Small business website design',
    'Web development',
    'Website maintenance',
    'Website hosting',
    'Search engine optimization',
    'E-commerce websites',
    'Online booking systems',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'sales',
    email: CONTACT_EMAIL,
    url: `${SITE.url}/contact`,
    availableLanguage: 'English',
  },
};

const website = {
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  url: `${SITE.url}/`,
  name: SITE.name,
  alternateName: 'FWS',
  publisher: { '@id': orgId },
  inLanguage: 'en-US',
};

const priceOf = (s) => Number(String(s).replace(/[^0-9.]/g, ''));

const offerCatalog = {
  '@type': 'OfferCatalog',
  name: 'Website Packages',
  itemListElement: [
    ...packages.map((p) => ({
      '@type': 'Offer',
      name: `${p.name} Website Plan`,
      description: `${p.tagline} ${p.features.join(', ')}.`,
      url: `${SITE.url}/packages`,
      price: p.monthly,
      priceCurrency: 'USD',
      priceSpecification: [
        { '@type': 'UnitPriceSpecification', price: p.monthly, priceCurrency: 'USD', unitCode: 'MON', referenceQuantity: { '@type': 'QuantitativeValue', value: 1, unitCode: 'MON' } },
        { '@type': 'PriceSpecification', name: 'One-time build fee', price: BUILD_FEE, priceCurrency: 'USD' },
      ],
      itemOffered: { '@type': 'Service', name: `${p.name} small business website`, provider: { '@id': orgId } },
    })),
    ...addOns.map((a) => ({
      '@type': 'Offer',
      name: a.name,
      description: a.desc,
      price: priceOf(a.price),
      priceCurrency: 'USD',
      itemOffered: { '@type': 'Service', name: a.name, provider: { '@id': orgId } },
    })),
  ],
};

const service = {
  '@type': 'Service',
  '@id': `${SITE.url}/#service`,
  name: 'Small Business Website Design, Hosting & Maintenance',
  serviceType: 'Web design and development',
  provider: { '@id': orgId },
  areaServed: organization.areaServed,
  description: `Custom websites built for $${BUILD_FEE}, with monthly plans that include hosting, SSL, security updates, backups, edits, and support.`,
  hasOfferCatalog: offerCatalog,
};

// One Service per main service. Every claim here comes from copy on the site (pricing.js / Home).
const addOn = (name) => addOns.find((a) => a.name === name);
const mainServices = [
  {
    slug: 'web-design',
    name: 'Custom Small Business Website Design',
    serviceType: 'Website design',
    description: 'Hand-built, mobile-first websites designed and coded from scratch for each business. No templates.',
    offer: { name: 'One-time build fee', price: BUILD_FEE },
  },
  {
    slug: 'hosting-maintenance',
    name: 'Website Hosting & Maintenance',
    serviceType: 'Website hosting and maintenance',
    description: 'Hosting, SSL, security updates, backups, monthly edit time, and support, included in every monthly plan.',
    offer: { name: 'Basic plan', price: packages[0].monthly, monthly: true },
  },
  {
    slug: 'seo',
    name: 'Small Business SEO Setup',
    serviceType: 'Search engine optimization',
    description: `SEO setup is included in the Standard and Premium plans. Advanced SEO add-on: ${addOn('Advanced SEO setup').desc}`,
    offer: { name: 'Advanced SEO setup (one-time)', price: priceOf(addOn('Advanced SEO setup').price) },
  },
  {
    slug: 'online-booking',
    name: 'Online Booking Integration',
    serviceType: 'Online appointment booking',
    description: addOn('Online booking').desc,
    offer: { name: 'Online booking add-on', price: priceOf(addOn('Online booking').price), monthly: true },
  },
  {
    slug: 'ecommerce',
    name: 'Online Checkout, Payments & Customer Portals',
    serviceType: 'E-commerce website development',
    description: 'Customer checkout and online payments, dashboards or customer portals, and third-party integrations, included in the Premium plan.',
    offer: { name: 'Premium plan', price: packages[2].monthly, monthly: true },
  },
  {
    slug: 'business-email',
    name: 'Business Email Setup',
    serviceType: 'Business email setup',
    description: addOn('Business email setup').desc,
    offer: { name: 'Business email setup (one-time)', price: priceOf(addOn('Business email setup').price) },
  },
].map(({ slug, offer, ...rest }) => ({
  '@type': 'Service',
  '@id': `${SITE.url}/#service-${slug}`,
  ...rest,
  provider: { '@id': orgId },
  areaServed: organization.areaServed,
  url: `${SITE.url}/packages`,
  offers: {
    '@type': 'Offer',
    name: offer.name,
    price: offer.price,
    priceCurrency: 'USD',
    url: `${SITE.url}/packages`,
    ...(offer.monthly && {
      priceSpecification: { '@type': 'UnitPriceSpecification', price: offer.price, priceCurrency: 'USD', unitCode: 'MON' },
    }),
  },
}));

function breadcrumb(path, name) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl(path)}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE.url}/` },
      { '@type': 'ListItem', position: 2, name, item: pageUrl(path) },
    ],
  };
}

function webPage(path, type = 'WebPage') {
  return {
    '@type': type,
    '@id': `${pageUrl(path)}#webpage`,
    url: pageUrl(path),
    name: pages[path].title,
    description: pages[path].description,
    isPartOf: { '@id': `${SITE.url}/#website` },
    about: { '@id': orgId },
    primaryImageOfPage: { '@type': 'ImageObject', url: pages[path].image.url, width: 1200, height: 630 },
    ...(path !== '/' && { breadcrumb: { '@id': `${pageUrl(path)}#breadcrumb` } }),
    inLanguage: 'en-US',
  };
}

export function structuredData(path) {
  const graph = [organization, website];
  if (path === '/') graph.push(webPage('/'), service, ...mainServices);
  if (path === '/packages') {
    graph.push(webPage('/packages'), service, ...mainServices, breadcrumb('/packages', 'Packages & Pricing'), {
      '@type': 'FAQPage',
      '@id': `${pageUrl('/packages')}#faq`,
      mainEntity: faqs.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    });
  }
  if (path === '/contact') graph.push(webPage('/contact', 'ContactPage'), breadcrumb('/contact', 'Get a Free Quote'));
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function seoFor(path) {
  return pages[path] ?? pages['/404'];
}
