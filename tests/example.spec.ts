// apps/web/tests/example.spec.ts
import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Sweet Shop/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Sweet Shop' }).click();

  // Expects page to have a heading with the name of the current page.
  await expect(page.getByRole('heading', { name: 'Welcome to the Sweet Shop!' })).toBeVisible();
});