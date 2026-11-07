/**
 * Regression Test - Inventory Page
 * Full E2E test demonstrating the framework capabilities
 */
import { test, expect } from '@playwright/test';
import { apiClient, APIResponse } from '../../src/api-clients/base';
import { testUsers, sampleProducts } from '../../src/test-data/users';
import { LoginPage } from '../../src/page-objects/login';
import { logger } from '../../src/utils/logger';
import { waitForElement, safeClick, captureFullScreenshot } from '../../src/utils/test-helpers';

test.describe('Inventory Page Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    const loginPage = new LoginPage(page);
    await loginPage.navigate();
    await loginPage.login(
      testUsers.standardUser.username,
      testUsers.standardUser.password
    );
    await loginPage.verifyLoginSuccess();
  });

  test('TC-101: Verify inventory page loads correctly', async ({ page }) => {
    logger.testStart('TC-101: Verify inventory page loads', test.info());

    await expect(page.locator('span.title')).toHaveText('Products');
    await expect(page.locator(By.tableRow(1))).toBeVisible();

    logger.testEnd('TC-101: Verify inventory page loads', test.info(), 'pass');
  });

  test('TC-102: Add product to cart and verify', async ({ page }) => {
    logger.testStart('TC-102: Add product to cart', test.info());

    // Add first product (Backpack) to cart
    await page.click(By.button('Add to cart'));
    await waitForElement(page, By.badge('1'), { timeout: 5000 });

    // Verify cart badge
    await expect(page.locator(By.badge('1'))).toBeVisible();

    // Capture screenshot
    await captureFullScreenshot(page, 'add-to-cart');

    logger.testEnd('TC-102: Add product to cart', test.info(), 'pass');
  });

  test('TC-103: Remove product from cart', async ({ page }) => {
    logger.testStart('TC-103: Remove product from cart', test.info());

    // Remove the item
    await page.click('button:has-text("Remove")');
    await expect(page.locator(By.badge('0'))).toBeVisible();

    logger.testEnd('TC-103: Remove product from cart', test.info(), 'pass');
  });

  test('TC-104: Verify product prices match API', async () => {
    logger.testStart('TC-104: Verify product prices match API', test.info());

    // Get products from API
    const apiResponse: APIResponse = await apiClient.get('/inventory-products');
    const apiProducts = apiResponse.body.data || [];

    // Verify each product on the page
    const pageProducts = await page.locator('.inventory_item').all();

    for (let i = 0; i < pageProducts.length; i++) {
      const productName = await pageProducts[i].locator('.inventory_item_name').textContent();
      const productPrice = await pageProducts[i].locator('.inventory_item_price').textContent();

      // Find matching API product
      const apiProduct = apiProducts.find(p => p.name === productName);
      if (apiProduct) {
        expect(productPrice).toContain(apiProduct.priceString);
      }
    }

    logger.testEnd('TC-104: Verify product prices match API', test.info(), 'pass');
  });

  test('TC-105: Performance check - page load under 2s', async ({ page }, testInfo) => {
    logger.testStart('TC-105: Performance check - page load', testInfo);

    const startTime = Date.now();
    // Navigate to inventory (already logged in from beforeEach)
    await page.goto('/inventory');

    // Wait for page to be ready
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Performance baseline: page should load under 2 seconds
    expect(loadTime).toBeLessThan(2000);

    // Attach performance metric to report
    testInfo.annotations?.push({
      type: 'performance',
      description: `Page load time: ${loadTime}ms`,
    });

    logger.testEnd('TC-105: Performance check - page load', testInfo, 'pass');
  });

  test('TC-106: Cross-browser verification - Chrome only', async ({ browser }) => {
    logger.testStart('TC-106: Cross-browser verification', test.info());

    const context = await browser.newContext();
    const page = await context.newPage();

    await loginPage.navigate();
    await loginPage.login(
      testUsers.standardUser.username,
      testUsers.standardUser.password
    );

    await page.waitForLoadState('networkidle');
    await expect(page.locator('span.title')).toHaveText('Products');

    await context.close();
    logger.testEnd('TC-106: Cross-browser verification', test.info(), 'pass');
  });
});