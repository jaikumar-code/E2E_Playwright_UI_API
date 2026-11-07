"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Regression Test - Inventory Page
 * Full E2E test demonstrating the framework capabilities
 */
const test_1 = require("@playwright/test");
const base_1 = require("../src/api-clients/base");
const users_1 = require("../src/test-data/users");
const login_1 = require("../src/page-objects/login");
const logger_1 = require("../src/utils/logger");
const test_helpers_1 = require("../src/utils/test-helpers");
test_1.test.describe('Inventory Page Regression Tests', () => {
    test_1.test.beforeEach(async ({ page }) => {
        // Login before each test
        const loginPage = new login_1.LoginPage(page);
        await loginPage.navigate();
        await loginPage.login(users_1.testUsers.standardUser.username, users_1.testUsers.standardUser.password);
        await loginPage.verifyLoginSuccess();
    });
    (0, test_1.test)('TC-101: Verify inventory page loads correctly', async ({ page }) => {
        logger_1.logger.testStart('TC-101: Verify inventory page loads', test_1.test.info());
        await (0, test_1.expect)(page.locator('span.title')).toHaveText('Products');
        await (0, test_1.expect)(page.locator(By.tableRow(1))).toBeVisible();
        logger_1.logger.testEnd('TC-101: Verify inventory page loads', test_1.test.info(), 'pass');
    });
    (0, test_1.test)('TC-102: Add product to cart and verify', async ({ page }) => {
        logger_1.logger.testStart('TC-102: Add product to cart', test_1.test.info());
        // Add first product (Backpack) to cart
        await page.click(By.button('Add to cart'));
        await (0, test_helpers_1.waitForElement)(page, By.badge('1'), { timeout: 5000 });
        // Verify cart badge
        await (0, test_1.expect)(page.locator(By.badge('1'))).toBeVisible();
        // Capture screenshot
        await (0, test_helpers_1.captureFullScreenshot)(page, 'add-to-cart');
        logger_1.logger.testEnd('TC-102: Add product to cart', test_1.test.info(), 'pass');
    });
    (0, test_1.test)('TC-103: Remove product from cart', async ({ page }) => {
        logger_1.logger.testStart('TC-103: Remove product from cart', test_1.test.info());
        // Remove the item
        await page.click('button:has-text("Remove")');
        await (0, test_1.expect)(page.locator(By.badge('0'))).toBeVisible();
        logger_1.logger.testEnd('TC-103: Remove product from cart', test_1.test.info(), 'pass');
    });
    (0, test_1.test)('TC-104: Verify product prices match API', async () => {
        logger_1.logger.testStart('TC-104: Verify product prices match API', test_1.test.info());
        // Get products from API
        const apiResponse = await base_1.apiClient.get('/inventory-products');
        const apiProducts = apiResponse.body.data || [];
        // Verify each product on the page
        const pageProducts = await page.locator('.inventory_item').all();
        for (let i = 0; i < pageProducts.length; i++) {
            const productName = await pageProducts[i].locator('.inventory_item_name').textContent();
            const productPrice = await pageProducts[i].locator('.inventory_item_price').textContent();
            // Find matching API product
            const apiProduct = apiProducts.find(p => p.name === productName);
            if (apiProduct) {
                (0, test_1.expect)(productPrice).toContain(apiProduct.priceString);
            }
        }
        logger_1.logger.testEnd('TC-104: Verify product prices match API', test_1.test.info(), 'pass');
    });
    (0, test_1.test)('TC-105: Performance check - page load under 2s', async ({ page }, testInfo) => {
        logger_1.logger.testStart('TC-105: Performance check - page load', testInfo);
        const startTime = Date.now();
        // Navigate to inventory (already logged in from beforeEach)
        await page.goto('/inventory');
        // Wait for page to be ready
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        // Performance baseline: page should load under 2 seconds
        (0, test_1.expect)(loadTime).toBeLessThan(2000);
        // Attach performance metric to report
        testInfo.annotations?.push({
            type: 'performance',
            description: `Page load time: ${loadTime}ms`,
        });
        logger_1.logger.testEnd('TC-105: Performance check - page load', testInfo, 'pass');
    });
    (0, test_1.test)('TC-106: Cross-browser verification - Chrome only', async ({ browser }) => {
        logger_1.logger.testStart('TC-106: Cross-browser verification', test_1.test.info());
        const context = await browser.newContext();
        const page = await context.newPage();
        await loginPage.navigate();
        await loginPage.login(users_1.testUsers.standardUser.username, users_1.testUsers.standardUser.password);
        await page.waitForLoadState('networkidle');
        await (0, test_1.expect)(page.locator('span.title')).toHaveText('Products');
        await context.close();
        logger_1.logger.testEnd('TC-106: Cross-browser verification', test_1.test.info(), 'pass');
    });
});
