import { configureStore } from '@reduxjs/toolkit';
import { composeWithDevTools } from '@redux-devtools/extension';
import { developmentConfig } from '../config/development';
import { logger } from '../utils/logger';

// Import your reducers here
// import authReducer from './slices/authSlice';
// import trainingReducer from './slices/trainingSlice';
// import userReducer from './slices/userSlice';

export const configureAppStore = () => {
  const store = configureStore({
    reducer: {
      // Add your reducers here
      // auth: authReducer,
      // training: trainingReducer,
      // user: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
    devTools: developmentConfig.redux.devTools
      ? {
          name: 'Vici App',
          features: {
            persist: false,
            lock: false,
            export: true,
            import: 'custom',
            jump: true,
            skip: false,
            reorder: true,
            dispatch: true,
            test: true,
          },
        }
      : false,
  });

  if (developmentConfig.redux.devTools) {
    logger.info('Redux DevTools enabled');
  }

  return store;
};

export const store = configureAppStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 