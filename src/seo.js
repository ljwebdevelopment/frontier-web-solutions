// Per-page SEO: titles, descriptions, and schema.org structured data.
// Used by the build-time prerender (scripts/prerender.mjs) and by <Seo /> on client navigation.
import { CONTACT_EMAIL } from './config.js';
import { faqs } from './data/faqs.js';
import { addOns, BUILD_FEE, packages } from './data/pricing.js';

export const SITE = {
  name: 'Frontier Web Systems',
  url: 'https://frontierwebsystems.com',
  image: 'https://frontierwebsystems.com/og-image.png',
  logo: 'https://frontierwebsystems.com/logo.png',
};

export const pages = {
  '/': {
    title: 'Small Business Website Design & Maintenance | Frontier Web Systems',
    description: `Custom, mobile-first websites for small businesses. $${BUILD_FEE} to build, then plans from $${packages[0].monthly}/mo with hosting, SSL, security updates, edits, and support included.`,
  },
  '/packages': {
    title: `Website Packages & Pricing, From $${packages[0].monthly}/mo | Frontier Web Systems`,
    description: `Compare Basic ($${packages[0].monthly}/mo), Standard ($${packages[1].monthly}/mo), and Premium ($${packages[2].monthly}/mo) website plans. One $${BUILD_FEE} build fee, hosting and support included, no long-term contract.`,
  },
  '/contact': {
    title: 'Get a Free Website Quote | Frontier Web Systems',
    description: 'Tell us about your business and get a free, no-obligation quote for a custom website. We reply within one business day.',
  },
  '/404': {
    title: 'Page Not Found | Frontier Web Systems',
    description: 'The page you are looking for does not exist.',
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

const organization = {
  '@type': 'ProfessionalService',
  '@id': orgId,
  name: SITE.name,
  alternateName: 'FWS',
  url: `${SITE.url}/`,
  logo: SITE.logo,
  image: SITE.image,
  email: CONTACT_EMAIL,
  description: 'Custom website design, development, hosting, and ongoing maintenance for small businesses.',
  priceRange: `$${packages[0].monthly}-$${packages[2].monthly}/mo`,
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
  },
};

const website = {
  '@type': 'WebSite',
  '@id': `${SITE.url}/#website`,
  url: `${SITE.url}/`,
  name: SITE.name,
  publisher: { '@id': orgId },
  inLanguage: 'en-US',
};

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
      price: Number(a.price.replace(/[^0-9.]/g, '')),
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
  description: `Custom websites built for $${BUILD_FEE}, with monthly plans that include hosting, SSL, security updates, backups, edits, and support.`,
  hasOfferCatalog: offerCatalog,
};

function breadcrumb(path, name) {
  return {
    '@type': 'BreadcrumbList',
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
    inLanguage: 'en-US',
  };
}

export function structuredData(path) {
  const graph = [organization, website];
  if (path === '/') graph.push(webPage('/'), service);
  if (path === '/packages') {
    graph.push(webPage('/packages'), service, breadcrumb('/packages', 'Packages & Pricing'), {
      '@type': 'FAQPage',
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
