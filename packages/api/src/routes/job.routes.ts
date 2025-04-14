// Job Routes: Defines internal API endpoints for triggering background jobs
import { Router } from 'express';
import * as jobController from '../controllers/job.controller';

const router = Router();

// Route for the Replit background worker to call for initial Strava sync
// POST /jobs/strava-initial-sync
// Expects { userId: string } in the body
router.post('/strava-initial-sync', jobController.handleStravaInitialSyncJob);

// Add other job routes here...

export default router; 