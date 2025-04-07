interface Environment {
  API_URL: string;
  API_TIMEOUT: number;
  ENV: 'development' | 'staging' | 'production';
  AUTH_PERSISTENCE: boolean;
  AUTH_TOKEN_KEY: string;
  ENABLE_STRAVA_INTEGRATION: boolean;
  ENABLE_OFFLINE_MODE: boolean;
  APP_NAME: string;
  DEFAULT_DISTANCE_UNIT: 'km' | 'miles';
  DEFAULT_LANGUAGE: string;
}

export const env: Environment = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  API_TIMEOUT: Number(process.env.EXPO_PUBLIC_API_TIMEOUT) || 10000,
  ENV: (process.env.EXPO_PUBLIC_ENV as Environment['ENV']) || 'development',
  AUTH_PERSISTENCE: process.env.EXPO_PUBLIC_AUTH_PERSISTENCE === 'true',
  AUTH_TOKEN_KEY: '@vici:auth_token',
  ENABLE_STRAVA_INTEGRATION: process.env.EXPO_PUBLIC_ENABLE_STRAVA_INTEGRATION === 'true',
  ENABLE_OFFLINE_MODE: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
  APP_NAME: process.env.EXPO_PUBLIC_APP_NAME!,
  DEFAULT_DISTANCE_UNIT: (process.env.EXPO_PUBLIC_DEFAULT_DISTANCE_UNIT as 'km' | 'miles') || 'miles',
  DEFAULT_LANGUAGE: process.env.EXPO_PUBLIC_DEFAULT_LANGUAGE || 'en',
};

export const isDevelopment = env.ENV === 'development';
export const isStaging = env.ENV === 'staging';
export const isProduction = env.ENV === 'production';

// Validate required environment variables
const requiredVars = [
  'API_URL',
  'AUTH_TOKEN_KEY',
  'APP_NAME',
] as const;

for (const key of requiredVars) {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
} 