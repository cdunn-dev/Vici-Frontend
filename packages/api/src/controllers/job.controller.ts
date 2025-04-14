// Job Controller: Handles incoming requests for background jobs
import { Request, Response, NextFunction } from 'express';
import { StravaService } from '../services/strava.service'; // Adjust path if needed

const stravaService = new StravaService();

/**
 * Handles the trigger for the initial Strava activity sync background job.
 */
export const handleStravaInitialSyncJob = async (req: Request, res: Response, next: NextFunction) => {
    // TODO: Add security - Ensure this endpoint is only callable by Replit worker infra or trusted internal service
    console.log('Received request to handle Strava initial sync job');

    const { userId } = req.body;

    if (!userId) {
        console.error('Strava initial sync job missing userId');
        return res.status(400).json({ success: false, message: 'Missing userId' });
    }

    try {
        console.log(`Starting initial Strava activity sync for user ${userId}`);
        
        // Perform the full activity sync using the service method
        await stravaService.fetchAndStoreStravaActivities(userId);

        // Remove simulation
        // await new Promise(resolve => setTimeout(resolve, 5000)); 
        
        console.log(`Successfully completed initial Strava activity sync job for user ${userId}`);
        // It's important to send a success response so the job runner knows it finished
        res.status(200).json({ success: true, message: 'Sync process completed successfully' });

    } catch (error) {
        console.error(`Error during Strava initial sync job for user ${userId}:`, error);
        res.status(500).json({ success: false, message: 'Sync job failed' });
    }
}; 