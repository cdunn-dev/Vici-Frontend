import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const environments = ['development', 'staging', 'production'];

const requiredVars = [
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_AUTH_TOKEN_KEY',
  'EXPO_PUBLIC_APP_NAME',
];

const validateEnvFile = (envPath: string) => {
  if (!fs.existsSync(envPath)) {
    console.error(`❌ Environment file not found: ${envPath}`);
    process.exit(1);
  }

  const envConfig = dotenv.parse(fs.readFileSync(envPath));

  const missingVars = requiredVars.filter(
    (varName) => !envConfig[varName]
  );

  if (missingVars.length > 0) {
    console.error(`❌ Missing required variables in ${envPath}:`);
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    process.exit(1);
  }

  // Validate API URL format
  const apiUrl = envConfig.EXPO_PUBLIC_API_URL;
  try {
    new URL(apiUrl);
  } catch (error) {
    console.error(`❌ Invalid API_URL in ${envPath}: ${apiUrl}`);
    process.exit(1);
  }

  // Validate environment name if present
  const env = envConfig.EXPO_PUBLIC_ENV;
  if (env && !environments.includes(env)) {
    console.error(`❌ Invalid environment in ${envPath}: ${env}`);
    console.error(`   Must be one of: ${environments.join(', ')}`);
    process.exit(1);
  }

  console.log(`✅ Environment file validated successfully: ${envPath}`);
};

// Validate all environment files
environments.forEach((env) => {
  const envPath = path.resolve(process.cwd(), `.env.${env}`);
  validateEnvFile(envPath);
}); 