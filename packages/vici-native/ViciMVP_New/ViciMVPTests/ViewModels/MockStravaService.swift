import Foundation
@testable import ViciMVP

class MockStravaService: StravaServiceProtocol {
    // Control test behavior
    var shouldSucceed = true
    var isConnectedValue = false
    var mockProfile: [String: Any] = [
        "username": "test_runner",
        "profile": "https://example.com/profile.jpg",
        "firstname": "Test",
        "lastname": "Runner",
        "city": "Test City",
        "state": "Test State",
        "country": "Test Country",
        "sex": "M",
        "athlete_type": "runner"
    ]
    var mockError = NSError(domain: "com.vici.test", code: 401, userInfo: [NSLocalizedDescriptionKey: "Mock Strava error"])
    
    // Function call tracking for verification
    var isConnectedCalled = false
    var getProfileCalled = false
    var syncActivitiesCalled = false
    
    func isConnected() -> Bool {
        isConnectedCalled = true
        return isConnectedValue
    }
    
    func getProfile() async throws -> [String: Any] {
        getProfileCalled = true
        
        if shouldSucceed {
            return mockProfile
        } else {
            throw mockError
        }
    }
    
    func syncActivities() async throws {
        syncActivitiesCalled = true
        
        if !shouldSucceed {
            throw mockError
        }
    }
    
    // Reset tracking for fresh tests
    func reset() {
        isConnectedCalled = false
        getProfileCalled = false
        syncActivitiesCalled = false
    }
} 