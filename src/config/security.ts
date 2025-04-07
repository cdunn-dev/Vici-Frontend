import { env } from './env';

export interface SecurityConfig {
  cors: {
    allowedOrigins: string[];
    allowedMethods: string[];
    allowedHeaders: string[];
    allowCredentials: boolean;
  };
  headers: {
    contentSecurityPolicy: string;
    xssProtection: string;
    frameOptions: string;
    referrerPolicy: string;
  };
}

const getCorsConfig = (): SecurityConfig['cors'] => {
  const allowedOrigins = [env.API_URL];
  
  if (env.ENV === 'development') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:19006');
  }

  return {
    allowedOrigins,
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    allowCredentials: true,
  };
};

const getSecurityHeaders = (): SecurityConfig['headers'] => {
  const baseCSP = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'";

  return {
    contentSecurityPolicy: baseCSP,
    xssProtection: '1; mode=block',
    frameOptions: 'DENY',
    referrerPolicy: 'strict-origin-when-cross-origin',
  };
};

export const securityConfig: SecurityConfig = {
  cors: getCorsConfig(),
  headers: getSecurityHeaders(),
}; 