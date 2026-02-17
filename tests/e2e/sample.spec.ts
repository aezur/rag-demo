import { test, expect } from '@playwright/test';

test('homepage renders header', async ({ page }) => {
  await page.goto('http://localhost:5173');
  const header = await page.locator('header');
  await expect(header).toBeVisible();
});
