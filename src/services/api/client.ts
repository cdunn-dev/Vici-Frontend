import axios from 'axios';
import { env } from '../../config/env';
import { securityConfig } from '../../config/security';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const apiClient = axios.create({
  baseURL: env.API_URL,
  timeout: env.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': securityConfig.headers.frameOptions,
    'X-XSS-Protection': securityConfig.headers.xssProtection,
    'Referrer-Policy': securityConfig.headers.referrerPolicy,
    'Content-Security-Policy': securityConfig.headers.contentSecurityPolicy,
  },
  withCredentials: securityConfig.cors.allowCredentials,
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(env.AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear the auth token
      await AsyncStorage.removeItem(env.AUTH_TOKEN_KEY);
      // You might want to trigger a logout action here
      // store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

export default apiClient; 