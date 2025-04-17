import Foundation

/// Protocol defining the interface for secure token storage
protocol KeychainServiceProtocol {
    /// Save access token to keychain
    func saveAccessToken(_ token: String)
    
    /// Retrieve access token from keychain
    func getAccessToken() -> String?
    
    /// Save refresh token to keychain
    func saveRefreshToken(_ token: String)
    
    /// Retrieve refresh token from keychain
    func getRefreshToken() -> String?
    
    /// Save token expiration timestamp
    func saveTokenExpiry(_ date: Date)
    
    /// Get token expiration timestamp
    func getTokenExpiry() -> Date?
    
    /// Check if access token is expired or about to expire
    func isAccessTokenExpired(withBuffer minutes: Int) -> Bool
    
    /// Save user ID
    func saveUserId(_ userId: String)
    
    /// Retrieve user ID
    func getUserId() -> String?
    
    /// Clear all tokens from keychain
    func clearTokens()
} 