// Strava Routes: Defines API endpoints related to Strava integration
import { Router } from 'express';
import * as stravaController from '../controllers/strava.controller'; // Adjust path if needed
import { authenticateJwt } from '../middleware/auth'; // Import auth middleware

const router = Router();

// Route to initiate the Strava OAuth flow
// Requires user to be logged in
// GET /api/integrations/strava/connect
router.get('/connect', authenticateJwt, stravaController.redirectToStrava);

// Route for the callback from Strava
// GET /api/integrations/strava/callback
// Note: Authentication for the callback might be handled differently,
// often relying on the CSRF state validation to link back to the user session
// that initiated the flow, rather than requiring a JWT header here.
router.get('/callback', stravaController.handleStravaCallback);

export default router; 