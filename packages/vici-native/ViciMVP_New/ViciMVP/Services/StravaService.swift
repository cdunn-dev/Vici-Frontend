import Foundation
import Combine
import os.log
import Network

/// Protocol defining the interface for the Strava service
protocol StravaServiceProtocol {
    /// Check if a user has connected their Strava account
    func checkConnectionStatus(userId: String) async throws -> Bool
    
    /// Get the authorization URL for Strava OAuth
    func getAuthorizationURL(userId: String) async throws -> URL
    
    /// Exchange authorization code for access token
    func exchangeCodeForToken(userId: String, code: String, state: String?) async throws
    
    /// Fetch recent activities from Strava
    func fetchRecentActivities(userId: String, limit: Int) async throws -> [Activity]
    
    /// Disconnect a user's Strava account
    func disconnectAccount(userId: String) async throws
}

/// Service for interacting with the Strava API
class StravaService: StravaServiceProtocol {
    // MARK: - Singleton
    
    static let shared = StravaService()
    
    // MARK: - Properties
    
    private let logger = Logger(subsystem: "com.vici.app", category: "StravaService")
    private let apiClient: ViciMVP.APIClientProtocol
    private let networkMonitor = NWPathMonitor()
    private var isNetworkAvailable = true
    
    // MARK: - Constants
    
    private struct Constants {
        static let baseURL = "https://api.vici.app"
        static let stravaEndpoint = "/strava"
    }
    
    // MARK: - Initialization
    
    init(apiClient: ViciMVP.APIClientProtocol = APIClient.shared as ViciMVP.APIClientProtocol) {
        self.apiClient = apiClient
        setupNetworkMonitoring()
    }
    
    private func setupNetworkMonitoring() {
        networkMonitor.pathUpdateHandler = { [weak self] path in
            self?.isNetworkAvailable = path.status == .satisfied
            self?.logger.debug("Network status updated: \(path.status == .satisfied ? "connected" : "disconnected")")
        }
        let queue = DispatchQueue(label: "com.vici.app.NetworkMonitor")
        networkMonitor.start(queue: queue)
    }
    
    deinit {
        networkMonitor.cancel()
    }
    
    // MARK: - Helper Methods
    
    /// Constructs an API endpoint by appending the path to the base Strava endpoint
    private func constructEndpoint(_ path: String) -> String {
        return "\(Constants.stravaEndpoint)\(path)"
    }
    
    // MARK: - Implementation
    
    /// Check if a user has connected their Strava account
    func checkConnectionStatus(userId: String) async throws -> Bool {
        // Check network availability first
        guard isNetworkAvailable else {
            logger.error("Network unavailable when checking Strava connection status")
            throw StravaError.offlineError
        }
        
        // Ensure user ID is valid
        guard !userId.isEmpty else {
            logger.error("Invalid user ID provided for Strava connection check")
            throw StravaError.userNotAuthenticated
        }
        
        do {
            struct ConnectionStatus: Codable {
                let connected: Bool
            }
            
            let status: ConnectionStatus = try await apiClient.get(
                endpoint: constructEndpoint("/connection/\(userId)"),
                parameters: nil,
                headers: nil
            )
            
            logger.debug("Strava connection status: \(status.connected ? "connected" : "not connected")")
            return status.connected
        } catch let error as APIError {
            logger.error("API error checking Strava connection: \(error.localizedDescription)")
            throw StravaError.from(error, context: "connection-check")
        } catch {
            logger.error("Unknown error checking Strava connection: \(error.localizedDescription)")
            throw StravaError.connectionFailed(reason: error.localizedDescription)
        }
    }
    
    /// Get the authorization URL for Strava OAuth
    func getAuthorizationURL(userId: String) async throws -> URL {
        // Check network availability first
        guard isNetworkAvailable else {
            logger.error("Network unavailable when getting Strava authorization URL")
            throw StravaError.offlineError
        }
        
        // Ensure user ID is valid
        guard !userId.isEmpty else {
            logger.error("Invalid user ID provided for Strava authorization URL")
            throw StravaError.userNotAuthenticated
        }
        
        do {
            struct AuthURLResponse: Codable {
                let url: String
            }
            
            let response: AuthURLResponse = try await apiClient.get(
                endpoint: constructEndpoint("/auth-url/\(userId)"),
                parameters: nil, 
                headers: nil
            )
            
            guard let url = URL(string: response.url) else {
                logger.error("Invalid authorization URL returned from API")
                throw StravaError.invalidResponse(details: "Invalid authorization URL format")
            }
            
            logger.debug("Received Strava authorization URL")
            return url
        } catch let error as APIError {
            logger.error("API error getting authorization URL: \(error.localizedDescription)")
            throw StravaError.from(error, context: "authorization")
        } catch {
            logger.error("Unknown error getting authorization URL: \(error.localizedDescription)")
            throw StravaError.connectionFailed(reason: error.localizedDescription)
        }
    }
    
