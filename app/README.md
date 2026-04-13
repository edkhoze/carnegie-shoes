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

## 🧞 Build & Deploy

This project is built using Astro and deployed via **Cloudflare Pages**.
The `@astrojs/cloudflare` server-side rendering adapter has been pre-configured to handle form processing via Astro Actions.

```sh
# Build for production
npm run build

# Preview the built production site locally
npm run preview
```
