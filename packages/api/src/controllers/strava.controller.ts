// Strava Controller: Handles HTTP requests for Strava integration 
import { Request, Response, NextFunction } from 'express';

// Import StravaService
import { StravaService } from '../services/strava.service'; // Adjust path if needed
import { UserService } from '../services/user.service'; // Import UserService

// Initialize StravaService (consider dependency injection if using a framework like NestJS)
const stravaService = new StravaService();
const userService = new UserService(); // Instantiate UserService

// Define an interface for the expected user object on the request
// Adjust this based on the actual properties in your JWT payload
interface AuthenticatedUser {
    id: string; 
    email?: string;
    // Add other relevant user properties from JWT
}

/**
 * Redirects the user to the Strava authorization page.
 */
export const redirectToStrava = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Ensure req.user exists and has an ID (due to authenticateJwt middleware)
        const user = req.user as AuthenticatedUser | undefined;
        if (!user || !user.id) {
             console.error('User context missing in redirectToStrava despite middleware.');
            // This shouldn't happen if authenticateJwt runs correctly
            return res.status(401).json({ message: 'Authentication required.'});
        }
        const userId = user.id;

        // Get the Strava authorization URL from the service, passing the userId
        const authUrl = await stravaService.getAuthorizationUrl(userId);

        console.log(`Redirecting user ${userId} to: ${authUrl}`);
        res.redirect(authUrl);
    } catch (error) {
        console.error('Error redirecting to Strava:', error);
        next(error); 
    }
};

/**
 * Handles the callback from Strava after user authorization.
 */
export const handleStravaCallback = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const code = req.query.code as string;
        const state = req.query.state as string;
        const error = req.query.error as string;

        if (error) {
            console.error('Strava authorization denied by user:', error);
            return res.redirect('http://localhost:8081/settings?strava_error=access_denied'); 
        }

        // Validate the state parameter
        const validatedUserId = await stravaService.validateAuthState(state);
        if (!validatedUserId) {
            console.error('Invalid or expired Strava callback state received.');
            return res.redirect('http://localhost:8081/settings?strava_error=invalid_state');
        }

        // State is valid, proceed with code exchange
        if (!code) {
            console.error('Strava callback missing authorization code despite valid state.');
            return res.redirect('http://localhost:8081/settings?strava_error=missing_code');
        }

        // Exchange code for tokens using StravaService
        const tokens = await stravaService.exchangeCodeForTokens(code);

        // Save the connection details
        await stravaService.saveUserStravaConnection(validatedUserId, tokens);

        // Fetch athlete data immediately after connecting
        // Use the athlete data included in the token exchange response if possible
        const athleteData = tokens.athlete || await stravaService.fetchStravaAthleteData(validatedUserId);

        if (athleteData) {
            console.log(`Processing initial Strava athlete data for user ${validatedUserId}`);
            await userService.updateProfileFromStrava(validatedUserId, athleteData);
        } else {
            console.warn(`Could not fetch/find initial Strava athlete data for user ${validatedUserId} after connection.`);
        }

        // Trigger asynchronous initial activity sync
        stravaService.triggerInitialActivitySync(validatedUserId);

        // Redirect user to a success page or back to settings
        console.log(`Strava connection successful, profile updated, and initial sync triggered for user ${validatedUserId}!`);
        res.redirect('http://localhost:8081/settings?strava_success=true');

    } catch (error) {
        console.error('Error handling Strava callback:', error);
        res.redirect('http://localhost:8081/settings?strava_error=callback_failed');
    }
}; 