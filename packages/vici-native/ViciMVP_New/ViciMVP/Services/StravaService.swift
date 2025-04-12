import Foundation

/// Service for handling Strava integration, connection, and data retrieval
class StravaService {
    // MARK: - Singleton
    static let shared = StravaService()
    
    // MARK: - Properties
    private let apiClient = APIClient.shared
    private let keychain = KeychainService.shared
    private let authService = AuthService.shared
    
    private let stravaTokenKey = "strava_token"
    
    // MARK: - Initialization
    private init() {}
    
    // MARK: - Connection Status
    
    /// Checks if the user is connected to Strava
    func isConnected() -> Bool {
        return keychain.get(stravaTokenKey) != nil
    }
    
    // MARK: - Connection Flow
    
    /// Get the OAuth URL for Strava connection
    func getStravaAuthURL() async throws -> String {
        guard authService.isLoggedIn() else {
            throw APIError.unauthorized
        }
        
        let response: [String: Any] = try await apiClient.get(
            endpoint: "/users/connections/strava/auth-url"
        )
        
        guard let authURL = response["url"] as? String else {
            throw APIError.decodingError("Invalid auth URL response")
        }
        
        return authURL
    }
    
    /// Complete Strava OAuth connection with received code
    func connectStrava(code: String) async throws -> Bool {
        guard authService.isLoggedIn() else {
            throw APIError.unauthorized
        }
        
        let response: [String: Any] = try await apiClient.post(
            endpoint: "/users/connections/strava",
            body: ["code": code]
        )
        
        guard let success = response["connected"] as? Bool,
              let token = response["accessToken"] as? String else {
            throw APIError.decodingError("Invalid connect response")
        }
        
        // Store Strava token securely
        if success {
            keychain.set(token, forKey: stravaTokenKey)
        }
        
        return success
    }
    
    /// Disconnect from Strava
    func disconnectStrava() async throws -> Bool {
        guard authService.isLoggedIn() else {
            throw APIError.unauthorized
        }
        
        let response: [String: Any] = try await apiClient.delete(
            endpoint: "/users/connections/strava"
        )
        
        keychain.delete(stravaTokenKey)
        
        return response["success"] as? Bool ?? true
    }
    
    // MARK: - Strava Data
    
    /// Get Strava athlete profile
    func getStravaAthlete() async throws -> [String: Any] {
        guard authService.isLoggedIn(), isConnected() else {
            throw APIError.unauthorized
        }
        
        let response: [String: Any] = try await apiClient.get(
            endpoint: "/strava/athlete"
        )
        
        return response
    }
    
    /// Get recent Strava activities
    func getStravaActivities(limit: Int = 20, before: Date? = nil, after: Date? = nil) async throws -> [Activity] {
        guard authService.isLoggedIn(), isConnected() else {
            throw APIError.unauthorized
        }
        
        var parameters: [String: Any] = ["limit": limit]
        
        let dateFormatter = ISO8601DateFormatter()
        if let before = before {
            parameters["before"] = dateFormatter.string(from: before)
        }
        if let after = after {
            parameters["after"] = dateFormatter.string(from: after)
        }
        
        let response: [[String: Any]] = try await apiClient.get(
            endpoint: "/strava/activities",
            parameters: parameters
        )
        
        // Parse activities
        var activities: [Activity] = []
        
        for activityData in response {
            do {
                let jsonData = try JSONSerialization.data(withJSONObject: activityData)
                let decoder = JSONDecoder()
                decoder.dateDecodingStrategy = .iso8601
                if let activity = try? decoder.decode(Activity.self, from: jsonData) {
                    activities.append(activity)
                }
            } catch {
                print("Error parsing activity: \(error.localizedDescription)")
            }
        }
        
        return activities
    }
    
    /// Get a specific Strava activity by ID
    func getStravaActivity(id: String) async throws -> Activity {
        guard authService.isLoggedIn(), isConnected() else {
            throw APIError.unauthorized
        }
        
        let response: [String: Any] = try await apiClient.get(
            endpoint: "/strava/activities/\(id)"
        )
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: response)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(Activity.self, from: jsonData)
        } catch {
            throw APIError.decodingError("Failed to decode activity: \(error.localizedDescription)")
        }
    }
    
    /// Manually trigger a sync of Strava data
    func syncStravaData() async throws -> Bool {
        guard authService.isLoggedIn(), isConnected() else {
            throw APIError.unauthorized
        }
        
        let response: [String: Any] = try await apiClient.post(
            endpoint: "/strava/sync"
        )
        
        return response["success"] as? Bool ?? false
    }
} 