import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  dateOfBirth?: string;
  gender?: 'Female' | 'Male' | 'Other' | 'PreferNotToSay';
  fitnessLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface UserPreferences {
  distanceUnit: 'km' | 'miles';
  language: string;
  coachingStyle: 'Motivational' | 'Authoritative' | 'Technical' | 'Data-Driven' | 'Balanced';
  notificationsEnabled: boolean;
  darkMode: boolean;
}

interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  preferences: {
    distanceUnit: 'miles',
    language: 'en',
    coachingStyle: 'Balanced',
    notificationsEnabled: true,
    darkMode: false,
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
      state.error = null;
    },
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
      state.error = null;
    },
    setPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
      state.error = null;
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
  setProfile,
  updateProfile,
  setPreferences,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer; 