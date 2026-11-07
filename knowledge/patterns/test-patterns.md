# Reusable Test Patterns

## Pattern 1: Login Test Pattern
**Description:** Standard login test with valid credentials and dashboard verification
**Framework:** Playwright TypeScript with Page Object Model

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login';

test('User can login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.navigate();
  await loginPage.login('standard_user', 'secret_sauce');
  await loginPage.verifyLoginSuccess();
});
```

**Key Elements:**
- Use Page Object for login interactions
- Low-level credentials from test data module
- Verification of success state
- Screenshot on completion

## Pattern 2: Inventory Test Pattern
**Description:** Test inventory page product verification and cart operations
**Framework:** Playwright TypeScript with Page Object Model

```typescript
test('Add product to cart and verify', async ({ page }) => {
  // From beforeEach: already logged in
  
  // Add product to cart
  await page.click('[data-testid="add-to-cart"]');
  
  // Verify cart badge
  await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  
  // Capture evidence
  await page.screenshot({ path: 'add-to-cart.png' });
});
```

**Key Elements:**
- Assume pre-condition (login) handled in beforeEach
- Data-testid attributes for stable locators
- Assertion on cart state
- Screenshot for evidence

## Pattern 3: API Test Pattern
**Description:** Standard API test with status validation and response schema check
**Framework:** API Client with typed responses

```typescript
test('API returns expected data structure', async () => {
  const response = await apiClient.get('/inventory-products');
  
  // Status validation
  await apiClient.assertStatus(response, 200);
  
  // Schema validation
  await expect(response.body.data).toHaveLength(6);
  
  // Key presence validation
  response.body.data.forEach((product: any) => {
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
  });
});
```

**Key Elements:**
- Use typed API client
- Status code assertion
- Response body validation
- Iterative schema checks

## Pattern 4: Accessibility Test Pattern
**Description:** Run axe-core accessibility audit and report violations
**Framework:** Playwright with axe-core integration

```typescript
test('Page has no critical accessibility violations', async ({ page }) => {
  await page.goto('/inventory');
  
  const results = await page.evaluate(async () => {
    return await window.axe.run();
  });
  
  const violations = results.violations.filter(
    (v: any) => v.level >= 2
  );
  
  expect(violations.length).toBe(0);
  
  // Report violations if any
  if (violations.length > 0) {
    console.log('Accessibility violations:', violations);
  }
});
```

**Key Elements:**
- Run axe-core via page.evaluate
- Filter by severity level
- Report and fail on violations
- Log for debugging

## Pattern 5: Performance Test Pattern
**Description:** Measure and validate page load performance
**Framework:** Playwright test metrics

```typescript
test('Page load time under baseline', async ({ page }, testInfo) => {
  const startTime = Date.now();
  await page.goto('/inventory');
  await page.waitForLoadState('networkidle');
  const loadTime = Date.now() - startTime;
  
  const baseline = { max: 3000, warning: 2000 };
  expect(loadTime).toBeLessThan(baseline.max);
  
  if (loadTime > baseline.warning) {
    testInfo.annotations.push({
      type: 'performance-warning',
      description: `Load time ${loadTime}ms exceeds warning threshold`,
    });
  }
});
```

**Key Elements:**
- Measure from navigation to network idle
- Compare against baselines
- Add annotations for warnings (not failures)
- Log metrics for trend analysis