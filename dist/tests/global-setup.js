"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIClient = void 0;
exports.default = globalSetup;
const base_1 = require("../src/api-clients/base");
Object.defineProperty(exports, "APIClient", { enumerable: true, get: function () { return base_1.APIClient; } });
const environment_1 = require("../src/config/environment");
async function globalSetup() {
    console.log('\n=== Global Setup Starting ===');
    console.log('Environment:', environment_1.env.isCI ? 'CI' : 'Local');
    console.log('Base URL:', environment_1.env.baseURL);
    console.log('API Base URL:', environment_1.env.apiBaseURL);
    // Initialize API client for global use
    const apiClient = new base_1.APIClient({
        baseURL: environment_1.env.apiBaseURL,
        timeout: 60000,
    });
    // Verify API is reachable
    try {
        const response = await apiClient.get('/health');
        console.log('API Health Check:', response.status === 200 ? 'PASS' : 'FAIL');
    }
    catch (error) {
        console.warn('API Health Check failed:', error.message);
        // Not fatal - tests may use mock APIs
    }
    console.log('=== Global Setup Complete ===\n');
}
