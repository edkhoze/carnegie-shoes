import { test, expect } from '@playwright/test';

test.describe('Carnegie Shoes UI Visual Verification', () => {

  const pages = [
    { name: 'Home Page', path: '/' },
    { name: 'Brands', path: '/brands' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' }
  ];

  for (const { name, path } of pages) {
    test(`Visual Regression - ${name}`, async ({ page }) => {
      // Navigate to the target page
      await page.goto(path);
      
      // Wait for the full document rendering, and an explicit buffer instead of 'networkidle' 
      // which times out on long-living websockets (like Cloudflare Turnstile on the contact page).
      await page.waitForLoadState('load');
      await page.waitForTimeout(1500);
      
      // Optional: hide generic un-styleable content if it flickers, e.g., third party widgets 
      // but here we just wait. We can evaluate any fonts load specifically if needed.
      await documentFontsLoaded(page);

      // Perform a full-page visual regression screenshot comparison
      await expect(page).toHaveScreenshot(`${name.replace(/\s+/g, '-').toLowerCase()}-snapshot.png`, {
        fullPage: true,
        // Allow a subtle color/edge pixel margin since different OS render fonts slightly differently
        maxDiffPixelRatio: 0.1,    
      });
    });
  }

});

// Helper function to ensure all CSS fonts are fully loaded to avoid layout shifts in snapshots
async function documentFontsLoaded(page) {
  await page.evaluate(() => document.fonts.ready);
}
