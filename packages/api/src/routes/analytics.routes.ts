import express from 'express';
import { authenticateJwt } from '../middleware/auth';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = express.Router();
const analyticsController = new AnalyticsController();

/**
 * @route GET /api/analytics/overview
 * @desc Get user dashboard overview
 * @access Private
 */
router.get('/overview', authenticateJwt, analyticsController.getOverview);

/**
 * @route GET /api/analytics/performance
 * @desc Get user performance metrics
 * @access Private
 */
router.get('/performance', authenticateJwt, analyticsController.getPerformance);

/**
 * @route GET /api/analytics/progress
 * @desc Get user training progress
 * @access Private
 */
router.get('/progress', authenticateJwt, analyticsController.getProgress);

/**
 * @route GET /api/analytics/insights
 * @desc Get AI-powered insights based on user's training
 * @access Private
 */
router.get('/insights', authenticateJwt, analyticsController.getInsights);

export default router; 