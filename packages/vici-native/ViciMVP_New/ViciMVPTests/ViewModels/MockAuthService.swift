import Foundation
@testable import ViciMVP

class MockAuthService: AuthServiceProtocol {
    // Control test behavior
    var shouldSucceed = true
    var mockUser = User.previewUser
    var mockError = NSError(domain: "com.vici.test", code: 401, userInfo: [NSLocalizedDescriptionKey: "Mock error"])
    
    // Function return tracking for verification
    var loginCalled = false
    var registerCalled = false
    var getCurrentUserCalled = false
    var logoutCalled = false
    var requestPasswordResetCalled = false
    var resetPasswordCalled = false
    var getStravaOAuthURLCalled = false
    var handleStravaCallbackCalled = false
    var disconnectStravaCalled = false
    
    func login(email: String, password: String) async throws -> User {
        loginCalled = true
        
        if shouldSucceed {
            // Mock successful login
            KeychainService.shared.saveAccessToken("mock_token")
            KeychainService.shared.saveRefreshToken("mock_refresh_token")
            return mockUser
        } else {
            throw mockError
        }
    }
    
    func register(name: String, email: String, password: String) async throws -> User {
        registerCalled = true
        
        if shouldSucceed {
            // Mock successful registration
            KeychainService.shared.saveAccessToken("mock_token")
            KeychainService.shared.saveRefreshToken("mock_refresh_token")
            return mockUser
        } else {
            throw mockError
        }
    }
    
    func getCurrentUser() async throws -> User {
        getCurrentUserCalled = true
        
        if shouldSucceed {
            return mockUser
        } else {
            throw mockError
        }
    }
    
    func logout() {
        logoutCalled = true
        
        // Clear tokens
        KeychainService.shared.clearTokens()
    }
    
    func requestPasswordReset(email: String) async throws {
        requestPasswordResetCalled = true
        
        if !shouldSucceed {
            throw mockError
        }
    }
    
    func resetPassword(token: String, newPassword: String) async throws {
        resetPasswordCalled = true
        
        if !shouldSucceed {
            throw mockError
        }
    }
    
    func getStravaOAuthURL() async throws -> String {
        getStravaOAuthURLCalled = true
        
        if shouldSucceed {
            return "https://www.strava.com/oauth/authorize?client_id=12345"
        } else {
            throw mockError
        }
    }
    
    func handleStravaCallback(code: String, state: String) async throws -> User {
        handleStravaCallbackCalled = true
        
        if shouldSucceed {
            // Update mock user with Strava connection
            var updatedUser = mockUser
            updatedUser.stravaConnection = StravaConnection(
                id: "strava123",
                userId: mockUser.id,
                stravaUserId: "strava_athlete_123",
                accessToken: "mock_strava_token",
                refreshToken: "mock_strava_refresh",
                tokenExpiresAt: Date().addingTimeInterval(3600),
                athleteInfo: ["profile": "https://example.com/profile.jpg"],
                scopes: ["read", "activity:read_all"],
                connected: true,
                lastSyncDate: Date()
            )
            return updatedUser
        } else {
            throw mockError
        }
    }
    
    func disconnectStrava() async throws -> User {
        disconnectStravaCalled = true
        
        if shouldSucceed {
            // Return user without Strava connection
            return mockUser
        } else {
            throw mockError
        }
    }
    
    // Reset tracking for fresh tests
    func reset() {
        loginCalled = false
        registerCalled = false
        getCurrentUserCalled = false
        logoutCalled = false
        requestPasswordResetCalled = false
        resetPasswordCalled = false
        getStravaOAuthURLCalled = false
        handleStravaCallbackCalled = false
        disconnectStravaCalled = false
    }
} 