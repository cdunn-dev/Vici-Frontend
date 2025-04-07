import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Workout {
  id: string;
  title: string;
  date: string;
  type: string;
  distance: number;
  duration: number;
  status: 'pending' | 'completed' | 'missed';
  structure?: {
    warmup?: { distance: number; pace: string };
    mainSet?: { distance: number; pace: string };
    cooldown?: { distance: number; pace: string };
  };
}

interface TrainingPlan {
  id: string;
  title: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  progress: number;
  weeklyMileage: number;
}

interface TrainingState {
  currentPlan: TrainingPlan | null;
  workouts: Workout[];
  loading: boolean;
  error: string | null;
}

const initialState: TrainingState = {
  currentPlan: null,
  workouts: [],
  loading: false,
  error: null,
};

const trainingSlice = createSlice({
  name: 'training',
  initialState,
  reducers: {
    setCurrentPlan: (state, action: PayloadAction<TrainingPlan>) => {
      state.currentPlan = action.payload;
      state.error = null;
    },
    updatePlanProgress: (state, action: PayloadAction<number>) => {
      if (state.currentPlan) {
        state.currentPlan.progress = action.payload;
      }
    },
    setWorkouts: (state, action: PayloadAction<Workout[]>) => {
      state.workouts = action.payload;
      state.error = null;
    },
    updateWorkoutStatus: (
      state,
      action: PayloadAction<{ id: string; status: Workout['status'] }>,
    ) => {
      const workout = state.workouts.find(w => w.id === action.payload.id);
      if (workout) {
        workout.status = action.payload.status;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setCurrentPlan,
  updatePlanProgress,
  setWorkouts,
  updateWorkoutStatus,
  setLoading,
  setError,
} = trainingSlice.actions;

export default trainingSlice.reducer; 