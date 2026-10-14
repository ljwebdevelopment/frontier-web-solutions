# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # Client build → SSR build → scripts/prerender.mjs writes static HTML per route + sitemap into /dist
npm run preview   # Preview the production build
```

There is no test suite or lint config.

## Architecture

Static marketing site (React 19 + Vite + react-router-dom + lucide-react). No backend; the quote form submits to Formspree.

- `src/App.jsx` — routes: `/`, `/packages`, `/contact`, 404 (`/pricing` → `/packages`, `/services` → `/`)
- `src/main.jsx` — client entry; hydrates prerendered HTML in production, renders fresh in dev
- `src/entry-server.jsx` — SSR entry used only by the prerender step
- `scripts/prerender.mjs` — renders each route into `dist/<route>.html` (GitHub Pages serves `/packages` from `packages.html`), injects per-page `<title>`/meta/canonical/Open Graph/JSON-LD at the `<!--seo-head-->` marker in `index.html`, writes `404.html`, redirect stubs, and `sitemap.xml`
- `src/seo.js` — per-page titles/descriptions, sitemap entries, and schema.org structured data (ProfessionalService, WebSite, Service + OfferCatalog, FAQPage, BreadcrumbList). Add new routes here and in `prerender.mjs`
- `src/components/Seo.jsx` — updates title/meta/canonical on client-side navigation
- `src/components/Layout.jsx` — fixed dark header (glass on scroll), mobile nav, footer
- `src/components/Reveal.jsx` — scroll-in animation wrapper (IntersectionObserver; disabled under prefers-reduced-motion)
- `src/components/BrowserMock.jsx` — decorative CSS-only site mockup in the home hero
- `src/data/pricing.js` — single source of truth for the build fee, the three packages (Basic / Standard / Premium), the comparison table, and add-ons
- `src/config.js` — Formspree form ID and contact email
- `src/pages/Contact.jsx` — quote form via `@formspree/react` (`useForm` + `ValidationError`); rewrites package/add-on fields to readable text and sets `_subject` before submitting; `?package=<id>` preselects a package
- `src/styles.css` — all styles, CSS custom properties on `:root`, BEM-style class names (`.package__price`, `.header__nav`)

Components must render the same on server and client (no `window` access during render; read the query string in effects — see `Contact.jsx`).

Social/OG image, icons, `logo.png`, `robots.txt` and `site.webmanifest` live in `public/`. Logos live in `src/assets/`: the original 2000×2000 files plus cropped `-wide` versions used in the header/footer.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on pushes to `master`. `public/CNAME` keeps the custom domain.
