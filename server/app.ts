import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { setupMiddleware } from './middleware';
import { createAdminRouter } from './routes/admin';
import { createV1Router } from './routes/api/v1';
import { createHealthRouter } from './routes/api/v1/health';
import { createMonitoringRouter } from './routes/api/v1/monitoring';
import { performanceMonitoringMiddleware } from './middleware/performanceMonitoring';
import performanceRoutes from './routes/performanceRoutes';
import { ErrorHandlingService } from './services/errorHandlingService';
import { AuditLoggingService } from './services/auditLoggingService';
import { PerformanceMonitoringService } from './services/performanceMonitoringService';
import { PerformanceDashboard } from './services/performanceDashboard';
import { logger } from './utils/logger';

/**
 * Create and configure the Express application
 */
export const createApp = async (pool: Pool): Promise<express.Application> => {
  const app = express();
  
  // Initialize Redis client
  const redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    enableReadyCheck: true,
    maxRetriesPerRequest: 3,
  });
  
  // Initialize services
  const auditLoggingService = new AuditLoggingService(pool);
  
  const errorHandlingService = ErrorHandlingService.getInstance();
  
  // Initialize performance monitoring service
  const performanceService = PerformanceMonitoringService.getInstance({
    updateInterval: 60000, // 1 minute
    retentionPeriod: 7, // 7 days
    alertThresholds: {
      responseTime: 1000, // 1 second
      errorRate: 0.05, // 5%
      memoryUsage: 0.8, // 80%
      cpuUsage: 80, // 80%
      cacheHitRate: 0.7, // 70%
      databaseQueryTime: 500 // 500ms
    },
    notificationChannels: {
      email: true,
      slack: true,
      webhook: true
    }
  });
  
  // Initialize performance dashboard
  const performanceDashboard = PerformanceDashboard.getInstance({
    updateInterval: 60000, // 1 minute
    retentionPeriod: 7, // 7 days
    alertThresholds: {
      responseTime: 1000, // 1 second
      errorRate: 0.05, // 5%
      memoryUsage: 0.8, // 80%
      cpuUsage: 80 // 80%
    }
  });
  
  // Start performance monitoring
  await performanceService.start();
  await performanceDashboard.start();
  
  // Basic middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Set up error handling middleware
  setupMiddleware(app, errorHandlingService);
  
  // Add performance monitoring middleware
  app.use(performanceMonitoringMiddleware);
  
  // Health check endpoint (no auth required)
  app.use('/health', createHealthRouter(pool, redis));
  
  // API v1 routes
  app.use('/api/v1', createV1Router(pool, redis));
  
  // Admin routes
  app.use('/api/admin', createAdminRouter(errorHandlingService));
  
  // Monitoring routes (admin auth required)
  app.use('/api/monitoring', createMonitoringRouter(pool, redis));
  
  // Performance monitoring routes (admin auth required)
  app.use('/api/performance', performanceRoutes);
  
  // Handle 404 errors
  app.use((req, res) => {
    res.status(404).json({
      error: {
        message: 'Not found',
        code: 'NOT_FOUND'
      }
    });
  });
  
  // Handle Redis connection errors
  redis.on('error', (error) => {
    logger.error('Redis connection error:', error);
  });
  
  // Handle Redis connection success
  redis.on('connect', () => {
    logger.info('Connected to Redis');
  });
  
  return app;
}; 