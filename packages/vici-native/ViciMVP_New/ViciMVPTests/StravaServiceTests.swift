import XCTest
@testable import ViciMVP

// We don't need to define APIError here since we can use the one from the main app via @testable import

// Define StravaError for testing if needed
// Only keep this if it's needed in tests and not accessible from the main app
/*
enum StravaError: Error {
    case networkError(Error?)
    case accessDenied
    case rateLimitExceeded(resetTime: Date?)
    case serverError(Int, String)
    case userNotAuthenticated
    case tokenExchangeFailed
    case invalidResponse
}
*/

// Define protocols needed for testing if they're not accessible
// REMOVED: Duplicate APIClientProtocol definition that was causing conflicts
// The protocol is already defined in the main app and available via @testable import
/*
protocol APIClientProtocol {
    func get<T: Decodable>(endpoint: String, parameters: [String: Any]?, headers: [String: String]?) async throws -> T
    func post<T: Decodable>(endpoint: String, body: Any?, headers: [String: String]?) async throws -> T
    func put<T: Decodable>(endpoint: String, body: Any?, headers: [String: String]?) async throws -> T
    func patch<T: Decodable>(endpoint: String, body: Any?, headers: [String: String]?) async throws -> T
    func delete<T: Decodable>(endpoint: String, headers: [String: String]?) async throws -> T
}
*/

// Define StravaService for testing
class StravaService {
    private let apiClient: APIClientProtocol
    
    init(apiClient: APIClientProtocol) {
        self.apiClient = apiClient
    }
    
    func checkConnectionStatus(userId: String) async throws -> Bool {
        if userId.isEmpty {
            throw StravaError.userNotAuthenticated
        }
        
        do {
            struct ConnectionStatus: Codable {
                let connected: Bool
            }
            
            let status: ConnectionStatus = try await apiClient.get(
                endpoint: "/strava/connection/\(userId)",
                parameters: nil,
                headers: nil
            )
            
            return status.connected
        } catch let error as APIError {
            switch error {
            case .networkError(let underlyingError):
                throw StravaError.networkError(underlyingError)
            case .unauthorized:
                throw StravaError.accessDenied
            case .rateLimited(let retryAfter):
                throw StravaError.rateLimitExceeded(resetTime: Date(timeIntervalSinceNow: retryAfter))
            case .httpError(let statusCode, let details):
                throw StravaError.serverError(statusCode, details)
            default:
                throw StravaError.invalidResponse
            }
        }
    }
    
    func getAuthorizationURL(userId: String) async throws -> URL {
        struct AuthResponse: Codable {
            let url: String
        }
        
        let response: AuthResponse = try await apiClient.get(
            endpoint: "/strava/auth-url/\(userId)",
            parameters: nil,
            headers: nil
        )
        
        guard let url = URL(string: response.url) else {
            throw StravaError.invalidResponse
        }
        
        return url
    }
    
    func exchangeCodeForToken(userId: String, code: String, state: String) async throws {
        if code.isEmpty {
            throw StravaError.tokenExchangeFailed
        }
        
        struct EmptyResponse: Codable {}
        
        let _: EmptyResponse = try await apiClient.post(
            endpoint: "/strava/exchange-token",
            body: [
                "userId": userId,
                "code": code,
                "state": state
            ],
            headers: nil
        )
    }
}

// Define any additional needed types
struct EmptyResponse: Codable {}

class StravaServiceTests: XCTestCase {
    
    // Mock API client for testing
    class MockAPIClient: APIClientProtocol {
        var shouldSucceed = true
        var errorToThrow: APIError?
        var mockResponse: Any?
        
        func get<T: Decodable>(endpoint: String, parameters: [String: Any]? = nil, headers: [String: String]? = nil) async throws -> T {
            if shouldSucceed, let mockResponse = mockResponse as? T {
                return mockResponse
            } else if let error = errorToThrow {
                throw error
            } else {
                throw APIError.unknown
            }
        }
        
        func post<T: Decodable>(endpoint: String, body: Any? = nil, headers: [String: String]? = nil) async throws -> T {
            if shouldSucceed, let mockResponse = mockResponse as? T {
                return mockResponse
            } else if let error = errorToThrow {
                throw error
            } else {
                throw APIError.unknown
            }
        }
        
        func put<T: Decodable>(endpoint: String, body: Any? = nil, headers: [String: String]? = nil) async throws -> T {
            if shouldSucceed, let mockResponse = mockResponse as? T {
                return mockResponse
            } else if let error = errorToThrow {
                throw error
            } else {
                throw APIError.unknown
            }
        }
        
        func patch<T: Decodable>(endpoint: String, body: Any? = nil, headers: [String: String]? = nil) async throws -> T {
            if shouldSucceed, let mockResponse = mockResponse as? T {
                return mockResponse
            } else if let error = errorToThrow {
                throw error
            } else {
                throw APIError.unknown
            }
        }
        
        func delete<T: Decodable>(endpoint: String, headers: [String: String]? = nil) async throws -> T {
            if shouldSucceed, let mockResponse = mockResponse as? T {
                return mockResponse
            } else if let error = errorToThrow {
                throw error
            } else {
                throw APIError.unknown
            }
        }
    }
    
    var mockAPIClient: MockAPIClient!
    var stravaService: StravaService!
    
    override func setUp() {
        super.setUp()
        mockAPIClient = MockAPIClient()
        stravaService = StravaService(apiClient: mockAPIClient)
    }
    
    override func tearDown() {
        mockAPIClient = nil
        stravaService = nil
        super.tearDown()
    }
    
    // MARK: - Connection Status Tests
    
