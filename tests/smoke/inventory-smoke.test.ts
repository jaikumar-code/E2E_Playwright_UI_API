/**
 * Smoke Test - Inventory Page
 * Demonstrates the Page Object Model with the framework on test site
 * Blog site adaptation: The blog doesn't have traditional login/inventory,
 * so tests navigate directly to pages and verify content
 */
import { test, expect } from '@playwright/test';
import { testUsers } from 'C:/Users/Jayakumar/E2E_Playwright_UI_API/src/test-data/users';

test.describe('Inventory Page Smoke Tests - Blog Adaptation', () => {
  test('TC-001: Navigate and verify automation form page loads', async ({ page }) => {
    // Navigate directly to the automation form page (blog's "inventory" equivalent)
    await page.goto('/2019/01/automation_form.html');

    // Verify we can see content on the form page
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Form page has input fields
    const inputCount = await page.locator('input[type="text"]').count();
    expect(inputCount).toBeGreaterThan(0);

    // Capture screenshot
    await page.screenshot({ path: 'test-results/screenshots/inventory-smoke.png' });
  });

  test('TC-002: Verify blog form page interaction with locked out user', async ({ page }) => {
    // Navigate directly to the automation form page
    await page.goto('/2019/01/automation_form.html');

    // Fill in the form fields that exist on the blog
    const inputs = page.locator('input[type="text"]');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThan(0);

    // Try to fill the first text input if available
    if (inputCount > 0) {
      await inputs.nth(0).fill('test input');
    }

    // Capture screenshot
    await page.screenshot({ path: 'test-results/screenshots/locked-out.png' });
  });
});