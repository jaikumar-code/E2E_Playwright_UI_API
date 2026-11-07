"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginPage = void 0;
/**
 * Login Page Object
 * Example page object for a login page
 */
const test_1 = require("@playwright/test");
const base_1 = require("./base");
const base_2 = require("./base");
const environment_1 = require("../config/environment");
class LoginPage extends base_1.BasePage {
    /**
     * Page identifiers
     */
    USERNAME_INPUT = 'input[name="username"]';
    PASSWORD_INPUT = 'input[name="password"]';
    SUBMIT_BUTTON = 'button[type="submit"]';
    FORGOT_PASSWORD_LINK = 'a:has-text("Forgot password")';
    constructor(page) {
        super(page);
    }
    /**
     * Navigate to the login page
     */
    async navigate() {
        await this.goto('/login');
        return this;
    }
    /**
     * Login with valid credentials
     */
    async login(username, password) {
        await this.page.fill(this.USERNAME_INPUT, username);
        await this.page.fill(this.PASSWORD_INPUT, password);
        await this.page.click(this.SUBMIT_BUTTON);
        await this.waitForStable();
        return this;
    }
    /**
     * Verify login was successful
     */
    async verifyLoginSuccess() {
        await (0, test_1.expect)(this.page).toHaveTitle(/Dashboard/);
        await (0, test_1.expect)(this.page.locator(base_2.By.button('Logout'))).toBeVisible({
            timeout: environment_1.env.timeout,
        });
        return this;
    }
    /**
     * Verify login failed
     */
    async verifyLoginFailed() {
        await (0, test_1.expect)(this.page.locator('[role="alert"]')).toBeVisible({
            timeout: environment_1.env.timeout,
        });
        return this;
    }
    /**
     * Get the error message
     */
    async getErrorMessage() {
        return this.page.locator('[role="alert"]').textContent() || '';
    }
    /**
     * Take screenshot
     */
    async takeScreenshot(name) {
        await (0, environment_1.attachScreenshot)(this.page, `login-${name}`);
    }
}
exports.LoginPage = LoginPage;
