/**
 * Model Types
 * 
 * Core domain models and entity types used throughout the application.
 */

// Re-export models from API types to avoid duplication
export type {
  User,
  UserSettings,
  UserProfile,
  TrainingPlan,
  Goal,
  PlanSettings,
  TrainingWeek,
  Workout,
  WorkoutType,
  WorkoutStep
} from '../api';

// Define additional model interfaces that aren't directly tied to API models

/**
 * Application theme configuration
 */
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    error: string;
    text: string;
    onPrimary: string;
    onSecondary: string;
    onBackground: string;
    onSurface: string;
    onError: string;
    disabled: string;
    placeholder: string;
    backdrop: string;
    notification: string;
    border: string;
    card: string;
    shadow: string;
    success: string;
    warning: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      semiBold: string;
      bold: string;
    };
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    lineHeight: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
  };
  borderRadius: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  shadows: {
    none: { [key: string]: string | number };
    sm: { [key: string]: string | number };
    md: { [key: string]: string | number };
    lg: { [key: string]: string | number };
  };
}

/**
 * App configuration
 */
export interface AppConfig {
  appName: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  theme: 'light' | 'dark' | 'system';
  analytics: {
    enabled: boolean;
    trackingId?: string;
  };
}

/**
 * User preferences stored locally
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  privacyAcknowledged: boolean;
  onboardingCompleted: boolean;
  lastActiveScreen?: string;
  recentSearches: string[];
}

/**
 * Navigation state
 */
export interface NavigationState {
  currentScreen: string;
  previousScreen?: string;
  params?: Record<string, any>;
}

/**
 * App session information
 */
export interface AppSession {
  startTime: number;
  lastActiveTime: number;
  deviceInfo: {
    platform: string;
    osVersion: string;
    appVersion: string;
    deviceId: string;
  };
} 