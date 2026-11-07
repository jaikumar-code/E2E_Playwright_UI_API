"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForElement = waitForElement;
exports.waitForElementToDisappear = waitForElementToDisappear;
exports.fillField = fillField;
exports.safeClick = safeClick;
exports.safeHover = safeHover;
exports.selectDropdownOption = selectDropdownOption;
exports.getElementText = getElementText;
exports.assertURLContains = assertURLContains;
exports.assertURLEqual = assertURLEqual;
exports.captureFullScreenshot = captureFullScreenshot;
exports.elementExists = elementExists;
exports.waitForNetworkIdle = waitForNetworkIdle;
exports.getElementBoundingBox = getElementBoundingBox;
exports.dragAndDrop = dragAndDrop;
exports.scrollToElement = scrollToElement;
exports.wait = wait;
exports.retry = retry;
exports.assertNotPresent = assertNotPresent;
exports.waitForText = waitForText;
exports.clearStorage = clearStorage;
/**
 * Test Helpers - Reusable utilities for test scenarios
 * Provides common patterns for UI and API testing
 */
const test_1 = require("@playwright/test");
const environment_1 = require("../config/environment");
/**
 * Wait for a specific element to be visible
 */
async function waitForElement(page, locator, options = {}) {
    const { timeout = environment_1.env.timeout, visible = true } = options;
    await (0, test_1.expect)(page.locator(locator)).toBeVisible({
        timeout,
    });
}
/**
 * Wait for an element to disappear
 */
async function waitForElementToDisappear(page, locator, options = {}) {
    const { timeout = environment_1.env.timeout } = options;
    await (0, test_1.expect)(page.locator(locator)).not.toBeVisible({
        timeout,
    });
}
/**
 * Fill a form field with validation
 */
async function fillField(page, field, value, options = {}) {
    const { clear = true } = options;
    const input = page.locator(field);
    if (clear) {
        await input.clear();
    }
    await input.fill(value);
}
/**
 * Click an element with retry and error handling
 */
async function safeClick(page, locator, options = {}) {
    const { timeout = environment_1.env.timeout, force = false } = options;
    await page.locator(locator).click({
        timeout,
        force,
    });
}
/**
 * Hover over an element
 */
async function safeHover(page, locator, options = {}) {
    const { timeout = environment_1.env.timeout } = options;
    await page.hover(locator, { timeout });
}
/**
 * Select a dropdown option by visible text
 */
async function selectDropdownOption(page, dropdown, optionText, options = {}) {
    const { timeout = environment_1.env.timeout } = options;
    await page.selectOption(dropdown, { label: optionText, timeout });
}
/**
 * Get text from an element with timeout
 */
async function getElementText(page, locator, options) {
    const { timeout = environment_1.env.timeout } = options;
    const element = page.locator(locator);
    await (0, test_1.expect)(element).toBeVisible({ timeout });
    return element.textContent();
}
/**
 * Assert page URL contains expected path
 */
async function assertURLContains(page, expected, options = {}) {
    const { timeout = environment_1.env.timeout } = options;
    await (0, test_1.expect)(page).toHaveURL(new RegExp(`\/.*${expected}.*`), { timeout });
}
/**
 * Assert page URL matches exactly
 */
async function assertURLEqual(page, expected, options = {}) {
    const { timeout = environment_1.env.timeout } = options;
    await (0, test_1.expect)(page).toHaveURL(expected, { timeout });
}
/**
 * Take full page screenshot and attach
 */
async function captureFullScreenshot(page, name, testInfo) {
    await page.screenshot({
        path: `test-results/screenshots/${name}.png`,
        fullPage: true,
    });
    await testInfo?.attach(`screenshot-${name}`, {
        body: await page.screenshot({ path: `test-results/screenshots/${name}.png`, fullPage: true }),
        contentType: 'image/png',
    });
}
/**
 * Check if element exists (without failing)
 */
async function elementExists(page, locator, options) {
    const { timeout = environment_1.env.timeout } = options;
    try {
        await (0, test_1.expect)(page.locator(locator)).toBeVisible({ timeout });
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Wait for network to be idle
 */
async function waitForNetworkIdle(page, options) {
    const { idleTime = 500, timeout = environment_1.env.timeout } = options;
    await page.waitForLoadState('networkidle', { timeout });
    // Additional wait for any pending operations
    await new Promise(resolve => setTimeout(resolve, idleTime));
}
/**
 * Get bounding box of element
 */
async function getElementBoundingBox(page, locator) {
    const element = page.locator(locator);
    await (0, test_1.expect)(element).toBeVisible();
    return element.boundingBox();
}
/**
 * Drag and drop element
 */
async function dragAndDrop(page, fromLocator, toLocator, options = {}) {
    const { speed = 1000 } = options;
    const [element] = await Promise.all([
        page.locator(fromLocator).first(),
        page.locator(toLocator).first(),
    ]);
    await element.dragTo(element, { speed });
}
/**
 * Scroll element into view
 */
async function scrollToElement(page, locator, options = {}) {
    const { behavior = 'smooth' } = options;
    const element = page.locator(locator);
    await element.scrollIntoViewIfNeeded({ behavior });
}
/**
 * Wait for timeout duration
 */
async function wait(duration, message) {
    return new Promise(resolve => setTimeout(resolve, duration));
}
/**
 * Retry wrapper for flaky operations
 */
async function retry(fn, options = {}) {
    const { maxAttempts = 3, delay = 500, onAttempt, shouldRetry = (error) => error.name === 'TimeoutError', } = options;
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (onAttempt) {
                onAttempt(attempt, lastError);
            }
            if (!shouldRetry(lastError)) {
                throw lastError;
            }
            console.log(`[RETRY] Attempt ${attempt}/${maxAttempts} failed: ${lastError.message}`);
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
    throw lastError;
}
/**
 * Verify element is not present (useful for checking absence of error messages)
 */
async function assertNotPresent(page, locator, options = {}) {
    const { timeout = environment_1.env.timeout, message = 'Element should not be present' } = options;
    await (0, test_1.expect)(page.locator(locator)).not.toBeVisible({ timeout });
}
/**
 * Wait for specific text to appear in the page
 */
async function waitForText(page, text, options = {}) {
    const { timeout = environment_1.env.timeout, waitFor = 'visible' } = options;
    await page.waitForSelector(`:has-text("${text}")`, { timeout, state: waitFor });
}
/**
 * Clear localStorage and sessionStorage before test
 */
async function clearStorage(page) {
    await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
    });
}
