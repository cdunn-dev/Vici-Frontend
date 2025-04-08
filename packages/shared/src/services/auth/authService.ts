import { authService as apiAuthService, AuthResponse, LoginParams, RegisterParams } from '../api/services/authService';
import { tokenService } from './tokenService';
import { User } from '../api/services/userService';

/**
 * Auth service for handling authentication in the application
 */
export const authService = {
  /**
   * Sign in a user with email and password
   */
  signIn: async (params: LoginParams): Promise<User> => {
    try {
      // Call the API auth service
      const response = await apiAuthService.login(params);
      
      // Store tokens
      await tokenService.saveTokens(response.tokens);
      
      return response.user;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },
  
  /**
   * Register a new user
   */
  register: async (params: RegisterParams): Promise<User> => {
    try {
      // Call the API auth service
      const response = await apiAuthService.register(params);
      
      // Store tokens
      await tokenService.saveTokens(response.tokens);
      
      return response.user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  /**
   * Sign out the current user
   */
  signOut: async (): Promise<void> => {
    try {
      // Get the refresh token to send to the server
      const refreshToken = await tokenService.getRefreshToken();
      
      // Call the API auth service if we have a token
      if (refreshToken) {
        try {
          await apiAuthService.logout();
        } catch (error) {
          // We still want to continue with clearing tokens even if the API call fails
          console.warn('Error logging out from server:', error);
        }
      }
      
      // Clear tokens from storage
      await tokenService.clearTokens();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  },
  
  /**
   * Check if a user is currently authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    try {
      // Check if we have a valid access token
      const isValid = await tokenService.hasValidAccessToken();
      
      return isValid;
    } catch (error) {
      console.error('Authentication check error:', error);
      return false;
    }
  },
  
  /**
   * Get the current user if authenticated
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      // Check if user is authenticated
      const isAuthenticated = await authService.isAuthenticated();
      
      if (!isAuthenticated) {
        return null;
      }
      
      // Get the user from the API
      const { user } = await apiAuthService.getAuthStatus() as any; // TODO: Update API types
      
      return user || null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  /**
   * Request a password reset for an email
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      await apiAuthService.requestPasswordReset({ email });
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  },
  
  /**
   * Complete a password reset with token and new password
   */
  completePasswordReset: async (token: string, newPassword: string): Promise<void> => {
    try {
      await apiAuthService.completePasswordReset({ token, newPassword });
    } catch (error) {
      console.error('Complete password reset error:', error);
      throw error;
    }
  },
}; 