/**
 * API Types
 * 
 * Types related to API requests, responses, and services.
 */

// Re-export types from API services
import { 
  APIClient,
  APIResponse,
  Method,
  RequestOptions,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor
} from '../../services/api/client';

// Auth types
import {
  AuthTokens,
  AuthResponse,
  LoginParams,
  RegisterParams,
  ResetPasswordParams,
  CompleteResetPasswordParams,
  RefreshTokenParams
} from '../../services/api/services/authService';

// User types
import {
  User,
  UserSettings,
  NotificationPreferences,
  UserProfile,
  UpdateUserParams,
  UpdateUserSettingsParams
} from '../../services/api/services/userService';

// Training types
import {
  TrainingPlan,
  Goal,
  PlanSettings,
  TrainingWeek,
  Workout,
  WorkoutType,
  WorkoutStep,
  CreatePlanParams,
  UpdatePlanParams,
  CreateWorkoutParams,
  UpdateWorkoutParams
} from '../../services/api/services/trainingService';

// Export API client types
export type {
  APIClient,
  APIResponse,
  Method,
  RequestOptions,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor
};

// Export auth types
export type {
  AuthTokens,
  AuthResponse,
  LoginParams,
  RegisterParams,
  ResetPasswordParams,
  CompleteResetPasswordParams,
  RefreshTokenParams
};

// Export user types
export type {
  User,
  UserSettings,
  NotificationPreferences,
  UserProfile,
  UpdateUserParams,
  UpdateUserSettingsParams
};

// Export training types
export type {
  TrainingPlan,
  Goal,
  PlanSettings,
  TrainingWeek,
  Workout,
  WorkoutType,
  WorkoutStep,
  CreatePlanParams,
  UpdatePlanParams,
  CreateWorkoutParams,
  UpdateWorkoutParams
}; 