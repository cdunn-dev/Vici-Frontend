const request = require('supertest');
const app = require('../../src/index').default; // Adjust path to your Express app instance
const jwt = require('jsonwebtoken');
const { mocks } = require('../setupJest');

// Test data
const TEST_USER_ID = 'test-user-123';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret'; // Use a test secret
const validToken = jwt.sign({ id: TEST_USER_ID }, JWT_SECRET, { expiresIn: '1h' });
const stravaAuthUrl = 'https://www.strava.com/oauth/authorize?client_id=test&redirect_uri=test&state=test-state-123';

describe('Strava Integration API Endpoints', () => {

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();
    });

    describe('GET /api/integrations/strava/connect', () => {
        it('should redirect to Strava auth URL for authenticated users', async () => {
            mocks.getAuthorizationUrl.mockResolvedValue(stravaAuthUrl);

            const response = await request(app)
                .get('/api/integrations/strava/connect')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(302); // Expect redirect
            expect(response.headers.location).toBe(stravaAuthUrl);
            expect(mocks.getAuthorizationUrl).toHaveBeenCalledWith(TEST_USER_ID);
        });

        it('should return 401 if no token is provided', async () => {
            const response = await request(app)
                .get('/api/integrations/strava/connect');
            
            expect(response.status).toBe(401);
            expect(response.body.message).toContain('No token provided');
        });

        it('should return 401 if token is invalid', async () => {
            const invalidToken = 'invalid-token-string';
            const response = await request(app)
                .get('/api/integrations/strava/connect')
                .set('Authorization', `Bearer ${invalidToken}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toContain('Invalid token');
        });

        it('should handle errors during URL generation', async () => {
            mocks.getAuthorizationUrl.mockRejectedValue(new Error('Service error'));

            const response = await request(app)
                .get('/api/integrations/strava/connect')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500); // Assuming default error handler returns 500
             expect(response.body.message).toContain('Service error'); 
        });
    });

    describe('GET /api/integrations/strava/callback', () => {
        const testCode = 'strava-auth-code-123';
        const testState = 'test-state-123';
        const testTokens = { access_token: 'acc_123', refresh_token: 'ref_456', expires_at: 1700000000, athlete: { id: 987 } };
        const successRedirect = 'http://localhost:8081/settings?strava_success=true';
        const deniedRedirect = 'http://localhost:8081/settings?strava_error=access_denied';
        const invalidStateRedirect = 'http://localhost:8081/settings?strava_error=invalid_state';
        const missingCodeRedirect = 'http://localhost:8081/settings?strava_error=missing_code';
        const failedRedirect = 'http://localhost:8081/settings?strava_error=callback_failed';

        it('should handle successful callback, save tokens, update profile, trigger sync, and redirect', async () => {
            mocks.validateAuthState.mockResolvedValue(TEST_USER_ID); // Return valid user ID for the state
            mocks.exchangeCodeForTokens.mockResolvedValue(testTokens);
            mocks.saveUserStravaConnection.mockResolvedValue({}); // Mock successful save
            mocks.updateProfileFromStrava.mockResolvedValue({}); // Mock successful profile update
            mocks.triggerInitialActivitySync.mockResolvedValue(undefined);

            const response = await request(app)
                .get(`/api/integrations/strava/callback?code=${testCode}&state=${testState}&scope=read,activity:read_all`);

            expect(response.status).toBe(302); // Expect redirect
            expect(response.headers.location).toBe(successRedirect);
            expect(mocks.validateAuthState).toHaveBeenCalledWith(testState);
            expect(mocks.exchangeCodeForTokens).toHaveBeenCalledWith(testCode);
            expect(mocks.saveUserStravaConnection).toHaveBeenCalledWith(TEST_USER_ID, testTokens);
            expect(mocks.updateProfileFromStrava).toHaveBeenCalledWith(TEST_USER_ID, testTokens.athlete);
            expect(mocks.triggerInitialActivitySync).toHaveBeenCalledWith(TEST_USER_ID);
        });
        
        it('should redirect with error if user denies access', async () => {
             const response = await request(app)
                .get(`/api/integrations/strava/callback?error=access_denied&state=${testState}`);

            expect(response.status).toBe(302);
            expect(response.headers.location).toBe(deniedRedirect);
            expect(mocks.validateAuthState).not.toHaveBeenCalled();
        });

        it('should redirect with error if state is invalid or expired', async () => {
            mocks.validateAuthState.mockResolvedValue(null); // Simulate invalid state

            const response = await request(app)
                .get(`/api/integrations/strava/callback?code=${testCode}&state=invalidOrExpiredState&scope=read`);

            expect(response.status).toBe(302);
            expect(response.headers.location).toBe(invalidStateRedirect);
            expect(mocks.validateAuthState).toHaveBeenCalledWith('invalidOrExpiredState');
            expect(mocks.exchangeCodeForTokens).not.toHaveBeenCalled();
        });

        it('should redirect with error if code is missing', async () => {
            mocks.validateAuthState.mockResolvedValue(TEST_USER_ID); // State is valid

            const response = await request(app)
                .get(`/api/integrations/strava/callback?state=${testState}&scope=read`); // No code

            expect(response.status).toBe(302);
            expect(response.headers.location).toBe(missingCodeRedirect);
            expect(mocks.validateAuthState).toHaveBeenCalledWith(testState);
            expect(mocks.exchangeCodeForTokens).not.toHaveBeenCalled();
        });

        it('should redirect with error if token exchange fails', async () => {
            mocks.validateAuthState.mockResolvedValue(TEST_USER_ID);
            mocks.exchangeCodeForTokens.mockRejectedValue(new Error('Strava API Error'));

            const response = await request(app)
                .get(`/api/integrations/strava/callback?code=${testCode}&state=${testState}&scope=read`);

            expect(response.status).toBe(302);
            expect(response.headers.location).toBe(failedRedirect);
            expect(mocks.saveUserStravaConnection).not.toHaveBeenCalled();
        });

        it('should redirect with error if saving connection fails', async () => {
             mocks.validateAuthState.mockResolvedValue(TEST_USER_ID);
            mocks.exchangeCodeForTokens.mockResolvedValue(testTokens);
            mocks.saveUserStravaConnection.mockRejectedValue(new Error('DB Error'));

            const response = await request(app)
                .get(`/api/integrations/strava/callback?code=${testCode}&state=${testState}&scope=read`);
            
            expect(response.status).toBe(302);
            expect(response.headers.location).toBe(failedRedirect);
        });

         it('should still succeed redirect even if initial profile update fails', async () => {
            mocks.validateAuthState.mockResolvedValue(TEST_USER_ID); 
            mocks.exchangeCodeForTokens.mockResolvedValue(testTokens);
            mocks.saveUserStravaConnection.mockResolvedValue({}); 
            mocks.updateProfileFromStrava.mockRejectedValue(new Error('Profile update failed')); // Simulate profile update failure
            mocks.triggerInitialActivitySync.mockResolvedValue(undefined);

            const response = await request(app)
                .get(`/api/integrations/strava/callback?code=${testCode}&state=${testState}&scope=read,activity:read_all`);

            expect(response.status).toBe(302); // Still expect redirect
            expect(response.headers.location).toBe(successRedirect);
            expect(mocks.saveUserStravaConnection).toHaveBeenCalled();
            expect(mocks.updateProfileFromStrava).toHaveBeenCalled(); // It was called
            expect(mocks.triggerInitialActivitySync).toHaveBeenCalled(); // Sync should still be triggered
        });

        it('should still succeed redirect even if triggering sync fails (fire and forget)', async () => {
            mocks.validateAuthState.mockResolvedValue(TEST_USER_ID); 
            mocks.exchangeCodeForTokens.mockResolvedValue(testTokens);
            mocks.saveUserStravaConnection.mockResolvedValue({}); 
            mocks.updateProfileFromStrava.mockResolvedValue({});
            mocks.triggerInitialActivitySync.mockImplementation(() => { throw new Error('Trigger failed') }); // Simulate failure in trigger

            const response = await request(app)
                .get(`/api/integrations/strava/callback?code=${testCode}&state=${testState}&scope=read,activity:read_all`);

            expect(response.status).toBe(302); // Still expect redirect
            expect(response.headers.location).toBe(successRedirect);
            expect(mocks.triggerInitialActivitySync).toHaveBeenCalled(); // It was called
        });
    });

    // Add new test section for Strava webhooks
    describe('Strava Webhook Endpoints', () => {
        const VALID_VERIFY_TOKEN = process.env.STRAVA_WEBHOOK_VERIFY_TOKEN || 'default-verify-token';
        const CHALLENGE = 'some-challenge-string';
        
        describe('GET /api/webhooks/strava (Subscription Verification)', () => {
            it('should respond with the challenge when verify_token is valid', async () => {
                const response = await request(app)
                    .get('/api/webhooks/strava')
                    .query({
                        'hub.mode': 'subscribe',
                        'hub.verify_token': VALID_VERIFY_TOKEN,
                        'hub.challenge': CHALLENGE
                    });
                
                expect(response.status).toBe(200);
                expect(response.body).toEqual({ "hub.challenge": CHALLENGE });
            });
            
            it('should respond with 403 when verify_token is invalid', async () => {
                const response = await request(app)
                    .get('/api/webhooks/strava')
                    .query({
                        'hub.mode': 'subscribe',
                        'hub.verify_token': 'invalid-token',
                        'hub.challenge': CHALLENGE
                    });
                
                expect(response.status).toBe(403);
            });
            
            it('should respond with 403 when mode is not subscribe', async () => {
                const response = await request(app)
                    .get('/api/webhooks/strava')
                    .query({
                        'hub.mode': 'something-else',
                        'hub.verify_token': VALID_VERIFY_TOKEN,
                        'hub.challenge': CHALLENGE
                    });
                
                expect(response.status).toBe(403);
            });
        });
        
        describe('POST /api/webhooks/strava (Event Handling)', () => {
            const STRAVA_ATHLETE_ID = 12345;
            const STRAVA_ACTIVITY_ID = 67890;
            const VICI_USER_ID = 'vici-user-123';
            
            beforeEach(() => {
                // Set up common mock behavior
                mocks.findViciUserIdByStravaId.mockResolvedValue(VICI_USER_ID);
            });
            
            it('should process activity created event', async () => {
                const eventPayload = {
                    object_type: 'activity',
                    object_id: STRAVA_ACTIVITY_ID,
                    aspect_type: 'create',
                    owner_id: STRAVA_ATHLETE_ID,
                    updates: {},
                    event_time: Date.now()
                };
                
                const response = await request(app)
                    .post('/api/webhooks/strava')
                    .send(eventPayload)
                    .set('Content-Type', 'application/json');
                
                expect(response.status).toBe(200);
                expect(response.text).toBe('EVENT_RECEIVED');
                
                // Wait for asynchronous processing
                await new Promise(resolve => setTimeout(resolve, 50));
                
                expect(mocks.findViciUserIdByStravaId).toHaveBeenCalledWith(STRAVA_ATHLETE_ID);
                expect(mocks.fetchAndStoreSingleActivity).toHaveBeenCalledWith(VICI_USER_ID, STRAVA_ACTIVITY_ID);
                expect(mocks.deleteActivity).not.toHaveBeenCalled();
            });
            
            it('should process activity updated event', async () => {
                const eventPayload = {
                    object_type: 'activity',
                    object_id: STRAVA_ACTIVITY_ID,
                    aspect_type: 'update',
                    owner_id: STRAVA_ATHLETE_ID,
                    updates: { title: 'Updated Title' },
                    event_time: Date.now()
                };
                
                const response = await request(app)
                    .post('/api/webhooks/strava')
                    .send(eventPayload)
                    .set('Content-Type', 'application/json');
                
                expect(response.status).toBe(200);
                
                // Wait for asynchronous processing
                await new Promise(resolve => setTimeout(resolve, 50));
                
                expect(mocks.findViciUserIdByStravaId).toHaveBeenCalledWith(STRAVA_ATHLETE_ID);
                expect(mocks.fetchAndStoreSingleActivity).toHaveBeenCalledWith(VICI_USER_ID, STRAVA_ACTIVITY_ID);
                expect(mocks.deleteActivity).not.toHaveBeenCalled();
            });
            
            it('should process activity deleted event', async () => {
                const eventPayload = {
                    object_type: 'activity',
                    object_id: STRAVA_ACTIVITY_ID,
                    aspect_type: 'delete',
                    owner_id: STRAVA_ATHLETE_ID,
                    updates: {},
                    event_time: Date.now()
                };
                
                const response = await request(app)
                    .post('/api/webhooks/strava')
                    .send(eventPayload)
                    .set('Content-Type', 'application/json');
                
                expect(response.status).toBe(200);
                
                // Wait for asynchronous processing
                await new Promise(resolve => setTimeout(resolve, 50));
                
                expect(mocks.findViciUserIdByStravaId).toHaveBeenCalledWith(STRAVA_ATHLETE_ID);
                expect(mocks.deleteActivity).toHaveBeenCalledWith(VICI_USER_ID, STRAVA_ACTIVITY_ID);
                expect(mocks.fetchAndStoreSingleActivity).not.toHaveBeenCalled();
            });
            
            it('should process athlete deauthorization event', async () => {
                const eventPayload = {
                    object_type: 'athlete',
                    object_id: STRAVA_ATHLETE_ID,
                    aspect_type: 'update',
                    owner_id: STRAVA_ATHLETE_ID,
                    updates: { authorized: false },
                    event_time: Date.now()
                };
                
                const response = await request(app)
                    .post('/api/webhooks/strava')
                    .send(eventPayload)
                    .set('Content-Type', 'application/json');
                
                expect(response.status).toBe(200);
                
                // Wait for asynchronous processing
                await new Promise(resolve => setTimeout(resolve, 50));
                
                expect(mocks.handleDeauthorization).toHaveBeenCalledWith(STRAVA_ATHLETE_ID);
                expect(mocks.findViciUserIdByStravaId).not.toHaveBeenCalled();
            });
            
            it('should handle unknown Vici user gracefully', async () => {
                mocks.findViciUserIdByStravaId.mockResolvedValue(null); // No Vici user found
                
                const eventPayload = {
                    object_type: 'activity',
                    object_id: STRAVA_ACTIVITY_ID,
                    aspect_type: 'create',
                    owner_id: STRAVA_ATHLETE_ID,
                    updates: {},
                    event_time: Date.now()
                };
                
                const response = await request(app)
                    .post('/api/webhooks/strava')
                    .send(eventPayload)
                    .set('Content-Type', 'application/json');
                
                expect(response.status).toBe(200);
                
                // Wait for asynchronous processing
                await new Promise(resolve => setTimeout(resolve, 50));
                
                expect(mocks.findViciUserIdByStravaId).toHaveBeenCalledWith(STRAVA_ATHLETE_ID);
                expect(mocks.fetchAndStoreSingleActivity).not.toHaveBeenCalled();
                expect(mocks.deleteActivity).not.toHaveBeenCalled();
            });
            
            it('should handle unknown event types gracefully', async () => {
                const eventPayload = {
                    object_type: 'unknown_type',
                    object_id: STRAVA_ACTIVITY_ID,
                    aspect_type: 'create',
                    owner_id: STRAVA_ATHLETE_ID,
                    updates: {},
                    event_time: Date.now()
                };
                
                const response = await request(app)
                    .post('/api/webhooks/strava')
                    .send(eventPayload)
                    .set('Content-Type', 'application/json');
                
                expect(response.status).toBe(200);
                
                // Wait for asynchronous processing
                await new Promise(resolve => setTimeout(resolve, 50));
                
                expect(mocks.findViciUserIdByStravaId).not.toHaveBeenCalled();
                expect(mocks.fetchAndStoreSingleActivity).not.toHaveBeenCalled();
                expect(mocks.deleteActivity).not.toHaveBeenCalled();
            });
        });
    });
}); 