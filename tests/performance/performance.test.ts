/**
 * Performance Test - Baseline metrics and threshold checks
 * Lightweight performance testing in the pipeline
 */
import { test, expect } from '@playwright/test';
import { logger } from '../src/utils/logger';

test.describe('Performance Tests', () => {
  // Performance baselines configuration
  const PERFORMANCE_BASELINES = {
    pageLoad: { max: 3000, warning: 2000 }, // ms
    apiResponse: { max: 500, warning: 200 }, // ms
    elementRender: { max: 500, warning: 200 }, // ms
    screenshotCapture: { max: 1000, warning: 500 }, // ms
  };

  test('PERF-001: Page load time under baseline', async ({ page }, testInfo) => {
    logger.testStart('PERF-001: Page load time', testInfo);

    const startTime = Date.now();
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    const baseline = PERFORMANCE_BASELINES.pageLoad;
    console.log(`Page load time: ${loadTime}ms (baseline: max ${baseline.max}ms, warning ${baseline.warning}ms)`);

    // Fail if over critical baseline
    expect(loadTime).toBeLessThan(baseline.max);

    // Warning if over warning threshold (can be logged but not fail)
    if (loadTime > baseline.warning) {
      testInfo.annotations?.push({
        type: 'performance-warning',
        description: `Page load time ${loadTime}ms exceeds warning threshold of ${baseline.warning}ms`,
      });
    }

    logger.testEnd('PERF-001: Page load time', testInfo, 'pass');
  });

  test('PERF-002: API response time under baseline', async () => {
    logger.testStart('PERF-002: API response time', testInfo);

    const startTime = Date.now();
    const response = await fetch('http://localhost:4000/api/users');
    const duration = Date.now() - startTime;

    const baseline = PERFORMANCE_BASELINES.apiResponse;
    console.log(`API response time: ${duration}ms (baseline: max ${baseline.max}ms)`);

    expect(duration).toBeLessThan(baseline.max);
    logger.testEnd('PERF-002: API response time', testInfo, 'pass');
  });

  test('PERF-003: Viewport resize performance', async ({ page }) => {
    logger.testStart('PERF-003: Viewport resize', testInfo);

    await page.setViewportSize({ width: 1920, height: 1080 });

    const startTime = Date.now();
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.waitForLoadState('networkidle');
    const resizeTime = Date.now() - startTime;

    const baseline = PERFORMANCE_BASELINES.elementRender;
    console.log(`Viewport resize time: ${resizeTime}ms (baseline: max ${baseline.max}ms)`);

    expect(resizeTime).toBeLessThan(baseline.max);
    logger.testEnd('PERF-003: Viewport resize', testInfo, 'pass');
  });

  test('PERF-004: Critical user journey timing', async ({ page }) => {
    logger.testStart('PERF-004: Critical user journey', testInfo);

    const journeyMetrics: Record<string, number> = {};

    // Measure login journey
    const loginStart = Date.now();
    await page.goto('/login');
    await page.fill('input[name="username"]', 'standard_user');
    await page.fill('input[name="password"]', 'secret_sauce');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    journeyMetrics.login = Date.now() - loginStart;

    // Measure product page load
    const productStart = Date.now();
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    journeyMetrics.productPage = Date.now() - productStart;

    console.log('Journey metrics:', journeyMetrics);

    // All journey steps should complete under 5 seconds
    expect(journeyMetrics.login).toBeLessThan(5000);
    expect(journeyMetrics.productPage).toBeLessThan(5000);

    logger.testEnd('PERF-004: Critical user journey', testInfo, 'pass');
  });
});