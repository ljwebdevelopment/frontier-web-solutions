// Generates the per-page social share images (1200×630 PNG) in public/.
// Run after changing prices or copy:  node scripts/og-images.mjs
// Needs Playwright with Chromium (not a project dependency):  npx playwright install chromium
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BUILD_FEE, packages } from '../src/data/pricing.js';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const dataUrl = (path, type) => `data:${type};base64,${readFileSync(resolve(path)).toString('base64')}`;
const logo = dataUrl('src/assets/FWSlogo-white-wide.png', 'image/png');
const display = dataUrl('node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2', 'font/woff2');
const body = dataUrl('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2', 'font/woff2');

const shell = (content) => `<!doctype html><html><head><style>
@font-face { font-family: D; src: url(${display}) format('woff2'); font-weight: 300 700; }
@font-face { font-family: B; src: url(${body}) format('woff2'); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; background: #0a0809; color: #fff; font-family: B, sans-serif; position: relative; }
.glow { position: absolute; inset: 0; background: radial-gradient(900px 600px at 100% 0%, rgba(142,45,42,.75), transparent 65%); }
.grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px); background-size: 56px 56px; }
.wrap { position: relative; padding: 56px 80px 52px; height: 100%; display: flex; flex-direction: column; }
.logo { height: 104px; width: auto; align-self: flex-start; }
h1 { font-family: D, sans-serif; font-weight: 700; font-size: 60px; line-height: 1.05; letter-spacing: -0.03em; margin-top: 30px; }
.red { color: #e0393a; }
.sub { margin-top: 22px; font-size: 28px; color: rgba(255,255,255,.75); }
.url { margin-top: auto; font-weight: 700; font-size: 26px; color: #e0393a; }
.cards { display: flex; gap: 22px; margin-top: 28px; }
.card { flex: 1; border: 1px solid rgba(255,255,255,.14); border-radius: 18px; padding: 20px 24px; background: rgba(255,255,255,.04); }
.card.f { border-color: #e0393a; background: rgba(142,45,42,.35); }
.card b { display: block; font-size: 22px; color: rgba(255,255,255,.8); font-weight: 600; }
.card span { font-family: D, sans-serif; font-weight: 700; font-size: 46px; letter-spacing: -0.02em; }
.card small { font-size: 22px; color: rgba(255,255,255,.65); }
</style></head><body><div class="glow"></div><div class="grid"></div><div class="wrap">
<img class="logo" src="${logo}" alt="" />${content}<div class="url">frontierwebsystems.com</div></div></body></html>`;

const images = {
  'og-packages.png': shell(`
    <h1>Website packages, <span class="red">priced for small business.</span></h1>
    <div class="cards">${packages
      .map((p) => `<div class="card${p.featured ? ' f' : ''}"><b>${p.name}</b><span>$${p.monthly}</span><small>/mo</small></div>`)
      .join('')}</div>
    <p class="sub">+ $${BUILD_FEE} one-time build · Hosting & support included</p>`),
  'og-contact.png': shell(`
    <h1>Get a free website quote.<br /><span class="red">No obligation.</span></h1>
    <p class="sub">We reply within one business day · Custom design · Hosting &amp; support</p>`),
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const [file, html] of Object.entries(images)) {
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve('public', file) });
  console.log(`wrote public/${file}`);
}
await browser.close();
