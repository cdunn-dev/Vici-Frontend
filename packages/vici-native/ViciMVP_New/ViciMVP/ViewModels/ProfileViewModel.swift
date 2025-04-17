import Foundation
import SwiftUI
import Combine
import os.log

/// ViewModel for handling user profile data and operations
class ProfileViewModel: BaseViewModel {
    // MARK: - Published Properties
    
    /// The current user profile
    @Published var user: User?
    
    /// Whether the profile is being edited
    @Published var isEditing: Bool = false
    
    /// Form fields for editing
    @Published var name: String = ""
    @Published var bio: String = ""
    
    // MARK: - Dependencies
    
    private let authService: AuthService
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Initialization
    
    init(authService: AuthService = .shared) {
        self.authService = authService
        
        // Initialize base class with the appropriate log category
        super.init(logCategory: "ProfileViewModel")
        
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
        Task {
            _ = await runTask(operation: "Load user profile") {
                let user = try await authService.getCurrentUser()
                self.user = user
                self.setupFormFields()
                return user
            }
        }
    }
    
    /// Update the user's profile with edited information
    func updateProfile(allowEmailUpdate: Bool = false) async -> Bool {
        guard let userId = user?.id else {
            handleError(DataError.notFound(entity: "User"))
            return false
        }
        
        return await runTask(operation: "Update user profile") {
            let updatedUser = try await authService.updateProfile(
                name: name.isEmpty ? nil : name,
                email: allowEmailUpdate && user?.email != nil ? user?.email : nil
            )
            
            self.user = updatedUser
            self.isEditing = false
            return true
        } ?? false
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
        return await runTask(operation: "Logout user") {
            try await authService.logout()
            self.user = nil
            return true
        } ?? false
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