    func testCheckConnectionStatus_Success() async throws {
        // Setup
        struct ConnectionStatus: Codable {
            let connected: Bool
        }
        mockAPIClient.shouldSucceed = true
        mockAPIClient.mockResponse = ConnectionStatus(connected: true)
        
        // Execute
        let result = try await stravaService.checkConnectionStatus(userId: "user123")
        
        // Verify
        XCTAssertTrue(result, "Connection status should be true")
    }
    
    func testCheckConnectionStatus_NetworkError() async {
        // Setup
        mockAPIClient.shouldSucceed = false
        mockAPIClient.errorToThrow = APIError.networkError(NSError(domain: "test", code: -1009, userInfo: nil))
        
        // Execute & Verify
        do {
            _ = try await stravaService.checkConnectionStatus(userId: "user123")
            XCTFail("Should have thrown an error")
        } catch let error as StravaError {
            // Verify we get the correct StravaError type
            switch error {
            case .networkError:
                // Success - expected error type
                break
            default:
                XCTFail("Expected networkError but got \(error)")
            }
        } catch {
            XCTFail("Expected StravaError but got \(error)")
        }
    }
    
    func testCheckConnectionStatus_Unauthorized() async {
        // Setup
        mockAPIClient.shouldSucceed = false
        mockAPIClient.errorToThrow = APIError.unauthorized
        
        // Execute & Verify
        do {
            _ = try await stravaService.checkConnectionStatus(userId: "user123")
            XCTFail("Should have thrown an error")
        } catch let error as StravaError {
            // Verify we get the correct StravaError type
            switch error {
            case .accessDenied:
                // Success - expected error type
                break
            default:
                XCTFail("Expected accessDenied but got \(error)")
            }
        } catch {
            XCTFail("Expected StravaError but got \(error)")
        }
    }
    
    func testCheckConnectionStatus_RateLimited() async {
        // Setup
        mockAPIClient.shouldSucceed = false
        mockAPIClient.errorToThrow = APIError.rateLimited(retryAfter: 60)
        
        // Execute & Verify
        do {
            _ = try await stravaService.checkConnectionStatus(userId: "user123")
            XCTFail("Should have thrown an error")
        } catch let error as StravaError {
            // Verify we get the correct StravaError type
            switch error {
            case .rateLimitExceeded(let resetTime):
                // Success - expected error type
                XCTAssertNotNil(resetTime, "Reset time should be provided")
                if let resetTime = resetTime {
                    let expectedTime = Date(timeIntervalSinceNow: 60)
                    let timeDiscrepancy = abs(resetTime.timeIntervalSince1970 - expectedTime.timeIntervalSince1970)
                    XCTAssertLessThan(timeDiscrepancy, 1.0, "Reset time should be approximately 60 seconds from now")
                }
                break
            default:
                XCTFail("Expected rateLimitExceeded but got \(error)")
            }
        } catch {
            XCTFail("Expected StravaError but got \(error)")
        }
    }
    
    func testCheckConnectionStatus_ServerError() async {
        // Setup
        mockAPIClient.shouldSucceed = false
        mockAPIClient.errorToThrow = APIError.httpError(statusCode: 500, details: "Internal Server Error")
        
        // Execute & Verify
        do {
            _ = try await stravaService.checkConnectionStatus(userId: "user123")
            XCTFail("Should have thrown an error")
        } catch let error as StravaError {
            // Verify we get the correct StravaError type
            switch error {
            case .serverError(let statusCode, let message):
                // Success - expected error type
                XCTAssertEqual(statusCode, 500, "Status code should be 500")
                XCTAssertEqual(message, "Internal Server Error", "Error message should match")
                break
            default:
                XCTFail("Expected serverError but got \(error)")
            }
        } catch {
            XCTFail("Expected StravaError but got \(error)")
        }
    }
    
    func testCheckConnectionStatus_EmptyUserId() async {
        // Execute & Verify
        do {
            _ = try await stravaService.checkConnectionStatus(userId: "")
            XCTFail("Should have thrown an error")
        } catch let error as StravaError {
            // Verify we get the correct StravaError type
            switch error {
            case .userNotAuthenticated:
                // Success - expected error type
                break
            default:
                XCTFail("Expected userNotAuthenticated but got \(error)")
            }
        } catch {
            XCTFail("Expected StravaError but got \(error)")
        }
    }
    
    // MARK: - Authorization URL Tests
    
    func testGetAuthorizationURL_Success() async throws {
        // Setup
        struct AuthResponse: Codable {
            let url: String
        }
        mockAPIClient.shouldSucceed = true
        mockAPIClient.mockResponse = AuthResponse(url: "https://strava.com/oauth/authorize?client_id=123")
        
        // Execute
        let url = try await stravaService.getAuthorizationURL(userId: "user123")
        
        // Verify
        XCTAssertEqual(url.absoluteString, "https://strava.com/oauth/authorize?client_id=123")
    }
    
    // MARK: - Token Exchange Tests
    
    func testExchangeCodeForToken_Success() async {
        // Setup
        mockAPIClient.shouldSucceed = true
        
        // Execute & Verify - no error should be thrown
        do {
            try await stravaService.exchangeCodeForToken(userId: "user123", code: "auth_code", state: "csrf_state")
        } catch {
            XCTFail("Should not have thrown an error: \(error)")
        }
    }
    
    func testExchangeCodeForToken_EmptyCode() async {
        // Execute & Verify
        do {
            try await stravaService.exchangeCodeForToken(userId: "user123", code: "", state: "csrf_state")
            XCTFail("Should have thrown an error for empty code")
        } catch let error as StravaError {
            // Verify we get the correct StravaError type
            switch error {
            case .tokenExchangeFailed:
                // Success - expected error type
                break
            default:
                XCTFail("Expected tokenExchangeFailed but got \(error)")
            }
        } catch {
            XCTFail("Expected StravaError but got \(error)")
        }
    }
} 
