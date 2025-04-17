import Foundation
import Combine
import SwiftUI
import os.log

/// AuthViewModel handles user authentication, profile management, and third-party service connections
@MainActor
class AuthViewModel: AuthViewModelProtocol {
    // MARK: - Published Properties
    
    /// Whether the user is currently logged in
    @Published var isLoggedIn: Bool = false
    
    /// The currently authenticated user
    @Published var currentUser: User?
    
    /// Whether authentication operations are in progress
    @Published var isLoading: Bool = true
    
    /// Current error message, if any
    @Published var errorMessage: String?
    
    /// Whether the user has connected their Strava account
    @Published var isStravaConnected: Bool = false
    
    // MARK: - Dependencies
    
    private let authService: AuthServiceProtocol
    private let keychainService: KeychainServiceProtocol
    private let stravaService: StravaServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    /// Logger for authentication operations
    private let logger = Logger(subsystem: "com.vici.ViciMVP", category: "AuthViewModel")
    
    // MARK: - Initialization
    
    init(authService: AuthServiceProtocol = AuthService.shared,
         keychainService: KeychainServiceProtocol = KeychainService.shared,
         stravaService: StravaServiceProtocol = StravaService.shared) {
        self.authService = authService
        self.keychainService = keychainService
        self.stravaService = stravaService
        
        setupSubscriptions()
        checkAuthStatus()
    }
    
