import Foundation
import Security
import os.log

/// Service for securely storing authentication tokens in the keychain
class KeychainService: KeychainServiceProtocol {
    static let shared = KeychainService()
    
    /// Logger for secure operations
    private let logger = Logger(subsystem: "com.vici.ViciMVP", category: "KeychainService")
    
    private init() {}
    
    // MARK: - Keys
    private let accessTokenKey = "vici.accessToken"
    private let refreshTokenKey = "vici.refreshToken"
    private let tokenExpiryKey = "vici.tokenExpiry"
    private let userIdKey = "vici.userId"
    
    // MARK: - Access Token
    
    /// Save access token to keychain
    func saveAccessToken(_ token: String) {
        logger.debug("Saving access token to keychain")
        save(key: accessTokenKey, data: token)
    }
    
    /// Retrieve access token from keychain
    func getAccessToken() -> String? {
        let token = retrieve(key: accessTokenKey)
        logger.debug("Retrieved access token from keychain: \(token != nil ? "success" : "not found")")
        return token
    }
    
    // MARK: - Refresh Token
    
    /// Save refresh token to keychain
    func saveRefreshToken(_ token: String) {
        logger.debug("Saving refresh token to keychain")
        save(key: refreshTokenKey, data: token, withAccessControl: true)
    }
    
    /// Retrieve refresh token from keychain
    func getRefreshToken() -> String? {
        let token = retrieve(key: refreshTokenKey)
        logger.debug("Retrieved refresh token from keychain: \(token != nil ? "success" : "not found")")
        return token
    }
    
    // MARK: - Token Expiry Management
    
    /// Save token expiration timestamp
    func saveTokenExpiry(_ date: Date) {
        logger.debug("Saving token expiry date: \(date)")
        let timestamp = String(Int(date.timeIntervalSince1970))
        save(key: tokenExpiryKey, data: timestamp)
    }
    
    /// Get token expiration timestamp
    func getTokenExpiry() -> Date? {
        guard let timestampString = retrieve(key: tokenExpiryKey),
              let timestamp = Double(timestampString) else {
            logger.debug("No token expiry found")
            return nil
        }
        
        let date = Date(timeIntervalSince1970: timestamp)
        logger.debug("Retrieved token expiry: \(date)")
        return date
    }
    
    /// Check if access token is expired or about to expire
    func isAccessTokenExpired(withBuffer minutes: Int) -> Bool {
        guard let expiryDate = getTokenExpiry() else {
            // If we can't find an expiry date, assume token is expired to be safe
            logger.debug("No expiry date found, assuming token is expired")
            return true
        }
        
        let bufferInterval = TimeInterval(minutes * 60)
        let now = Date()
        let isExpired = now.addingTimeInterval(bufferInterval) >= expiryDate
        
        logger.debug("Token expiry check: \(isExpired ? "expired or expiring soon" : "valid") (expires \(expiryDate))")
        return isExpired
    }
    
    // MARK: - User ID
    
    /// Save user ID
    func saveUserId(_ userId: String) {
        logger.debug("Saving userId to keychain")
        save(key: userIdKey, data: userId)
    }
    
    /// Retrieve user ID
    func getUserId() -> String? {
        let userId = retrieve(key: userIdKey)
        logger.debug("Retrieved userId from keychain: \(userId != nil ? "success" : "not found")")
        return userId
    }
    
    // MARK: - Clear Tokens
    
    /// Clear all tokens from keychain
    func clearTokens() {
        logger.debug("Clearing all tokens from keychain")
        delete(key: accessTokenKey)
        delete(key: refreshTokenKey)
        delete(key: tokenExpiryKey)
    }
    
    // MARK: - Helper Methods
    
    /// Save string data to keychain
    private func save(key: String, data: String, withAccessControl: Bool = false) {
        guard let data = data.data(using: .utf8) else {
            logger.error("Failed to convert string to data for key: \(key)")
            return
        }
        
        // Create query with access control if needed
        var query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecValueData as String: data
        ]
        
        // Add access control for more sensitive items like refresh tokens
        if withAccessControl {
            // Create access control that requires user presence (FaceID/TouchID/Passcode)
            if let accessControl = SecAccessControlCreateWithFlags(
                nil,
                kSecAttrAccessibleWhenUnlockedThisDeviceOnly,
                .userPresence,
                nil
            ) {
                query[kSecAttrAccessControl as String] = accessControl
            }
        } else {
            // Standard security for non-sensitive items
            query[kSecAttrAccessible as String] = kSecAttrAccessibleWhenUnlockedThisDeviceOnly
        }
        
        // Delete any existing items
        SecItemDelete(query as CFDictionary)
        
        // Add the new item
        let status = SecItemAdd(query as CFDictionary, nil)
        if status != errSecSuccess {
            logger.error("Error saving to Keychain: \(status)")
        } else {
            logger.debug("Successfully saved item for key: \(key)")
        }
    }
    
    /// Retrieve data from keychain
    private func retrieve(key: String) -> String? {
        // Create query
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key,
            kSecReturnData as String: kCFBooleanTrue!,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        
        var dataTypeRef: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &dataTypeRef)
        
        if status == errSecSuccess, let retrievedData = dataTypeRef as? Data {
            return String(data: retrievedData, encoding: .utf8)
        } else if status == errSecItemNotFound {
            logger.debug("No item found for key: \(key)")
        } else {
            logger.error("Error retrieving from Keychain: \(status)")
        }
        
        return nil
    }
    
    /// Delete item from keychain
    private func delete(key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrAccount as String: key
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        if status != errSecSuccess && status != errSecItemNotFound {
            logger.error("Error deleting from Keychain: \(status)")
        } else {
            logger.debug("Successfully deleted item for key: \(key)")
        }
    }
} 