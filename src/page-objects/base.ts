/**
 * Base Page Object
 * Provides common methods and locator patterns for all page objects
 */
import { test, expect, Page } from '@playwright/test';
import { env } from '../config/environment';
import { assertElementVisible, assertElementNotVisible, attachScreenshot } from '../fixtures/base';

export class BasePage {
  protected page: Page;
  protected baseURL: string;

  constructor(page: Page, baseURL?: string) {
    this.page = page;
    this.baseURL = baseURL || env.baseURL;
  }

  /**
   * Navigate to a page path
   */
  async goto(path: string, options?: { waitUntil?: string }): Promise<void> {
    const url = `${this.baseURL}${path.startsWith('/') ? path : '/' + path}`;
    await this.page.goto(url, {
      waitUntil: options?.waitUntil || 'domcontentloaded',
      timeout: env.timeout,
    });
    // Wait for network to settle
    await this.page.waitForLoadState('networkidle', { timeout: env.timeout });
  }

  /**
   * Get the current page title
   */
  async getTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Wait for page to be stable
   */
  async waitForStable(): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout: env.timeout });
  }

  /**
   * Take screenshot and attach to report
   */
  async captureScreenshot(name: string): Promise<void> {
    await attachScreenshot(this.page, name);
  }

  /**
   * Get current URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Verify we're on the correct page
   */
  async verifyPageLoaded(headingText: string): Promise<void> {
    await expect(this.page.locator(`h1:has-text("${headingText}")`)).toBeVisible({
      timeout: env.timeout,
    });
  }
}

/**
 * Common locator utilities
 */
export const By = {
  // Button locators
  button: (textOrRole: string) =>
    `button:has-text("${textOrRole}") || [role="button"]:has-text("${textOrRole}")`,

  link: (text: string) => `a:has-text("${text}")`,

  // Input locators
  input: (label?: string) => label ? `input[aria-label="${label}"]` : 'input',

  // Form elements
  form: (formName?: string) => formName ? `[name="${formName}"]` : 'form',

  // Table rows
  tableRow: (rowIndex: number) => `tr:nth-child(${rowIndex})`,

  // Badge/Status
  badge: (text: string) => `[data-badge="${text}"]`,

  // Error messages
  errorMessage: (field: string) => `.error-msg[data-field="${field}"]`,

  // Common patterns
  submitButton: 'button[type="submit"]',
  cancelButton: 'button:has-text("Cancel")',
  saveButton: 'button:has-text("Save")',
  deleteButton: 'button:has-text("Delete")',

  // Navigation
  sidebarNav: 'nav.sidebar',
  topNav: 'nav.top',

  // Section markers
  section: (sectionName: string) => `[data-section="${sectionName}"]`,

  // Status indicators
  loadingSpinner: '[data-testid="loading-spinner"], .loading, .spinner',
};