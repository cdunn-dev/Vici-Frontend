import { securityConfig } from '../config/security';

export const validateCorsRequest = (origin: string, method: string, headers: string[]): boolean => {
  const { allowedOrigins, allowedMethods, allowedHeaders } = securityConfig.cors;

  // Check if origin is allowed
  if (!allowedOrigins.includes(origin)) {
    return false;
  }

  // Check if method is allowed
  if (!allowedMethods.includes(method.toUpperCase())) {
    return false;
  }

  // Check if all headers are allowed
  const invalidHeaders = headers.filter(header => !allowedHeaders.includes(header));
  if (invalidHeaders.length > 0) {
    return false;
  }

  return true;
};

export const getCorsHeaders = (origin: string) => {
  const { allowedOrigins, allowedMethods, allowedHeaders, allowCredentials } = securityConfig.cors;

  if (!allowedOrigins.includes(origin)) {
    return {};
  }

  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': allowedMethods.join(', '),
    'Access-Control-Allow-Headers': allowedHeaders.join(', '),
    'Access-Control-Allow-Credentials': allowCredentials.toString(),
    'Access-Control-Max-Age': '86400', // 24 hours
  };
};

export const validateSecurityHeaders = (headers: Record<string, string>): boolean => {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Referrer-Policy',
    'Content-Security-Policy',
  ];

  return requiredHeaders.every(header => headers[header] !== undefined);
}; 