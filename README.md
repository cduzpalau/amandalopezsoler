# Amanda López Soler — Website

Minimalist, bilingual (**Catalan / Spanish**) static website for Amanda López Soler (Psychologist & Traditional Chinese Medicine specialist in Terrassa).

Built with plain HTML, CSS, and vanilla JavaScript — zero frameworks, zero build step, zero tracking cookies.

## Structure
- `index.html` — Single-page flowing bilingual site (`CA` / `ES`)
- `aviso-legal.html` & `privacidad.html` — Bilingual legal pages (LSSI & RGPD)
- `css/styles.css` — Design tokens and responsive layout
- `js/config.js` — Contact form endpoint and WhatsApp link
- `js/i18n.js` — Spanish and Catalan copy (edit text here)
- `js/main.js` — Mobile navigation, accessible form validation, and form submission
- `assets/images/` — Optimized portraits of Amanda and logo
- `google-apps-script/` — `Code.gs` + `SETUP.md` to connect the contact form to Google Sheets & Gmail

## Publishing
- **GitHub Pages**: Repository Settings → Pages → Deploy from branch `main` (`/ (root)`). All asset paths are relative so it works cleanly on `https://<user>.github.io/amandalopezsoler/`.
- **Cloudflare Pages** (later): Connect the GitHub repo with no build command and output directory `.`, then attach the custom domain once purchased.
