// Mock environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.STRAVA_WEBHOOK_VERIFY_TOKEN = 'default-verify-token';
process.env.GOOGLE_GEMINI_API_KEY = 'fake-api-key';

// Mock our services
const mockUpdateProfileFromStrava = jest.fn();
jest.mock('../src/services/user.service', () => {
  return {
    UserService: jest.fn().mockImplementation(() => {
      return {
        updateProfileFromStrava: mockUpdateProfileFromStrava
      };
    }),
  };
}, { virtual: true });

const mockGetAuthorizationUrl = jest.fn();
const mockValidateAuthState = jest.fn();
const mockExchangeCodeForTokens = jest.fn();
const mockSaveUserStravaConnection = jest.fn();
const mockTriggerInitialActivitySync = jest.fn();
const mockFindViciUserIdByStravaId = jest.fn();
const mockFetchAndStoreSingleActivity = jest.fn();
const mockDeleteActivity = jest.fn();
const mockHandleDeauthorization = jest.fn();

jest.mock('../src/services/strava.service', () => {
  return {
    StravaService: jest.fn().mockImplementation(() => {
      return {
        getAuthorizationUrl: mockGetAuthorizationUrl,
        validateAuthState: mockValidateAuthState,
        exchangeCodeForTokens: mockExchangeCodeForTokens,
        saveUserStravaConnection: mockSaveUserStravaConnection,
        triggerInitialActivitySync: mockTriggerInitialActivitySync,
        findViciUserIdByStravaId: mockFindViciUserIdByStravaId,
        fetchAndStoreSingleActivity: mockFetchAndStoreSingleActivity,
        deleteActivity: mockDeleteActivity,
        handleDeauthorization: mockHandleDeauthorization,
      };
    }),
  };
}, { virtual: true });

// Export mocks for use in tests
module.exports = {
  mocks: {
    updateProfileFromStrava: mockUpdateProfileFromStrava,
    getAuthorizationUrl: mockGetAuthorizationUrl,
    validateAuthState: mockValidateAuthState,
    exchangeCodeForTokens: mockExchangeCodeForTokens,
    saveUserStravaConnection: mockSaveUserStravaConnection,
    triggerInitialActivitySync: mockTriggerInitialActivitySync,
    findViciUserIdByStravaId: mockFindViciUserIdByStravaId,
    fetchAndStoreSingleActivity: mockFetchAndStoreSingleActivity,
    deleteActivity: mockDeleteActivity,
    handleDeauthorization: mockHandleDeauthorization,
  }
}; 