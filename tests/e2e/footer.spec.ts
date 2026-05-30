import { test, expect } from '@playwright/test';

test.describe('Street Dudes - Footer & Maps E2E', () => {
  test('should display the footer with address and opening hours translating properly', async ({
    page,
  }) => {
    // 1. Visit root page (redirects to /sv)
    await page.goto('/');
    await expect(page).toHaveURL(/\/sv/);

    // 2. Footer is visible at bottom of page
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // 3. Address text is present in SV mode
    await expect(footer).toContainText('Street Dudes, Borås, Sverige');
    await expect(footer).toContainText('Mån-Fre: 11:00 - 21:00');

    // 4. Map iframe OR placeholder card is rendered (not both, not neither)
    const hasIframeContainer = await page
      .locator('[data-testid="map-iframe-container"]')
      .isVisible();
    const hasPlaceholder = await page.locator('[data-testid="map-placeholder"]').isVisible();

    // Exclusive OR (XOR) assertion: exactly one must be true
    expect(hasIframeContainer !== hasPlaceholder).toBe(true);

    // 5. Click the EN language toggle button to switch to English
    const enButton = page.locator('button[aria-label="English"]');
    await expect(enButton).toBeVisible();
    await enButton.click();
    await expect(page).toHaveURL(/\/en/);

    // 6. Address text is present in EN mode
    await expect(footer).toContainText('Street Dudes, Borås, Sweden');
    await expect(footer).toContainText('Mon-Fri: 11:00 AM - 9:00 PM');

    // 7. Verify map XOR assertion holds true in English mode too
    const hasIframeContainerEn = await page
      .locator('[data-testid="map-iframe-container"]')
      .isVisible();
    const hasPlaceholderEn = await page.locator('[data-testid="map-placeholder"]').isVisible();
    expect(hasIframeContainerEn !== hasPlaceholderEn).toBe(true);
  });
});
