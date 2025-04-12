import SwiftUI

@main
struct ViciMVPApp: App {
    @StateObject private var authViewModel = AuthViewModel()
    
    var body: some Scene {
        WindowGroup {
            if authViewModel.isAuthenticated {
                MainTabView()
                    .environmentObject(authViewModel)
            } else {
                AuthView()
                    .environmentObject(authViewModel)
            }
        }
    }
}

class AuthViewModel: ObservableObject {
    @Published var isAuthenticated: Bool = false
    @Published var currentUser: User?
    private let authService = AuthService.shared
    
    init() {
        // Check if user is already logged in
        if let user = authService.currentUser {
            self.currentUser = user
            self.isAuthenticated = true
        }
    }
    
    func login(email: String, password: String) async {
        do {
            let user = try await authService.login(email: email, password: password)
            DispatchQueue.main.async {
                self.currentUser = user
                self.isAuthenticated = true
            }
        } catch {
            print("Login error: \(error)")
        }
    }
    
    func register(name: String, email: String, password: String) async {
        do {
            let user = try await authService.register(name: name, email: email, password: password)
            DispatchQueue.main.async {
                self.currentUser = user
                self.isAuthenticated = true
            }
        } catch {
            print("Registration error: \(error)")
        }
    }
    
    func logout() {
        authService.logout()
        DispatchQueue.main.async {
            self.currentUser = nil
            self.isAuthenticated = false
        }
    }
} 