    private func setupSubscriptions() {
        // Subscribe to auth state changes
        authService.authStatePublisher
            .receive(on: DispatchQueue.main)
            .sink { [weak self] authState in
                guard let self = self else { return }
                
                switch authState {
                case .loggedIn(let user):
                    self.currentUser = user
                    self.isLoggedIn = true
                    self.isLoading = false
                    self.checkStravaConnection()
                    
                case .loggedOut:
                    self.currentUser = nil
                    self.isLoggedIn = false
                    self.isLoading = false
                    self.isStravaConnected = false
                    
                case .loading:
                    self.isLoading = true
                }
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Authentication Methods
    
    /// Check the current authentication status
    func checkAuthStatus() {
        logger.debug("Checking authentication status")
        authService.checkAuthStatus()
    }
    
    /// Log in with email and password
    /// - Parameters:
    ///   - email: User's email address
    ///   - password: User's password
    func login(email: String, password: String) {
        isLoading = true
        errorMessage = nil
        
        logger.debug("Attempting login for email: \(email)")
        
        authService.login(email: email, password: password) { [weak self] result in
            Task { @MainActor in
                guard let self = self else { return }
                self.isLoading = false
                
                switch result {
                case .success(let user):
                    self.logger.debug("Login successful for user: \(user.id)")
                    self.currentUser = user
                    self.isLoggedIn = true
                    self.checkStravaConnection()
                    
                case .failure(let error):
                    self.logger.error("Login failed: \(error.localizedDescription)")
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    /// Register a new user
    /// - Parameters:
    ///   - name: User's full name
    ///   - email: User's email address
    ///   - password: User's password
    func register(email: String, password: String, name: String) {
        isLoading = true
        errorMessage = nil
        
        logger.debug("Attempting registration for email: \(email)")
        
        authService.register(email: email, password: password, name: name) { [weak self] result in
            Task { @MainActor in
                guard let self = self else { return }
                self.isLoading = false
                
                switch result {
                case .success(let user):
                    self.logger.debug("Registration successful for user: \(user.id)")
                    self.currentUser = user
                    self.isLoggedIn = true
                    
                case .failure(let error):
                    self.logger.error("Registration failed: \(error.localizedDescription)")
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    /// Log out the current user
    func logout() {
        isLoading = true
        errorMessage = nil
        
        logger.debug("Attempting logout")
        
        authService.logout { [weak self] result in
            Task { @MainActor in
                guard let self = self else { return }
                self.isLoading = false
                
                switch result {
                case .success:
                    self.logger.debug("Logout successful")
                    self.currentUser = nil
                    self.isLoggedIn = false
                    self.isStravaConnected = false
                    
                case .failure(let error):
                    self.logger.error("Logout failed: \(error.localizedDescription)")
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    /// Refresh the current user's profile
    func refreshUserProfile() {
        guard isLoggedIn else {
            logger.debug("Cannot refresh profile: user not logged in")
            return
        }
        
        logger.debug("Refreshing user profile")
        
        authService.getUserProfile { [weak self] result in
            Task { @MainActor in
                guard let self = self else { return }
                
                switch result {
                case .success(let user):
                    self.logger.debug("Profile refresh successful for user: \(user.id)")
                    self.currentUser = user
                    self.checkStravaConnection()
                    
                case .failure(let error):
                    self.logger.error("Profile refresh failed: \(error.localizedDescription)")
                    self.errorMessage = error.localizedDescription
                }
            }
        }
    }
    
    // MARK: - Strava Connection Methods
    
    /// Check if the user has connected their Strava account
    func checkStravaConnection() {
        guard let userId = currentUser?.id else {
            logger.debug("Cannot check Strava connection: no current user")
            return
        }
        
        logger.debug("Checking Strava connection for user: \(userId)")
        
        authService.checkStravaConnection(userId: userId) { [weak self] result in
            Task { @MainActor in
                guard let self = self else { return }
                
                switch result {
                case .success(let isConnected):
                    self.logger.debug("Strava connection status: \(isConnected ? "connected" : "not connected")")
                    self.isStravaConnected = isConnected
                    
                case .failure(let error):
                    self.logger.error("Failed to check Strava connection: \(error.localizedDescription)")
                    // Don't update the UI error message for this check
                }
            }
        }
    }
    
    /// Update the Strava connection status
    func updateStravaConnectionStatus(isConnected: Bool = false) {
        logger.debug("Updating Strava connection status: \(isConnected ? "connected" : "not connected")")
        self.isStravaConnected = isConnected
    }
    
    /// Connect to Strava
    func connectToStrava() {
        guard let userId = currentUser?.id else {
            logger.error("Cannot connect Strava: user not logged in")
            errorMessage = "User must be logged in to connect Strava"
            return
        }
        
        logger.debug("Connecting Strava for user: \(userId)")
        
        authService.connectStrava(userId: userId) { [weak self] result in
            Task { @MainActor in
                guard let self = self else { return }
                
                switch result {
                case .success:
                    self.logger.debug("Successfully connected to Strava")
                    self.isStravaConnected = true
                    
                case .failure(let error):
                    self.logger.error("Failed to connect Strava: \(error.localizedDescription)")
                    self.errorMessage = "Failed to connect Strava: \(error.localizedDescription)"
                }
            }
        }
    }
    
    /// Disconnect from Strava
    func disconnectStrava() {
        guard let userId = currentUser?.id else {
            logger.error("Cannot disconnect Strava: user not logged in")
            errorMessage = "User must be logged in to disconnect Strava"
            return
        }
        
        logger.debug("Disconnecting Strava for user: \(userId)")
        
        authService.disconnectStrava(userId: userId) { [weak self] result in
            Task { @MainActor in
                guard let self = self else { return }
                
                switch result {
                case .success:
                    self.logger.debug("Successfully disconnected from Strava")
                    self.isStravaConnected = false
                    
                case .failure(let error):
                    self.logger.error("Failed to disconnect Strava: \(error.localizedDescription)")
                    self.errorMessage = "Failed to disconnect Strava: \(error.localizedDescription)"
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    
    private func isUnauthorizedError(_ error: Error) -> Bool {
        // Check if error is an unauthorized error (e.g., 401)
        if let apiError = error as? APIError, case .unauthorized = apiError {
            return true
        }
        
        let nsError = error as NSError
        return nsError.domain == "APIError" && nsError.code == 401
    }
}

// MARK: - Extensions for Preview Convenience

extension User {
    // Provide a preview user for testing/SwiftUI previews
    static var preview: User {
        var user = User(
            id: "user123",
            email: "test@example.com",
            name: "Test User",
            createdAt: Date(),
            updatedAt: Date()
        )
        
        let settings = UserSettings(
            id: "settings123",
            userId: "user123",
            distanceUnit: .km,
            language: "en",
            coachingStyle: .balanced,
            notificationPreferences: NotificationPreferences(
                id: "notif123",
                email: true,
                push: true,
                sms: false,
                inApp: true
            ),
            privacyDataSharing: true
        )
        
        let runnerProfile = RunnerProfile(
            id: "profile123",
            userId: "user123",
            experienceLevel: .intermediate,
            weeklyRunningFrequency: 4,
            weeklyRunningDistanceKm: 40,
            typicalPaceMinPerKm: 320,
            recentRaces: nil,
            primaryGoal: "Run a half marathon",
            injuries: nil,
            maxHR: 185,
            restingHR: 60,
            dateOfBirth: nil,
            weight: 70,
            height: 175,
            sex: .male
        )
        
        user.settings = settings
        user.runnerProfile = runnerProfile
        
        return user
    }
}

extension AuthViewModel {
    /// Create a preview instance with a logged-in user
    static func loggedInPreview() -> AuthViewModel {
        let viewModel = AuthViewModel()
        viewModel.currentUser = User.preview
        viewModel.isLoggedIn = true
        viewModel.isLoading = false
        return viewModel
    }
    
    /// Create a preview instance with a logged-out user
    static func loggedOutPreview() -> AuthViewModel {
        let viewModel = AuthViewModel()
        viewModel.isLoggedIn = false
        viewModel.currentUser = nil
        viewModel.isLoading = false
        return viewModel
    }
} 