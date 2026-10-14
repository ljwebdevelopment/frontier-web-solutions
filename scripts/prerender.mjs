// Renders every route to static HTML after `vite build`, so search engines and
// social previews get full content and correct meta tags without running JS.
// Output: dist/index.html, dist/packages.html, dist/contact.html (GitHub Pages
// serves /packages from packages.html), dist/404.html, redirect stubs, sitemap.xml.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const dist = resolve('dist');
const ssrEntry = resolve('dist-ssr/entry-server.js');
const { render, seoFor, pageUrl, structuredData, sitemap, SITE } = await import(pathToFileURL(ssrEntry).href);

const template = readFileSync(resolve(dist, 'index.html'), 'utf8');

const escape = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function headTags(path) {
  const page = seoFor(path);
  const url = pageUrl(page.noindex ? '/' : path);
  const robots = page.noindex
    ? 'noindex, follow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  const tags = [
    `<title>${escape(page.title)}</title>`,
    `<meta name="description" content="${escape(page.description)}" />`,
    `<meta name="robots" content="${robots}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE.name}" />`,
    `<meta property="og:locale" content="en_US" />`,
    `<meta property="og:title" content="${escape(page.title)}" />`,
    `<meta property="og:description" content="${escape(page.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${SITE.image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${SITE.name}: custom websites for small businesses" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escape(page.title)}" />`,
    `<meta name="twitter:description" content="${escape(page.description)}" />`,
    `<meta name="twitter:image" content="${SITE.image}" />`,
  ];
  if (!page.noindex) {
    const json = JSON.stringify(structuredData(path)).replace(/</g, '\\u003c');
    tags.push(`<script type="application/ld+json">${json}</script>`);
  }
  return tags.join('\n    ');
}

function page(path, renderUrl = path) {
  return template
    .replace('<!--seo-head-->', headTags(path))
    .replace('<div id="root"></div>', `<div id="root">${render(renderUrl)}</div>`);
}

function redirect(to) {
  const url = pageUrl(to);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Redirecting…</title>
    <link rel="canonical" href="${url}" />
    <meta name="robots" content="noindex, follow" />
    <meta http-equiv="refresh" content="0; url=${to}" />
    <script>location.replace(${JSON.stringify(to)} + location.search + location.hash);</script>
  </head>
  <body><a href="${to}">Continue to ${url}</a></body>
</html>
`;
}

const files = {
  'index.html': page('/'),
  'packages.html': page('/packages'),
  'contact.html': page('/contact'),
  '404.html': page('/404', '/404'),
  'pricing.html': redirect('/packages'),
  'services.html': redirect('/'),
};

const today = new Date().toISOString().slice(0, 10);
files['sitemap.xml'] = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap
  .map((s) => `  <url>\n    <loc>${pageUrl(s.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${s.changefreq}</changefreq>\n    <priority>${s.priority}</priority>\n  </url>`)
  .join('\n')}
</urlset>
`;

for (const [name, html] of Object.entries(files)) {
  writeFileSync(resolve(dist, name), html);
  console.log(`prerendered dist/${name}`);
}

rmSync(resolve('dist-ssr'), { recursive: true, force: true });
