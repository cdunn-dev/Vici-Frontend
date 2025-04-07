import { Router, Request, Response } from 'express';
import { PerformanceMonitoringService } from '../services/performanceMonitoringService';
import { PerformanceDashboard } from '../services/performanceDashboard';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Get all performance metrics
 * @route GET /api/performance/metrics
 */
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const performanceService = PerformanceMonitoringService.getInstance();
    const timeRange = req.query.timeRange 
      ? JSON.parse(req.query.timeRange as string) 
      : undefined;
    
    const metrics = performanceService.getMetrics(timeRange);
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error getting performance metrics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get performance metrics'
    });
  }
});

/**
 * Get metrics for a specific endpoint
 * @route GET /api/performance/metrics/:endpoint
 */
router.get('/metrics/:endpoint', async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.params;
    const { method = 'GET' } = req.query;
    const timeRange = req.query.timeRange 
      ? JSON.parse(req.query.timeRange as string) 
      : undefined;
    
    const performanceService = PerformanceMonitoringService.getInstance();
    const metrics = performanceService.getEndpointMetrics(endpoint, timeRange);
    
    // Filter by method if provided
    const filteredMetrics = method 
      ? metrics.filter(m => m.method === method) 
      : metrics;
    
    res.json({
      success: true,
      data: filteredMetrics
    });
  } catch (error) {
    logger.error('Error getting endpoint metrics', { error, endpoint: req.params.endpoint });
    res.status(500).json({
      success: false,
      error: 'Failed to get endpoint metrics'
    });
  }
});

/**
 * Get all performance alerts
 * @route GET /api/performance/alerts
 */
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const performanceService = PerformanceMonitoringService.getInstance();
    const includeResolved = req.query.includeResolved === 'true';
    
    const alerts = performanceService.getAlerts(includeResolved);
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    logger.error('Error getting performance alerts', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get performance alerts'
    });
  }
});

/**
 * Get a specific performance alert
 * @route GET /api/performance/alerts/:id
 */
router.get('/alerts/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const performanceService = PerformanceMonitoringService.getInstance();
    
    const alert = performanceService.getAlertById(id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
    
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    logger.error('Error getting performance alert', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to get performance alert'
    });
  }
});

/**
 * Acknowledge a performance alert
 * @route POST /api/performance/alerts/:id/acknowledge
 */
router.post('/alerts/:id/acknowledge', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const performanceService = PerformanceMonitoringService.getInstance();
    
    performanceService.acknowledgeAlert(id);
    
    res.json({
      success: true,
      message: 'Alert acknowledged successfully'
    });
  } catch (error) {
    logger.error('Error acknowledging performance alert', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to acknowledge performance alert'
    });
  }
});

/**
 * Resolve a performance alert
 * @route POST /api/performance/alerts/:id/resolve
 */
router.post('/alerts/:id/resolve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const performanceService = PerformanceMonitoringService.getInstance();
    
    performanceService.resolveAlert(id);
    
    res.json({
      success: true,
      message: 'Alert resolved successfully'
    });
  } catch (error) {
    logger.error('Error resolving performance alert', { error, id: req.params.id });
    res.status(500).json({
      success: false,
      error: 'Failed to resolve performance alert'
    });
  }
});

/**
 * Get performance dashboard data
 * @route GET /api/performance/dashboard
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const dashboard = PerformanceDashboard.getInstance();
    
    const systemSummary = dashboard.getSystemSummary();
    const endpointSummaries = dashboard.getEndpointSummaries();
    
    res.json({
      success: true,
      data: {
        system: systemSummary,
        endpoints: endpointSummaries
      }
    });
  } catch (error) {
    logger.error('Error getting performance dashboard', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get performance dashboard'
    });
  }
});

/**
 * Get performance summary for a specific endpoint
 * @route GET /api/performance/dashboard/endpoints/:endpoint
 */
router.get('/dashboard/endpoints/:endpoint', async (req: Request, res: Response) => {
  try {
    const { endpoint } = req.params;
    const { method = 'GET' } = req.query;
    
    const dashboard = PerformanceDashboard.getInstance();
    const summary = dashboard.getEndpointSummary(endpoint, method as string);
    
    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'Endpoint summary not found'
      });
    }
    
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Error getting endpoint summary', { error, endpoint: req.params.endpoint });
    res.status(500).json({
      success: false,
      error: 'Failed to get endpoint summary'
    });
  }
});

export default router; 