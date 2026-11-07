/**
 * Test Helpers - Reusable utilities for test scenarios
 * Provides common patterns for UI and API testing
 */
import { test, expect, Page, TestInfo } from '@playwright/test';
import { By } from '../page-objects/base';
import { assertElementVisible, assertElementNotVisible } from '../fixtures/base';
import { env } from '../config/environment';

/**
 * Wait for a specific element to be visible
 */
export async function waitForElement(
  page: Page,
  locator: string,
  options: { timeout?: number; visible?: boolean } = {}
): Promise<void> {
  const { timeout = env.timeout, visible = true } = options;
  await expect(page.locator(locator)).toBeVisible({
    timeout,
  });
}

/**
 * Wait for an element to disappear
 */
export async function waitForElementToDisappear(
  page: Page,
  locator: string,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = env.timeout } = options;
  await expect(page.locator(locator)).not.toBeVisible({
    timeout,
  });
}

/**
 * Fill a form field with validation
 */
export async function fillField(
  page: Page,
  field: string,
  value: string,
  options: { clear?: boolean } = {}
): Promise<void> {
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
export async function safeClick(
  page: Page,
  locator: string,
  options: { timeout?: number; force?: boolean } = {}
): Promise<void> {
  const { timeout = env.timeout, force = false } = options;

  await page.locator(locator).click({
    timeout,
    force,
  });
}

/**
 * Hover over an element
 */
export async function safeHover(
  page: Page,
  locator: string,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = env.timeout } = options;
  await page.hover(locator, { timeout });
}

/**
 * Select a dropdown option by visible text
 */
export async function selectDropdownOption(
  page: Page,
  dropdown: string,
  optionText: string,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = env.timeout } = options;
  await page.selectOption(dropdown, { label: optionText, timeout });
}

/**
 * Get text from an element with timeout
 */
export async function getElementText(
  page: Page,
  locator: string,
  options: { timeout?: number }
): Promise<string | null> {
  const { timeout = env.timeout } = options;
  const element = page.locator(locator);
  await expect(element).toBeVisible({ timeout });
  return element.textContent();
}

/**
 * Assert page URL contains expected path
 */
export async function assertURLContains(
  page: Page,
  expected: string,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = env.timeout } = options;
  await expect(page).toHaveURL(new RegExp(`\/.*${expected}.*`), { timeout });
}

/**
 * Assert page URL matches exactly
 */
export async function assertURLEqual(
  page: Page,
  expected: string,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = env.timeout } = options;
  await expect(page).toHaveURL(expected, { timeout });
}

/**
 * Take screenshot and attach to test report
 */
export async function attachScreenshot(
  page: Page,
  name: string
): Promise<void> {
  const screenshot = await page.screenshot({
    path: `test-results/screenshots/${name}-${Date.now()}.png`,
    fullPage: true,
  });
  await page.testInfo?.attach(`screenshot-${name}`, {
    body: screenshot,
    contentType: 'image/png',
  });
}

/**
 * Take full page screenshot and attach
 */
export async function captureFullScreenshot(
  page: Page,
  name: string,
  testInfo: TestInfo
): Promise<void> {
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
export async function elementExists(
  page: Page,
  locator: string,
  options: { timeout?: number }
): Promise<boolean> {
  const { timeout = env.timeout } = options;
  try {
    await expect(page.locator(locator)).toBeVisible({ timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(
  page: Page,
  options: { idleTime?: number; timeout?: number }
): Promise<void> {
  const { idleTime = 500, timeout = env.timeout } = options;
  await page.waitForLoadState('networkidle', { timeout });
  // Additional wait for any pending operations
  await new Promise(resolve => setTimeout(resolve, idleTime));
}

/**
 * Get bounding box of element
 */
export async function getElementBoundingBox(
  page: Page,
  locator: string
): Promise<{ x: number; y: number; width: number; height: number } | null> {
  const element = page.locator(locator);
  await expect(element).toBeVisible();
  return element.boundingBox();
}

/**
 * Drag and drop element
 */
export async function dragAndDrop(
  page: Page,
  fromLocator: string,
  toLocator: string,
  options: { speed?: number } = {}
): Promise<void> {
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
export async function scrollToElement(
  page: Page,
  locator: string,
  options: { behavior?: 'auto' | 'smooth' } = {}
): Promise<void> {
  const { behavior = 'smooth' } = options;
  const element = page.locator(locator);
  await element.scrollIntoViewIfNeeded({ behavior });
}

/**
 * Wait for timeout duration
 */
export async function wait(
  duration: number,
  message?: string
): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, duration));
}

/**
 * Retry wrapper for flaky operations
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    onAttempt?: (attempt: number, error: Error) => void;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 500,
    onAttempt,
    shouldRetry = (error: Error) => error.name === 'TimeoutError',
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
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

  throw lastError!;
}

/**
 * Verify element is not present (useful for checking absence of error messages)
 */
export async function assertNotPresent(
  page: Page,
  locator: string,
  options: { timeout?: number; message?: string } = {}
): Promise<void> {
  const { timeout = env.timeout, message = 'Element should not be present' } = options;
  await expect(page.locator(locator)).not.toBeVisible({ timeout });
}

/**
 * Wait for specific text to appear in the page
 */
export async function waitForText(
  page: Page,
  text: string,
  options: { timeout?: number; waitFor?: 'visible' | 'hidden' } = {}
): Promise<void> {
  const { timeout = env.timeout, waitFor = 'visible' } = options;
  await page.waitForSelector(`:has-text("${text}")`, { timeout, state: waitFor });
}

/**
 * Clear localStorage and sessionStorage before test
 */
export async function clearStorage(
  page: Page
): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}