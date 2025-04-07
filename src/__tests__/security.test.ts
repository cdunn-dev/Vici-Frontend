import { describe, it, expect } from '@jest/globals';
import { securityConfig } from '../config/security';
import { validateCorsRequest, getCorsHeaders, validateSecurityHeaders } from '../utils/security';

describe('Security Configuration', () => {
  describe('CORS Validation', () => {
    it('should validate allowed origins', () => {
      const origin = securityConfig.cors.allowedOrigins[0];
      const isValid = validateCorsRequest(origin, 'GET', ['Content-Type']);
      expect(isValid).toBe(true);
    });

    it('should reject invalid origins', () => {
      const isValid = validateCorsRequest('http://malicious-site.com', 'GET', ['Content-Type']);
      expect(isValid).toBe(false);
    });

    it('should validate allowed methods', () => {
      const origin = securityConfig.cors.allowedOrigins[0];
      securityConfig.cors.allowedMethods.forEach(method => {
        const isValid = validateCorsRequest(origin, method, ['Content-Type']);
        expect(isValid).toBe(true);
      });
    });

    it('should reject invalid methods', () => {
      const origin = securityConfig.cors.allowedOrigins[0];
      const isValid = validateCorsRequest(origin, 'TRACE', ['Content-Type']);
      expect(isValid).toBe(false);
    });
  });

  describe('CORS Headers', () => {
    it('should return CORS headers for allowed origin', () => {
      const origin = securityConfig.cors.allowedOrigins[0];
      const headers = getCorsHeaders(origin);
      
      expect(headers['Access-Control-Allow-Origin']).toBe(origin);
      expect(headers['Access-Control-Allow-Methods']).toBeDefined();
      expect(headers['Access-Control-Allow-Headers']).toBeDefined();
      expect(headers['Access-Control-Allow-Credentials']).toBeDefined();
    });

    it('should return empty object for invalid origin', () => {
      const headers = getCorsHeaders('http://malicious-site.com');
      expect(headers).toEqual({});
    });
  });

  describe('Security Headers Validation', () => {
    it('should validate correct security headers', () => {
      const headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': securityConfig.headers.frameOptions,
        'X-XSS-Protection': securityConfig.headers.xssProtection,
        'Referrer-Policy': securityConfig.headers.referrerPolicy,
        'Content-Security-Policy': securityConfig.headers.contentSecurityPolicy,
      };

      const isValid = validateSecurityHeaders(headers);
      expect(isValid).toBe(true);
    });

    it('should reject missing security headers', () => {
      const headers = {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': securityConfig.headers.frameOptions,
        // Missing other required headers
      };

      const isValid = validateSecurityHeaders(headers);
      expect(isValid).toBe(false);
    });
  });
}); 