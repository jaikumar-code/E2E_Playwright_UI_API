"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
    testDir: './tests',
    timeout: 30000,
    expect: {
        timeout: 5000,
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 4 : undefined,
    reporter: [
        ['list'],
        ['html', {
                outputFolder: 'test-results/html',
                open: 'never',
            }],
        ['json', {
                outputFolder: 'test-results/json',
                compact: true,
                useTimestamps: true,
            }],
    ],
    use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        headless: process.env.CI === 'true',
        launchOptions: {
        // args: ['--start-maximized'],
        },
        // Device emulation
        viewport: null,
    },
    // Configure CI sharding
    projects: [
        {
            name: 'Chromium',
            use: {
                ...test_1.devices['Desktop Chrome'],
            },
        },
        {
            name: 'Firefox',
            use: {
                ...test_1.devices['Desktop Firefox'],
            },
        },
        {
            name: 'WebKit',
            use: {
                ...test_1.devices['Desktop Safari'],
            },
        },
        // Mobile devices
        {
            name: 'Pixel 2 XL',
            use: {
                ...test_1.devices['Pixel 2 XL'],
            },
        },
        {
            name: 'iPhone 12',
            use: {
                ...test_1.devices['iPhone 12'],
            },
        },
        // API project for non-UI tests
        {
            name: 'API',
            testMatch: '**/api/**/*.test.ts',
            use: {
                baseURL: process.env.API_BASE_URL || 'http://localhost:4000',
                trace: 'on',
                screenshot: 'off',
                video: 'off',
            },
        },
    ],
    // Shared test options
    testMatch: '**/*.test.ts',
    globalSetup: './tests/global-setup.ts',
    globalTeardown: './tests/global-teardown.ts',
});
