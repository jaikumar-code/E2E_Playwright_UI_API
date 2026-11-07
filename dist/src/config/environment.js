"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
exports.getEnvironment = getEnvironment;
/**
 * Gets the current environment configuration based on NODE_ENV
 */
function getEnvironment() {
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
    const nodeEnv = process.env.NODE_ENV || 'development';
    const configs = {
        development: {
            baseURL: 'http://localhost:3000',
            apiBaseURL: 'http://localhost:4000',
            timeout: 30000,
            viewport: { width: 1920, height: 1080 },
            isCI: false,
            browsers: ['chromium', 'firefox', 'webkit'],
        },
        staging: {
            baseURL: 'https-staging.example.com',
            apiBaseURL: 'https-staging-api.example.com',
            timeout: 60000,
            viewport: { width: 1920, height: 1080 },
            isCI: false,
            browsers: ['chromium'],
        },
        production: {
            baseURL: 'https://example.com',
            apiBaseURL: 'https://api.example.com',
            timeout: 120000,
            viewport: { width: 1920, height: 1080 },
            isCI: false,
            browsers: ['chromium', 'firefox', 'webkit'],
        },
    };
    const config = configs[nodeEnv] || configs.development;
    // Override baseURL if explicitly provided
    if (process.env.BASE_URL) {
        config.baseURL = process.env.BASE_URL;
    }
    if (process.env.API_BASE_URL) {
        config.apiBaseURL = process.env.API_BASE_URL;
    }
    return config;
}
exports.env = getEnvironment();
exports.default = exports.env;
