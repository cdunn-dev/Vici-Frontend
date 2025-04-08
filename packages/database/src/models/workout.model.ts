import { Workout as PrismaWorkout } from '@prisma/client';

/**
 * Workout model interface
 */
export interface Workout extends PrismaWorkout {
  // Add any extended fields here
}

/**
 * Workout type enum
 */
export enum WorkoutType {
  EASY_RUN = 'EASY_RUN',
  LONG_RUN = 'LONG_RUN',
  TEMPO_RUN = 'TEMPO_RUN',
  INTERVAL = 'INTERVAL',
  RECOVERY = 'RECOVERY',
  RACE = 'RACE',
  CROSS_TRAINING = 'CROSS_TRAINING',
  REST = 'REST'
}

/**
 * Workout step interface
 */
export interface WorkoutStep {
  type: 'warmup' | 'cooldown' | 'interval' | 'recovery' | 'main';
  duration: number; // in seconds
  distance?: number; // in meters
  targetPace?: [number, number]; // min/max pace in seconds per kilometer
  targetHeartRate?: [number, number]; // min/max heart rate
  description?: string;
}

/**
 * Workout creation data
 */
export interface WorkoutCreateInput {
  trainingPlanId: string;
  type: WorkoutType;
  scheduledDate: Date;
  title: string;
  description?: string;
  duration: number; // in seconds
  distance?: number; // in meters
  steps: WorkoutStep[];
}

/**
 * Workout update data
 */
export interface WorkoutUpdateInput {
  scheduledDate?: Date;
  title?: string;
  description?: string;
  duration?: number; // in seconds
  distance?: number; // in meters
  steps?: WorkoutStep[];
  completedDate?: Date;
  actualDuration?: number; // in seconds
  actualDistance?: number; // in meters
  status?: 'scheduled' | 'completed' | 'skipped' | 'modified';
} 