// Strava Service: Handles business logic for Strava API interaction, token management, etc.

import { randomBytes } from 'crypto';
import { PrismaClient, UserConnection } from '@prisma/client'; // Import UserConnection type

// Instantiate Prisma Client (consider dependency injection for better testability)
const prisma = new PrismaClient();

// Consider using an HTTP client library like axios or node-fetch if not already available globally

// Define an interface for the expected token structure from Strava
interface StravaTokenData {
    token_type: string; // e.g., "Bearer"
    expires_at: number; // Unix timestamp (seconds)
    expires_in: number; // Seconds from now
    refresh_token: string;
    access_token: string;
    athlete?: any; // Strava includes athlete info in the token response
}

export class StravaService {
    private readonly clientId: string;
    private readonly clientSecret: string;
    private readonly redirectUri: string;
    private readonly baseAuthUrl = 'https://www.strava.com/oauth/authorize';

    constructor() {
        this.clientId = process.env.STRAVA_CLIENT_ID || '';
        this.clientSecret = process.env.STRAVA_CLIENT_SECRET || '';
        this.redirectUri = process.env.STRAVA_REDIRECT_URI || '';

        if (!this.clientId || !this.clientSecret || !this.redirectUri) {
            console.error('Strava environment variables missing in StravaService');
            // Depending on the app structure, might want to throw here
            // or use a more robust config loading mechanism.
        }
    }

    /**
     * Generates a secure random state string for CSRF protection.
     * @returns {string} A random state string.
     */
    private generateState(): string {
        return randomBytes(16).toString('hex');
    }

    /**
     * Creates and stores a state record in the database for CSRF protection.
     * @param {string} userId The ID of the user initiating the flow.
     * @returns {Promise<string>} The generated state string.
     */
    async createAuthState(userId: string): Promise<string> {
        const state = this.generateState();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

        try {
            await prisma.stravaAuthState.create({
                data: {
                    state,
                    userId,
                    expiresAt,
                },
            });
            console.log(`Stored Strava auth state for user ${userId}`);
            return state;
        } catch (error) {
            console.error(`Error storing Strava auth state for user ${userId}:`, error);
            throw new Error('Failed to store Strava auth state.');
        }
    }

    /**
     * Validates the state received from the callback against the stored state.
     * Deletes the state record if valid and not expired.
     * @param {string} receivedState The state string received from the Strava callback query.
     * @returns {Promise<string | null>} The userId associated with the valid state, or null if invalid/expired.
     */
    async validateAuthState(receivedState: string): Promise<string | null> {
        if (!receivedState) {
            console.warn('No state received in Strava callback for validation.');
            return null;
        }

        try {
            const storedState = await prisma.stravaAuthState.findUnique({
                where: { state: receivedState },
            });

            if (!storedState) {
                console.warn(`Received Strava state not found in DB: ${receivedState}`);
                return null;
            }

            // Immediately delete the used state to prevent replay attacks
            await prisma.stravaAuthState.delete({
                where: { id: storedState.id },
            });
            console.log(`Deleted used Strava auth state: ${receivedState}`);

            // Check expiry
            if (storedState.expiresAt < new Date()) {
                console.warn(`Received Strava state has expired: ${receivedState}`);
                return null;
            }

            console.log(`Successfully validated Strava auth state for user ${storedState.userId}`);
            return storedState.userId; // Return the userId associated with the valid state

        } catch (error) {
            console.error(`Error validating Strava auth state ${receivedState}:`, error);
            // Handle potential errors during find or delete
            return null; 
        }
    }

