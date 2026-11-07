/**
 * Test Data - User fixtures and data models
 * Centralized test data for reuse across tests
 */

export interface UserCredentials {
  username: string;
  password: string;
  role?: 'admin' | 'user' | 'guest';
}

export interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

/**
 * Predefined user credentials for different test scenarios
 */
export const testUsers: Record<string, UserCredentials> = {
  standardUser: {
    username: 'standard_user',
    password: 'secret_sauce',
    role: 'standard',
  },
  lockedOutUser: {
    username: 'locked_out_user',
    password: 'secret_sauce',
    role: 'standard',
  },
  problemUser: {
    username: 'problem_user',
    password: 'secret_sauce',
    role: 'standard',
  },
  performanceGlitchUser: {
    username: 'performance_glitch_user',
    password: 'secret_sauce',
    role: 'standard',
  },
  errorUser: {
    username: 'error_user',
    password: 'secret_sauce',
    role: 'standard',
  },
  visualUser: {
    username: 'visual_user',
    password: 'secret_sauce',
    role: 'standard',
  },
  audioUser: {
    username: 'audio_user',
    password: 'secret_sauce',
    role: 'standard',
  },
  standardUserAdmin: {
    username: 'standard_user',
    password: 'secret_sauce',
    role: 'admin',
  },
};

/**
 * Test product data for inventory page
 */
export interface ProductData {
  id: string;
  name: string;
  description: string;
  price: number;
  priceString: string;
  inventoryCount: number;
}

export const sampleProducts: Record<string, ProductData> = {
  backpack: {
    id: '1',
    name: 'Backpack',
    description: 'USB-powered charger',
    price: 29.99,
    priceString: '$29.99',
    inventoryCount: 6,
  },
  bikeLight: {
    id: '2',
    name: 'Bike Light',
    description: 'Ultra bright LED bike light',
    price: 18.99,
    priceString: '$18.99',
    inventoryCount: 4,
  },
  fleeceJacket: {
    id: '3',
    name: 'Fleece Jacket',
    description: 'Warm fleece jacket for outdoor activities',
    price: 49.99,
    priceString: '$49.99',
    inventoryCount: 2,
  },
  onesie: {
    id: '4',
    name: 'Onesie',
    description: 'Onesie for the little one in your life',
    price: 7.99,
    priceString: '$7.99',
    inventoryCount: 12,
  },
  onesieBlue: {
    id: '5',
    name: 'Onesie Blue',
    description: 'Onesie for the little one in your life',
    price: 7.99,
    priceString: '$7.99',
    inventoryCount: 12,
  },
};

/**
 * Test data for API fixtures
 */
export interface APIEndpointData {
  method: string;
  endpoint: string;
  expectedStatus: number;
  expectedBodyKeys?: string[];
}

/**
 * Common API response fixtures
 */
export const apiFixtures = {
  successResponse: {
    status: 200,
    success: true,
  },
  notFoundResponse: {
    status: 404,
    success: false,
    error: 'Not Found',
  },
  validationErrorResponse: {
    status: 400,
    success: false,
    error: 'Validation Error',
  },
  serverErrorResponse: {
    status: 500,
    success: false,
    error: 'Internal Server Error',
  },
};