import { api } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  refreshToken: string;
}

const handleAuthResponse = async (data: AuthResponse): Promise<void> => {
  await AsyncStorage.multiSet([
    ['token', data.token],
    ['refreshToken', data.refreshToken],
  ]);
};

const handleError = (error: any): Error => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const message = error.response.data?.message || 'Authentication failed';
    return new Error(message);
  } else if (error.request) {
    // The request was made but no response was received
    return new Error('No response from server');
  } else {
    // Something happened in setting up the request that triggered an Error
    return new Error('Request failed');
  }
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      await handleAuthResponse(response.data);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data);
      await handleAuthResponse(response.data);
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await AsyncStorage.multiRemove(['token', 'refreshToken']);
    }
  },
}; 