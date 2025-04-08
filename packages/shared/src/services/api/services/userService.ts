import { apiClient } from '../index';

/**
 * User types
 */
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  dateOfBirth?: string;
  gender?: 'Female' | 'Male' | 'Other' | 'PreferNotToSay';
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  distanceUnit: 'km' | 'miles';
  language: string;
  coachingStyle: 'Motivational' | 'Authoritative' | 'Technical' | 'Data-Driven' | 'Balanced';
  notificationPreferences: NotificationPreferences;
  privacyDataSharing: boolean;
  updatedAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  workoutReminders: boolean;
  planUpdates: boolean;
  achievementAlerts: boolean;
}

export interface UserProfile {
  user: User;
  settings: UserSettings;
}

export interface UpdateUserParams {
  name?: string;
  email?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  gender?: 'Female' | 'Male' | 'Other' | 'PreferNotToSay';
}

export interface UpdateUserSettingsParams {
  distanceUnit?: 'km' | 'miles';
  language?: string;
  coachingStyle?: 'Motivational' | 'Authoritative' | 'Technical' | 'Data-Driven' | 'Balanced';
  notificationPreferences?: Partial<NotificationPreferences>;
  privacyDataSharing?: boolean;
}

/**
 * User API service for handling user-related requests
 */
export const userService = {
  /**
   * Get the current user profile
   */
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/user/profile');
    return response.data;
  },

  /**
   * Update user information
   */
  updateUser: async (params: UpdateUserParams): Promise<User> => {
    const response = await apiClient.patch<User>('/user', params);
    return response.data;
  },

  /**
   * Update user settings
   */
  updateUserSettings: async (params: UpdateUserSettingsParams): Promise<UserSettings> => {
    const response = await apiClient.patch<UserSettings>('/user/settings', params);
    return response.data;
  },

  /**
   * Delete user account
   */
  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/user');
    return;
  },

  /**
   * Get user statistics
   */
  getUserStats: async (): Promise<any> => {
    const response = await apiClient.get('/user/stats');
    return response.data;
  },
}; 