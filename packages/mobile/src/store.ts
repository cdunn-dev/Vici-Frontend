import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// We'll add slices here as we develop the app
// import authReducer from './slices/authSlice';
// import trainingReducer from './slices/trainingSlice';

export const store = configureStore({
  reducer: {
    // auth: authReducer,
    // training: trainingReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 