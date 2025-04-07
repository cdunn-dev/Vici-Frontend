import { useQuery, useMutation } from 'react-query';
import apiClient from './client';
import { store } from '../../store';
import { 
  setCurrentPlan, 
  setWorkouts, 
  updateWorkoutStatus,
  setLoading,
  setError 
} from '../../store/slices/trainingSlice';
import type { TrainingPlan, Workout } from '../../store/slices/trainingSlice';

// Query keys
export const trainingKeys = {
  all: ['training'] as const,
  plans: () => [...trainingKeys.all, 'plans'] as const,
  plan: (id: string) => [...trainingKeys.plans(), id] as const,
  workouts: () => [...trainingKeys.all, 'workouts'] as const,
  workout: (id: string) => [...trainingKeys.workouts(), id] as const,
};

// Fetch current training plan
export const useCurrentPlan = () => {
  return useQuery(
    trainingKeys.plans(),
    async () => {
      store.dispatch(setLoading(true));
      try {
        const { data } = await apiClient.get<TrainingPlan>('/training/current-plan');
        store.dispatch(setCurrentPlan(data));
        return data;
      } catch (error) {
        if (error instanceof Error) {
          store.dispatch(setError(error.message));
        }
        throw error;
      } finally {
        store.dispatch(setLoading(false));
      }
    }
  );
};

// Fetch workouts
export const useWorkouts = (startDate?: string, endDate?: string) => {
  return useQuery(
    trainingKeys.workouts(),
    async () => {
      store.dispatch(setLoading(true));
      try {
        const { data } = await apiClient.get<Workout[]>('/training/workouts', {
          params: { startDate, endDate },
        });
        store.dispatch(setWorkouts(data));
        return data;
      } catch (error) {
        if (error instanceof Error) {
          store.dispatch(setError(error.message));
        }
        throw error;
      } finally {
        store.dispatch(setLoading(false));
      }
    }
  );
};

// Update workout status
export const useUpdateWorkoutStatus = () => {
  return useMutation<
    Workout,
    Error,
    { id: string; status: Workout['status'] }
  >(
    async ({ id, status }) => {
      store.dispatch(setLoading(true));
      try {
        const { data } = await apiClient.patch<Workout>(`/training/workouts/${id}/status`, {
          status,
        });
        store.dispatch(updateWorkoutStatus({ id, status }));
        return data;
      } catch (error) {
        if (error instanceof Error) {
          store.dispatch(setError(error.message));
        }
        throw error;
      } finally {
        store.dispatch(setLoading(false));
      }
    }
  );
}; 