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
    
    // MARK: - Dependencies
    
    private let stravaService: StravaServiceProtocol
    private let authViewModel: AuthViewModel
    
    // MARK: - Initialization
    
    init(stravaService: StravaServiceProtocol = StravaService.shared, authViewModel: AuthViewModel) {
        self.stravaService = stravaService
        self.authViewModel = authViewModel
        
        // Initialize with logger category
        super.init(logCategory: "StravaConnectViewModel")
        
        // Initialize connection state from auth view model
        self.isStravaConnected = authViewModel.isStravaConnected
    }
    
    // MARK: - Public Methods
    
    /// Checks the current Strava connection status
    func checkStravaConnection() {
        guard let userId = authViewModel.currentUser?.id else {
            handleError(AuthError.unauthorized, message: "You must be logged in to connect with Strava")
            return
        }
        
        logger.debug("Checking Strava connection for user: \(userId)")
        
        Task {
            let isConnected = await runTask(operation: "Check Strava connection") {
                try await stravaService.checkConnectionStatus(userId: userId)
            }
            
            if let isConnected = isConnected {
                self.isStravaConnected = isConnected
                self.authViewModel.updateStravaConnectionStatus(isConnected: isConnected)
                self.logger.debug("Strava connection status: \(isConnected ? "connected" : "not connected")")
            }
        }
    }
    
    /// Initiates the Strava connection process
    func initiateStravaConnection() {
        guard let userId = authViewModel.currentUser?.id else {
            handleError(AuthError.unauthorized, message: "You must be logged in to connect with Strava")
            return
        }
        
        logger.debug("Initiating Strava connection for user: \(userId)")
        
        Task {
            let url = await runTask(operation: "Get Strava authorization URL") {
                try await stravaService.getAuthorizationURL(userId: userId)
            }
            
            if let url = url {
                self.authURL = url
                self.showWebView = true
                self.logger.debug("Got authorization URL for Strava: \(url)")
            }
        }
    }
    
    /// Handles the Strava callback after OAuth
    func handleStravaCallback(url: URL) {
        guard let userId = authViewModel.currentUser?.id,
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
        
        Task {
            let success = await runTask(operation: "Exchange code for Strava token") {
                try await stravaService.exchangeCodeForToken(userId: userId, code: code, state: state)
                return true
            }
            
            if success == true {
                self.isStravaConnected = true
                self.authViewModel.updateStravaConnectionStatus(isConnected: true)
                self.showWebView = false
                self.logger.debug("Successfully exchanged code for Strava token")
            } else {
                self.showWebView = false
            }
        }
    }
    
    /// Disconnects the user's Strava account
    func disconnectStrava() {
        guard let userId = authViewModel.currentUser?.id else {
            handleError(AuthError.unauthorized, message: "You must be logged in to disconnect Strava")
            return
        }
        
        logger.debug("Disconnecting Strava for user: \(userId)")
        
        Task {
            let success = await runTask(operation: "Disconnect Strava account") {
                try await stravaService.disconnectAccount(userId: userId)
                return true
            }
            
            if success == true {
                self.isStravaConnected = false
                self.authViewModel.updateStravaConnectionStatus(isConnected: false)
                self.logger.debug("Successfully disconnected Strava account")
            }
        }
    }
} 