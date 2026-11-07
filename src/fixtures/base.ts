/**
 * Base Test Fixture
 * Provides shared test context, fixtures, and helper methods
 * All test files should extend this fixture
 */
import { test, expect, Page, TestInfo } from '@playwright/test';
import { env } from '../config/environment';

/**
 * Shared test options applied to all tests using this fixture
 */
export const testOptions = {
  timeout: env.timeout,
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
};

/**
 * Log helper for test output
 */
export function logTestInfo(message: string, testInfo?: TestInfo): void {
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
export async function assertElementVisible(
  page: Page,
  locator: string | Parameters<typeof page.locator>[0],
  options?: { message?: string }
): Promise<void> {
  const element = page.locator(locator);
  await expect(element).toBeVisible({
    timeout: env.timeout,
    ...options,
  });
}

/**
 * Assert that an element is not visible
 */
export async function assertElementNotVisible(
  page: Page,
  locator: string | Parameters<typeof page.locator>[0],
  options?: { message?: string }
): Promise<void> {
  const element = page.locator(locator);
  await expect(element).not.toBeVisible({
    timeout: env.timeout,
    ...options,
  });
}

/**
 * Take a screenshot and attach to test report
 */
export async function attachScreenshot(
  page: Page,
  name: string,
  testInfo: TestInfo
): Promise<void> {
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
export async function attachVideoSnapshot(
  page: Page,
  name: string,
  testInfo: TestInfo
): Promise<void> {
  if (page.video()) {
    const videoPath = await page.video()!.path();
    await testInfo?.attach(`video-${name}`, {
      body: await page.video()!.catch(() => null),
      contentType: 'video/webm',
    });
  }
}

/**
 * Wait for network idle (reduced)
 */
export async function waitForNetworkIdle(
  page: Page,
  options?: { idleTime?: number }
): Promise<void> {
  await page.waitForLoadState('networkidle', {
    timeout: options?.idleTime || env.timeout,
  });
}

/**
 * Get page title with validation
 */
export async function getPageTitle(page: Page, expectedTitle: string): Promise<string> {
  const title = await page.title();
  await expect(page).toHaveTitle(expectedTitle);
  return title;
}

/**
 * Handle page dialogs (confirm, prompt, alert)
 */
export async function handleDialog(
  page: Page,
  callback: (dialog: any) => void,
  accept: boolean = true
): Promise<void> {
  page.on('dialog', async (dialog) => {
    await callback(dialog);
    if (accept) {
      await dialog.accept();
    } else {
      await dialog.dismiss();
    }
  });
}

/**
 * Screenshot comparison utility
 */
export async function compareScreenshot(
  page: Page,
  name: string,
  options?: { threshold?: number }
): Promise<{
  changed: boolean;
  diffPixels: number;
  totalPixels: number;
}> {
  // This would integrate with pixelmatch for pixel comparison
  // For now, just capture and store
  await page.screenshot({ path: `test-results/screenshots/${name}-current.png` });
  return { changed: false, diffPixels: 0, totalPixels: 0 };
}

/**
 * Retry helper for flaky operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    shouldRetry?: (error: Error) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    shouldRetry = (error: Error) => error.name === 'TimeoutError',
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (!shouldRetry(lastError)) {
        throw lastError;
      }
      console.log(`[RETRY] Attempt ${attempt}/${maxRetries} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError!;
}

export { env };