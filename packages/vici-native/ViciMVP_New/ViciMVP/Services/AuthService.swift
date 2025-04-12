import Foundation

/// Service for handling user authentication, registration, and session management
class AuthService {
    // MARK: - Singleton
    static let shared = AuthService()
    
    // MARK: - Properties
    private let apiClient = APIClient.shared
    private let keychain = KeychainService.shared
    
    private let tokenKey = "auth_token"
    private let refreshTokenKey = "refresh_token"
    private let userIdKey = "user_id"
    
    // MARK: - Initialization
    private init() {}
    
    // MARK: - Authentication Methods
    
    /// Checks if the user is currently logged in
    func isLoggedIn() -> Bool {
        return keychain.get(tokenKey) != nil
    }
    
    /// Log in a user with email and password
    func login(email: String, password: String) async throws -> User {
        let loginData = ["email": email, "password": password]
        
        let response: [String: Any] = try await apiClient.request(
            endpoint: "/auth/login",
            method: .post,
            body: loginData
        )
        
        guard let token = response["token"] as? String,
              let refreshToken = response["refreshToken"] as? String,
              let userData = response["user"] as? [String: Any],
              let userId = userData["id"] as? String else {
            throw APIError.decodingError("Invalid login response format")
        }
        
        // Store tokens securely
        keychain.set(token, forKey: tokenKey)
        keychain.set(refreshToken, forKey: refreshTokenKey)
        keychain.set(userId, forKey: userIdKey)
        
        // Parse user data
        return try await getCurrentUser()
    }
    
    /// Register a new user
    func register(email: String, password: String, name: String) async throws -> User {
        let registrationData = [
            "email": email,
            "password": password,
            "name": name
        ]
        
        let response: [String: Any] = try await apiClient.request(
            endpoint: "/auth/register",
            method: .post,
            body: registrationData
        )
        
        guard let token = response["token"] as? String,
              let refreshToken = response["refreshToken"] as? String,
              let userData = response["user"] as? [String: Any],
              let userId = userData["id"] as? String else {
            throw APIError.decodingError("Invalid registration response format")
        }
        
        // Store tokens securely
        keychain.set(token, forKey: tokenKey)
        keychain.set(refreshToken, forKey: refreshTokenKey)
        keychain.set(userId, forKey: userIdKey)
        
        // Parse user data
        return try await getCurrentUser()
    }
    
    /// Log out the current user
    func logout() {
        keychain.delete(tokenKey)
        keychain.delete(refreshTokenKey)
        keychain.delete(userIdKey)
    }
    
    /// Fetch current user details
    func getCurrentUser() async throws -> User {
        guard let token = keychain.get(tokenKey) else {
            throw APIError.unauthorized
        }
        
        let userData: [String: Any] = try await apiClient.request(
            endpoint: "/users/me",
            method: .get,
            headers: ["Authorization": "Bearer \(token)"]
        )
        
        // Parse JSON into User model
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: userData)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(User.self, from: jsonData)
        } catch {
            throw APIError.decodingError("Failed to decode user data: \(error.localizedDescription)")
        }
    }
    
    /// Update user information
    func updateUser(name: String? = nil, email: String? = nil, bio: String? = nil) async throws -> User {
        guard let token = keychain.get(tokenKey),
              let userId = keychain.get(userIdKey) else {
            throw APIError.unauthorized
        }
        
        var updateData: [String: Any] = [:]
        if let name = name { updateData["name"] = name }
        if let email = email { updateData["email"] = email }
        if let bio = bio { updateData["bio"] = bio }
        
        let userData: [String: Any] = try await apiClient.request(
            endpoint: "/users/\(userId)",
            method: .put,
            body: updateData,
            headers: ["Authorization": "Bearer \(token)"]
        )
        
        // Parse JSON into User model
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: userData)
            let decoder = JSONDecoder()
            decoder.dateDecodingStrategy = .iso8601
            return try decoder.decode(User.self, from: jsonData)
        } catch {
            throw APIError.decodingError("Failed to decode user data: \(error.localizedDescription)")
        }
    }
    
    /// Refresh the access token
    func refreshToken() async throws -> String {
        guard let refreshToken = keychain.get(refreshTokenKey) else {
            throw APIError.unauthorized
        }
        
        let response: [String: Any] = try await apiClient.request(
            endpoint: "/auth/refresh-token",
            method: .post,
            body: ["refreshToken": refreshToken]
        )
        
        guard let newToken = response["token"] as? String else {
            throw APIError.decodingError("Invalid refresh token response")
        }
        
        // Update stored token
        keychain.set(newToken, forKey: tokenKey)
        return newToken
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
} 