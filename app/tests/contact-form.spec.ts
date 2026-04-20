import { test, expect } from '@playwright/test';

// Exercises the contact form end-to-end in the local dev server.
// Turnstile is configured with Cloudflare's always-pass dev site key
// ("1x00000000000000000000AA") when PUBLIC_TURNSTILE_SITE_KEY is not set, and the
// Resend API is skipped in dev (the action returns a "Message received (Development mode)"
// payload when RESEND_API_KEY is missing). Those two dev-mode behaviours make this
// test deterministic without network dependencies.
test.describe('Contact form', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('load');
  });

  test('renders all required fields and the submit button', async ({ page }) => {
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Your Message')).toBeVisible();
    await expect(page.getByRole('button', { name: /submit request/i })).toBeVisible();
  });

  test('browser-level validation blocks empty submissions', async ({ page }) => {
    const nameInput = page.getByLabel('Full Name');
    await page.getByRole('button', { name: /submit request/i }).click();
    // The first required field should be reported invalid; the page should not navigate.
    await expect(nameInput).toHaveJSProperty('validity.valid', false);
    await expect(page).toHaveURL(/\/contact/);
  });

  test('rejects an invalid email address', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByLabel('Email Address').fill('not-an-email');
    await page.getByLabel('Your Message').fill('Hello');
    await page.getByRole('button', { name: /submit request/i }).click();
    await expect(page.getByLabel('Email Address')).toHaveJSProperty('validity.valid', false);
  });

  test('submits successfully with valid data and the dev Turnstile token', async ({ page }) => {
    // Wait for the Turnstile widget to auto-solve against the always-pass dev site key.
    // It sets a hidden input[name="cf-turnstile-response"] once the challenge succeeds.
    const token = page.locator('input[name="cf-turnstile-response"]');
    await expect(token).toHaveValue(/.+/, { timeout: 15_000 });

    await page.getByLabel('Full Name').fill('Playwright Tester');
    await page.getByLabel('Email Address').fill('tester@example.com');
    await page.getByLabel('Your Message').fill('This is an automated test submission.');
    await page.getByRole('button', { name: /submit request/i }).click();

    await expect(page.getByRole('heading', { name: /signal received/i })).toBeVisible({ timeout: 15_000 });
  });
});
