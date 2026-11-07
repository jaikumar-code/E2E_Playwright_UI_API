"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = exports.testOptions = void 0;
exports.logTestInfo = logTestInfo;
exports.assertElementVisible = assertElementVisible;
exports.assertElementNotVisible = assertElementNotVisible;
exports.attachScreenshot = attachScreenshot;
exports.attachVideoSnapshot = attachVideoSnapshot;
exports.waitForNetworkIdle = waitForNetworkIdle;
exports.getPageTitle = getPageTitle;
exports.handleDialog = handleDialog;
exports.compareScreenshot = compareScreenshot;
exports.withRetry = withRetry;
/**
 * Base Test Fixture
 * Provides shared test context, fixtures, and helper methods
 * All test files should extend this fixture
 */
const test_1 = require("@playwright/test");
const environment_1 = require("../config/environment");
Object.defineProperty(exports, "env", { enumerable: true, get: function () { return environment_1.env; } });
/**
 * Shared test options applied to all tests using this fixture
 */
exports.testOptions = {
    timeout: environment_1.env.timeout,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
};
/**
 * Log helper for test output
 */
function logTestInfo(message, testInfo) {
    console.log(`[TEST] ${message}`);
    if (testInfo) {
        console.log(`[TEST] - Test: ${testInfo.title}`);
        console.log(`[TEST] - Test file: ${testInfo.file}`);
        console.log(`[TEST] - Test action: ${testInfo.status}`);
    }
}
/**
 * Assert that an element is visible and interactable
 */
async function assertElementVisible(page, locator, options) {
    const element = page.locator(locator);
    await (0, test_1.expect)(element).toBeVisible({
        timeout: environment_1.env.timeout,
        ...options,
    });
}
/**
 * Assert that an element is not visible
 */
async function assertElementNotVisible(page, locator, options) {
    const element = page.locator(locator);
    await (0, test_1.expect)(element).not.toBeVisible({
        timeout: environment_1.env.timeout,
        ...options,
    });
}
/**
 * Take a screenshot and attach to test report
 */
async function attachScreenshot(page, name, testInfo) {
    const screenshot = await page.screenshot({
        path: `test-results/screenshots/${name}-${Date.now()}.png`,
        fullPage: true,
    });
    await testInfo?.attach(`screenshot-${name}`, {
        body: screenshot,
        contentType: 'image/png',
    });
}
/**
 * Take a video snapshot and attach to test report
 */
async function attachVideoSnapshot(page, name, testInfo) {
    if (page.video()) {
        const videoPath = await page.video().path();
        await testInfo?.attach(`video-${name}`, {
            body: await page.video().catch(() => null),
            contentType: 'video/webm',
        });
    }
}
/**
 * Wait for network idle (reduced)
 */
async function waitForNetworkIdle(page, options) {
    await page.waitForLoadState('networkidle', {
        timeout: options?.idleTime || environment_1.env.timeout,
    });
}
/**
 * Get page title with validation
 */
async function getPageTitle(page, expectedTitle) {
    const title = await page.title();
    await (0, test_1.expect)(page).toHaveTitle(expectedTitle);
    return title;
}
/**
 * Handle page dialogs (confirm, prompt, alert)
 */
async function handleDialog(page, callback, accept = true) {
    page.on('dialog', async (dialog) => {
        await callback(dialog);
        if (accept) {
            await dialog.accept();
        }
        else {
            await dialog.dismiss();
        }
    });
}
/**
 * Screenshot comparison utility
 */
async function compareScreenshot(page, name, options) {
    // This would integrate with pixelmatch for pixel comparison
    // For now, just capture and store
    await page.screenshot({ path: `test-results/screenshots/${name}-current.png` });
    return { changed: false, diffPixels: 0, totalPixels: 0 };
}
/**
 * Retry helper for flaky operations
 */
async function withRetry(operation, options = {}) {
    const { maxRetries = 3, delay = 1000, shouldRetry = (error) => error.name === 'TimeoutError', } = options;
    let lastError = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        }
        catch (error) {
            lastError = error;
            if (!shouldRetry(lastError)) {
                throw lastError;
            }
            console.log(`[RETRY] Attempt ${attempt}/${maxRetries} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
    throw lastError;
}
