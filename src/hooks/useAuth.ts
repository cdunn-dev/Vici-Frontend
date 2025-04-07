import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLogin, useRegister } from '../services/api/auth';
import { env } from '../config/env';

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem(env.AUTH_TOKEN_KEY);
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          user: JSON.parse(userData),
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
        });
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await loginMutation.mutateAsync({ email, password });
      await AsyncStorage.setItem(env.AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
      });

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An error occurred during login');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await registerMutation.mutateAsync({ name, email, password });
      await AsyncStorage.setItem(env.AUTH_TOKEN_KEY, response.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.user));

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user: response.user,
      });

      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An error occurred during registration');
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(env.AUTH_TOKEN_KEY);
      await AsyncStorage.removeItem('userData');

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return {
    ...authState,
    register,
    login,
    logout,
  };
}; 