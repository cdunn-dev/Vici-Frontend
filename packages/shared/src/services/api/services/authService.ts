import { apiClient } from '../index';
import { User } from './userService';

/**
 * Auth types
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  name: string;
}

export interface ResetPasswordParams {
  email: string;
}

export interface CompleteResetPasswordParams {
  token: string;
  newPassword: string;
}

export interface RefreshTokenParams {
  refreshToken: string;
}

/**
 * Auth API service for handling authentication-related requests
 */
export const authService = {
  /**
   * Login with email and password
   */
  login: async (params: LoginParams): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', params);
    return response.data;
  },

  /**
   * Register a new user
   */
  register: async (params: RegisterParams): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', params);
    return response.data;
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    return;
  },

  /**
   * Refresh authentication tokens
   */
  refreshTokens: async (params: RefreshTokenParams): Promise<AuthTokens> => {
    const response = await apiClient.post<AuthTokens>('/auth/refresh-token', params);
    return response.data;
  },

  /**
   * Request a password reset
   */
  requestPasswordReset: async (params: ResetPasswordParams): Promise<void> => {
    await apiClient.post('/auth/reset-password', params);
    return;
  },

  /**
   * Complete a password reset
   */
  completePasswordReset: async (params: CompleteResetPasswordParams): Promise<void> => {
    await apiClient.post('/auth/reset-password/complete', params);
    return;
  },

  /**
   * Verify email address
   */
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/verify-email', { token });
    return;
  },

  /**
   * Get the current authentication status
   */
  getAuthStatus: async (): Promise<{ isAuthenticated: boolean }> => {
    const response = await apiClient.get<{ isAuthenticated: boolean }>('/auth/status');
    return response.data;
  },
}; 