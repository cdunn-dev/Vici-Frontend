import Foundation
import SwiftUI

class AuthViewModel: ObservableObject {
    private let authService = AuthService.shared
    
    @Published var user: User?
    @Published var isLoggedIn: Bool
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    init() {
        // Initialize login state from keychain
        self.isLoggedIn = authService.isLoggedIn()
        
        // Attempt to fetch the current user if logged in
        if self.isLoggedIn {
            Task {
                await fetchCurrentUser()
            }
        }
    }
    
    // MARK: - Login
    
    func login(email: String, password: String) async {
        await MainActor.run { 
            isLoading = true
            errorMessage = nil
        }
        
        do {
            let user = try await authService.login(email: email, password: password)
            await MainActor.run {
                self.user = user
                self.isLoggedIn = true
                self.isLoading = false
            }
        } catch let error as APIError {
            await MainActor.run {
                self.errorMessage = "Login failed: \(error.localizedDescription)"
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = "Login failed: \(error.localizedDescription)"
                self.isLoading = false
            }
        }
    }
    
    // MARK: - Registration
    
    func register(name: String, email: String, password: String) async {
        await MainActor.run {
            isLoading = true
            errorMessage = nil
        }
        
        do {
            let user = try await authService.register(email: email, password: password, name: name)
            await MainActor.run {
                self.user = user
                self.isLoggedIn = true
                self.isLoading = false
            }
        } catch let error as APIError {
            await MainActor.run {
                self.errorMessage = "Registration failed: \(error.localizedDescription)"
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = "Registration failed: \(error.localizedDescription)"
                self.isLoading = false
            }
        }
    }
    
    // MARK: - Logout
    
    func logout() {
        authService.logout()
        
        // Update UI state
        Task { @MainActor in
            self.user = nil
            self.isLoggedIn = false
        }
    }
    
    // MARK: - User Info
    
    func fetchCurrentUser() async {
        await MainActor.run {
            isLoading = true
            errorMessage = nil
        }
        
        do {
            let user = try await authService.getCurrentUser()
            await MainActor.run {
                self.user = user
                self.isLoading = false
            }
        } catch let error as APIError {
            await MainActor.run {
                self.errorMessage = "Failed to fetch user: \(error.localizedDescription)"
                self.isLoading = false
                
                // If unauthorized, log out
                if case .unauthorized = error {
                    self.logout()
                }
            }
        } catch {
            await MainActor.run {
                self.errorMessage = "Failed to fetch user: \(error.localizedDescription)"
                self.isLoading = false
            }
        }
    }
    
    // MARK: - Profile Update
    
    func updateProfile(name: String? = nil, email: String? = nil, bio: String? = nil) async {
        await MainActor.run {
            isLoading = true
            errorMessage = nil
        }
        
        do {
            let updatedUser = try await authService.updateUser(name: name, email: email, bio: bio)
            await MainActor.run {
                self.user = updatedUser
                self.isLoading = false
            }
        } catch let error as APIError {
            await MainActor.run {
                self.errorMessage = "Failed to update profile: \(error.localizedDescription)"
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.errorMessage = "Failed to update profile: \(error.localizedDescription)"
                self.isLoading = false
            }
        }
    }
} 