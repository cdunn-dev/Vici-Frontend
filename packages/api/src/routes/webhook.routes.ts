// Webhook Routes: Defines endpoints for receiving events from third-party services
import { Router } from 'express';
import * as stravaWebhookController from '../controllers/stravaWebhook.controller'; // We will create this controller next

const router = Router();

// --- Strava Webhooks ---

// GET /webhooks/strava - For Strava subscription verification
router.get('/strava', stravaWebhookController.verifySubscription);

// POST /webhooks/strava - For receiving activity/deauthorization events
router.post('/strava', stravaWebhookController.handleEvent);

// --- Add other webhook routes here (e.g., Garmin) ---

export default router; 