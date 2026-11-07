/**
 * Performance Tests - Baseline metrics and threshold checks
 * Performance testing for the test automation practice blog site
 */
import { test, expect } from '@playwright/test';
import { logger } from '../../src/utils/logger';

test.describe('Performance Tests', () => {
  // Performance baselines configuration
  const PERFORMANCE_BASELINES = {
    pageLoad: { max: 3000, warning: 2000 }, // ms
    elementRender: { max: 500, warning: 200 }, // ms
    screenshotCapture: { max: 1000, warning: 500 }, // ms
    userJourney: { max: 5000, warning: 3000 }, // ms
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

  test('PERF-002: Viewport resize performance', async ({ page }, testInfo) => {
    logger.testStart('PERF-002: Viewport resize', testInfo);

    await page.setViewportSize({ width: 1920, height: 1080 });

    const startTime = Date.now();
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.waitForLoadState('networkidle');
    const resizeTime = Date.now() - startTime;

    const baseline = PERFORMANCE_BASELINES.elementRender;
    console.log(`Viewport resize time: ${resizeTime}ms (baseline: max ${baseline.max}ms)`);

    expect(resizeTime).toBeLessThan(baseline.max);
    logger.testEnd('PERF-002: Viewport resize', testInfo, 'pass');
  });

  test('PERF-003: Critical user journey timing', async ({ page }, testInfo) => {
    logger.testStart('PERF-003: Critical user journey', testInfo);

    const journeyMetrics: Record<string, number> = {};

    // Measure navigation to inventory page
    const navStart = Date.now();
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    journeyMetrics.navigation = Date.now() - navStart;

    // Wait for post titles to load
    const contentStart = Date.now();
    await expect(page.locator('h3.post-title')).toBeVisible();
    journeyMetrics.contentLoad = Date.now() - contentStart;

    console.log('Journey metrics:', journeyMetrics);

    // All journey steps should complete under 5 seconds
    expect(journeyMetrics.navigation).toBeLessThan(5000);
    expect(journeyMetrics.contentLoad).toBeLessThan(5000);

    // Attach journey metrics to report
    testInfo.annotations?.push({
      type: 'performance',
      description: `Journey: navigation=${journeyMetrics.navigation}ms, contentLoad=${journeyMetrics.contentLoad}ms`,
    });

    logger.testEnd('PERF-003: Critical user journey', testInfo, 'pass');
  });

  test('PERF-004: Mobile page load performance', async ({ page }, testInfo) => {
    logger.testStart('PERF-004: Mobile page load', testInfo);

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const startTime = Date.now();
    await page.goto('/inventory');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    const baseline = PERFORMANCE_BASELINES.pageLoad;
    console.log(`Mobile page load time: ${loadTime}ms (baseline: max ${baseline.max}ms)`);

    // Mobile should also meet baseline (may have different max)
    expect(loadTime).toBeLessThan(baseline.max * 1.5); // 50% tolerance for mobile

    // Attach metric to report
    testInfo.annotations?.push({
      type: 'performance',
      description: `Mobile page load time: ${loadTime}ms`,
    });

    logger.testEnd('PERF-004: Mobile page load performance', testInfo, 'pass');
  });
});