import { apiClient } from '../index';

/**
 * Training data types
 */
export interface TrainingPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  goal: Goal;
  status: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  settings: PlanSettings;
  createdAt: string;
  updatedAt: string;
  weeks: TrainingWeek[];
}

export interface Goal {
  type: 'Race' | 'Distance' | 'Time' | 'Performance' | 'Fitness';
  race?: {
    name: string;
    distance: number;
    unit: 'km' | 'miles';
    date: string;
  };
  targetDistance?: {
    distance: number;
    unit: 'km' | 'miles';
  };
  targetTime?: {
    duration: number; // in seconds
  };
  targetPerformance?: {
    metricType: 'Pace' | 'Speed' | 'Power';
    value: number;
    unit: string;
  };
  generalFitness?: {
    focusArea: 'Endurance' | 'Speed' | 'Strength' | 'Recovery';
  };
}

export interface PlanSettings {
  difficultyLevel: 1 | 2 | 3 | 4 | 5;
  recoveryRate: 1 | 2 | 3 | 4 | 5;
  preferredRunDays: Array<0 | 1 | 2 | 3 | 4 | 5 | 6>;
  preferredWorkoutTime: 'Morning' | 'Afternoon' | 'Evening' | 'Any';
  useMetricUnits: boolean;
}

export interface TrainingWeek {
  id: string;
  planId: string;
  weekNumber: number;
  description?: string;
  targetDistance?: number;
  targetDuration?: number;
  workouts: Workout[];
}

export interface Workout {
  id: string;
  weekId: string;
  planId: string;
  name: string;
  description: string;
  date: string;
  workoutType: WorkoutType;
  status: 'Planned' | 'Completed' | 'Missed' | 'Rescheduled';
  targetDistance?: number;
  targetDuration?: number;
  targetIntensity?: number;
  steps: WorkoutStep[];
  complexity: 'Easy' | 'Moderate' | 'Advanced';
  RPE?: number; // Rate of Perceived Exertion
  externalId?: string; // For linking to Strava, etc.
  notes?: string;
}

export type WorkoutType = 
  | 'Easy Run' 
  | 'Long Run' 
  | 'Tempo Run' 
  | 'Interval' 
  | 'Hill Repeats' 
  | 'Recovery Run' 
  | 'Fartlek' 
  | 'Race Pace' 
  | 'Cross Training'
  | 'Rest';

export interface WorkoutStep {
  id: string;
  workoutId: string;
  name: string;
  description?: string;
  stepType: 'Warmup' | 'Cooldown' | 'Work' | 'Recovery';
  duration?: number; // in seconds
  distance?: number; // in meters
  intensity?: number; // percentage of max
  repetitions?: number;
  targetPace?: number; // in seconds per km
  order: number;
}

export interface CreatePlanParams {
  name: string;
  description?: string;
  startDate: string;
  goal: Goal;
  settings: PlanSettings;
}

export interface UpdatePlanParams {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  goal?: Partial<Goal>;
  status?: 'Draft' | 'Active' | 'Completed' | 'Cancelled';
  settings?: Partial<PlanSettings>;
}

export interface CreateWorkoutParams {
  planId: string;
  weekId: string;
  name: string;
  description: string;
  date: string;
  workoutType: WorkoutType;
  targetDistance?: number;
  targetDuration?: number;
  targetIntensity?: number;
  steps: Omit<WorkoutStep, 'id' | 'workoutId'>[];
  complexity: 'Easy' | 'Moderate' | 'Advanced';
  notes?: string;
}

export interface UpdateWorkoutParams {
  name?: string;
  description?: string;
  date?: string;
  workoutType?: WorkoutType;
  status?: 'Planned' | 'Completed' | 'Missed' | 'Rescheduled';
  targetDistance?: number;
  targetDuration?: number;
  targetIntensity?: number;
  steps?: Partial<WorkoutStep>[];
  complexity?: 'Easy' | 'Moderate' | 'Advanced';
  RPE?: number;
  notes?: string;
}

/**
 * Training API service for handling training-related requests
 */
export const trainingService = {
  /**
   * Get all training plans
   */
  getPlans: async (): Promise<TrainingPlan[]> => {
    const response = await apiClient.get<TrainingPlan[]>('/training/plans');
    return response.data;
  },

  /**
   * Get a training plan by ID
   */
  getPlan: async (id: string): Promise<TrainingPlan> => {
    const response = await apiClient.get<TrainingPlan>(`/training/plans/${id}`);
    return response.data;
  },

  /**
   * Create a new training plan
   */
  createPlan: async (params: CreatePlanParams): Promise<TrainingPlan> => {
    const response = await apiClient.post<TrainingPlan>('/training/plans', params);
    return response.data;
  },

  /**
   * Update a training plan
   */
  updatePlan: async (id: string, params: UpdatePlanParams): Promise<TrainingPlan> => {
    const response = await apiClient.patch<TrainingPlan>(`/training/plans/${id}`, params);
    return response.data;
  },

  /**
   * Delete a training plan
   */
  deletePlan: async (id: string): Promise<void> => {
    await apiClient.delete(`/training/plans/${id}`);
    return;
  },

  /**
   * Get all workouts for a plan
   */
  getWorkouts: async (planId: string): Promise<Workout[]> => {
    const response = await apiClient.get<Workout[]>(`/training/plans/${planId}/workouts`);
    return response.data;
  },

  /**
   * Get a workout by ID
   */
  getWorkout: async (planId: string, workoutId: string): Promise<Workout> => {
    const response = await apiClient.get<Workout>(`/training/plans/${planId}/workouts/${workoutId}`);
    return response.data;
  },

  /**
   * Create a new workout
   */
  createWorkout: async (params: CreateWorkoutParams): Promise<Workout> => {
    const { planId, ...workoutParams } = params;
    const response = await apiClient.post<Workout>(`/training/plans/${planId}/workouts`, workoutParams);
    return response.data;
  },

  /**
   * Update a workout
   */
  updateWorkout: async (planId: string, workoutId: string, params: UpdateWorkoutParams): Promise<Workout> => {
    const response = await apiClient.patch<Workout>(`/training/plans/${planId}/workouts/${workoutId}`, params);
    return response.data;
  },

  /**
   * Delete a workout
   */
  deleteWorkout: async (planId: string, workoutId: string): Promise<void> => {
    await apiClient.delete(`/training/plans/${planId}/workouts/${workoutId}`);
    return;
  },

  /**
   * Mark a workout as completed
   */
  completeWorkout: async (planId: string, workoutId: string, data: { RPE?: number, notes?: string }): Promise<Workout> => {
    const response = await apiClient.post<Workout>(`/training/plans/${planId}/workouts/${workoutId}/complete`, data);
    return response.data;
  },

  /**
   * Generate a training plan based on user goals
   */
  generatePlan: async (params: CreatePlanParams): Promise<TrainingPlan> => {
    const response = await apiClient.post<TrainingPlan>('/training/generate-plan', params);
    return response.data;
  },
}; 