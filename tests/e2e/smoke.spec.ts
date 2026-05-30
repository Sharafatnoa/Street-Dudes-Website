import { test, expect } from '@playwright/test';

test.describe('Street Dudes - i18n Smoke Test', () => {
  test('should load Swedish by default and toggle to English successfully', async ({ page }) => {
    // 1. Visit the root path (should redirect to /sv via middleware)
    await page.goto('/');
    await expect(page).toHaveURL(/\/sv/);

    // 2. Swedish heading and content checks
    await expect(page.locator('h1').first()).toContainText('STREET DUDES');
    await expect(page.getByRole('heading', { name: 'Meny', exact: true })).toBeVisible();

    // Swedish brand names checks
    await expect(page.locator('h3', { hasText: 'TRUFFLE SMASH' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'BIRRIA TACO' })).toBeVisible();

    // 3. Click the English language toggle button
    const enButton = page.locator('button[aria-label="English"]');
    await expect(enButton).toBeVisible();
    await enButton.click();
    await expect(page).toHaveURL(/\/en/);

    // 4. English content checks
    await expect(page.getByRole('heading', { name: 'Menu', exact: true })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'TRUFFLE SMASH' })).toBeVisible();

    // Toggle button should now show Swedish option
    await expect(page.locator('button[aria-label="Svenska"]')).toBeVisible();
  });
});
