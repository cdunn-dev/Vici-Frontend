import SwiftUI

@main
struct ViciMVPApp: App {
    // Use the comprehensive AuthViewModel from ViewModels/AuthViewModel.swift
    @StateObject private var authViewModel = AuthViewModel()
    
    var body: some Scene {
        WindowGroup {
            if authViewModel.isLoggedIn {
                MainTabView()
                    .environmentObject(authViewModel)
            } else {
                AuthenticationView()
                    .environmentObject(authViewModel)
            }
        }
    }
}

// MARK: - Redundant AuthViewModel 
// NOTE: This simple implementation is replaced by the comprehensive AuthViewModel in ViewModels/AuthViewModel.swift
// This code should be removed but is kept temporarily to prevent breaking changes elsewhere in the codebase
class _DeprecatedAuthViewModel: ObservableObject {
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