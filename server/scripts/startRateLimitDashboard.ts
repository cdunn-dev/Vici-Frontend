import { logger } from '../utils/logger';
import { RateLimitMonitoringService } from '../services/rateLimitMonitoringService';
import { MonitoringService } from '../services/monitoring';
import { RateLimitDashboard, RateLimitDashboardConfig } from '../services/rateLimitDashboard';

/**
 * Starts the rate limit monitoring dashboard
 * @returns Promise that resolves when the dashboard is started
 */
async function startRateLimitDashboard(): Promise<void> {
  logger.info('Starting rate limit monitoring dashboard');
  
  try {
    // Initialize services
    const rateLimitMonitoringService = RateLimitMonitoringService.getInstance();
    const monitoringService = MonitoringService.getInstance();
    
    // Configure dashboard
    const dashboardConfig: RateLimitDashboardConfig = {
      updateInterval: 1000, // 1 second
      retentionPeriod: 24 * 60 * 60 * 1000, // 24 hours
      alertThresholds: {
        rateLimitHits: 0.1, // 10% rate limit hits
        latency: 1000, // 1 second
        errorRate: 0.01 // 1% error rate
      }
    };
    
    // Create and start dashboard
    const dashboard = RateLimitDashboard.getInstance(
      rateLimitMonitoringService,
      monitoringService,
      dashboardConfig
    );
    
    await dashboard.start();
    
    // Handle process termination
    process.on('SIGINT', async () => {
      logger.info('Stopping rate limit monitoring dashboard');
      await dashboard.stop();
      process.exit(0);
    });
    
    logger.info('Rate limit monitoring dashboard started successfully');
  } catch (error) {
    logger.error('Failed to start rate limit monitoring dashboard', { error });
    process.exit(1);
  }
}

// Start the dashboard
startRateLimitDashboard(); 