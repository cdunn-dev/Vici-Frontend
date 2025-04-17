import Foundation
import SwiftUI
import Combine
import os.log

/// ViewModel for handling Strava connection operations
@MainActor
class StravaConnectViewModel: BaseViewModel {
    // MARK: - Published Properties
    
    /// Whether there is an active Strava connection
    @Published var isStravaConnected = false
    
    /// Whether to show the web view for Strava OAuth
    @Published var showWebView = false
    
    /// The authorization URL for Strava OAuth
    @Published var authURL: URL?
    
    // Additional loading states for more granular control
    @Published var isCheckingConnection = false
    @Published var isConnecting = false
    @Published var isDisconnecting = false
    @Published var isSyncing = false
    
    // MARK: - Dependencies
    
    private let stravaService: StravaServiceProtocol
    private var authViewModel: AuthViewModel?
    
    // MARK: - Initialization
    
    init(stravaService: StravaServiceProtocol = StravaService.shared) {
        self.stravaService = stravaService
        
        // Initialize with logger category
        super.init(logCategory: "StravaConnectViewModel")
    }
    
    /// Sets the AuthViewModel from the environment after view appears
    func setAuthViewModel(_ viewModel: AuthViewModel) {
        self.authViewModel = viewModel
        self.isStravaConnected = viewModel.isStravaConnected
        logger.debug("AuthViewModel set, Strava connection status: \(isStravaConnected ? "connected" : "not connected")")
    }
    
    // MARK: - Public Methods
    
    /// Checks the current Strava connection status
    func checkStravaConnection() {
        guard let authViewModel = authViewModel, let userId = authViewModel.currentUser?.id else {
            handleError(AuthError.unauthorized, message: "You must be logged in to connect with Strava")
            return
        }
        
        logger.debug("Checking Strava connection for user: \(userId)")
        isCheckingConnection = true
        
        Task {
            let isConnected = await runTask(operation: "Check Strava connection") {
                try await stravaService.checkConnectionStatus(userId: userId)
            }
            
            isCheckingConnection = false
            
            if let isConnected = isConnected {
                self.isStravaConnected = isConnected
                self.authViewModel?.updateStravaConnectionStatus(isConnected: isConnected)
                self.logger.debug("Strava connection status: \(isConnected ? "connected" : "not connected")")
            }
        }
    }
    
    /// Initiates the Strava connection process
    func initiateStravaConnection() {
        guard let authViewModel = authViewModel, let userId = authViewModel.currentUser?.id else {
            handleError(AuthError.unauthorized, message: "You must be logged in to connect with Strava")
            return
        }
        
        logger.debug("Initiating Strava connection for user: \(userId)")
        isConnecting = true
        
        Task {
            let url = await runTask(operation: "Get Strava authorization URL") {
                try await stravaService.getAuthorizationURL(userId: userId)
            }
            
            isConnecting = false
            
            if let url = url {
                self.authURL = url
                self.showWebView = true
                self.logger.debug("Got authorization URL for Strava: \(url)")
            }
        }
    }
    
    /// Handles the Strava callback after OAuth
    func handleStravaCallback(url: URL) {
        guard let authViewModel = authViewModel, 
              let userId = authViewModel.currentUser?.id,
              let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            handleError(AuthError.unauthorized, message: "Invalid callback URL")
            logger.error("Invalid callback URL: \(url)")
            return
        }
        
        // Extract code and state parameters from URL
        let queryItems = components.queryItems ?? []
        guard let code = queryItems.first(where: { $0.name == "code" })?.value else {
            if let error = queryItems.first(where: { $0.name == "error" })?.value {
                handleError(AuthError.unauthorized, message: "Strava authorization failed: \(error)")
                logger.error("Strava authorization failed: \(error)")
            } else {
                handleError(AuthError.unauthorized, message: "Missing authorization code")
                logger.error("Missing authorization code in callback URL")
            }
            return
        }
        
        let state = queryItems.first(where: { $0.name == "state" })?.value
        
        logger.debug("Processing Strava callback with code: \(code), state: \(state ?? "nil")")
        isConnecting = true
        
        Task {
            let success = await runTask(operation: "Exchange code for Strava token") {
                try await stravaService.exchangeCodeForToken(userId: userId, code: code, state: state)
                return true
            }
            
            isConnecting = false
            
            if success == true {
                self.isStravaConnected = true
                self.authViewModel?.updateStravaConnectionStatus(isConnected: true)
                self.showWebView = false
                self.logger.debug("Successfully exchanged code for Strava token")
            } else {
                self.showWebView = false
            }
        }
    }
    
    /// Disconnects the user's Strava account
    func disconnectStrava() {
        guard let authViewModel = authViewModel, let userId = authViewModel.currentUser?.id else {
            handleError(AuthError.unauthorized, message: "You must be logged in to disconnect Strava")
            return
        }
        
        logger.debug("Disconnecting Strava for user: \(userId)")
        isDisconnecting = true
        
        Task {
            let success = await runTask(operation: "Disconnect Strava account") {
                try await stravaService.disconnectAccount(userId: userId)
                return true
            }
            
            isDisconnecting = false
            
            if success == true {
                self.isStravaConnected = false
                self.authViewModel?.updateStravaConnectionStatus(isConnected: false)
                self.logger.debug("Successfully disconnected Strava account")
            }
        }
    }
    
    /// Syncs the latest activities from Strava
    func syncStravaActivities(userId: String) async {
        isSyncing = true
        
        let success = await runTask(operation: "Sync Strava activities") {
            try await stravaService.fetchRecentActivities(userId: userId, limit: 10)
            return true
        }
        
        isSyncing = false
        
        if success == true {
            logger.debug("Successfully synced Strava activities")
        }
    }
    
    // MARK: - Error Handling
    
    /// Enhanced error handling specific to Strava errors
    func handleStravaError(_ error: Error) {
        if let stravaError = error as? StravaError {
            switch stravaError {
            case .connectionFailed(let reason):
                handleError(stravaError, message: "Connection failed: \(reason)")
            case .tokenExchangeFailed(let reason):
                handleError(stravaError, message: "Authorization failed: \(reason)")
            case .offlineError:
                handleError(stravaError, message: "Network connection unavailable. Please check your connection and try again.")
            case .userNotAuthenticated:
                handleError(stravaError, message: "You must be logged in to connect with Strava")
            case .disconnectionFailed(let reason):
                handleError(stravaError, message: "Failed to disconnect: \(reason)")
            case .invalidResponse(let details):
                handleError(stravaError, message: "Invalid response: \(details)")
            default:
                handleError(stravaError)
            }
        } else {
            handleError(error)
        }
    }
} 