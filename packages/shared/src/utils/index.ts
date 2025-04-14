/**
 * Utility functions
 * 
 * Exports all utility functions from the shared package
 */

// Format utilities
export * from './format';

// Date utilities - resolve formatDate ambiguity
import { formatDate as formatDateFromDate } from './date';
export { formatDateFromDate };

// Validation utilities
export * from './validation';

export const add = (a: number, b: number): number => {
  return a + b;
}; 