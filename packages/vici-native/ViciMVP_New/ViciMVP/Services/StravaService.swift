import Foundation
import AuthenticationServices

class StravaService {
    static let shared = StravaService()
    
    private let apiClient = APIClient.shared
    private let keychain = KeychainSwift()
    
    private let stravaTokenKey = "vici.stravaToken"
    private let stravaRefreshTokenKey = "vici.stravaRefreshToken"
    private let stravaExpirationKey = "vici.stravaExpiration"
    
    private let clientId = "YOUR_STRAVA_CLIENT_ID" // Replace with actual Strava client ID
    private let clientSecret = "YOUR_STRAVA_CLIENT_SECRET" // Replace with actual Strava client secret
    private let redirectUri = "vici://strava-callback"
    
    // MARK: - Token Management
    
    private func saveStravaTokens(accessToken: String, refreshToken: String, expiresAt: Date) {
        keychain.set(accessToken, forKey: stravaTokenKey)
        keychain.set(refreshToken, forKey: stravaRefreshTokenKey)
        
        let expiresAtString = String(Int(expiresAt.timeIntervalSince1970))
        keychain.set(expiresAtString, forKey: stravaExpirationKey)
    }
    
    private func clearStravaTokens() {
        keychain.delete(stravaTokenKey)
        keychain.delete(stravaRefreshTokenKey)
        keychain.delete(stravaExpirationKey)
    }
    
    private func getStravaAccessToken() async throws -> String {
        guard let accessToken = keychain.get(stravaTokenKey),
              let expiresAtString = keychain.get(stravaExpirationKey),
              let expirationTimestamp = Double(expiresAtString) else {
            throw APIError.unauthorized
        }
        
        let expiresAt = Date(timeIntervalSince1970: expirationTimestamp)
        
        // If token is expired or about to expire, refresh it
        if Date().addingTimeInterval(600) > expiresAt { // 10 minutes buffer
            return try await refreshStravaToken()
        }
        
        return accessToken
    }
    
    private func refreshStravaToken() async throws -> String {
        guard let refreshToken = keychain.get(stravaRefreshTokenKey) else {
            throw APIError.unauthorized
        }
        
        // Define the token refresh response structure
        struct RefreshResponse: Codable {
            let accessToken: String
            let refreshToken: String
            let expiresAt: Int
        }
        
        let parameters: [String: Any] = [
            "client_id": clientId,
            "client_secret": clientSecret,
            "grant_type": "refresh_token",
            "refresh_token": refreshToken
        ]
        
        // Use URLSession directly for Strava API calls
        guard let url = URL(string: "https://www.strava.com/oauth/token") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: parameters)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200..<300).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let refreshResponse = try decoder.decode(RefreshResponse.self, from: data)
        
        let expiresAt = Date(timeIntervalSince1970: TimeInterval(refreshResponse.expiresAt))
        saveStravaTokens(
            accessToken: refreshResponse.accessToken,
            refreshToken: refreshResponse.refreshToken,
            expiresAt: expiresAt
        )
        
        return refreshResponse.accessToken
    }
    
    // MARK: - Strava Authentication
    
    func isConnectedToStrava() -> Bool {
        return keychain.get(stravaTokenKey) != nil
    }
    
    func authorizeStrava(from viewController: UIViewController) async throws -> Bool {
        let authURL = "https://www.strava.com/oauth/authorize?client_id=\(clientId)&redirect_uri=\(redirectUri)&response_type=code&scope=activity:read_all,activity:write"
        
        guard let url = URL(string: authURL) else {
            throw APIError.invalidURL
        }
        
        let authSession = ASWebAuthenticationSession(
            url: url,
            callbackURLScheme: "vici",
            completionHandler: { [weak self] callbackURL, error in
                guard let self = self,
                      error == nil,
                      let callbackURL = callbackURL,
                      let components = URLComponents(url: callbackURL, resolvingAgainstBaseURL: true),
                      let queryItems = components.queryItems,
                      let code = queryItems.first(where: { $0.name == "code" })?.value else {
                    return
                }
                
                Task {
                    do {
                        try await self.exchangeCodeForToken(code: code)
                    } catch {
                        print("Failed to exchange code: \(error)")
                    }
                }
            }
        )
        
        authSession.presentationContextProvider = viewController as? ASWebAuthenticationPresentationContextProviding
        
        return authSession.start()
    }
    
    private func exchangeCodeForToken(code: String) async throws {
        struct TokenResponse: Codable {
            let accessToken: String
            let refreshToken: String
            let expiresAt: Int
        }
        
        let parameters: [String: Any] = [
            "client_id": clientId,
            "client_secret": clientSecret,
            "code": code,
            "grant_type": "authorization_code"
        ]
        
        guard let url = URL(string: "https://www.strava.com/oauth/token") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONSerialization.data(withJSONObject: parameters)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200..<300).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        let tokenResponse = try decoder.decode(TokenResponse.self, from: data)
        
        let expiresAt = Date(timeIntervalSince1970: TimeInterval(tokenResponse.expiresAt))
        saveStravaTokens(
            accessToken: tokenResponse.accessToken,
            refreshToken: tokenResponse.refreshToken,
            expiresAt: expiresAt
        )
        
        // Sync user's connection status with our backend
        try await syncStravaConnection()
    }
    
    func disconnectStrava() async throws {
        clearStravaTokens()
        
        // Notify our backend
        let _: EmptyResponse = try await apiClient.delete(endpoint: "integrations/strava")
    }
    
    private func syncStravaConnection() async throws {
        struct EmptyResponse: Codable {}
        
        let _: EmptyResponse = try await apiClient.post(endpoint: "integrations/strava")
    }
    
    // MARK: - Strava API Calls
    
    struct StravaActivity: Codable {
        let id: Int64
        let name: String
        let type: String
        let startDate: Date
        let distance: Float
        let movingTime: Int
        let elapsedTime: Int
        let totalElevationGain: Float
    }
    
    func getRecentActivities(limit: Int = 10) async throws -> [StravaActivity] {
        let token = try await getStravaAccessToken()
        
        guard let url = URL(string: "https://www.strava.com/api/v3/athlete/activities?per_page=\(limit)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200..<300).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        
        return try decoder.decode([StravaActivity].self, from: data)
    }
    
    func getActivity(id: Int64) async throws -> StravaActivity {
        let token = try await getStravaAccessToken()
        
        guard let url = URL(string: "https://www.strava.com/api/v3/activities/\(id)") else {
            throw APIError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.addValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse, (200..<300).contains(httpResponse.statusCode) else {
            throw APIError.invalidResponse
        }
        
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .iso8601
        
        return try decoder.decode(StravaActivity.self, from: data)
    }
    
    func syncActivities() async throws {
        struct SyncResponse: Codable {
            let success: Bool
            let count: Int
        }
        
        let _: SyncResponse = try await apiClient.post(endpoint: "integrations/strava/sync")
    }
}

// Helper struct for empty responses
struct EmptyResponse: Codable {} 