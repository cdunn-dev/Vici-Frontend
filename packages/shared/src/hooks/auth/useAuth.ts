import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '../api/useQuery';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import { User } from '../../types/user';
import { setAuthToken, removeAuthToken, getAuthToken } from '../../services/storage';

/**
 * Authentication hook for managing user authentication
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const queryClient = useQueryClient();

  // Get current user data
  const { 
    data: user,
    isLoading: isLoadingUser,
    error,
    refetch 
  } = useQuery<User>(
    ['currentUser'],
    API_ENDPOINTS.auth.current,
    {
      enabled: isAuthenticated,
      onError: () => {
        // If query fails, user might be logged out
        setIsAuthenticated(false);
        removeAuthToken();
      }
    }
  );

  // Login mutation
  const { 
    mutate: login,
    isLoading: isLoggingIn 
  } = useMutation(
    API_ENDPOINTS.auth.login,
    {
      onSuccess: (data) => {
        const { token, user } = data;
        setAuthToken(token);
        setIsAuthenticated(true);
        queryClient.setQueryData(['currentUser'], user);
      }
    }
  );

  // Register mutation
  const { 
    mutate: register,
    isLoading: isRegistering 
  } = useMutation(
    API_ENDPOINTS.auth.register,
    {
      onSuccess: (data) => {
        const { token, user } = data;
        setAuthToken(token);
        setIsAuthenticated(true);
        queryClient.setQueryData(['currentUser'], user);
      }
    }
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch(API_ENDPOINTS.auth.logout, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      queryClient.clear();
      removeAuthToken();
      setIsAuthenticated(false);
    }
  }, [queryClient]);

  // Refresh user data
  const refreshUser = useCallback(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, refetch]);

  // Update user profile
  const { 
    mutate: updateProfile,
    isLoading: isUpdatingProfile 
  } = useMutation(
    API_ENDPOINTS.users.updateProfile,
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['currentUser'], (old: User) => ({
          ...old,
          ...data
        }));
      }
    }
  );

  // Update user settings
  const { 
    mutate: updateSettings,
    isLoading: isUpdatingSettings 
  } = useMutation(
    API_ENDPOINTS.users.updateSettings,
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['currentUser'], (old: User) => ({
          ...old,
          settings: data
        }));
      }
    }
  );

  // Update user password
  const { 
    mutate: updatePassword,
    isLoading: isUpdatingPassword 
  } = useMutation(
    API_ENDPOINTS.users.updatePassword
  );

  // Check authentication status on mount
  useEffect(() => {
    const token = getAuthToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  return {
    // Authentication state
    user,
    isAuthenticated,
    isLoading: isLoading || isLoadingUser,
    error,

    // Authentication methods
    login,
    register,
    logout,
    refreshUser,

    // Loading states
    isLoggingIn,
    isRegistering,

    // Profile methods
    updateProfile,
    updateSettings,
    updatePassword,
    
    // Profile loading states
    isUpdatingProfile,
    isUpdatingSettings,
    isUpdatingPassword
  };
}; 