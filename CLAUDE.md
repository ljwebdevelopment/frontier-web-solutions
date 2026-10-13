# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Vite dev server
npm run build     # Production build → /dist (also copies index.html → 404.html for GitHub Pages SPA routing)
npm run preview   # Preview the production build
```

There is no test suite or lint config.

## Architecture

Static marketing site (React 19 + Vite + react-router-dom + lucide-react). No backend.

- `src/main.jsx` — routes: `/`, `/packages` (`/pricing` redirects there), `/contact`, 404
- `src/components/Layout.jsx` — header, mobile nav, footer
- `src/data/pricing.js` — single source of truth for the build fee, the three packages (Outpost / Homestead / Frontier), and add-ons
- `src/config.js` — Formspree form ID and contact email
- `src/pages/Contact.jsx` — quote form, POSTs to Formspree; `?package=<id>` preselects a package
- `src/styles.css` — all styles, CSS custom properties on `:root`, BEM-style class names (`.package__price`, `.header__nav`)

Logos live in `src/assets/`: the original 2000×2000 files plus cropped `-wide` versions used in the header/footer.

## Deployment

`.github/workflows/deploy.yml` builds and deploys to GitHub Pages on pushes to `master`. `public/CNAME` keeps the custom domain.
