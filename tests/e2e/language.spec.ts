import { test, expect } from '@playwright/test';

test.describe('Street Dudes - Language Switcher E2E', () => {
  test('should load Swedish by default and switch to English and back successfully', async ({
    page,
  }) => {
    // 1. Visit root page (redirects to /sv)
    await page.goto('/');
    await expect(page).toHaveURL(/\/sv/);

    // 2. Swedish is active by default
    const tagline = page.locator('[data-testid="hero-tagline"]');
    await expect(tagline).toBeVisible();
    await expect(tagline).toContainText('Inga regler. Bara mat.');

    // 3. Click the EN language toggle button
    const enButton = page.locator('button[aria-label="English"]');
    await expect(enButton).toBeVisible();
    await enButton.click();

    // Verify URL updates to /en
    await expect(page).toHaveURL(/\/en/);

    // 4. Verify text switches to English (checking hero tagline)
    await expect(tagline).toContainText('No Rules. Just Food.');

    // 5. Click the SV language toggle button
    const svButton = page.locator('button[aria-label="Svenska"]');
    await expect(svButton).toBeVisible();
    await svButton.click();

    // Verify URL updates back to /sv
    await expect(page).toHaveURL(/\/sv/);

    // 6. Verify text switches back to Swedish
    await expect(tagline).toContainText('Inga regler. Bara mat.');
  });
});
