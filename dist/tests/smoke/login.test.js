"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Smoke Test - Login Page
 * Demonstrates the Page Object Model with the framework
 */
const test_1 = require("@playwright/test");
// Use absolute paths from project root
const base_1 = require("C:/Users/Jayakumar/E2E_Playwright_UI_API/src/api-clients/base");
const users_1 = require("C:/Users/Jayakumar/E2E_Playwright_UI_API/src/test-data/users");
const login_1 = require("C:/Users/Jayakumar/E2E_Playwright_UI_API/src/page-objects/login");
const logger_1 = require("C:/Users/Jayakumar/E2E_Playwright_UI_API/src/utils/logger");
test_1.test.describe('Login Page Smoke Tests', () => {
    (0, test_1.test)('TC-001: Standard user login success', async ({ page }) => {
        logger_1.logger.testStart('TC-001: Standard user login success', test_1.test.info());
        const loginPage = new login_1.LoginPage(page);
        await loginPage.navigate();
        await loginPage.login(users_1.testUsers.standardUser.username, users_1.testUsers.standardUser.password);
        await loginPage.verifyLoginSuccess();
        await loginPage.takeScreenshot('success');
        logger_1.logger.testEnd('TC-001: Standard user login success', test_1.test.info(), 'pass');
    });
    (0, test_1.test)('TC-002: Locked out user login failure', async ({ page }) => {
        logger_1.logger.testStart('TC-002: Locked out user login failure', test_1.test.info());
        const loginPage = new login_1.LoginPage(page);
        await loginPage.navigate();
        await loginPage.login(users_1.testUsers.lockedOutUser.username, users_1.testUsers.lockedOutUser.password);
        await loginPage.verifyLoginFailed();
        const errorMessage = await loginPage.getErrorMessage();
        (0, test_1.expect)(errorMessage).toContain('locked out');
        logger_1.logger.testEnd('TC-002: Locked out user login failure', test_1.test.info(), 'pass');
    });
    (0, test_1.test)('TC-003: API verification - login endpoint returns 200', async () => {
        logger_1.logger.testStart('TC-003: API verification - login endpoint', test_1.test.info());
        const response = await base_1.apiClient.post('/login', {
            username: users_1.testUsers.standardUser.username,
            password: users_1.testUsers.standardUser.password,
        });
        await base_1.apiClient.assertStatus(response, 200);
        await base_1.apiClient.assertResponseContains(response, 'success', true);
        logger_1.logger.testEnd('TC-003: API verification - login endpoint', test_1.test.info(), 'pass');
    });
});
