import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens, authService as apiAuthService, RefreshTokenParams } from '../api/services/authService';

// Storage keys
const ACCESS_TOKEN_KEY = '@vici/access-token';
const REFRESH_TOKEN_KEY = '@vici/refresh-token';
const TOKEN_EXPIRY_KEY = '@vici/token-expiry';

// Default token refresh buffer (5 minutes before expiry)
const TOKEN_REFRESH_BUFFER = 5 * 60 * 1000;

/**
 * Token service for managing authentication tokens
 */
export const tokenService = {
  /**
   * Save authentication tokens to secure storage
   */
  saveTokens: async (tokens: AuthTokens): Promise<void> => {
    try {
      await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, tokens.expiresAt.toString());
    } catch (error) {
      console.error('Error saving tokens:', error);
      throw new Error('Failed to save auth tokens');
    }
  },

  /**
   * Get the access token from storage
   */
  getAccessToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  /**
   * Get the refresh token from storage
   */
  getRefreshToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  },

  /**
   * Get the token expiry timestamp from storage
   */
  getTokenExpiry: async (): Promise<number | null> => {
    try {
      const expiry = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);
      return expiry ? parseInt(expiry, 10) : null;
    } catch (error) {
      console.error('Error getting token expiry:', error);
      return null;
    }
  },

  /**
   * Clear all tokens from storage
   */
  clearTokens: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
      await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
      await AsyncStorage.removeItem(TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Error clearing tokens:', error);
      throw new Error('Failed to clear auth tokens');
    }
  },

  /**
   * Check if the access token is still valid
   */
  hasValidAccessToken: async (): Promise<boolean> => {
    try {
      const [token, expiry] = await Promise.all([
        tokenService.getAccessToken(),
        tokenService.getTokenExpiry(),
      ]);

      if (!token || !expiry) {
        return false;
      }

      // Token is valid if it's not expired yet
      const isValid = expiry > Date.now();
      return isValid;
    } catch (error) {
      console.error('Error checking token validity:', error);
      return false;
    }
  },

  /**
   * Check if the access token needs refreshing
   */
  needsRefresh: async (): Promise<boolean> => {
    try {
      const expiry = await tokenService.getTokenExpiry();

      if (!expiry) {
        return false;
      }

      // Token needs refresh if it's close to expiry
      const needsRefresh = expiry - Date.now() < TOKEN_REFRESH_BUFFER;
      return needsRefresh;
    } catch (error) {
      console.error('Error checking if token needs refresh:', error);
      return false;
    }
  },

  /**
   * Refresh the access token using the refresh token
   */
  refreshTokens: async (): Promise<boolean> => {
    try {
      const refreshToken = await tokenService.getRefreshToken();

      if (!refreshToken) {
        return false;
      }

      // Call the API to refresh the token
      const newTokens = await apiAuthService.refreshTokens({ refreshToken });

      // Save the new tokens
      await tokenService.saveTokens(newTokens);

      return true;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return false;
    }
  },

  /**
   * Get the access token, refreshing if necessary
   */
  getValidAccessToken: async (): Promise<string | null> => {
    try {
      // Check if token needs refreshing
      const needsRefresh = await tokenService.needsRefresh();

      if (needsRefresh) {
        const refreshSuccess = await tokenService.refreshTokens();
        if (!refreshSuccess) {
          // Failed to refresh token
          return null;
        }
      }

      // Get the possibly refreshed access token
      return await tokenService.getAccessToken();
    } catch (error) {
      console.error('Error getting valid access token:', error);
      return null;
    }
  },
}; 