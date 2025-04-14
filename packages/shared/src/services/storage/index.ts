/**
 * Export storage services
 */
export * from './storageService';
export * from './cacheService';

/**
 * Storage service for managing tokens and user data
 */

// Storage keys
const AUTH_TOKEN_KEY = 'vici_auth_token';
const REFRESH_TOKEN_KEY = 'vici_refresh_token';
const USER_DATA_KEY = 'vici_user_data';

/**
 * Set authentication token in storage
 * @param token Authentication token
 */
export const setAuthToken = (token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store auth token:', error);
  }
};

/**
 * Get authentication token from storage
 * @returns Authentication token or null if not found
 */
export const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get auth token:', error);
    return null;
  }
};

/**
 * Remove authentication token from storage
 */
export const removeAuthToken = (): void => {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove auth token:', error);
  }
};

/**
 * Set refresh token in storage
 * @param token Refresh token
 */
export const setRefreshToken = (token: string): void => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store refresh token:', error);
  }
};

/**
 * Get refresh token from storage
 * @returns Refresh token or null if not found
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get refresh token:', error);
    return null;
  }
};

/**
 * Remove refresh token from storage
 */
export const removeRefreshToken = (): void => {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove refresh token:', error);
  }
};

/**
 * Set user data in storage
 * @param data User data object
 */
export const setUserData = <T>(data: T): void => {
  try {
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
};

/**
 * Get user data from storage
 * @returns Parsed user data or null if not found
 */
export const getUserData = <T>(): T | null => {
  try {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) as T : null;
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};

/**
 * Remove user data from storage
 */
export const removeUserData = (): void => {
  try {
    localStorage.removeItem(USER_DATA_KEY);
  } catch (error) {
    console.error('Failed to remove user data:', error);
  }
};

/**
 * Clear all authentication related data from storage
 */
export const clearAuthData = (): void => {
  removeAuthToken();
  removeRefreshToken();
  removeUserData();
};

/**
 * Check if user is authenticated
 * @returns True if the auth token exists
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
}; 