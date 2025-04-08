/**
 * User model interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  profilePicture?: string;
  dateOfBirth?: string;
  gender?: 'Female' | 'Male' | 'Other' | 'PreferNotToSay';
  settings: UserSettings;
  runnerProfile?: RunnerProfile;
}

/**
 * User settings interface
 */
export interface UserSettings {
  id: string;
  userId: string;
  distanceUnit: 'km' | 'miles';
  language: string;
  coachingStyle: 'Motivational' | 'Authoritative' | 'Technical' | 'Data-Driven' | 'Balanced';
  privacyDataSharing: boolean;
  notificationPreferences: NotificationPreferences;
}

/**
 * Notification preferences interface
 */
export interface NotificationPreferences {
  id: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
}

/**
 * Runner profile interface
 */
export interface RunnerProfile {
  fitnessLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  weeklyDistance?: number;
  weeklyFrequency?: number;
  recentRaces?: RecentRace[];
  preferredRunTypes?: string[];
  injuryHistory?: string[];
  personalBests?: PersonalBest[];
}

/**
 * Recent race interface
 */
export interface RecentRace {
  name: string;
  date: string;
  distance: number;
  time: number;
}

/**
 * Personal best interface
 */
export interface PersonalBest {
  distance: number;
  time: number;
  date?: string;
}

/**
 * User registration input
 */
export interface UserRegistrationInput {
  email: string;
  password: string;
  name: string;
}

/**
 * User login input
 */
export interface UserLoginInput {
  email: string;
  password: string;
}

/**
 * Authentication response
 */
export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
} 