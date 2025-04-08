import { useQuery } from '../api/useQuery';
import { API_ENDPOINTS } from '../../services/api/endpoints';
import { User } from '../../types/user';
import { useAuth } from './useAuth';

/**
 * Hook to access and manage current user data
 */
export const useUser = () => {
  const { isAuthenticated } = useAuth();

  // Get current user profile
  const { 
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery<User>(
    ['currentUser'],
    API_ENDPOINTS.users.getProfile,
    {
      enabled: isAuthenticated,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    if (!user) return false;
    
    // Assuming role information is stored in the user object
    // Adjust according to your actual user data structure
    return user.roles?.includes(role) || false;
  };
  
  /**
   * Format user's full name
   */
  const getFullName = (): string => {
    if (!user) return '';
    
    return user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim();
  };
  
  /**
   * Get user's preferred distance unit
   */
  const getDistanceUnit = (): 'km' | 'miles' => {
    if (!user?.settings) return 'km'; // Default to km
    
    return user.settings.distanceUnit;
  };
  
  /**
   * Get user's avatar URL or default placeholder
   */
  const getAvatarUrl = (): string => {
    if (!user) return '/assets/default-avatar.png';
    
    return user.profilePicture || '/assets/default-avatar.png';
  };

  /**
   * Get user's membership status
   */
  const getMembershipStatus = (): string => {
    if (!user?.membership) return 'Free';
    
    return user.membership.status || 'Free';
  };

  return {
    user,
    isLoading,
    error,
    refetch,
    hasRole,
    getFullName,
    getDistanceUnit,
    getAvatarUrl,
    getMembershipStatus,
    isAuthenticated
  };
}; 