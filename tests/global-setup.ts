/**
 * Global Setup - Runs once before all tests
 * Initialize test resources, database connections, etc.
 */
import { test, expect } from '@playwright/test';
import { APIClient } from '../src/api-clients/base';
import { env } from '../src/config/environment';

export default async function globalSetup() {
  console.log('\n=== Global Setup Starting ===');
  console.log('Environment:', env.isCI ? 'CI' : 'Local');
  console.log('Base URL:', env.baseURL);
  console.log('API Base URL:', env.apiBaseURL);

  // Initialize API client for global use
  const apiClient = new APIClient({
    baseURL: env.apiBaseURL,
    timeout: 60000,
  });

  // Verify API is reachable
  try {
    const response = await apiClient.get('/health');
    console.log('API Health Check:', response.status === 200 ? 'PASS' : 'FAIL');
  } catch (error) {
    console.warn('API Health Check failed:', error.message);
    // Not fatal - tests may use mock APIs
  }

  console.log('=== Global Setup Complete ===\n');
}

// Export for programmatic access
export { APIClient };