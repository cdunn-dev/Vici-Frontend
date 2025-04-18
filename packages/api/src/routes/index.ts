import * as express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import trainingRoutes from './training.routes';
import analyticsRoutes from './analytics.routes';
import stravaRoutes from './strava.routes';
import jobRoutes from './job.routes';
import webhookRoutes from './webhook.routes';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is up and running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/training', trainingRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/integrations/strava', stravaRoutes);

// Mount internal job routes
router.use('/jobs', jobRoutes);

// Mount webhook routes
router.use('/webhooks', webhookRoutes);

export default router; 