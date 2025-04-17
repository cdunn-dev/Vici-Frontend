import SwiftUI
import Combine

class SimpleAuthViewModel: ObservableObject {
    @Published var isLoggedIn: Bool = false
    @Published var currentUser: User? = nil
    @Published var isLoading: Bool = false
    @Published var errorMessage: String? = nil
    @Published var isStravaConnected: Bool = false
    
    init() {
        // For testing only
        isLoggedIn = true
        currentUser = User(
            id: "test-user",
            email: "test@example.com",
            name: "Test User",
            createdAt: Date(),
            updatedAt: Date(),
            settings: nil,
            runnerProfile: nil,
            stravaConnection: nil
        )
    }
    
    func login(email: String, password: String) {
        isLoading = true
        
        // Simulate login
        DispatchQueue.main.asyncAfter(deadline: .now() + 1) {
            self.isLoading = false
            self.isLoggedIn = true
            self.currentUser = User(
                id: "user-1",
                email: email,
                name: "Test User",
                createdAt: Date(),
                updatedAt: Date(),
                settings: nil,
                runnerProfile: nil,
                stravaConnection: nil
            )
        }
    }
    
    func logout() {
        isLoggedIn = false
        currentUser = nil
    }
    
    func updateStravaConnectionStatus(isConnected: Bool) {
        isStravaConnected = isConnected
    }
}
