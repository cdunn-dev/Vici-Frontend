import { createAPIClient } from './client';

/**
 * Default API configuration
 */
const API_CONFIG = {
  // Default to a typical development environment API URL
  baseURL: process.env.API_URL || 'https://api.dev.example.com/v1',
  
  // Default timeout in milliseconds
  timeout: 10000,
};

/**
 * Create the default API client instance
 */
export const apiClient = createAPIClient(API_CONFIG.baseURL);

/**
 * Configure common error handling
 */
apiClient.addErrorInterceptor((error) => {
  // Log errors in development
  if (process.env.NODE_ENV !== 'production') {
    console.error('API Error:', error);
  }
  
  // Add custom error handling here
  // For example, you can check for specific error types
  if (error.status === 401) {
    // Handle unauthorized errors
    // For example, trigger logout or refresh token
    console.warn('Unauthorized request');
  }
  
  return error;
});

// Re-export the API client types
export type { APIClient } from './client';

// Export API services
export * from './services';

// Export API services as they are created
// export * from './services/userService';
// export * from './services/authService';
// export * from './services/trainingService'; 