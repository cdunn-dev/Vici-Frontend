import Foundation
import Combine
import os.log

/// Authentication response from login/register endpoints
struct AuthResponse {
    /// The authenticated user
    let user: User
    
    /// JWT access token
    let accessToken: String?
    
    /// JWT refresh token
    let refreshToken: String?
}

/// Protocol defining the interface for authentication services
protocol AuthServiceProtocol: AnyObject {
    // Authentication state
    var authStatePublisher: AnyPublisher<AuthState, Never> { get }
    func checkAuthStatus()
    
    // Authentication methods
    func login(email: String, password: String, completion: @escaping (Result<User, Error>) -> Void)
    func register(email: String, password: String, name: String, completion: @escaping (Result<User, Error>) -> Void)
    func logout(completion: @escaping (Result<Void, Error>) -> Void)
    
    // User profile
    func getUserProfile(completion: @escaping (Result<User, Error>) -> Void)
    
    // Strava integration
    func checkStravaConnection(userId: String, completion: @escaping (Result<Bool, Error>) -> Void)
    func connectStrava(userId: String, completion: @escaping (Result<Void, Error>) -> Void)
    func disconnectStrava(userId: String, completion: @escaping (Result<Void, Error>) -> Void)
}

/// Enum representing different authentication states
enum AuthState {
    case loading
    case loggedIn(User)
    case loggedOut
}

/// Service for handling user authentication, registration, and session management
class AuthService: ObservableObject, AuthServiceProtocol {
    // MARK: - Singleton
    static let shared = AuthService()
    
    // MARK: - Properties
    private let apiClient = APIClient.shared
    private let keychainService = KeychainService.shared
    
    @Published var currentUser: User?
    @Published var isAuthenticated = false
    @Published var errorMessage: String?
    
    private let tokenKey = "auth_token"
    private let refreshTokenKey = "refresh_token"
    private let userIdKey = "user_id"
    
    /// Logger for authentication operations
    private let logger = Logger(subsystem: "com.vici.ViciMVP", category: "AuthService")
    
    // MARK: - AuthServiceProtocol
    
    /// Publisher for auth state changes
    var authStatePublisher: AnyPublisher<AuthState, Never> {
        $isAuthenticated
            .combineLatest($currentUser)
            .map { isAuthenticated, user in
                if isAuthenticated, let user = user {
                    return .loggedIn(user)
                } else if isAuthenticated {
                    return .loading
                } else {
                    return .loggedOut
                }
            }
            .eraseToAnyPublisher()
    }
    
    // MARK: - Initialization
    private init() {
        checkAuthentication()
    }
    
    // MARK: - Auth state
    
    private func checkAuthentication() {
        isAuthenticated = keychainService.getAccessToken() != nil
        
        if isAuthenticated {
            Task {
                do {
                    currentUser = try await getCurrentUser()
                } catch {
                    isAuthenticated = false
                    self.errorMessage = "Session expired. Please log in again."
                }
            }
        }
    }
    
    // MARK: - Authentication
    
