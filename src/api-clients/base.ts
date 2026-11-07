/**
 * Base API Client
 * Provides common methods for API testing with typed responses
 */
import { test, expect } from '@playwright/test';
import { env } from '../config/environment';

export interface APIResponse<T = any> {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: T;
  duration: number;
}

export interface APIClientOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

export class APIClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private withCredentials: boolean;

  constructor(options: APIClientOptions = {}) {
    this.baseURL = options.baseURL || env.apiBaseURL;
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
  async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    options: {
      body?: any;
      headers?: Record<string, string>;
      params?: Record<string, string | number>;
    } = {}
  ): Promise<APIResponse<T>> {
    const url = new URL(endpoint, this.baseURL).toString();
    const requestOptions: any = {
      method,
      timeout: this.timeout,
      failOnStatusCode: false,
    };

    // Add headers
    const headers: Record<string, string> = {
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

    let response: Response;

    // Use Playwright's request API if available (within test), otherwise fetch
    if (this.page?.request) {
      response = await this.page?.request?.request?.(requestOptions);
    } else {
      try {
        response = await fetch(url, requestOptions as RequestInit);
      } catch (error) {
        // Fetch failed (no real API) - return a mock response
        return {
          status: 0,
          statusText: 'Fetch Failed',
          headers: {},
          body: {},
          duration: 0,
        };
      }
    }

    const responseBody = (await response.clone().json()) as T;
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
  async get<T = any>(
    endpoint: string,
    options: { params?: Record<string, string | number>; headers?: Record<string, string> } = {}
  ): Promise<APIResponse<T>> {
    return this.request<T>('GET', endpoint, { params: options.params, headers: options.headers });
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    body: any,
    options: { headers?: Record<string, string> } = {}
  ): Promise<APIResponse<T>> {
    return this.request<T>('POST', endpoint, { body, headers: options.headers });
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    body: any,
    options: { headers?: Record<string, string> } = {}
  ): Promise<APIResponse<T>> {
    return this.request<T>('PUT', endpoint, { body, headers: options.headers });
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options: { params?: Record<string, string | number>; headers?: Record<string, string> } = {}
  ): Promise<APIResponse<T>> {
    return this.request<T>('DELETE', endpoint, { params: options.params, headers: options.headers });
  }

  /**
   * Verify response status code
   */
  async assertStatus(response: APIResponse<any>, expectedStatus: number): Promise<void> {
    if (response.status !== expectedStatus) {
      throw new Error(
        `Expected status ${expectedStatus}, got ${response.status}. ` +
        `Body: ${JSON.stringify(response.body)}`
      );
    }
  }

  /**
   * Verify response contains expected data
   */
  async assertResponseContains<T>(
    response: APIResponse<T>,
    key: keyof T,
    value: any
  ): Promise<void> {
    if (response.body[key] !== value) {
      throw new Error(
        `Expected ${String(key)} to be ${value}, got ${String(response.body[key])}`
      );
    }
  }
}

export const apiClient = new APIClient();