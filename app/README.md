# Carnegie Shoes

The official frontend repository for **Carnegie Shoes**, implementing the Kinetic Mosaic design system with heavy brutalist aesthetics, vibrant color palettes, and community-focused styling.

## 🚀 Quick Start

Ensure you have Node.js version 22+ installed.

```sh
# Clone the repository and CD into the app directory
cd c:\src\carnegieshoes\app

# Install all dependencies (including DevDependencies for Playwright)
npm install

# Start the local development server on https://localhost:4321
npm run dev
```

## 🧪 UI Visual Validation

We use **Playwright** to ensure that any CSS structural changes or responsive layout adjustments do not unintentionally break the design across our three supported viewports:
- Desktop (1920x1080)
- Tablet (iPad Mini)
- Mobile (iPhone Safari)

### Running UI Tests

To execute the test suite (it will run against a dynamically spun-up local server):
```sh
npm run test:e2e
```

### Visualizing Test Failures
To open the comprehensive Playwright UI for a detailed diff of any failing visual tests, run:
```sh
npm run test:e2e:ui
```

### Updating Baselines
When you intentionally modify the visual look and feel of the site (e.g. changing spacing, typography, colors), the test suite will intentionally fail on visual regressions. To accept your new changes as the new source of truth and update the snapshot baselines matching your current local layout:
```sh
npm run test:e2e -- --update-snapshots
```

## 🔐 Environment Variables

Before running the application or integrating services like the contact form, set up your local environment:
1. Copy `.env.example` to a new file named `.env`.
2. Fill in the required values:
   - `RESEND_API_KEY`: API key for email delivery via Resend.
   - `TO_EMAIL`: The destination email address for contact form submissions.
   - `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret key for bot protection validation.
   - `PUBLIC_TURNSTILE_SITE_KEY`: Public site key used on the frontend contact form.
   - `PUBLIC_CF_ANALYTICS_TOKEN` (optional): Cloudflare Web Analytics token. Leave blank to disable the beacon locally.

## ✏️ How to Update Content

Most content changes are just edits to `.astro` files — no build step or CMS to learn.

| I want to change…                          | Edit this file                                   |
| ------------------------------------------ | ------------------------------------------------ |
| Hero text, home sections, bento cards      | `src/pages/index.astro`                          |
| Brand list or descriptions                 | `src/pages/brands.astro`                         |
| Services copy (aged care, fitting, etc.)   | `src/pages/services.astro`                       |
| Address, phone, map link, form labels      | `src/pages/contact.astro`                        |
| Opening hours (visible)                    | `src/components/Footer.astro` + `src/pages/contact.astro` |
| Opening hours + NAP (for Google / SEO)     | `openingHoursSpecification` in `src/pages/index.astro` |
| Social links (Facebook/Instagram/GBP)      | `sameAs` array in `src/pages/index.astro`        |
| Nav links / header logo                    | `src/components/Header.astro`                    |
| Default meta description / OG tags         | `src/layouts/Layout.astro`                       |
| Global colors, fonts, spacing tokens       | `src/styles/global.css`                          |
| Robots / sitemap hints                     | `public/robots.txt` (sitemap auto-generated)     |

### Adding or changing an image

1. Drop the file into `public/` (general assets) or `public/images/` (photos).
2. Reference it with a leading slash: `src="/images/your-file.jpg"`.
3. Always include `alt`, `width`, and `height` attributes on `<img>` (prevents layout shift).
4. Use `loading="lazy"` unless the image is above the fold, in which case use `fetchpriority="high"` and no `loading` attribute.
5. Run `npm run test:e2e -- --update-snapshots` after layout-affecting changes (see Visual Validation below).

### Adding or changing an icon

Icons are inlined SVGs in `src/components/Icon.astro`. To add a new one:

1. Browse [Material Symbols on icones.js.org](https://icones.js.org/collection/material-symbols) and copy the SVG body (the `<path>` etc. inside the `<svg>` — not the outer tag).
2. Add an entry to the `ICONS` map in `src/components/Icon.astro`, keyed by `material-symbols:<icon-name>`.
3. Reference it in a page:

```astro
---
import Icon from '../components/Icon.astro';
---
<Icon name="material-symbols:call-outline" class="text-lg" aria-hidden="true" />
```

Only icons registered in the map are available — rendering an unknown name throws at build time. This keeps the bundle to the exact SVGs we use.

### Keeping NAP (Name/Address/Phone) consistent

Google Local SEO is brittle about NAP drift. If the address or phone number changes, update **all four** in the same commit:
- visible `Footer.astro`
- visible `contact.astro` (including the Google Maps iframe URL)
- the JSON-LD schema in `index.astro`
- the `tel:` links across Footer + contact

## 🧞 Build & Deploy

This project is built using Astro and deployed via **Cloudflare Pages**.
The `@astrojs/cloudflare` server-side rendering adapter has been pre-configured to handle form processing via Astro Actions.

```sh
# Build for production
npm run build

# Preview the built production site locally
npm run preview
```
