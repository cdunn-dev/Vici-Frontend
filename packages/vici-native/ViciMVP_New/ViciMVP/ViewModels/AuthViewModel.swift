import Foundation
import Combine

class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var currentUser: User?
    
    private let authService: AuthService
    private var cancellables = Set<AnyCancellable>()
    
    init(authService: AuthService = AuthService()) {
        self.authService = authService
        checkAuthStatus()
    }
    
    func checkAuthStatus() {
        if let token = UserDefaults.standard.string(forKey: "authToken"), !token.isEmpty {
            // Auto-login with stored token
            Task {
                do {
                    self.currentUser = try await authService.getCurrentUser()
                    DispatchQueue.main.async {
                        self.isAuthenticated = true
                    }
                } catch {
                    print("Failed to auto-login: \(error)")
                    DispatchQueue.main.async {
                        self.logout()
                    }
                }
            }
        }
    }
    
    func login(email: String, password: String) async throws {
        let response = try await authService.login(email: email, password: password)
        
        UserDefaults.standard.set(response.token, forKey: "authToken")
        
        DispatchQueue.main.async {
            self.currentUser = response.user
            self.isAuthenticated = true
        }
    }
    
    func register(email: String, password: String) async throws {
        let response = try await authService.register(email: email, password: password)
        
        UserDefaults.standard.set(response.token, forKey: "authToken")
        
        DispatchQueue.main.async {
            self.currentUser = response.user
            self.isAuthenticated = true
        }
    }
    
    func logout() {
        UserDefaults.standard.removeObject(forKey: "authToken")
        
        DispatchQueue.main.async {
            self.currentUser = nil
            self.isAuthenticated = false
        }
    }
    
    func connectStrava(code: String) async throws {
        try await authService.connectStrava(code: code)
        // After connecting, refresh user data to get updated Strava connection status
        self.currentUser = try await authService.getCurrentUser()
    }
} 