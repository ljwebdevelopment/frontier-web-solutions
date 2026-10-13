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

## Contact form (Formspree)

1. Create a free account at [formspree.io](https://formspree.io) and create a new form.
2. Copy the form ID (the part after `/f/` in the endpoint, e.g. `https://formspree.io/f/abcdwxyz` → `abcdwxyz`).
3. Paste it into `FORMSPREE_FORM_ID` in `src/config.js` and push.
