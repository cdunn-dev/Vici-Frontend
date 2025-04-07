import { Request, Response, NextFunction } from 'express';
import { securityConfig } from '../config/security';
import { validateCorsRequest, getCorsHeaders, validateSecurityHeaders } from '../utils/security';

export const securityMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = req.headers.origin || '';

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    const corsHeaders = getCorsHeaders(origin);
    res.set(corsHeaders);
    res.status(204).end();
    return;
  }

  // Validate CORS for actual requests
  if (!validateCorsRequest(origin, req.method, Object.keys(req.headers))) {
    res.status(403).json({ error: 'CORS validation failed' });
    return;
  }

  // Set CORS headers
  const corsHeaders = getCorsHeaders(origin);
  res.set(corsHeaders);

  // Set security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': securityConfig.headers.frameOptions,
    'X-XSS-Protection': securityConfig.headers.xssProtection,
    'Referrer-Policy': securityConfig.headers.referrerPolicy,
    'Content-Security-Policy': securityConfig.headers.contentSecurityPolicy,
  });

  next();
};

export const validateHeadersMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const headers = res.getHeaders();
  const stringHeaders: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      stringHeaders[key] = String(value);
    }
  }

  if (!validateSecurityHeaders(stringHeaders)) {
    res.status(500).json({ error: 'Security headers validation failed' });
    return;
  }
  next();
}; 