/**
 * API endpoints configuration
 */

// Base API URL - Should come from environment variables in a real app
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

/**
 * API endpoints for the application
 */
export const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    current: `${API_BASE_URL}/auth/me`,
    refreshToken: `${API_BASE_URL}/auth/refresh-token`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
  },
  
  // User endpoints
  users: {
    getProfile: `${API_BASE_URL}/users/profile`,
    updateProfile: `${API_BASE_URL}/users/profile`,
    updateSettings: `${API_BASE_URL}/users/settings`,
    updatePassword: `${API_BASE_URL}/users/password`,
    deleteAccount: `${API_BASE_URL}/users`,
  },
  
  // Training plan endpoints
  training: {
    getPlans: `${API_BASE_URL}/training/plans`,
    getPlan: (id: string) => `${API_BASE_URL}/training/plans/${id}`,
    createPlan: `${API_BASE_URL}/training/plans`,
    updatePlan: (id: string) => `${API_BASE_URL}/training/plans/${id}`,
    deletePlan: (id: string) => `${API_BASE_URL}/training/plans/${id}`,
  },
  
  // Workout endpoints
  workouts: {
    getWorkouts: `${API_BASE_URL}/training/workouts`,
    getWorkout: (id: string) => `${API_BASE_URL}/training/workouts/${id}`,
    getPlanWorkouts: (planId: string) => `${API_BASE_URL}/training/plans/${planId}/workouts`,
    createWorkout: `${API_BASE_URL}/training/workouts`,
    updateWorkout: (id: string) => `${API_BASE_URL}/training/workouts/${id}`,
    completeWorkout: (id: string) => `${API_BASE_URL}/training/workouts/${id}/complete`,
    deleteWorkout: (id: string) => `${API_BASE_URL}/training/workouts/${id}`,
  },
  
  // Analytics endpoints
  analytics: {
    getOverview: `${API_BASE_URL}/analytics/overview`,
    getPerformance: `${API_BASE_URL}/analytics/performance`,
    getProgress: `${API_BASE_URL}/analytics/progress`,
    getInsights: `${API_BASE_URL}/analytics/insights`,
  }
}; 