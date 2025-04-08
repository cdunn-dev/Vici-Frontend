import { User as PrismaUser } from '@prisma/client';

/**
 * User model interface
 */
export interface User extends PrismaUser {
  // Add any extended fields here
}

/**
 * User creation data
 */
export interface UserCreateInput {
  email: string;
  password: string;
  name: string;
  profilePicture?: string;
  dateOfBirth?: Date;
  gender?: 'Female' | 'Male' | 'Other' | 'PreferNotToSay';
}

/**
 * User update data
 */
export interface UserUpdateInput {
  name?: string;
  profilePicture?: string;
  dateOfBirth?: Date;
  gender?: 'Female' | 'Male' | 'Other' | 'PreferNotToSay';
  settings?: UserSettingsUpdateInput;
}

/**
 * User settings update data
 */
export interface UserSettingsUpdateInput {
  distanceUnit?: 'km' | 'miles';
  language?: string;
  coachingStyle?: 'Motivational' | 'Authoritative' | 'Technical' | 'Data-Driven' | 'Balanced';
  notificationPreferences?: NotificationPreferencesUpdateInput;
  privacyDataSharing?: boolean;
}

/**
 * Notification preferences update data
 */
export interface NotificationPreferencesUpdateInput {
  email?: boolean;
  push?: boolean;
  sms?: boolean;
  inApp?: boolean;
} 