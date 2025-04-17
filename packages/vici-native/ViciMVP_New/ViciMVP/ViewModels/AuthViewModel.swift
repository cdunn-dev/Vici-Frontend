import Foundation
import Combine
import SwiftUI
import os.log

/// AuthViewModel handles user authentication, profile management, and third-party service connections
@MainActor
class AuthViewModel: BaseViewModel, AuthViewModelProtocol {
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
         keychainService: KeychainServiceProtocol,
         stravaService: StravaServiceProtocol = StravaService.shared) {
        self.authService = authService
        self.keychainService = keychainService
        self.stravaService = stravaService
        
        super.init(logCategory: "AuthViewModel")
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
        Task {
            await loginAsync(email: email, password: password)
        }
    }
    
    /// Async implementation of login
    private func loginAsync(email: String, password: String) async {
        let _ = await runTask(operation: "Login with email: \(email)") {
            let user = try await authService.login(email: email, password: password)
            self.currentUser = user
            self.isLoggedIn = true
            self.checkStravaConnection()
            return user
        }
    }
    
    /// Register a new user
    /// - Parameters:
    ///   - name: User's full name
    ///   - email: User's email address
    ///   - password: User's password
    func register(email: String, password: String, name: String) {
        Task {
            await registerAsync(email: email, password: password, name: name)
        }
    }
    
    /// Async implementation of register
    private func registerAsync(email: String, password: String, name: String) async {
        let _ = await runTask(operation: "Register new user with email: \(email)") {
            let user = try await authService.register(email: email, password: password, name: name)
            self.currentUser = user
            self.isLoggedIn = true
            return user
        }
    }
    
    /// Log out the current user
    func logout() {
        Task {
            await logoutAsync()
        }
    }
    
    /// Async implementation of logout
    private func logoutAsync() async {
        let success = await runTask(operation: "Logout user") {
            try await authService.logout()
            self.currentUser = nil
            self.isLoggedIn = false
            self.isStravaConnected = false
            return true
        } ?? false
    }
    
    /// Refresh the current user's profile
    func refreshUserProfile() async {
        guard isLoggedIn else {
            logger.debug("Cannot refresh profile: user not logged in")
            handleError(AuthError.sessionExpired)
            return
        }
        
        let _ = await runTask(operation: "Refresh user profile") {
            let user = try await authService.getCurrentUser()
            self.currentUser = user
            self.checkStravaConnection()
            return user
        }
    }
    
    // MARK: - Strava Connection Methods
    
    /// Check if the user has connected their Strava account
    private func checkStravaConnection() {
        guard let userId = currentUser?.id else {
            logger.debug("Cannot check Strava connection: no current user")
            return
        }
        
        // Using handlePublisher for Combine publisher
        handlePublisher(
            authService.checkStravaConnectionPublisher(userId: userId),
            operation: "Check Strava connection",
            showLoading: false
        ) { [weak self] isConnected in
            self?.isStravaConnected = isConnected
        }
    }
    
    /// Connect the user's Strava account
    /// - Parameter userId: The user's ID
    func connectStrava(userId: String) async {
        let _ = await runTask(operation: "Connect Strava for user: \(userId)") {
            try await authService.connectStrava(userId: userId)
            self.isStravaConnected = true
            return true
        }
    }
    
    /// Disconnect the user's Strava account
    /// - Parameter userId: The user's ID
    func disconnectStrava(userId: String) async {
        let _ = await runTask(operation: "Disconnect Strava for user: \(userId)") {
            try await authService.disconnectStrava(userId: userId)
            self.isStravaConnected = false
            return true
        }
    }
    
    /// Update the Strava connection status
    /// - Parameter isConnected: Whether the user is connected to Strava
    func updateStravaConnectionStatus(isConnected: Bool) {
        self.isStravaConnected = isConnected
    }
    
    // MARK: - Helper methods for previews
    
    /// Create a preview instance for logged-in state
    static func loggedInPreview() -> AuthViewModel {
        let mockViewModel = AuthViewModel(
            authService: AuthService.shared,
            keychainService: KeychainService.shared
        )
        mockViewModel.isLoggedIn = true
        mockViewModel.currentUser = User.preview
        return mockViewModel
    }
    
    /// Create a preview instance for logged-out state
    static func loggedOutPreview() -> AuthViewModel {
        let mockViewModel = AuthViewModel(
            authService: AuthService.shared,
            keychainService: KeychainService.shared
        )
        mockViewModel.isLoggedIn = false
        mockViewModel.currentUser = nil
        return mockViewModel
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