    /// Exchange authorization code for access token
    func exchangeCodeForToken(userId: String, code: String, state: String?) async throws {
        // Check network availability first
        guard isNetworkAvailable else {
            logger.error("Network unavailable when exchanging Strava token")
            throw StravaError.offlineError
        }
        
        // Ensure user ID and code are valid
        guard !userId.isEmpty else {
            logger.error("Invalid user ID provided for token exchange")
            throw StravaError.userNotAuthenticated
        }
        
        guard !code.isEmpty else {
            logger.error("Empty authorization code provided")
            throw StravaError.tokenExchangeFailed(reason: "Empty authorization code")
        }
        
        do {
            struct EmptyResponse: Codable {}
            
            let _: EmptyResponse = try await apiClient.post(
                endpoint: constructEndpoint("/exchange-token"),
                body: [
                    "userId": userId,
                    "code": code,
                    "state": state ?? ""
                ],
                headers: nil
            )
            logger.debug("Successfully exchanged code for Strava token")
        } catch let error as APIError {
            logger.error("API error exchanging token: \(error.localizedDescription)")
            throw StravaError.from(error, context: "token-exchange")
        } catch {
            logger.error("Unknown error exchanging token: \(error.localizedDescription)")
            throw StravaError.tokenExchangeFailed(reason: error.localizedDescription)
        }
    }
    
    /// Fetch recent activities from Strava
    func fetchRecentActivities(userId: String, limit: Int = 10) async throws -> [Activity] {
        // Check network availability first
        guard isNetworkAvailable else {
            logger.error("Network unavailable when fetching Strava activities")
            throw StravaError.offlineError
        }
        
        // Ensure user ID is valid
        guard !userId.isEmpty else {
            logger.error("Invalid user ID provided for fetching activities")
            throw StravaError.userNotAuthenticated
        }
        
        logger.debug("Fetching \(limit) recent Strava activities for user \(userId)")
        
        do {
            let response: APIResponse<[Activity]> = try await apiClient.get(
                endpoint: constructEndpoint("/activities/\(userId)"),
                parameters: ["limit": limit]
            )
            
            guard let activities = response.data else {
                throw StravaError.invalidResponse(details: "Missing activity data in response")
            }

            logger.debug("Successfully fetched \(activities.count) Strava activities")
            return activities
        } catch let error as APIError {
            logger.error("API error fetching activities: \(error.localizedDescription)")
            throw StravaError.from(error, context: "activities")
        } catch {
            logger.error("Unknown error fetching activities: \(error.localizedDescription)")
            throw StravaError.connectionFailed(reason: "Failed to fetch activities: \(error.localizedDescription)")
        }
    }
    
    /// Disconnect a user's Strava account
    func disconnectAccount(userId: String) async throws {
        // Check network availability first
        guard isNetworkAvailable else {
            logger.error("Network unavailable when disconnecting Strava account")
            throw StravaError.offlineError
        }
        
        // Ensure user ID is valid
        guard !userId.isEmpty else {
            logger.error("Invalid user ID provided for Strava disconnection")
            throw StravaError.userNotAuthenticated
        }
        
        do {
            struct EmptyResponse: Codable {}
            
            let _: EmptyResponse = try await apiClient.delete(
                endpoint: constructEndpoint("/connection/\(userId)"),
                headers: nil
            )
            logger.debug("Successfully disconnected Strava account")
        } catch let error as APIError {
            logger.error("API error disconnecting Strava: \(error.localizedDescription)")
            throw StravaError.from(error, context: "disconnection")
        } catch {
            logger.error("Unknown error disconnecting Strava: \(error.localizedDescription)")
            throw StravaError.disconnectionFailed(reason: error.localizedDescription)
        }
    }
}

/// Model representing a Strava activity
struct StravaActivity: Identifiable, Hashable {
    let id: String
    let name: String
    let type: String
    let startDate: Date
    let movingTimeSeconds: Int
    let distanceMeters: Double
    let elevationGainMeters: Double
    let averageSpeedMps: Double
    let maxSpeedMps: Double
    let averageHeartRate: Double?
    let maxHeartRate: Double?
    let calories: Double?
    
    // Computed properties for convenience
    var distanceKilometers: Double {
        return distanceMeters / 1000.0
    }
    
    var distanceMiles: Double {
        return distanceMeters / 1609.34
    }
    
    var movingTimeFormatted: String {
        let hours = movingTimeSeconds / 3600
        let minutes = (movingTimeSeconds % 3600) / 60
        let seconds = movingTimeSeconds % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%d:%02d", minutes, seconds)
        }
    }
    
    var pacePerKilometer: String {
        // Convert Int to Double for division
        let secondsPerKm = Double(movingTimeSeconds) / distanceKilometers 
        let minutes = Int(secondsPerKm) / 60
        let seconds = Int(secondsPerKm) % 60
        return String(format: "%d:%02d /km", minutes, seconds)
    }
    
    var pacePerMile: String {
        // Convert Int to Double for division
        let secondsPerMile = Double(movingTimeSeconds) / distanceMiles 
        let minutes = Int(secondsPerMile) / 60
        let seconds = Int(secondsPerMile) % 60
        return String(format: "%d:%02d /mi", minutes, seconds)
    }
}

// MARK: - Helper Types

/// Structure for API error responses
private struct ErrorResponse: Decodable {
    let message: String
} 