    /**
     * Generates the Strava authorization URL, including a CSRF state parameter.
     * @param {string} userId The ID of the user initiating the flow.
     * @returns {Promise<string>} The full Strava authorization URL.
     */
    async getAuthorizationUrl(userId: string): Promise<string> { // Now async and requires userId
        if (!this.clientId || !this.redirectUri) {
            throw new Error('Strava Client ID or Redirect URI not configured in service.');
        }

        const state = await this.createAuthState(userId); // Create and store state

        const responseType = 'code';
        const approvalPrompt = 'auto';
        const scope = 'read,activity:read_all,profile:read_all';

        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: responseType,
            approval_prompt: approvalPrompt,
            scope: scope,
            state: state, // Use the generated and stored state
        });

        return `${this.baseAuthUrl}?${params.toString()}`;
    }

    /**
     * Exchanges the authorization code received from Strava callback for access and refresh tokens.
     * @param {string} code The authorization code from Strava.
     * @returns {Promise<object>} An object containing the tokens (access_token, refresh_token, expires_at, etc.).
     */
    async exchangeCodeForTokens(code: string): Promise<any> {
        if (!this.clientId || !this.clientSecret) {
            throw new Error('Strava Client ID or Secret not configured in service.');
        }
    
        const tokenUrl = 'https://www.strava.com/oauth/token';
        const params = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            code: code,
            grant_type: 'authorization_code',
        });
    
        try {
            // Using Fetch API - ensure node-fetch or similar is installed if not on Node 18+
            const response = await fetch(tokenUrl, {
                method: 'POST',
                body: params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error exchanging Strava code for tokens:', response.status, errorData);
                // Rethrow a more specific error maybe?
                throw new Error(`Strava token exchange failed: ${response.status} ${response.statusText}`);
            }
    
            const tokenData = await response.json();
            console.log('Successfully exchanged code for tokens:', tokenData); 
            // It's good practice to calculate the exact expiry timestamp here
            // Strava returns expires_in (seconds from now)
            const nowInSeconds = Math.floor(Date.now() / 1000);
            const expires_at = nowInSeconds + (tokenData.expires_in || 0); // Handle case where expires_in might be missing
            
            return { 
                ...tokenData, 
                expires_at: expires_at // Add calculated timestamp
            };
        } catch (error) {
            console.error('Network or other error during Strava token exchange:', error);
            // Rethrow or handle as appropriate
            throw error;
        }
    }

    /**
     * Retrieves the UserConnection record for Strava for a given user.
     * @param {string} userId The Vici user ID.
     * @returns {Promise<UserConnection | null>} The connection record or null if not found.
     */
    private async getStravaConnection(userId: string): Promise<UserConnection | null> {
        try {
            return await prisma.userConnection.findUnique({
                where: { 
                    userId_provider: { userId, provider: 'strava' } 
                },
            });
        } catch (error) {
            console.error(`Error fetching Strava connection for user ${userId}:`, error);
            return null;
        }
    }

    /**
     * Refreshes the Strava access token using the refresh token.
     * Updates the stored tokens in the database.
     * @param {string} userId The Vici user ID.
     * @param {string} refreshToken The Strava refresh token.
     * @returns {Promise<string>} The new access token.
     */
    private async refreshAccessToken(userId: string, refreshToken: string): Promise<string> {
        console.log(`Attempting to refresh Strava token for user ${userId}`);
        if (!this.clientId || !this.clientSecret) {
            throw new Error('Strava Client ID or Secret not configured for token refresh.');
        }

        const tokenUrl = 'https://www.strava.com/oauth/token';
        const params = new URLSearchParams({
            client_id: this.clientId,
            client_secret: this.clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        });

        try {
            const response = await fetch(tokenUrl, {
                method: 'POST',
                body: params,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error refreshing Strava token:', response.status, errorData);
                // If refresh fails (e.g., revoked token), we might need to mark the connection as invalid
                // await prisma.userConnection.update({ where: { ... }, data: { accessToken: null, refreshToken: null, expiresAt: null } });
                throw new Error(`Strava token refresh failed: ${response.statusText}`);
            }

            const newTokens: Omit<StravaTokenData, 'athlete'> = await response.json();
            console.log(`Successfully refreshed Strava token for user ${userId}`);

            const nowInSeconds = Math.floor(Date.now() / 1000);
            const expires_at = nowInSeconds + (newTokens.expires_in || 0);

            // Update the database with the new tokens
            await prisma.userConnection.update({
                where: { userId_provider: { userId, provider: 'strava' } },
                data: {
                    accessToken: newTokens.access_token,
                    refreshToken: newTokens.refresh_token, // Strava might return a new refresh token
                    expiresAt: new Date(expires_at * 1000),
                    updatedAt: new Date(),
                },
            });
            console.log(`Updated refreshed tokens in DB for user ${userId}`);

            return newTokens.access_token;
        } catch (error) {
            console.error(`Network or other error during Strava token refresh for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Gets a valid Strava access token for the user, refreshing if necessary.
     * @param {string} userId The Vici user ID.
     * @returns {Promise<string | null>} A valid access token or null if unavailable/refresh failed.
     */
    async getValidAccessToken(userId: string): Promise<string | null> {
        const connection = await this.getStravaConnection(userId);

        if (!connection || !connection.accessToken || !connection.refreshToken || !connection.expiresAt) {
            console.log(`No valid Strava connection found for user ${userId}`);
            return null;
        }

        // Check if token is expired or close to expiring (e.g., within 5 minutes)
        const now = new Date();
        const expiryBuffer = 5 * 60 * 1000; // 5 minutes in milliseconds
        if (connection.expiresAt.getTime() - expiryBuffer < now.getTime()) {
            console.log(`Strava token expired or expiring soon for user ${userId}. Refreshing...`);
            try {
                return await this.refreshAccessToken(userId, connection.refreshToken);
            } catch (error) {
                console.error(`Failed to refresh Strava token for user ${userId}.`);
                return null; // Refresh failed
            }
        }

        // Token is valid
        return connection.accessToken;
    }

    /**
     * Saves or updates the Strava connection details for a user.
     * Uses upsert for atomicity: creates if not exists, updates if exists.
     * @param {string} userId The Vici user ID.
     * @param {StravaTokenData} tokens The token data received from Strava.
     * @returns {Promise<UserConnection>} The created or updated UserConnection record.
     */
    async saveUserStravaConnection(userId: string, tokens: StravaTokenData): Promise<UserConnection> {
        if (!userId || !tokens || !tokens.access_token || !tokens.refresh_token || !tokens.expires_at) {
            throw new Error('Missing required data to save Strava connection.');
        }

        const provider = 'strava'; // Define provider identifier
        const providerUserId = tokens.athlete?.id?.toString(); // Extract athlete ID if available
        
        try {
            const connection = await prisma.userConnection.upsert({
                where: {
                    userId_provider: { // Unique constraint
                        userId: userId,
                        provider: provider,
                    },
                },
                update: {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: new Date(tokens.expires_at * 1000), // Convert seconds to JS Date
                    scopes: ['read', 'activity:read_all', 'profile:read_all'], // Store the scopes granted
                    providerUserId: providerUserId, // Update athlete ID
                    updatedAt: new Date(),
                },
                create: {
                    userId: userId,
                    provider: provider,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: new Date(tokens.expires_at * 1000),
                    scopes: ['read', 'activity:read_all', 'profile:read_all'],
                    providerUserId: providerUserId, // Store athlete ID
                },
            });
            console.log(`Saved/Updated Strava connection for user ${userId}`);
            return connection;
        } catch (error) {
            console.error(`Error saving Strava connection for user ${userId}:`, error);
            throw new Error('Failed to save Strava connection details.');
        }
    }

    /**
     * Fetches the authenticated user's athlete data from the Strava API.
     * @param {string} userId The Vici user ID.
     * @returns {Promise<any | null>} The Strava athlete data object or null if fetch fails.
     */
    async fetchStravaAthleteData(userId: string): Promise<any | null> {
        const accessToken = await this.getValidAccessToken(userId);
        if (!accessToken) {
            console.error(`Cannot fetch Strava athlete data for user ${userId}: No valid access token.`);
            return null;
        }

        const athleteUrl = 'https://www.strava.com/api/v3/athlete';

        try {
            const response = await fetch(athleteUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                // Handle potential errors like 401 Unauthorized (token issue), 429 Rate Limit, etc.
                const errorText = await response.text();
                console.error(`Error fetching Strava athlete data for user ${userId}: ${response.status} ${response.statusText}`, errorText);
                // Optionally, you might want to invalidate the token here if it's a 401
                return null;
            }

            const athleteData = await response.json();
            console.log(`Successfully fetched Strava athlete data for user ${userId}`);
            return athleteData;

        } catch (error) {
            console.error(`Network or other error fetching Strava athlete data for user ${userId}:`, error);
            return null;
        }
    }

    /**
     * Fetches all available running activities for a user from Strava using pagination
     * and stores them in the Vici database.
     * @param {string} userId The Vici user ID.
     */
    async fetchAndStoreStravaActivities(userId: string): Promise<void> {
        const accessToken = await this.getValidAccessToken(userId);
        if (!accessToken) {
            console.error(`Cannot sync Strava activities for user ${userId}: No valid access token.`);
            throw new Error('Invalid access token for Strava activity sync.');
        }

        const activitiesUrl = 'https://www.strava.com/api/v3/athlete/activities';
        let page = 1;
        const perPage = 50; // Fetch 50 activities per page
        const maxPages = 20; // Safety break: Limit to fetching ~1000 activities max initially
        let activitiesFetchedInPage = 0;
        let totalActivitiesProcessed = 0;
        let continueFetching = true;

        console.log(`Starting Strava activity fetch loop for user ${userId}`);

        try {
            while (continueFetching && page <= maxPages) {
                const params = new URLSearchParams({
                    page: page.toString(),
                    per_page: perPage.toString(),
                });

                console.log(`Fetching Strava activities page ${page} for user ${userId}`);
                let response: Response;
                try {
                    response = await fetch(`${activitiesUrl}?${params.toString()}`, {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                } catch (networkError) {
                    console.error(`Network error fetching Strava activities page ${page} for user ${userId}:`, networkError);
                    // Stop sync on network error for now. Could implement retry later.
                    continueFetching = false;
                    break; 
                }

                if (response.status === 401) {
                    console.error(`Strava API returned 401 Unauthorized for user ${userId}. Invalidating token and stopping sync.`);
                    // Optionally mark the token as invalid in the DB
                    // await prisma.userConnection.update({ where: { ... }, data: { accessToken: null } });
                    continueFetching = false;
                    break;
                }
                
                if (response.status === 429) {
                     console.warn(`Strava API rate limit hit for user ${userId} on page ${page}. Stopping sync for now.`);
                    // TODO: Implement proper backoff and retry logic for rate limits
                    continueFetching = false;
                    break;
                }

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Unhandled error fetching Strava activities page ${page} for user ${userId}: ${response.status} ${response.statusText}`, errorText);
                    // Stop sync on other unhandled errors
                    continueFetching = false;
                    break;
                }

                const activities: any[] = await response.json();
                activitiesFetchedInPage = activities.length;
                console.log(`Fetched ${activitiesFetchedInPage} activities on page ${page} for user ${userId}`);

                if (activitiesFetchedInPage > 0) {
                    const runActivities = activities.filter(act => 
                        act.type === 'Run' || 
                        act.sport_type === 'Run' || // Some activities might use sport_type
                        act.sport_type === 'VirtualRun' 
                    );
                    
                    if (runActivities.length > 0) {
                        const activitiesToUpsert = runActivities.map(act => ({
                            // --- Data Mapping Review --- 
                            id: `strava-${act.id}`, 
                            userId: userId,
                            source: 'Strava' as const, // Use const assertion if ActivitySource is an enum type
                            sourceActivityId: act.id.toString(),
                            startTime: new Date(act.start_date),
                            name: act.name || '', // Use empty string instead of null for Prisma upsert? Check model
                            description: act.description || null,
                            distanceMeters: Math.round(act.distance || 0),
                            movingTimeSeconds: Math.round(act.moving_time || 0),
                            elapsedTimeSeconds: Math.round(act.elapsed_time || 0),
                            averagePaceSecondsPerKm: act.average_speed ? Math.round(1000 / act.average_speed) : 0,
                            maxPaceSecondsPerKm: act.max_speed ? Math.round(1000 / act.max_speed) : null,
                            averageHeartRate: act.average_heartrate ? Math.round(act.average_heartrate) : null,
                            maxHeartRate: act.max_heartrate ? Math.round(act.max_heartrate) : null,
                            totalElevationGainMeters: Math.round(act.total_elevation_gain || 0),
                            mapPolyline: act.map?.summary_polyline || null,
                            hasPhotos: act.total_photo_count > 0, // Use total_photo_count
                            updatedAt: new Date(), 
                            // Fields to set later: isReconciled, reconciliationType, reconciledWorkoutId, perceivedEffort, journalEntry
                            // Fields not directly available: mapThumbnailUrl, photos array, detailedStats (streams)
                        }));

                        // Batch Upsert Logic (remains the same)
                        console.log(`Attempting to upsert ${activitiesToUpsert.length} run activities for user ${userId} from page ${page}`);
                        const results = await Promise.allSettled(
                            activitiesToUpsert.map(activityData =>
                                prisma.activity.upsert({
                                    where: { id: activityData.id }, 
                                    update: activityData, 
                                    create: activityData,
                                })
                            )
                        );
                        const successfulUpserts = results.filter(r => r.status === 'fulfilled').length;
                        const failedUpserts = results.filter(r => r.status === 'rejected');
                        totalActivitiesProcessed += successfulUpserts;
                        console.log(`Successfully upserted ${successfulUpserts} run activities for user ${userId} from page ${page}`);
                        if (failedUpserts.length > 0) {
                            console.warn(`Failed to upsert ${failedUpserts.length} run activities for user ${userId} from page ${page}:`, failedUpserts.map(r => (r as PromiseRejectedResult).reason));
                        }
                    } else {
                        console.log(`No run activities found on page ${page} for user ${userId}`);
                    }

                    page++; 
                    
                    // Check if we should stop fetching (either last page had < perPage items or max pages reached)
                    if (activitiesFetchedInPage < perPage || page > maxPages) {
                        continueFetching = false;
                    }

                    // Add delay between pages if continuing
                    if (continueFetching) {
                        await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
                    }
                } else {
                    // No activities returned on this page, stop fetching
                    continueFetching = false;
                }
            } // End while loop

            console.log(`Completed Strava activity fetch loop for user ${userId}. Total run activities processed: ${totalActivitiesProcessed}`);

            // Update last sync time only if the loop completed naturally or hit max pages (not on error)
            if (page > maxPages || activitiesFetchedInPage < perPage) {
                 await prisma.userConnection.update({
                    where: { userId_provider: { userId, provider: 'strava' } },
                    data: { lastSyncAt: new Date() },
                });
                console.log(`Updated lastSyncAt for user ${userId}`);
            }

        } catch (error) {
            console.error(`Strava activity sync failed for user ${userId}:`, error);
            // Re-throw to let the job handler know it failed
            throw error;
        }
    }

    /**
     * Triggers the background job for the initial Strava activity sync.
     * Makes an async request to the internal job endpoint.
     * @param {string} userId The Vici user ID.
     */
    async triggerInitialActivitySync(userId: string): Promise<void> {
        // Construct the full internal URL for the job endpoint
        // Assumes the API runs on localhost:3000/3001 locally. Adjust if needed.
        // For Replit deployment, this URL will need to be the deployed service URL.
        // TODO: Make the base URL configurable via environment variables.
        const jobEndpointUrl = `${process.env.API_INTERNAL_URL || 'http://localhost:3001'}/api/jobs/strava-initial-sync`;

        console.log(`Triggering Strava initial activity sync job for user ${userId} via POST to ${jobEndpointUrl}`);

        try {
            // We don't wait for the response here - just fire and forget
            // The actual work happens in the background worker triggered by this request.
            fetch(jobEndpointUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // TODO: Add internal auth header if the job endpoint is secured
                    // 'X-Internal-Auth-Key': process.env.INTERNAL_JOB_AUTH_KEY || ''
                },
                body: JSON.stringify({ userId: userId }),
            })
            .then(async response => {
                // Log the response status asynchronously, but don't block
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Error triggering Strava sync job for user ${userId}: ${response.status} ${response.statusText}`, errorText);
                } else {
                    console.log(`Successfully triggered Strava sync job request for user ${userId}, status: ${response.status}`);
                }
            })
            .catch(error => {
                // Log network errors during the trigger request
                console.error(`Network error triggering Strava sync job for user ${userId}:`, error);
            });

        } catch (error) {
            // Catch synchronous errors during the fetch call setup (unlikely)
            console.error(`Synchronous error triggering Strava sync job for user ${userId}:`, error);
            // We might not want to re-throw here, as the main callback flow should continue.
        }
    }

    // TODO:
    // - Fetching activities using stored token
    // - Deauthorizing
} 