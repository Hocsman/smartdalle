import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    // Should redirect to login or show login page
    await expect(page).toHaveURL(/login|signin/);
  });

  test('login page should load correctly', async ({ page }) => {
    await page.goto('/login');
    // Check that login form elements exist
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });
});
