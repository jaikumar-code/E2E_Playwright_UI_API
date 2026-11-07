"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = exports.APIClient = void 0;
const environment_1 = require("../config/environment");
class APIClient {
    baseURL;
    timeout;
    defaultHeaders;
    withCredentials;
    constructor(options = {}) {
        this.baseURL = options.baseURL || environment_1.env.apiBaseURL;
        this.timeout = options.timeout || 30000;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        this.withCredentials = options.withCredentials || false;
    }
    /**
     * Request method - handles all HTTP methods
     */
    async request(method, endpoint, options = {}) {
        const url = new URL(endpoint, this.baseURL).toString();
        const requestOptions = {
            method,
            timeout: this.timeout,
            failOnStatusCode: false,
        };
        // Add headers
        const headers = {
            ...this.defaultHeaders,
            ...options.headers,
        };
        requestOptions.headers = headers;
        // Add body if provided
        if (options.body) {
            requestOptions.data = JSON.stringify(options.body);
        }
        // Add query parameters
        if (options.params) {
            const searchParams = new URLSearchParams();
            Object.entries(options.params).forEach(([key, value]) => {
                searchParams.append(key, String(value));
            });
            const separator = url.includes('?') ? '&' : '?';
            requestOptions.url = `${url}${separator}${searchParams.toString()}`;
        }
        const response = await this.page?.request?.request?.(requestOptions) ||
            await fetch(url, requestOptions);
        const responseBody = (await response.clone().json());
        const duration = response.timing?.requestStart
            ? response.timing.requestStart - response.timing.start
            : 0;
        return {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: responseBody,
            duration,
        };
    }
    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request('GET', endpoint, { params: options.params, headers: options.headers });
    }
    /**
     * POST request
     */
    async post(endpoint, body, options = {}) {
        return this.request('POST', endpoint, { body, headers: options.headers });
    }
    /**
     * PUT request
     */
    async put(endpoint, body, options = {}) {
        return this.request('PUT', endpoint, { body, headers: options.headers });
    }
    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request('DELETE', endpoint, { params: options.params, headers: options.headers });
    }
    /**
     * Verify response status code
     */
    async assertStatus(response, expectedStatus) {
        if (response.status !== expectedStatus) {
            throw new Error(`Expected status ${expectedStatus}, got ${response.status}. ` +
                `Body: ${JSON.stringify(response.body)}`);
        }
    }
    /**
     * Verify response contains expected data
     */
    async assertResponseContains(response, key, value) {
        if (response.body[key] !== value) {
            throw new Error(`Expected ${String(key)} to be ${value}, got ${String(response.body[key])}`);
        }
    }
}
exports.APIClient = APIClient;
exports.apiClient = new APIClient();
