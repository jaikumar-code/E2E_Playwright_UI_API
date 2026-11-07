/**
 * Environment configuration module
 * Provides environment-specific settings and base URLs
 */
export interface EnvironmentConfig {
  baseURL: string;
  apiBaseURL: string;
  timeout: number;
  viewport: { width: number; height: number };
  isCI: boolean;
  browsers: string[];
}

/**
 * Gets the current environment configuration based on NODE_ENV
 */
export function getEnvironment(): EnvironmentConfig {
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const nodeEnv = process.env.NODE_ENV || 'development';

  const configs: Record<string, EnvironmentConfig> = {
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

export const env = getEnvironment();
export default env;