    /// Login with email and password
    /// - Parameters:
    ///   - email: User's email address
    ///   - password: User's password
    /// - Returns: Authentication response with user and tokens
    func login(email: String, password: String) async throws -> AuthResponse {
        logger.debug("Sending login request for email: \(email)")
        
        let parameters: [String: Any] = [
            "email": email,
            "password": password
        ]
        
        do {
            let response: APIResponse<[String: Any]> = try await apiClient.post(
                endpoint: "auth/login",
                body: parameters
            )
            
            guard let data = response.data else {
                logger.error("No data in login response")
                throw APIError.invalidResponseData
            }
            
            guard let userData = data["user"] as? [String: Any],
                  let accessToken = data["accessToken"] as? String,
                  let refreshToken = data["refreshToken"] as? String else {
                logger.error("Invalid response format")
                throw APIError.invalidResponseData
            }
            
            // Parse user data into User model
            let user = try parseUserData(userData)
            
            logger.debug("Login successful for user: \(user.id)")
            return AuthResponse(user: user, accessToken: accessToken, refreshToken: refreshToken)
        } catch {
            logger.error("Login failed: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Register a new user
    /// - Parameters:
    ///   - name: User's name
    ///   - email: User's email address
    ///   - password: User's password
    /// - Returns: Authentication response with user and tokens
    func register(name: String, email: String, password: String) async throws -> AuthResponse {
        logger.debug("Sending registration request for email: \(email)")
        
        let parameters: [String: Any] = [
            "name": name,
            "email": email,
            "password": password
        ]
        
        do {
            let response: APIResponse<[String: Any]> = try await apiClient.post(
                endpoint: "auth/register",
                body: parameters
            )
            
            guard let data = response.data else {
                logger.error("No data in registration response")
                throw APIError.invalidResponseData
            }
            
            guard let userData = data["user"] as? [String: Any],
                  let accessToken = data["accessToken"] as? String,
                  let refreshToken = data["refreshToken"] as? String else {
                logger.error("Invalid response format")
                throw APIError.invalidResponseData
            }
            
            // Parse user data into User model
            let user = try parseUserData(userData)
            
            logger.debug("Registration successful for user: \(user.id)")
            return AuthResponse(user: user, accessToken: accessToken, refreshToken: refreshToken)
        } catch {
            logger.error("Registration failed: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Logout the current user
    func logout() async throws {
        logger.debug("Sending logout request")
        
        do {
            let _: APIResponse<String> = try await apiClient.post(endpoint: "auth/logout")
            logger.debug("Logout successful")
        } catch {
            logger.error("Logout failed: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Refresh the access token using a refresh token
    /// - Returns: New tokens
    func refreshToken() async throws -> (accessToken: String, refreshToken: String) {
        logger.debug("Refreshing access token")
        
        guard let refreshToken = KeychainService.shared.getRefreshToken() else {
            logger.error("No refresh token available")
            throw APIError.unauthorized
        }
        
        let parameters: [String: Any] = [
            "refreshToken": refreshToken
        ]
        
        do {
            let response: APIResponse<[String: Any]> = try await apiClient.post(
                endpoint: "auth/refresh-token",
                body: parameters
            )
            
            guard let data = response.data,
                  let accessToken = data["accessToken"] as? String,
                  let newRefreshToken = data["refreshToken"] as? String else {
                logger.error("Invalid token refresh response")
                throw APIError.invalidResponseData
            }
            
            // Store new tokens
            KeychainService.shared.saveAccessToken(accessToken)
            KeychainService.shared.saveRefreshToken(newRefreshToken)
            
            logger.debug("Token refresh successful")
            return (accessToken, newRefreshToken)
        } catch {
            logger.error("Token refresh failed: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Fetch current user details
    func getCurrentUser() async throws -> User {
        logger.debug("Fetching current user profile")
        
        do {
            let response: APIResponse<[String: Any]> = try await apiClient.get(endpoint: "users/me")
            
            guard let userData = response.data else {
                logger.error("No user data in response")
                throw APIError.invalidResponseData
            }
            
            // Parse user data into User model
            let user = try parseUserData(userData)
            
            logger.debug("Successfully fetched user profile: \(user.id)")
            return user
        } catch {
            logger.error("Failed to fetch user profile: \(error.localizedDescription)")
            throw error
        }
    }
    
    /// Update user information
    func updateProfile(name: String? = nil, email: String? = nil, height: Double? = nil, weight: Double? = nil, birthdate: Date? = nil) async throws -> User {
        var body: [String: Any] = [:]
        
        if let name = name { body["name"] = name }
        if let email = email { body["email"] = email }
        if let height = height { body["height"] = height }
        if let weight = weight { body["weight"] = weight }
        if let birthdate = birthdate {
            let formatter = ISO8601DateFormatter()
            body["birthdate"] = formatter.string(from: birthdate)
        }
        
        let response: APIResponse<User> = try await apiClient.patch(
            endpoint: "users/me",
            body: body
        )
        
        if let user = response.data {
            await MainActor.run {
                self.currentUser = user
            }
            return user
        } else {
            throw APIError.invalidResponse("Missing user in response")
        }
    }
    
    /// Request password reset
    func requestPasswordReset(email: String) async throws {
        let _: APIResponse<EmptyResponse> = try await apiClient.post(
            endpoint: "auth/forgot-password",
            body: ["email": email]
        )
    }
    
    /// Reset password
    func resetPassword(token: String, newPassword: String) async throws {
        let _: APIResponse<EmptyResponse> = try await apiClient.post(
            endpoint: "auth/reset-password",
            body: ["token": token, "password": newPassword]
        )
    }
    
    /// Get Strava OAuth URL
    func getStravaOAuthURL() async throws -> String {
        let response: APIResponse<StravaOAuthURLResponse> = try await apiClient.get(endpoint: "integrations/strava/auth-url")
        
        if let url = response.data?.url {
            return url
        } else {
            throw APIError.invalidResponse("Missing OAuth URL in response")
        }
    }
    
    /// Handle Strava callback
    func handleStravaCallback(code: String, state: String) async throws -> User {
        let response: APIResponse<User> = try await apiClient.post(
            endpoint: "integrations/strava/callback",
            body: ["code": code, "state": state]
        )
        
        if let user = response.data {
            await MainActor.run {
                self.currentUser = user
            }
            return user
        } else {
            throw APIError.invalidResponse("Missing user in response")
        }
    }
    
    /// Disconnect Strava account
    func disconnectStrava() async throws {
        let response: APIResponse<User> = try await apiClient.delete(endpoint: "integrations/strava")
        
        if let user = response.data {
            await MainActor.run {
                self.currentUser = user
            }
        } else {
            throw APIError.invalidResponse("Missing user in response")
        }
    }
    
    // MARK: - AuthServiceProtocol Implementation
    
    /// Check the current authentication status
    func checkAuthStatus() {
        logger.debug("Checking authentication status")
        isAuthenticated = keychainService.getAccessToken() != nil
        
        if isAuthenticated {
            Task {
                do {
                    let user = try await getCurrentUser()
                    await MainActor.run {
                        self.currentUser = user
                    }
                } catch {
                    await MainActor.run {
                        self.isAuthenticated = false
                        self.errorMessage = "Session expired. Please log in again."
                    }
                }
            }
        }
    }
    
    /// Login with completion handler (for protocol conformance)
    func login(email: String, password: String, completion: @escaping (Result<User, Error>) -> Void) {
        Task {
            do {
                let response = try await login(email: email, password: password)
                
                // Store tokens
                keychainService.saveAccessToken(response.accessToken ?? "")
                keychainService.saveRefreshToken(response.refreshToken ?? "")
                
                // Set authenticated state
                await MainActor.run {
                    self.isAuthenticated = true
                    self.currentUser = response.user
                }
                
                completion(.success(response.user))
            } catch {
                completion(.failure(error))
            }
        }
    }
    
    /// Register with completion handler (for protocol conformance)
    func register(email: String, password: String, name: String, completion: @escaping (Result<User, Error>) -> Void) {
        Task {
            do {
                let response = try await register(name: name, email: email, password: password)
                
                // Store tokens
                keychainService.saveAccessToken(response.accessToken ?? "")
                keychainService.saveRefreshToken(response.refreshToken ?? "")
                
                // Set authenticated state
                await MainActor.run {
                    self.isAuthenticated = true
                    self.currentUser = response.user
                }
                
                completion(.success(response.user))
            } catch {
                completion(.failure(error))
            }
        }
    }
    
    /// Logout with completion handler (for protocol conformance)
    func logout(completion: @escaping (Result<Void, Error>) -> Void) {
        Task {
            do {
                try await logout()
                
                // Clear tokens
                keychainService.clearTokens()
                
                // Update state
                await MainActor.run {
                    self.isAuthenticated = false
                    self.currentUser = nil
                }
                
                completion(.success(()))
            } catch {
                completion(.failure(error))
            }
        }
    }
    
    /// Get user profile with completion handler (for protocol conformance)
    func getUserProfile(completion: @escaping (Result<User, Error>) -> Void) {
        Task {
            do {
                let user = try await getCurrentUser()
                
                await MainActor.run {
                    self.currentUser = user
                }
                
                completion(.success(user))
            } catch {
                completion(.failure(error))
            }
        }
    }
    
    /// Check if a user has connected their Strava account
    func checkStravaConnection(userId: String, completion: @escaping (Result<Bool, Error>) -> Void) {
        Task {
            do {
                let endpoint = "users/\(userId)/strava/status"
                let response: APIResponse<[String: Any]> = try await apiClient.get(endpoint: endpoint)
                
                guard let data = response.data,
                      let isConnected = data["connected"] as? Bool else {
                    throw APIError.invalidResponseData
                }
                
                completion(.success(isConnected))
            } catch {
                completion(.failure(error))
            }
        }
    }
    
    /// Connect a user's Strava account
    func connectStrava(userId: String, completion: @escaping (Result<Void, Error>) -> Void) {
        Task {
            do {
                // Get the Strava OAuth URL
                let endpoint = "users/\(userId)/strava/connect"
                let response: APIResponse<[String: String]> = try await apiClient.get(endpoint: endpoint)
                
                guard let data = response.data,
                      let authURL = data["authUrl"] else {
                    throw APIError.invalidResponseData
                }
                
                // Open the URL in Safari
                if let url = URL(string: authURL),
                   UIApplication.shared.canOpenURL(url) {
                    UIApplication.shared.open(url)
                    completion(.success(()))
                } else {
                    throw NSError(domain: "com.vici.error", code: 400, userInfo: [
                        NSLocalizedDescriptionKey: "Invalid Strava authorization URL"
                    ])
                }
            } catch {
                completion(.failure(error))
            }
        }
    }
    
    /// Disconnect a user's Strava account
    func disconnectStrava(userId: String, completion: @escaping (Result<Void, Error>) -> Void) {
        Task {
            do {
                let endpoint = "users/\(userId)/strava/disconnect"
                let _: APIResponse<String> = try await apiClient.post(endpoint: endpoint)
                completion(.success(()))
            } catch {
                completion(.failure(error))
            }
        }
    }
    
    // MARK: - Helper Methods
    
    @MainActor
    private func saveTokensAndUpdateUser(user: User, accessToken: String, refreshToken: String) {
        keychainService.saveAccessToken(accessToken)
        keychainService.saveRefreshToken(refreshToken)
        
        self.currentUser = user
        self.isAuthenticated = true
    }
    
    /// Parse user data from API response
    /// - Parameter userData: Dictionary of user data
    /// - Returns: User object
    private func parseUserData(_ userData: [String: Any]) throws -> User {
        guard let id = userData["id"] as? String,
              let email = userData["email"] as? String else {
            logger.error("Missing required user fields")
            throw APIError.invalidResponseData
        }
        
        let name = userData["name"] as? String
        
        // Basic user with required fields
        var user = User(
            id: id,
            email: email,
            name: name,
            createdAt: parseDate(userData["createdAt"]),
            updatedAt: parseDate(userData["updatedAt"])
        )
        
        // Add optional fields if available
        if let settingsData = userData["settings"] as? [String: Any] {
            user.settings = parseUserSettings(settingsData, userId: id)
        }
        
        if let profileData = userData["runnerProfile"] as? [String: Any] {
            user.runnerProfile = parseRunnerProfile(profileData, userId: id)
        }
        
        if let stravaData = userData["stravaConnection"] as? [String: Any], 
           let stravaId = stravaData["stravaId"] as? String {
            user.stravaConnection = UserConnection(
                id: stravaData["id"] as? String ?? UUID().uuidString,
                userId: id,
                providerName: "strava",
                providerId: stravaId,
                active: stravaData["active"] as? Bool ?? true
            )
        }
        
        return user
    }
    
    /// Parse date string to Date object
    private func parseDate(_ dateString: Any?) -> Date {
        if let dateStr = dateString as? String,
           let date = ISO8601DateFormatter().date(from: dateStr) {
            return date
        }
        return Date()
    }
    
    /// Parse user settings data
    private func parseUserSettings(_ data: [String: Any], userId: String) -> UserSettings? {
        guard let id = data["id"] as? String else {
            return nil
        }
        
        let distanceUnitString = data["distanceUnit"] as? String ?? "km"
        let distanceUnit: DistanceUnit = distanceUnitString == "miles" ? .miles : .km
        
        let language = data["language"] as? String ?? "en"
        
        let coachingStyleString = data["coachingStyle"] as? String ?? "balanced"
        let coachingStyle: CoachingStyle = {
            switch coachingStyleString.lowercased() {
            case "supportive": return .supportive
            case "challenging": return .challenging
            default: return .balanced
            }
        }()
        
        var notificationPreferences: NotificationPreferences?
        if let notifData = data["notificationPreferences"] as? [String: Any] {
            notificationPreferences = NotificationPreferences(
                id: notifData["id"] as? String ?? UUID().uuidString,
                email: notifData["email"] as? Bool ?? true,
                push: notifData["push"] as? Bool ?? true,
                sms: notifData["sms"] as? Bool ?? false,
                inApp: notifData["inApp"] as? Bool ?? true
            )
        }
        
        return UserSettings(
            id: id,
            userId: userId,
            distanceUnit: distanceUnit,
            language: language,
            coachingStyle: coachingStyle,
            notificationPreferences: notificationPreferences,
            privacyDataSharing: data["privacyDataSharing"] as? Bool ?? true
        )
    }
    
    /// Parse runner profile data
    private func parseRunnerProfile(_ data: [String: Any], userId: String) -> RunnerProfile? {
        guard let id = data["id"] as? String else {
            return nil
        }
        
        let experienceLevelString = data["experienceLevel"] as? String ?? "intermediate"
        let experienceLevel: ExperienceLevel = {
            switch experienceLevelString.lowercased() {
            case "beginner": return .beginner
            case "advanced": return .advanced
            case "elite": return .elite
            default: return .intermediate
            }
        }()
        
        let sexString = data["sex"] as? String ?? "unspecified"
        let sex: Sex = {
            switch sexString.lowercased() {
            case "male": return .male
            case "female": return .female
            default: return .unspecified
            }
        }()
        
        var dateOfBirth: Date?
        if let dobString = data["dateOfBirth"] as? String {
            dateOfBirth = ISO8601DateFormatter().date(from: dobString)
        }
        
        return RunnerProfile(
            id: id,
            userId: userId,
            experienceLevel: experienceLevel,
            weeklyRunningFrequency: data["weeklyRunningFrequency"] as? Int ?? 3,
            weeklyRunningDistanceKm: data["weeklyRunningDistanceKm"] as? Double ?? 20.0,
            typicalPaceMinPerKm: data["typicalPaceMinPerKm"] as? Int ?? 360, // 6:00 min/km
            recentRaces: nil, // Would need to parse races array
            primaryGoal: data["primaryGoal"] as? String,
            injuries: data["injuries"] as? String,
            maxHR: data["maxHR"] as? Int,
            restingHR: data["restingHR"] as? Int,
            dateOfBirth: dateOfBirth,
            weight: data["weight"] as? Double,
            height: data["height"] as? Double,
            sex: sex
        )
    }
}

// MARK: - KeychainService for secure storage

class KeychainService {
    static let shared = KeychainService()
    
    private init() {}
    
    func set(_ value: String, forKey key: String) {
        if let data = value.data(using: .utf8) {
            let query: [String: Any] = [
                kSecClass as String: kSecClassGenericPassword,
                kSecAttrAccount as String: key,
                kSecValueData as String: data
            ]
            
            // First, delete any existing item
            SecItemDelete(query as CFDictionary)
            
            // Then add the new item
            SecItemAdd(query as CFDictionary, nil)
        }
    }
    
    func get(_ key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        if status == errSecSuccess {
            if let data = dataTypeRef as? Data,
               let value = String(data: data, encoding: .utf8) {
                return value
            }
        }
        
        return nil
    }
    
    func delete(_ key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        
        SecItemDelete(query as CFDictionary)
    }
    
    func getAccessToken() -> String? {
        get(tokenKey)
    }
    
    func getRefreshToken() -> String? {
        get(refreshTokenKey)
    }
    
    func saveAccessToken(_ token: String) {
        set(token, forKey: tokenKey)
    }
    
    func saveRefreshToken(_ token: String) {
        set(token, forKey: refreshTokenKey)
    }
    
    func clearTokens() {
        delete(tokenKey)
        delete(refreshTokenKey)
        delete(userIdKey)
    }
}

// MARK: - Response Models

struct StravaOAuthURLResponse: Codable {
    let url: String
}

struct EmptyResponse: Codable {} 