import SwiftUI
import Combine

class AuthViewModel_Fixed: ObservableObject {
    @Published var isLoggedIn: Bool = true
    @Published var currentUser: User? = User(id: "test-user", email: "test@example.com", name: "Test User")
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var isStravaConnected: Bool = false
    
    // Stub methods
    func updateStravaConnectionStatus() {
        // No-op for fixed implementation
    }
    
    func refreshUserProfile() {
        // No-op for fixed implementation
    }
    
    func logout() {
        // No-op for fixed implementation
    }
} 