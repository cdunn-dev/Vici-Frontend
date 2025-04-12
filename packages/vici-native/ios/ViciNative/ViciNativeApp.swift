import SwiftUI

// User authentication model
class UserAuthentication: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    func login(email: String, password: String) {
        // In a real app, this would validate credentials with a backend
        // For the MVP, we'll just simulate success
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            self.isAuthenticated = true
            self.currentUser = User.current
        }
    }
    
    func register(email: String, password: String, name: String = "") {
        // In a real app, this would register a new user with a backend
        // For the MVP, we'll just simulate success
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            self.isAuthenticated = true
            self.currentUser = User.current
        }
    }
    
    func logout() {
        isAuthenticated = false
        currentUser = nil
    }
}

@main
struct ViciNativeApp: App {
    @StateObject private var userAuth = UserAuthentication()
    
    var body: some Scene {
        WindowGroup {
            if userAuth.isAuthenticated {
                MainTabView()
                    .environmentObject(userAuth)
            } else {
                AuthenticationView()
                    .environmentObject(userAuth)
            }
        }
    }
} 