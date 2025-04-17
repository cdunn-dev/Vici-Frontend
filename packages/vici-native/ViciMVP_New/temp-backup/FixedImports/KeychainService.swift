import Foundation

// KeychainService for secure storage of auth tokens
class KeychainService {
    static let shared = KeychainService()
    
    private let accessTokenKey = "vici_access_token"
    private let refreshTokenKey = "vici_refresh_token"
    private let userIdKey = "vici_user_id"
    
    private init() {}
    
    func saveAccessToken(_ token: String) {
        // In a real app, this would use the Keychain API to securely store the token
        // For now using UserDefaults for simplicity
        UserDefaults.standard.set(token, forKey: accessTokenKey)
    }
    
    func getAccessToken() -> String? {
        // In a real app, this would retrieve from the Keychain
        return UserDefaults.standard.string(forKey: accessTokenKey)
    }
    
    func saveRefreshToken(_ token: String) {
        // In a real app, this would use the Keychain API
        UserDefaults.standard.set(token, forKey: refreshTokenKey)
    }
    
    func getRefreshToken() -> String? {
        // In a real app, this would retrieve from the Keychain
        return UserDefaults.standard.string(forKey: refreshTokenKey)
    }
    
    func saveUserId(_ userId: String) {
        UserDefaults.standard.set(userId, forKey: userIdKey)
    }
    
    func getUserId() -> String? {
        return UserDefaults.standard.string(forKey: userIdKey)
    }
    
    func clearTokens() {
        UserDefaults.standard.removeObject(forKey: accessTokenKey)
        UserDefaults.standard.removeObject(forKey: refreshTokenKey)
        UserDefaults.standard.removeObject(forKey: userIdKey)
    }
}
