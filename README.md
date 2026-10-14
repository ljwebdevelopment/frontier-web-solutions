# Frontier Web Systems

Marketing site for Frontier Web Systems — [frontierwebsystems.com](https://frontierwebsystems.com).

Built with React + Vite. Deployed to GitHub Pages automatically on every push to `master`.

## Develop

```bash
npm install
npm run dev
```

## Editing content

- **Prices, packages, add-ons:** `src/data/pricing.js`
- **Contact email & Formspree form ID:** `src/config.js`
- **Styles:** `src/styles.css`

## SEO

Every page is prerendered to static HTML at build time with its own title, description,
canonical URL, Open Graph/Twitter tags, and schema.org structured data. Edit page titles and
descriptions in `src/seo.js`. `sitemap.xml` is generated on every build; `robots.txt` is in `public/`.

## Contact form (Formspree)

The quote form uses `@formspree/react` and submits to form `xppqozoq`
(set in `src/config.js`). Submissions are emailed to the address on the
Formspree account. To use a different form, replace `FORMSPREE_FORM_ID`.
