import Foundation
import SwiftUI
import Combine
import os.log

/// ViewModel for handling user profile data and operations
class ProfileViewModel: ObservableObject {
    // MARK: - Published Properties
    
    /// The current user profile
    @Published var user: User?
    
    /// Whether profile operations are loading
    @Published var isLoading: Bool = false
    
    /// Error message if an operation fails
    @Published var errorMessage: String?
    
    /// Whether the profile is being edited
    @Published var isEditing: Bool = false
    
    /// Form fields for editing
    @Published var name: String = ""
    @Published var bio: String = ""
    
    // MARK: - Dependencies
    
    private let authService: AuthService
    private let logger = Logger(subsystem: "com.vici.app", category: "ProfileViewModel")
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    init(authService: AuthService = .shared) {
        self.authService = authService
        
        // Listen for auth state changes
        NotificationCenter.default.publisher(for: .authStateChanged)
            .sink { [weak self] _ in
                self?.loadUserProfile()
            }
            .store(in: &cancellables)
            
        // Initial load
        loadUserProfile()
    }
    
    // MARK: - Public Methods
    
    /// Load the user's profile from the authentication service
    func loadUserProfile() {
        isLoading = true
        errorMessage = nil
        
        logger.debug("Loading user profile")
        
        Task {
            do {
                let user = try await authService.getCurrentUser()
                
                await MainActor.run {
                    self.user = user
                    self.isLoading = false
                    self.setupFormFields()
                    logger.debug("Successfully loaded profile for user: \(user.id)")
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = "Failed to load profile: \(error.localizedDescription)"
                    logger.error("Failed to load profile: \(error.localizedDescription)")
                }
            }
        }
    }
    
    /// Update the user's profile with edited information
    func updateProfile() async -> Bool {
        guard let userId = user?.id else {
            errorMessage = "No user profile loaded"
            return false
        }
        
        isLoading = true
        errorMessage = nil
        
        logger.debug("Updating profile for user: \(userId)")
        
        do {
            let updatedUser = try await authService.updateProfile(
                name: name.isEmpty ? nil : name,
                email: nil // Not allowing email updates for security
            )
            
            await MainActor.run {
                self.user = updatedUser
                self.isLoading = false
                self.isEditing = false
                logger.debug("Successfully updated profile")
            }
            return true
        } catch {
            await MainActor.run {
                self.isLoading = false
                self.errorMessage = "Failed to update profile: \(error.localizedDescription)"
                logger.error("Failed to update profile: \(error.localizedDescription)")
            }
            return false
        }
    }
    
    /// Prepares the form fields for editing
    func startEditing() {
        setupFormFields()
        isEditing = true
    }
    
    /// Cancels editing mode without saving changes
    func cancelEditing() {
        isEditing = false
        setupFormFields() // Reset fields to current values
    }
    
    /// Logs the user out
    func logout() async -> Bool {
        isLoading = true
        errorMessage = nil
        
        logger.debug("Logging out user")
        
        do {
            try await authService.logout()
            
            await MainActor.run {
                self.user = nil
                self.isLoading = false
                logger.debug("Successfully logged out")
            }
            return true
        } catch {
            await MainActor.run {
                self.isLoading = false
                self.errorMessage = "Failed to logout: \(error.localizedDescription)"
                logger.error("Failed to logout: \(error.localizedDescription)")
            }
            return false
        }
    }
    
    /// Check if Strava is connected
    var isStravaConnected: Bool {
        return user?.isStravaConnected ?? false
    }
    
    /// Get user's display name, falls back to email if name is nil
    var displayName: String {
        return user?.displayName ?? "User"
    }
    
    /// Get initials from the user's name
    func getInitials() -> String {
        guard let name = user?.name, !name.isEmpty else {
            return user?.email.prefix(1).uppercased() ?? "U"
        }
        
        let components = name.components(separatedBy: " ")
        if components.count > 1,
           let firstChar = components.first?.first,
           let lastChar = components.last?.first {
            return String(firstChar) + String(lastChar)
        } else if let firstChar = components.first?.first {
            return String(firstChar)
        }
        
        return "U"
    }
    
    // MARK: - Private Methods
    
    /// Set up form fields with current user data
    private func setupFormFields() {
        guard let user = user else { return }
        name = user.name ?? ""
        bio = user.runnerProfile?.primaryGoal ?? ""
    }
}

// MARK: - Notification Extension

extension Notification.Name {
    static let authStateChanged = Notification.Name("authStateChanged")
} 