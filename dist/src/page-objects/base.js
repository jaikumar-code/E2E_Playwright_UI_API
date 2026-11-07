"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.By = exports.BasePage = void 0;
/**
 * Base Page Object
 * Provides common methods and locator patterns for all page objects
 */
const test_1 = require("@playwright/test");
const environment_1 = require("../config/environment");
const base_1 = require("../fixtures/base");
class BasePage {
    page;
    baseURL;
    constructor(page, baseURL) {
        this.page = page;
        this.baseURL = baseURL || environment_1.env.baseURL;
    }
    /**
     * Navigate to a page path
     */
    async goto(path, options) {
        const url = `${this.baseURL}${path.startsWith('/') ? path : '/' + path}`;
        await this.page.goto(url, {
            waitUntil: options?.waitUntil || 'domcontentloaded',
            timeout: environment_1.env.timeout,
        });
        // Wait for network to settle
        await this.page.waitForLoadState('networkidle', { timeout: environment_1.env.timeout });
    }
    /**
     * Get the current page title
     */
    async getTitle() {
        return this.page.title();
    }
    /**
     * Wait for page to be stable
     */
    async waitForStable() {
        await this.page.waitForLoadState('networkidle', { timeout: environment_1.env.timeout });
    }
    /**
     * Take screenshot and attach to report
     */
    async captureScreenshot(name) {
        await (0, base_1.attachScreenshot)(this.page, name);
    }
    /**
     * Get current URL
     */
    async getCurrentURL() {
        return this.page.url();
    }
    /**
     * Verify we're on the correct page
     */
    async verifyPageLoaded(headingText) {
        await (0, test_1.expect)(this.page.locator(`h1:has-text("${headingText}")`)).toBeVisible({
            timeout: environment_1.env.timeout,
        });
    }
}
exports.BasePage = BasePage;
/**
 * Common locator utilities
 */
exports.By = {
    // Button locators
    button: (textOrRole) => `button:has-text("${textOrRole}") || [role="button"]:has-text("${textOrRole}")`,
    link: (text) => `a:has-text("${text}")`,
    // Input locators
    input: (label) => label ? `input[aria-label="${label}"]` : 'input',
    // Form elements
    form: (formName) => formName ? `[name="${formName}"]` : 'form',
    // Table rows
    tableRow: (rowIndex) => `tr:nth-child(${rowIndex})`,
    // Badge/Status
    badge: (text) => `[data-badge="${text}"]`,
    // Error messages
    errorMessage: (field) => `.error-msg[data-field="${field}"]`,
    // Common patterns
    submitButton: 'button[type="submit"]',
    cancelButton: 'button:has-text("Cancel")',
    saveButton: 'button:has-text("Save")',
    deleteButton: 'button:has-text("Delete")',
    // Navigation
    sidebarNav: 'nav.sidebar',
    topNav: 'nav.top',
    // Section markers
    section: (sectionName) => `[data-section="${sectionName}"]`,
    // Status indicators
    loadingSpinner: '[data-testid="loading-spinner"], .loading, .spinner',
};
