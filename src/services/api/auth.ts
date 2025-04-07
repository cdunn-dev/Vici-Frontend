import { useMutation } from 'react-query';
import apiClient from './client';
import { store } from '../../store';
import { setCredentials, setError, setLoading } from '../../store/slices/authSlice';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  name: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const useLogin = () => {
  return useMutation<AuthResponse, Error, LoginCredentials>(
    async (credentials) => {
      store.dispatch(setLoading(true));
      try {
        const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
        store.dispatch(setCredentials({ token: data.token }));
        return data;
      } catch (error) {
        if (error instanceof Error) {
          store.dispatch(setError(error.message));
        }
        throw error;
      } finally {
        store.dispatch(setLoading(false));
      }
    }
  );
};

export const useRegister = () => {
  return useMutation<AuthResponse, Error, RegisterData>(
    async (registerData) => {
      store.dispatch(setLoading(true));
      try {
        const { data } = await apiClient.post<AuthResponse>('/auth/register', registerData);
        store.dispatch(setCredentials({ token: data.token }));
        return data;
      } catch (error) {
        if (error instanceof Error) {
          store.dispatch(setError(error.message));
        }
        throw error;
      } finally {
        store.dispatch(setLoading(false));
      }
    }
  );
}; 