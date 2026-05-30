import { test, expect } from '@playwright/test';

test.describe('Street Dudes - Menu Page E2E', () => {
  test('should load menu categories and verify tab scrolling and order button states', async ({
    page,
  }) => {
    // 1. Load default landing page (redirects to /sv)
    await page.goto('/');
    await expect(page).toHaveURL(/\/sv/);

    // 2. All category headings are visible on page load (burgers, tacos, sides, etc.)
    const categoryHeadings = [
      'Burgare',
      'Tacos & Burritos',
      'Skålar',
      'Tillbehör',
      'Vegetariskt',
      'Såser',
      'Tillval',
      'Dryck',
    ];

    for (const heading of categoryHeadings) {
      const locator = page.locator('h3', { hasText: heading });
      await expect(locator).toBeVisible();
    }

    // 3. FlashingLabel is present below the first order button (exhibiting coming soon message)
    const orderBtnWrapper = page.locator('[data-testid="order-button-wrapper"]').first();
    await expect(orderBtnWrapper).toBeVisible();

    const flashingLabel = orderBtnWrapper.locator('[data-testid="flashing-label"]');
    await expect(flashingLabel).toBeVisible();
    await expect(flashingLabel).toContainText('KOMMER SNART');

    // 4. Clicking a tab scrolls to the correct section
    const sidesTab = page.locator('[data-testid="tab-sides"]');
    await expect(sidesTab).toBeVisible();

    // Click on the Tillbehör tab
    await sidesTab.click();

    // The sides section should now be visible and scrolled into viewport
    const sidesSection = page.locator('[data-testid="section-sides"]');
    await expect(sidesSection).toBeInViewport();
  });
});
