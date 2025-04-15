import Foundation

/// Protocol for keychain service functionality
protocol KeychainServiceProtocol {
    func getAccessToken() -> String?
    func getRefreshToken() -> String?
    func saveAccessToken(_ token: String)
    func saveRefreshToken(_ token: String)
    func clearTokens()
}

/// Mock implementation of KeychainServiceProtocol for testing
class MockKeychainService: KeychainServiceProtocol {
    // MARK: - Properties
    
    /// Storage for mock tokens
    private var storage: [String: String] = [:]
    
    /// Keys for token storage
    private let accessTokenKey = "mock_access_token_key"
    private let refreshTokenKey = "mock_refresh_token_key"
    
    /// Flag to simulate keychain errors
    var shouldSimulateErrors: Bool = false
    
    // MARK: - Methods
    
    /// Get the access token
    func getAccessToken() -> String? {
        if shouldSimulateErrors {
            return nil
        }
        return storage[accessTokenKey]
    }
    
    /// Get the refresh token
    func getRefreshToken() -> String? {
        if shouldSimulateErrors {
            return nil
        }
        return storage[refreshTokenKey]
    }
    
    /// Save the access token
    func saveAccessToken(_ token: String) {
        if shouldSimulateErrors {
            return
        }
        storage[accessTokenKey] = token
    }
    
    /// Save the refresh token
    func saveRefreshToken(_ token: String) {
        if shouldSimulateErrors {
            return
        }
        storage[refreshTokenKey] = token
    }
    
    /// Clear all tokens
    func clearTokens() {
        storage.removeValue(forKey: accessTokenKey)
        storage.removeValue(forKey: refreshTokenKey)
    }
} 