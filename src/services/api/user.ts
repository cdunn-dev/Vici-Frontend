import { useQuery, useMutation } from 'react-query';
import apiClient from './client';
import { store } from '../../store';
import { 
  setProfile, 
  updateProfile, 
  setPreferences,
  setLoading,
  setError 
} from '../../store/slices/userSlice';
import type { UserProfile, UserPreferences } from '../../store/slices/userSlice';

// Query keys
export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
  preferences: () => [...userKeys.all, 'preferences'] as const,
};

// Fetch user profile
export const useProfile = () => {
  return useQuery(
    userKeys.profile(),
    async () => {
      store.dispatch(setLoading(true));
      try {
        const { data } = await apiClient.get<UserProfile>('/user/profile');
        store.dispatch(setProfile(data));
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

// Update user profile
export const useUpdateProfile = () => {
  return useMutation<UserProfile, Error, Partial<UserProfile>>(
    async (profileData) => {
      store.dispatch(setLoading(true));
      try {
        const { data } = await apiClient.patch<UserProfile>('/user/profile', profileData);
        store.dispatch(updateProfile(data));
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

// Update user preferences
export const useUpdatePreferences = () => {
  return useMutation<UserPreferences, Error, Partial<UserPreferences>>(
    async (preferences) => {
      store.dispatch(setLoading(true));
      try {
        const { data } = await apiClient.patch<UserPreferences>('/user/preferences', preferences);
        store.dispatch(setPreferences(data));
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