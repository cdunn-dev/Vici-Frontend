import request from 'supertest';
import app from '../../src/index'; // Adjust path to your Express app instance
import jwt from 'jsonwebtoken';

// Mock the StravaService methods to avoid actual external calls
// We need to mock BEFORE the service is potentially instantiated in the controller
const mockGetAuthorizationUrl = jest.fn();
const mockValidateAuthState = jest.fn();
const mockExchangeCodeForTokens = jest.fn();
const mockSaveUserStravaConnection = jest.fn();
const mockTriggerInitialActivitySync = jest.fn();

jest.mock('../../src/services/strava.service', () => {
    return {
        StravaService: jest.fn().mockImplementation(() => {
            return {
                getAuthorizationUrl: mockGetAuthorizationUrl,
                validateAuthState: mockValidateAuthState,
                exchangeCodeForTokens: mockExchangeCodeForTokens,
                saveUserStravaConnection: mockSaveUserStravaConnection,
                triggerInitialActivitySync: mockTriggerInitialActivitySync,
                // Mock other methods if needed by the controller
            };
        }),
    };
});

// Mock UserService
const mockUpdateProfileFromStrava = jest.fn();
jest.mock('../../src/services/user.service', () => {
    return {
        UserService: jest.fn().mockImplementation(() => {
            return {
                updateProfileFromStrava: mockUpdateProfileFromStrava
            };
        }),
    };
});

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
            mockGetAuthorizationUrl.mockResolvedValue(stravaAuthUrl);

            const response = await request(app)
                .get('/api/integrations/strava/connect')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(302); // Expect redirect
            expect(response.headers.location).toBe(stravaAuthUrl);
            expect(mockGetAuthorizationUrl).toHaveBeenCalledWith(TEST_USER_ID);
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
            mockGetAuthorizationUrl.mockRejectedValue(new Error('Service error'));

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
            mockValidateAuthState.mockResolvedValue(TEST_USER_ID); // Return valid user ID for the state
            mockExchangeCodeForTokens.mockResolvedValue(testTokens);
            mockSaveUserStravaConnection.mockResolvedValue({}); // Mock successful save
            mockUpdateProfileFromStrava.mockResolvedValue({}); // Mock successful profile update
            mockTriggerInitialActivitySync.mockResolvedValue(undefined);

            const response = await request(app)
                .get(`/api/integrations/strava/callback?code=${testCode}&state=${testState}&scope=read,activity:read_all`);

            expect(response.status).toBe(302); // Expect redirect
            expect(response.headers.location).toBe(successRedirect);
            expect(mockValidateAuthState).toHaveBeenCalledWith(testState);
            expect(mockExchangeCodeForTokens).toHaveBeenCalledWith(testCode);
            expect(mockSaveUserStravaConnection).toHaveBeenCalledWith(TEST_USER_ID, testTokens);
            expect(mockUpdateProfileFromStrava).toHaveBeenCalledWith(TEST_USER_ID, testTokens.athlete);
            expect(mockTriggerInitialActivitySync).toHaveBeenCalledWith(TEST_USER_ID);
        });
        
        it('should redirect with error if user denies access', async () => {
             const response = await request(app)
                .get(`/api/integrations/strava/callback?error=access_denied&state=${testState}`);

            expect(response.status).toBe(302);
            expect(response.headers.location).toBe(deniedRedirect);
            expect(mockValidateAuthState).not.toHaveBeenCalled();
        });

        it('should redirect with error if state is invalid or expired', async () => {
            mockValidateAuthState.mockResolvedValue(null); // Simulate invalid state

            const response = await request(app)
                .get(`/api/integrations/strava/callback?code=${testCode}&state=invalidOrExpiredState&scope=read`);

            expect(response.status).toBe(302);
            expect(response.headers.location).toBe(invalidStateRedirect);
            expect(mockValidateAuthState).toHaveBeenCalledWith('invalidOrExpiredState');
            expect(mockExchangeCodeForTokens).not.toHaveBeenCalled();
        });

        it('should redirect with error if code is missing', async () => {
            mockValidateAuthState.mockResolvedValue(TEST_USER_ID); // State is valid

            const response = await request(app)
                .get(`/api/integrations/strava/callback?state=${testState}&scope=read`); // No code

            expect(response.status).toBe(302);
            expect(response.headers.location).toBe(missingCodeRedirect);
            expect(mockValidateAuthState).toHaveBeenCalledWith(testState);
            expect(mockExchangeCodeForTokens).not.toHaveBeenCalled();
        });

        it('should redirect with error if token exchange fails', async () => {
            mockValidateAuthState.mockResolvedValue(TEST_USER_ID);
            mockExchangeCodeForTokens.mockRejectedValue(new Error('Strava API Error'));

            const response = await request(app)
                .get(`/api/integrations/strava/callback?code=${testCode}&state=${testState}&scope=read`);

            expect(response.status).toBe(302);
            expect(response.headers.location).toBe(failedRedirect);
            expect(mockSaveUserStravaConnection).not.toHaveBeenCalled();
        });

        it('should redirect with error if saving connection fails', async () => {
             mockValidateAuthState.mockResolvedValue(TEST_USER_ID);
            mockExchangeCodeForTokens.mockResolvedValue(testTokens);
            mockSaveUserStravaConnection.mockRejectedValue(new Error('DB Error'));

            const response = await request(app)
                .get(`/api/integrations/strava/callback?code=${testCode}&state=${testState}&scope=read`);
            
            expect(response.status).toBe(302);
            expect(response.headers.location).toBe(failedRedirect);
        });

         it('should still succeed redirect even if initial profile update fails', async () => {
            mockValidateAuthState.mockResolvedValue(TEST_USER_ID); 
            mockExchangeCodeForTokens.mockResolvedValue(testTokens);
            mockSaveUserStravaConnection.mockResolvedValue({}); 
            mockUpdateProfileFromStrava.mockRejectedValue(new Error('Profile update failed')); // Simulate profile update failure
            mockTriggerInitialActivitySync.mockResolvedValue(undefined);

            const response = await request(app)
                .get(`/api/integrations/strava/callback?code=${testCode}&state=${testState}&scope=read,activity:read_all`);

            expect(response.status).toBe(302); // Still expect redirect
            expect(response.headers.location).toBe(successRedirect);
            expect(mockSaveUserStravaConnection).toHaveBeenCalled();
            expect(mockUpdateProfileFromStrava).toHaveBeenCalled(); // It was called
            expect(mockTriggerInitialActivitySync).toHaveBeenCalled(); // Sync should still be triggered
        });

        it('should still succeed redirect even if triggering sync fails (fire and forget)', async () => {
            mockValidateAuthState.mockResolvedValue(TEST_USER_ID); 
            mockExchangeCodeForTokens.mockResolvedValue(testTokens);
            mockSaveUserStravaConnection.mockResolvedValue({}); 
            mockUpdateProfileFromStrava.mockResolvedValue({});
            mockTriggerInitialActivitySync.mockImplementation(() => { throw new Error('Trigger failed') }); // Simulate failure in trigger

            const response = await request(app)
                .get(`/api/integrations/strava/callback?code=${testCode}&state=${testState}&scope=read,activity:read_all`);

            expect(response.status).toBe(302); // Still expect redirect
            expect(response.headers.location).toBe(successRedirect);
            expect(mockTriggerInitialActivitySync).toHaveBeenCalled(); // It was called
        });
    });
}); 