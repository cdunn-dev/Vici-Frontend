import Foundation
import SwiftUI
import Combine
import os.log

/// ViewModel for handling Strava connection operations
class StravaConnectViewModel: ObservableObject {
    // MARK: - Published Properties
    
    /// Whether there is an active Strava connection
    @Published var isStravaConnected = false
    
    /// Whether operations are loading
    @Published var isLoading = false
    
    /// Error message if an operation fails
    @Published var errorMessage: String?
    
    /// Whether to show the web view for Strava OAuth
    @Published var showWebView = false
    
    /// The authorization URL for Strava OAuth
    @Published var authURL: URL?
    
    // MARK: - Dependencies
    
    private let stravaService: StravaServiceProtocol
    private let authViewModel: AuthViewModel
    private let logger = Logger(subsystem: "com.vici.app", category: "StravaConnectViewModel")
    
    // MARK: - Initialization
    
    init(stravaService: StravaServiceProtocol = StravaService.shared, authViewModel: AuthViewModel) {
        self.stravaService = stravaService
        self.authViewModel = authViewModel
        
        // Initialize connection state from auth view model
        self.isStravaConnected = authViewModel.isStravaConnected
    }
    
    // MARK: - Public Methods
    
    /// Checks the current Strava connection status
    func checkStravaConnection() {
        guard let userId = authViewModel.currentUser?.id else {
            errorMessage = "You must be logged in to connect with Strava"
            return
        }
        
        logger.debug("Checking Strava connection for user: \(userId)")
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let isConnected = try await stravaService.checkConnectionStatus(userId: userId)
                
                await MainActor.run {
                    self.isStravaConnected = isConnected
                    self.authViewModel.updateStravaConnectionStatus(isConnected: isConnected)
                    self.isLoading = false
                    self.logger.debug("Strava connection status: \(isConnected ? "connected" : "not connected")")
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = "Failed to check Strava connection: \(error.localizedDescription)"
                    self.logger.error("Failed to check Strava connection: \(error.localizedDescription)")
                }
            }
        }
    }
    
    /// Initiates the Strava connection process
    func initiateStravaConnection() {
        guard let userId = authViewModel.currentUser?.id else {
            errorMessage = "You must be logged in to connect with Strava"
            return
        }
        
        logger.debug("Initiating Strava connection for user: \(userId)")
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                let url = try await stravaService.getAuthorizationURL(userId: userId)
                
                await MainActor.run {
                    self.authURL = url
                    self.showWebView = true
                    self.isLoading = false
                    self.logger.debug("Got authorization URL for Strava: \(url)")
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = "Failed to initiate Strava connection: \(error.localizedDescription)"
                    self.logger.error("Failed to initiate Strava connection: \(error.localizedDescription)")
                }
            }
        }
    }
    
    /// Handles the Strava callback after OAuth
    func handleStravaCallback(url: URL) {
        guard let userId = authViewModel.currentUser?.id,
              let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else {
            errorMessage = "Invalid callback URL"
            logger.error("Invalid callback URL: \(url)")
            return
        }
        
        // Extract code and state parameters from URL
        let queryItems = components.queryItems ?? []
        guard let code = queryItems.first(where: { $0.name == "code" })?.value else {
            if let error = queryItems.first(where: { $0.name == "error" })?.value {
                errorMessage = "Strava authorization failed: \(error)"
                logger.error("Strava authorization failed: \(error)")
            } else {
                errorMessage = "Missing authorization code"
                logger.error("Missing authorization code in callback URL")
            }
            return
        }
        
        let state = queryItems.first(where: { $0.name == "state" })?.value
        
        logger.debug("Processing Strava callback with code: \(code), state: \(state ?? "nil")")
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                try await stravaService.exchangeCodeForToken(userId: userId, code: code, state: state)
                
                await MainActor.run {
                    self.isStravaConnected = true
                    self.authViewModel.updateStravaConnectionStatus(isConnected: true)
                    self.isLoading = false
                    self.showWebView = false
                    self.logger.debug("Successfully exchanged code for Strava token")
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.showWebView = false
                    self.errorMessage = "Failed to complete Strava authorization: \(error.localizedDescription)"
                    self.logger.error("Failed to exchange code for token: \(error.localizedDescription)")
                }
            }
        }
    }
    
    /// Disconnects the user's Strava account
    func disconnectStrava() {
        guard let userId = authViewModel.currentUser?.id else {
            errorMessage = "You must be logged in to disconnect Strava"
            return
        }
        
        logger.debug("Disconnecting Strava for user: \(userId)")
        isLoading = true
        errorMessage = nil
        
        Task {
            do {
                try await stravaService.disconnectAccount(userId: userId)
                
                await MainActor.run {
                    self.isStravaConnected = false
                    self.authViewModel.updateStravaConnectionStatus(isConnected: false)
                    self.isLoading = false
                    self.logger.debug("Successfully disconnected Strava account")
                }
            } catch {
                await MainActor.run {
                    self.isLoading = false
                    self.errorMessage = "Failed to disconnect Strava: \(error.localizedDescription)"
                    self.logger.error("Failed to disconnect Strava: \(error.localizedDescription)")
                }
            }
        }
    }
} 