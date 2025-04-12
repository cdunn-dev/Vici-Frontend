import Foundation
import KeychainSwift

class AuthService {
    static let shared = AuthService()
    
    private let keychain = KeychainSwift()
    private let tokenKey = "vici.authToken"
    private let refreshTokenKey = "vici.refreshToken"
    private let userIdKey = "vici.userId"
    private let apiClient: APIClient
    
    private var currentUser: User?
    
    init() {
        self.apiClient = APIClient.shared
    }
    
    // MARK: - Token Management
    
    func getToken() throws -> String {
        guard let token = keychain.get(tokenKey) else {
            throw APIError.unauthorized
        }
        return token
    }
    
    func saveTokens(token: String, refreshToken: String) {
        keychain.set(token, forKey: tokenKey)
        keychain.set(refreshToken, forKey: refreshTokenKey)
        
        // Update the API client with the token
        apiClient.setAuthToken(token)
    }
    
    func clearTokens() {
        keychain.delete(tokenKey)
        keychain.delete(refreshTokenKey)
        keychain.delete(userIdKey)
        
        // Clear the token from API client
        apiClient.setAuthToken(nil)
        currentUser = nil
    }
    
    // MARK: - Authentication
    
    func login(email: String, password: String) async throws -> User {
        struct LoginResponse: Codable {
            let user: User
            let token: String
            let refreshToken: String
        }
        
        let parameters: [String: Any] = [
            "email": email,
            "password": password
        ]
        
        let response: LoginResponse = try await apiClient.post(endpoint: "auth/login", parameters: parameters)
        
        // Save tokens and user ID
        saveTokens(token: response.token, refreshToken: response.refreshToken)
        if let userId = response.user.id as? Int {
            keychain.set(String(userId), forKey: userIdKey)
        }
        
        currentUser = response.user
        return response.user
    }
    
    func signup(email: String, password: String, name: String) async throws -> User {
        struct SignupResponse: Codable {
            let user: User
            let token: String
            let refreshToken: String
        }
        
        let parameters: [String: Any] = [
            "email": email,
            "password": password,
            "name": name
        ]
        
        let response: SignupResponse = try await apiClient.post(endpoint: "auth/signup", parameters: parameters)
        
        // Save tokens and user ID
        saveTokens(token: response.token, refreshToken: response.refreshToken)
        if let userId = response.user.id as? Int {
            keychain.set(String(userId), forKey: userIdKey)
        }
        
        currentUser = response.user
        return response.user
    }
    
    // Alias for signup to maintain compatibility with previous code
    func register(email: String, password: String, name: String) async throws -> User {
        return try await signup(email: email, password: password, name: name)
    }
    
    func logout() {
        clearTokens()
    }
    
    func refreshAuth() async throws {
        guard let refreshToken = keychain.get(refreshTokenKey) else {
            throw APIError.unauthorized
        }
        
        struct RefreshResponse: Codable {
            let token: String
            let refreshToken: String
        }
        
        let parameters: [String: Any] = [
            "refreshToken": refreshToken
        ]
        
        let response: RefreshResponse = try await apiClient.post(endpoint: "auth/refresh", parameters: parameters)
        
        // Save new tokens
        saveTokens(token: response.token, refreshToken: response.refreshToken)
    }
    
    // MARK: - User Management
    
    func getCurrentUser() async throws -> User {
        if let currentUser = currentUser {
            return currentUser
        }
        
        return try await fetchCurrentUser()
    }
    
    func fetchCurrentUser() async throws -> User {
        let user: User = try await apiClient.get(endpoint: "users/me")
        currentUser = user
        return user
    }
    
    func updateUser(name: String? = nil, email: String? = nil, bio: String? = nil) async throws -> User {
        var parameters: [String: Any] = [:]
        
        if let name = name {
            parameters["name"] = name
        }
        
        if let email = email {
            parameters["email"] = email
        }
        
        if let bio = bio {
            parameters["bio"] = bio
        }
        
        let user: User = try await apiClient.put(endpoint: "users/me", parameters: parameters)
        currentUser = user
        return user
    }
    
    func isLoggedIn() -> Bool {
        return keychain.get(tokenKey) != nil
    }
    
    // MARK: - App Initialization
    
    func setupFromSavedState() {
        if let token = keychain.get(tokenKey) {
            apiClient.setAuthToken(token)
            
            // You might want to fetch the current user in the background
            Task {
                do {
                    _ = try await fetchCurrentUser()
                } catch {
                    print("Error fetching user on app start: \(error)")
                    // This might be due to expired token, let's try refreshing
                    do {
                        try await refreshAuth()
                        _ = try await fetchCurrentUser()
                    } catch {
                        // Failed to refresh, log the user out
                        print("Failed to refresh token: \(error)")
                        clearTokens()
                    }
                }
            }
        }
    }
    
    // MARK: - Profile Management
    
    func updateProfile(name: String, email: String, settings: [String: Any]?) async throws -> User {
        var params: [String: Any] = [
            "name": name,
            "email": email
        ]
        
        if let settings = settings {
            params["settings"] = settings
        }
        
        let user: User = try await apiClient.request(
            endpoint: "auth/profile",
            method: .put,
            parameters: params
        )
        
        currentUser = user
        return user
    }
    
    func getProfile() async throws -> User {
        let user: User = try await apiClient.request(
            endpoint: "auth/profile",
            method: .get
        )
        
        currentUser = user
        return user
    }
    
    // MARK: - Social Auth
    
    func socialAuth(provider: String, token: String) async throws -> User {
        let params = [
            "provider": provider,
            "token": token
        ]
        
        let response: AuthResponse = try await apiClient.request(
            endpoint: "auth/social",
            method: .post,
            parameters: params
        )
        
        saveTokens(token: response.token, refreshToken: response.refreshToken)
        keychain.set(String(response.user.id), forKey: userIdKey)
        
        currentUser = response.user
        return response.user
    }
}

enum AuthError: Error {
    case invalidCredentials
    case userNotFound
    case registrationFailed
    case unauthorized
} 