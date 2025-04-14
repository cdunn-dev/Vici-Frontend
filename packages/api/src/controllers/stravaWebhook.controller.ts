// Strava Webhook Controller: Handles incoming webhook requests from Strava
import { Request, Response, NextFunction } from 'express';
import { StravaService } from '../services/strava.service'; // Adjust path if needed

// TODO: Add secure comparison function for verify token

const stravaService = new StravaService();

// This should match the token you provide when creating the subscription in Strava settings
const STRAVA_VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'default-verify-token';

/**
 * Handles the Strava webhook subscription verification request (GET).
 * Responds with the hub.challenge value if the verify token matches.
 */
export const verifySubscription = (req: Request, res: Response, next: NextFunction) => {
    console.log('Received Strava webhook verification request:', req.query);
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verifies that the hub.verify_token sent by Strava matches our verify token
    if (mode === 'subscribe' && token === STRAVA_VERIFY_TOKEN) {
        // Responds with the challenge token from the request
        console.log('Strava webhook verification successful!');
        res.status(200).json({ "hub.challenge": challenge });
    } else {
        // Responds with 403 Forbidden if verify tokens do not match
        console.warn('Strava webhook verification failed: Invalid mode or token.');
        res.sendStatus(403);
    }
};

/**
 * Handles incoming Strava event notifications (POST).
 * Processes activity updates/creations/deletions and deauthorizations.
 */
export const handleEvent = async (req: Request, res: Response, next: NextFunction) => {
    console.log('Received Strava webhook event:', JSON.stringify(req.body, null, 2));
    
    const event = req.body;

    // Acknowledge receipt immediately
    res.status(200).send('EVENT_RECEIVED');

    // --- Process Event Asynchronously --- 
    // Use Promise.resolve().then() for cleaner async background processing
    Promise.resolve().then(async () => {
        try {
            if (event.object_type === 'athlete') {
                if (event.aspect_type === 'update' && event.updates?.authorized === false) {
                    console.log(`Processing Strava deauthorization for athlete ID: ${event.owner_id}`);
                    await stravaService.handleDeauthorization(event.owner_id);
                }
            } else if (event.object_type === 'activity') {
                const stravaUserId = event.owner_id;
                const stravaActivityId = event.object_id;
                const eventType = event.aspect_type;

                const viciUserId = await stravaService.findViciUserIdByStravaId(stravaUserId);
                if (!viciUserId) {
                    console.warn(`Webhook event ignored: Could not find Vici user for Strava athlete ID: ${stravaUserId}`);
                    return;
                }

                console.log(`Processing Strava activity event for Vici User ${viciUserId}: Strava Activity ${stravaActivityId}, Type: ${eventType}`);
                if (eventType === 'create' || eventType === 'update') {
                     await stravaService.fetchAndStoreSingleActivity(viciUserId, stravaActivityId);
                } else if (eventType === 'delete') {
                     await stravaService.deleteActivity(viciUserId, stravaActivityId);
                }
            } else {
                console.warn('Received unknown Strava webhook event type:', event.object_type);
            }
        } catch (error) {
            console.error('Error processing Strava webhook event asynchronously:', error);
        }
    }).catch(error => {
        // Catch errors from the Promise chain itself 
        console.error('Error in webhook async processing chain:', error);
    });
}; 