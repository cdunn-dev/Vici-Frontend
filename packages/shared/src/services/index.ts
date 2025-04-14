// Export all service categories
export * from './api';

// Explicit exports to avoid ambiguity with authService
import { authService as authServiceImpl } from './auth';
export { authServiceImpl };

export * from './storage';
