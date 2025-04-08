import { TrainingPlan as PrismaTrainingPlan } from '@prisma/client';

/**
 * Training plan model interface
 */
export interface TrainingPlan extends PrismaTrainingPlan {
  // Add any extended fields here
}

/**
 * Training goal interface
 */
export interface Goal {
  type: 'Race' | 'Distance' | 'Time' | 'Fitness';
  distance?: number; // in meters
  time?: number; // in seconds
  date?: Date;
  name?: string;
  description?: string;
}

/**
 * Training plan settings interface
 */
export interface PlanSettings {
  daysPerWeek: number;
  startDate: Date;
  endDate?: Date;
  preferredRunDays: string[]; // e.g. ['Monday', 'Wednesday', 'Friday']
  maxRunDistance?: number; // in meters
  maxRunTime?: number; // in seconds
  includeIntervals: boolean;
  includeLongRuns: boolean;
  includeRecoveryRuns: boolean;
  intensity: 'Low' | 'Medium' | 'High';
}

/**
 * Training plan creation data
 */
export interface TrainingPlanCreateInput {
  userId: string;
  goal: Goal;
  settings: PlanSettings;
}

/**
 * Training plan update data
 */
export interface TrainingPlanUpdateInput {
  goal?: Goal;
  settings?: PlanSettings;
  status?: 'Active' | 'Completed' | 'Cancelled' | 'Paused';
} 